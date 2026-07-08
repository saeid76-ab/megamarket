function formatPrice(amount) {
  return amount.toLocaleString('fa-IR') + ' تومان';
}

function formatNumber(n) {
  return n.toLocaleString('fa-IR');
}

function finalPrice(price, discount) {
  return Math.floor(price * (1 - discount / 100));
}

function toToman(n) {
  return Math.round(n);
}

module.exports = { formatPrice, formatNumber, finalPrice, toToman };
