import instance from './axios';

export async function setWebhook(data) {
  const res = await instance.post('/api/telegram/set-webhook', data);
  return res.data;
}

export async function testSend(data) {
  const res = await instance.post('/api/telegram/test-send', data);
  return res.data;
}
