window.HotelUtils = window.HotelUtils || {};

window.HotelUtils.validators = {
  isEmail: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || ''),
  isRequired: (value) => Boolean((value || '').toString().trim()),
  strength: (password) => {
    let score = 0;
    if (!password) {
      return 0;
    }
    if (password.length >= 8) {
      score += 1;
    }
    if (/[A-Z]/.test(password)) {
      score += 1;
    }
    if (/\d/.test(password)) {
      score += 1;
    }
    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    }
    return score;
  }
};
