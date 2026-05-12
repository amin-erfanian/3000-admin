import SHA256 from 'crypto-js/sha256';

export const createSmsHash = ({
  body = '',
  phoneNumber = '',
  timestamp = '',
}) => {
  const normalizedBody = body.trim();
  const normalizedPhone = (phoneNumber || '').toString().trim();
  const normalizedTimestamp = timestamp ? timestamp.toString() : '';
  const payload = `${normalizedPhone}::${normalizedBody}::${normalizedTimestamp}`;
  return SHA256(payload).toString();
};
