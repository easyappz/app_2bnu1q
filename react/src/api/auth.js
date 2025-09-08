import instance from './axios';

export async function login(payload) {
  const res = await instance.post('/api/auth/login', payload);
  return res.data;
}

export async function registerAdmin(payload) {
  const res = await instance.post('/api/auth/register-admin', payload);
  return res.data;
}
