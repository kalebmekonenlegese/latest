const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && re.test(email);
};

const validatePhoneNumber = (phone) => {
  const re = /^[\d\s+()-]+$/;
  return typeof phone === 'string' && re.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

const validatePassword = (password) => typeof password === 'string' && password.length >= 8;

const validateEnum = (value, allowed = []) => typeof value === 'string' && allowed.includes(value);

const isUuidLike = (value) => typeof value === 'string' && /^[A-Za-z0-9_-]{1,80}$/.test(value);

const validateBookingDates = (checkIn, checkOut) => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  return checkInDate instanceof Date && !Number.isNaN(checkInDate.valueOf()) && checkOutDate instanceof Date && !Number.isNaN(checkOutDate.valueOf()) && checkOutDate > checkInDate;
};

module.exports = {
  validateEmail,
  validatePhoneNumber,
  validatePassword,
  validateEnum,
  isUuidLike,
  validateBookingDates
};
