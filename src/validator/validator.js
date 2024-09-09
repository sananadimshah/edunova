const isValidEmail = (value) => {
  return /^([a-z0-9\._]+){3,}@([a-zA-Z0-9])+.([a-z]){2,6}(.[a-z]+)?$/.test(
    value
  );
};

const isValidPhone = (value) => {
  return /^[6789]{1}[0-9]{9}$/.test(value);
};

const isValid = (value) => {
  if (!value) return false;
  if (typeof value !== "string" || value.trim().length === 0) return false;
  return true;
};

const isValidPassword = (value) => {
  return /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/.test(
    value
  );
};

const isValidRent = (value) => {
  if (!value) return false;
  if (typeof value !== "number" || value.length == 0 || value < 0) return false;
  return true;
};

export { isValidEmail, isValidPassword, isValid, isValidPhone, isValidRent };
