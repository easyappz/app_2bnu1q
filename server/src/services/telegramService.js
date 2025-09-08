const axios = require('axios');
const Settings = require('@src/models/Settings');

async function getActiveBotToken() {
  const settings = await Settings.findOne();
  if (!settings) {
    throw new Error('Settings not found');
  }
  const botToken = (settings.botToken || '').trim();
  if (!botToken) {
    throw new Error('botToken is not set in Settings');
  }
  return { botToken, settings };
}

function createBotAxios(botToken) {
  return axios.create({
    baseURL: `https://api.telegram.org/bot${botToken}/`,
    timeout: 15000
  });
}

async function sendMessage(chatId, text, options = {}) {
  try {
    if ((typeof chatId !== 'string' && typeof chatId !== 'number') || (typeof text !== 'string' || !text.trim())) {
      throw new Error('Invalid arguments: chatId and non-empty text are required');
    }
    const { botToken } = await getActiveBotToken();
    const api = createBotAxios(botToken);
    const payload = { chat_id: chatId, text: text.trim(), ...options };
    const { data } = await api.post('sendMessage', payload);
    if (!data || data.ok !== true) {
      const d = data && data.description ? data.description : 'Unknown error';
      throw new Error(`Telegram API error (sendMessage): ${d}`);
    }
    return data.result;
  } catch (error) {
    throw new Error(error.message);
  }
}

async function sendInvoice(params = {}) {
  try {
    const { botToken, settings } = await getActiveBotToken();

    const chatId = params.chatId;
    const title = typeof params.title === 'string' ? params.title.trim() : (settings.productName || 'Product');
    const description = typeof params.description === 'string' ? params.description.trim() : (settings.description || '');
    const payload = typeof params.payload === 'string' ? params.payload : 'invoice_payload';
    const providerToken = typeof params.providerToken === 'string' && params.providerToken.trim() ? params.providerToken.trim() : (settings.providerToken || '');
    const currency = typeof params.currency === 'string' ? params.currency.trim().toUpperCase() : (settings.currency || 'RUB');
    const prices = Array.isArray(params.prices) && params.prices.length > 0
      ? params.prices
      : [{ label: title, amount: Number.isInteger(settings.priceCents) ? settings.priceCents : 0 }];

    if ((typeof chatId !== 'string' && typeof chatId !== 'number')) {
      throw new Error('sendInvoice: chatId is required');
    }
    if (!providerToken) {
      throw new Error('sendInvoice: providerToken is not set');
    }
    if (!title) {
      throw new Error('sendInvoice: title is required');
    }
    if (currency !== 'RUB') {
      throw new Error('sendInvoice: currency must be RUB');
    }

    const api = createBotAxios(botToken);
    const payloadBody = {
      chat_id: chatId,
      title,
      description,
      payload,
      provider_token: providerToken,
      currency,
      prices
    };

    const { data } = await api.post('sendInvoice', payloadBody);
    if (!data || data.ok !== true) {
      const d = data && data.description ? data.description : 'Unknown error';
      throw new Error(`Telegram API error (sendInvoice): ${d}`);
    }
    return data.result;
  } catch (error) {
    throw new Error(error.message);
  }
}

async function answerPreCheckoutQuery(preCheckoutQueryId, ok, errorMessage = '') {
  try {
    const { botToken } = await getActiveBotToken();
    const api = createBotAxios(botToken);

    if (typeof preCheckoutQueryId !== 'string' || !preCheckoutQueryId.trim()) {
      throw new Error('answerPreCheckoutQuery: preCheckoutQueryId is required');
    }
    if (typeof ok !== 'boolean') {
      throw new Error('answerPreCheckoutQuery: ok must be boolean');
    }

    const payload = { pre_checkout_query_id: preCheckoutQueryId, ok };
    if (!ok && errorMessage) {
      payload.error_message = String(errorMessage);
    }

    const { data } = await api.post('answerPreCheckoutQuery', payload);
    if (!data || data.ok !== true) {
      const d = data && data.description ? data.description : 'Unknown error';
      throw new Error(`Telegram API error (answerPreCheckoutQuery): ${d}`);
    }
    return data.result;
  } catch (error) {
    throw new Error(error.message);
  }
}

async function createChatInviteLink(chatId, options = {}) {
  try {
    const { botToken } = await getActiveBotToken();
    const api = createBotAxios(botToken);

    if ((typeof chatId !== 'string' && typeof chatId !== 'number')) {
      throw new Error('createChatInviteLink: chatId is required');
    }

    const payload = { chat_id: chatId, ...options };
    const { data } = await api.post('createChatInviteLink', payload);
    if (!data || data.ok !== true) {
      const d = data && data.description ? data.description : 'Unknown error';
      throw new Error(`Telegram API error (createChatInviteLink): ${d}`);
    }
    return data.result;
  } catch (error) {
    throw new Error(error.message);
  }
}

async function setWebhook(webhookUrl) {
  try {
    const { botToken } = await getActiveBotToken();
    const api = createBotAxios(botToken);

    if (typeof webhookUrl !== 'string' || !webhookUrl.trim()) {
      throw new Error('setWebhook: webhookUrl is required');
    }

    const { data } = await api.post('setWebhook', { url: webhookUrl.trim() });
    if (!data || data.ok !== true) {
      const d = data && data.description ? data.description : 'Unknown error';
      throw new Error(`Telegram API error (setWebhook): ${d}`);
    }
    return data.result;
  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = {
  sendMessage,
  sendInvoice,
  answerPreCheckoutQuery,
  createChatInviteLink,
  setWebhook
};
