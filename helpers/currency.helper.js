function currencyToNumber(value) {
  return Number(value.replace(',', '.'));
}

module.exports = {
  currencyToNumber
};
