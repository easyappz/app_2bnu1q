const axios = require('axios');
const Settings = require('@src/models/Settings');

async function getSettingsOrThrow() {
  const settings = await Settings.findOne();
  if (!settings) {
    throw new Error('Settings are not configured');
  }
  if (!settings.botToken || typeof settings.botToken !== 'string' || !settings.botToken.trim()) {
    throw new Error('botToken is not configured in Settings');
  }
  return settings;
}

function buildApiUrl(token, method) {
  return `https://api.telegram.org/bot${token}/${method}`;
}

async function sendInvoice(chatId, params) {
  const settings = await getSettingsOrThrow();
  if (!settings.providerToken || !settings.providerToken.trim()) {
    throw new Error('providerToken is not configured in Settings');
  }

  const payload = {
    chat_id: chatId,
    title: params.title,
    description: params.description,
    payload: params.payload,
    provider_token: settings.providerToken,
    currency: params.currency,
    prices: params.prices,
    is_flexible: false
  };

  const url = buildApiUrl(settings.botToken, 'sendInvoice');
  const { data } = await axios.post(url, payload, { timeout: 10000 });
  return data;
}

async function answerPreCheckoutQuery(preCheckoutQueryId, ok, errorMessage) {
  const settings = await getSettingsOrThrow();
  const url = buildApiUrl(settings.botToken, 'answerPreCheckoutQuery');
  const body = { pre_checkout_query_id: preCheckoutQueryId, ok: !!ok };
  if (!ok && errorMessage) body.error_message = errorMessage;
  const { data } = await axios.post(url, body, { timeout: 10000 });
  return data;
}

async function createChatInviteLink(chatIdOrUsername, options) {
  const settings = await getSettingsOrThrow();
  const url = buildApiUrl(settings.botToken, 'createChatInviteLink');
  const payload = {
    chat_id: chatIdOrUsername,
    ...options
  };
  const { data } = await axios.post(url, payload, { timeout: 10000 });
  return data;
}

async function sendMessage(chatId, text, options = {}) {
  const settings = await getSettingsOrThrow();
  const url = buildApiUrl(settings.botToken, 'sendMessage');
  const payload = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    ...options
  };
  const { data } = await axios.post(url, payload, { timeout: 10000 });
  return data;
}

async function setWebhook(urlValue) {
  const settings = await getSettingsOrThrow();
  const url = buildApiUrl(settings.botToken, 'setWebhook');
  const payload = { url: urlValue };
  const { data } = await axios.post(url, payload, { timeout: 10000 });
  return data;
}

module.exports = {
  sendInvoice,
  answerPreCheckoutQuery,
  createChatInviteLink,
  sendMessage,
  setWebhook
};
