import jalaali from 'jalaali-js';

const jalaaliDays = [6, 0, 1, 2, 3, 4, 5];

const persianDays = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه',
];

const persianMonths = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

export const getFormattedDate = (date) => {
  if (!date) return '';

  const { dateFa, dateEn } = date;

  const today = new Date();
  const jToday = jalaali.toJalaali(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate(),
  );

  const weekDay = persianDays[jalaaliDays.indexOf(dateEn.getDay())];

  const isToday = () => `${jToday.jy}/${jToday.jm}/${jToday.jd}` === dateFa;

  if (isToday()) return 'امروز';
  return `${weekDay}، ${dateFa}`;
};

export const getJalaaliDate = (date) => {
  return jalaali.toJalaali(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );
};

export const getJalaaliStringDate = (date) => {
  if (!date) return '';
  const { jy, jm, jd } = getJalaaliDate(date);
  return `${jy}/${jm}/${jd}`;
};

export const getDayNameAndDateFromGregorian = (jalaaliStringDate) => {
  const [year, month, day] = jalaaliStringDate.split('/').map(Number);
  const { gy, gm, gd } = jalaali.toGregorian(year, month, day);
  const gregorianDate = new Date(gy, gm - 1, gd);

  return getFormattedDate({
    dateEn: gregorianDate,
    dateFa: getJalaaliStringDate(gregorianDate),
  });
};

export const formatJalaaliFullDate = (jalaaliStringDate, options = {}) => {
  if (!jalaaliStringDate) return '';
  const [jy, jm, jd] = jalaaliStringDate.split('/').map(Number);
  if ([jy, jm, jd].some((value) => Number.isNaN(value))) {
    return jalaaliStringDate;
  }

  const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd);
  const gregorianDate = new Date(gy, gm - 1, gd);

  const weekDay =
    persianDays[jalaaliDays.indexOf(gregorianDate.getDay())] || persianDays[0];
  const monthName = persianMonths[jm - 1] || jm.toString();
  const dayNumber = jd.toString().replace(/^0/, '') || jd.toString();
  const dateWithoutYear = `${weekDay} ${dayNumber} ${monthName}`;

  if (options.showYear === false) {
    return dateWithoutYear;
  }
  return `${dateWithoutYear} ${jy}`;
};

export const getDateObject = (jalaaliStringDate) => {
  const [year, month, day] = jalaaliStringDate.split('/').map(Number);
  const { gy, gm, gd } = jalaali.toGregorian(year, month, day);
  const gregorianDate = new Date(gy, gm - 1, gd);

  return {
    dateEn: gregorianDate,
    dateFa: getJalaaliStringDate(gregorianDate),
  };
};

export const jalaaliDateToComparable = (dateStr) => {
  const [jy, jm, jd] = dateStr.split('/').map(Number);
  const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd);
  return new Date(gy, gm - 1, gd).getTime();
};
