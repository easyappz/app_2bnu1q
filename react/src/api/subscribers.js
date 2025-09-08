import instance from './axios';

export async function listSubscribers(params) {
  const res = await instance.get('/api/subscribers', { params });
  return res.data;
}
