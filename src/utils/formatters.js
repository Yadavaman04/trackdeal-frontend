/**
 * Formats numeric values to Indian Currency Standard (INR) notation (₹).
 * Handles Indian Lakh and Crore formatting divisions.
 * @param {number} value - Numeric value
 * @returns {string}
 */
export function formatCurrency(value) {
  if (value === null || value === undefined || isNaN(value)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Formats ISO strings or Date instances to locale date format.
 * @param {string|Date} date - Date value
 * @param {string} format - Option formatting (defaults to short format)
 * @returns {string}
 */
export function formatDate(date) {
  if (!date) return '—';
  const instance = new Date(date);
  if (isNaN(instance.getTime())) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(instance);
}

/**
 * Formats bytes to standard KB/MB/GB storage notation.
 * @param {number} bytes - Storage size in bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (bytes === 0 || !bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
export default {
  formatCurrency,
  formatDate,
  formatBytes
};
