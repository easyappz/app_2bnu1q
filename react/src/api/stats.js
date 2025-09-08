import instance from './axios';

export async function summary(range) {
  const res = await instance.get('/api/stats/summary', { params: { range } });
  return res.data;
}

export async function timeseries({ from, to, interval = 'day' }) {
  const res = await instance.get('/api/stats/timeseries', { params: { from, to, interval } });
  return res.data;
}
