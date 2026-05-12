export const rialToToman = (amount) => {
  return amount.slice(0, -1);
};

export const formatNumberWithCommas = (value = '', decimalCount = 2) => {
  if (value === null || value === undefined || value === '') return '';
  const stringValue = value.toString().replace(/,/g, '');

  const isTrailingDot = stringValue.endsWith('.');
  const [int, dec = ''] = stringValue.split('.');
  const formattedInt = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // Limit decimal part based on the maxDecimals
  const limitedDec = dec.slice(0, decimalCount);

  if (limitedDec || isTrailingDot) {
    return `${formattedInt}.${limitedDec}`;
  }

  return formattedInt;
};

export const removeCommas = (value) => {
  return value?.toString().replace(/,/g, '');
};

export const convertTimestampToPersianDateTime = (timestamp, options) => {
  const date = new Date(timestamp * 1000);

  const persianDateTime = new Intl.DateTimeFormat('fa-IR', options).format(
    date,
  );
  const [time, fullDate] = persianDateTime.split(', ');
  return `${fullDate}  -  ${time}`;
};

export const convertIsoToPersianDate = (isoDate, options) => {
  const date = new Date(isoDate);

  const persianDateTime = new Intl.DateTimeFormat('fa-IR', options)
    .format(date)
    .replace(/,/g, '-');

  const [time, fullDate] = persianDateTime.split('-');

  return `${fullDate}  -  ${time}`;
};

export const convertSecondsToMinutes = (seconds) => {
  const minutes = ~~(seconds / 60);
  const extraSeconds = seconds % 60;
  return { minutes: minutes, seconds: extraSeconds };
};
