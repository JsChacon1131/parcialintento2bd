const HttpError = require('./http-error');
const requiredText = (value, field, maximum = 120) => {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > maximum) {
    throw new HttpError(400, `Invalid ${field}`);
  }
  return value.trim();
};
const positiveInteger = (value, field) => {
  if (!Number.isSafeInteger(Number(value)) || Number(value) < 1 || String(value).trim() === '') {
    throw new HttpError(400, `Invalid ${field}`);
  }
  return Number(value);
};
const optionalId = (value, field) => value == null || value === '' ? null : positiveInteger(value, field);
const dateTime = (value, field) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    throw new HttpError(400, `Invalid ${field}; expected YYYY-MM-DDTHH:mm`);
  }
  const [date, time] = value.split('T');
  const parsed = new Date(`${date}T${time}:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 16) !== value) {
    throw new HttpError(400, `Invalid ${field}`);
  }
  return `${date} ${time}:00`;
};
module.exports = { requiredText, positiveInteger, optionalId, dateTime };
