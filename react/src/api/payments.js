import instance from './axios';

export async function listPayments(params) {
  const res = await instance.get('/api/payments', { params });
  return res.data;
}
