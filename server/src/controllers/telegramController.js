const Settings = require('@src/models/Settings');
const Payment = require('@src/models/Payment');
const Subscriber = require('@src/models/Subscriber');
const ProcessedUpdate = require('@src/models/ProcessedUpdate');
const telegramService = require('@src/services/telegramService');

async function getSettingsOrDefault() {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({
      botToken: '',
      providerToken: '',
      channelId: '',
      channelUsername: '',
      productName: 'Access to channel',
      priceCents: 0,
      currency: 'RUB',
      description: '',
      webhookUrl: ''
    });
  }
  return settings;
}

function buildInviteExpireUnix(hoursFromNow) {
  const nowSec = Math.floor(Date.now() / 1000);
  return nowSec + Math.floor(hoursFromNow * 3600);
}

async function webhook(req, res) {
  try {
    const update = req.body || {};
    const updateId = typeof update.update_id === 'number' ? update.update_id : null;

    if (updateId !== null) {
      try {
        await ProcessedUpdate.create({ updateId, type: update.message ? 'message' : (update.pre_checkout_query ? 'pre_checkout_query' : 'unknown') });
      } catch (e) {
        if (e && e.code === 11000) {
          return res.status(200).json({ ok: true, skipped: true, reason: 'duplicate_update' });
        }
        throw e;
      }
    }

    // Handle pre_checkout_query
    if (update && update.pre_checkout_query) {
      const pcq = update.pre_checkout_query;
      try {
        await telegramService.answerPreCheckoutQuery(pcq.id, true);
      } catch (err) {
        return res.status(200).json({ ok: false, error: err.message });
      }
      return res.status(200).json({ ok: true, processed: true, type: 'pre_checkout_query' });
    }

    // Handle message
    if (update && update.message) {
      const msg = update.message;
      const chatId = msg.chat && (msg.chat.id || msg.chat.ID) ? String(msg.chat.id || msg.chat.ID) : '';
      const from = msg.from || {};

      // Command /buy
      if (msg.text && msg.text.trim() === '/buy') {
        const settings = await getSettingsOrDefault();
        if (!settings.botToken || !settings.providerToken || !settings.productName || !settings.currency) {
          try {
            await telegramService.sendMessage(chatId, 'Payment is not configured. Please contact the administrator.');
          } catch (e) {
            // ignore telegram send error here
          }
          return res.status(200).json({ ok: false, error: 'Payment settings are incomplete' });
        }

        const payload = `invoice_${Date.now()}_${from.id || 'user'}`;
        const prices = [
          { label: settings.productName, amount: settings.priceCents }
        ];

        try {
          await telegramService.sendInvoice(chatId, {
            title: settings.productName,
            description: settings.description || `Payment for ${settings.productName}`,
            payload,
            currency: settings.currency,
            prices
          });
          return res.status(200).json({ ok: true, processed: true, type: 'sendInvoice' });
        } catch (error) {
          return res.status(200).json({ ok: false, error: error.message });
        }
      }

      // Successful payment
      if (msg.successful_payment) {
        const sp = msg.successful_payment;
        const settings = await getSettingsOrDefault();
        try {
          const payment = await Payment.create({
            userId: String(from.id),
            chatId: String(chatId),
            username: from.username || '',
            firstName: from.first_name || '',
            lastName: from.last_name || '',
            telegramPaymentChargeId: sp.telegram_payment_charge_id,
            providerPaymentChargeId: sp.provider_payment_charge_id,
            totalAmount: sp.total_amount,
            currency: sp.currency,
            payload: sp.invoice_payload,
            status: 'paid'
          });

          const expireUnix = buildInviteExpireUnix(2);
          const channelIdentifier = settings.channelId && settings.channelId.trim() ? settings.channelId.trim() : settings.channelUsername.trim();

          if (!channelIdentifier) {
            await telegramService.sendMessage(chatId, 'Channel is not configured. Please contact the administrator.');
            return res.status(200).json({ ok: false, error: 'Channel is not configured in Settings' });
          }

          const inviteResp = await telegramService.createChatInviteLink(channelIdentifier, {
            member_limit: 1,
            expire_date: expireUnix
          });

          const inviteLink = inviteResp && inviteResp.result && inviteResp.result.invite_link ? inviteResp.result.invite_link : '';

          const subscriberUpdate = {
            userId: String(from.id),
            chatId: String(chatId),
            username: from.username || '',
            firstName: from.first_name || '',
            lastName: from.last_name || '',
            status: 'active',
            inviteLink,
            inviteExpireAt: new Date(expireUnix * 1000),
            lastPaymentId: payment._id
          };

          await Subscriber.findOneAndUpdate(
            { userId: String(from.id) },
            subscriberUpdate,
            { upsert: true, new: true }
          );

          if (inviteLink) {
            await telegramService.sendMessage(
              chatId,
              `✅ Payment received!\n\nHere is your one-time invite link: ${inviteLink}\nThe link will expire in 2 hours.\n\nIf the link expires before you join, send /buy again.`
            );
          } else {
            await telegramService.sendMessage(
              chatId,
              '✅ Payment received, but failed to generate an invite link. Please contact the administrator.'
            );
          }

          return res.status(200).json({ ok: true, processed: true, type: 'successful_payment' });
        } catch (error) {
          return res.status(200).json({ ok: false, error: error.message });
        }
      }

      // Unknown messages are ignored but acknowledged
      return res.status(200).json({ ok: true, processed: false, type: 'message_ignored' });
    }

    // Unknown update type
    return res.status(200).json({ ok: true, processed: false, type: 'unknown' });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}

async function setWebhook(req, res) {
  try {
    const body = req.body || {};
    const settings = await getSettingsOrDefault();

    const url = (typeof body.url === 'string' && body.url.trim()) ? body.url.trim() : (settings.webhookUrl || '').trim();
    if (!url) {
      return res.status(400).json({ ok: false, error: 'Webhook URL is required. Provide in body.url or set in Settings.webhookUrl' });
    }

    const result = await telegramService.setWebhook(url);
    return res.status(200).json({ ok: true, data: result });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}

async function testSend(req, res) {
  try {
    const { chat_id, text } = req.body || {};
    if (!chat_id) {
      return res.status(400).json({ ok: false, error: 'chat_id is required' });
    }

    const message = typeof text === 'string' && text.trim() ? text.trim() : 'Test message from server';
    const result = await telegramService.sendMessage(chat_id, message);
    return res.status(200).json({ ok: true, data: result });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}

module.exports = {
  webhook,
  setWebhook,
  testSend
};
