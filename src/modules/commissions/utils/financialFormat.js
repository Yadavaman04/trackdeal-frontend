export const formatCurrency = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(Number(value) || 0);

export const formatDate = (value, fallback = 'Not scheduled') => {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const formatStatus = (status) => {
  if (!status) return 'Unpaid';
  return String(status)
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase());
};

export const getDaysPastDue = (dueDate) => {
  if (!dueDate) return 0;
  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return 0;
  return Math.max(0, Math.floor((Date.now() - due.getTime()) / 86400000));
};

export const getCollectionPercentage = (collected, expected) => {
  const total = Number(expected) || 0;
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round(((Number(collected) || 0) / total) * 100)));
};
