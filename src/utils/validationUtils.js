export const isValidPhoneNumber = (phoneNumber) => {
  return /^\+?[0-9\s\-()]*$/.test(phoneNumber);
};