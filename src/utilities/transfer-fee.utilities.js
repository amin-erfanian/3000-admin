export default function calculateTransferFee(type, amount, currency = 'تومان') {
  if (currency !== 'تومان' && currency !== 'ریال') {
    return 0;
  }

  let fee = 0;

  switch (type.toLowerCase()) {
    case 'card':
      fee = 900 + Math.floor(Math.max(0, amount - 1_000_000) / 1_000_000) * 320;
      fee = Math.min(fee, 4500);
      break;

    case 'paya':
      fee = Math.min(Math.max(amount * 0.0001, 300), 7500);
      break;

    case 'satna':
      fee = Math.min(amount * 0.0002, 3500);
      break;

    case 'pol':
      fee = Math.min(Math.max(amount * 0.0002, 400), 4000);
      break;

    default:
      throw new Error(
        "Unsupported transfer type. Use 'card', 'paya', 'satna', or 'pol'.",
      );
  }

  if (currency.toLowerCase() === 'ریال') {
    fee = fee * 10;
  }

  return Math.round(fee);
}
