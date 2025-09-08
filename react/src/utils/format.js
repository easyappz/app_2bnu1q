import dayjs from 'dayjs';

export const formatCurrency = (amountCents, currency = 'USD') => {
  const amount = (Number(amountCents || 0) / 100);
  try {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount);
  } catch (e) {
    return `${amount.toFixed(2)} ${currency}`;
  }
};

export const formatDateTime = (iso) => {
  if (!iso) return '';
  return dayjs(iso).format('DD.MM.YYYY HH:mm');
};

export const formatDate = (iso) => {
  if (!iso) return '';
  return dayjs(iso).format('DD.MM.YYYY');
};
