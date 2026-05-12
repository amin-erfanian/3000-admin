import jalaali from 'jalaali-js';
// Function to subtract days from a Jalaali date
export const subtractDaysFromJalaali = (jalaaliDate, days) => {
  let gregorianDate = jalaali.toGregorian(
    jalaaliDate.jy,
    jalaaliDate.jm,
    jalaaliDate.jd,
  );
  let date = new Date(gregorianDate.gy, gregorianDate.gm - 1, gregorianDate.gd);

  date.setDate(date.getDate() - days);
  let newJalaaliDate = jalaali.toJalaali(date);
  return newJalaaliDate;
};

export const getDateRange = (jalaaliDateString) => {
  // TODO: find a better solution

  const today = new Date(Date.now());

  const [year, month, day] = jalaaliDateString?.split('/')?.map(Number) || [];
  const { gy, gm, gd } = jalaali.toGregorian(year, month, day);
  const gregorianDate = new Date(gy, gm - 1, gd);

  const diffInDays = Math.ceil((gregorianDate - today) / (24 * 60 * 60 * 1000));

  if (diffInDays === 0) return 'امروز';
  if (diffInDays === 1) return 'فردا';
  if (diffInDays === -1) return 'دیروز';

  return `${Math.abs(diffInDays)} روز ${diffInDays < 0 ? 'قبل' : 'بعد'}`;
};

// Function to add days to a Jalaali date
export const addDaysToJalaali = (jalaaliDate, days) => {
  let gregorianDate = jalaali.toGregorian(
    jalaaliDate.jy,
    jalaaliDate.jm,
    jalaaliDate.jd,
  );
  let date = new Date(gregorianDate.gy, gregorianDate.gm - 1, gregorianDate.gd);
  date.setDate(date.getDate() + days);
  let newJalaaliDate = jalaali.toJalaali(date);
  return newJalaaliDate;
};

export const getPreviousMonthJalaali = (dateString) => {
  if (!dateString) return;
  // Split the input date string into year, month, and day
  const [year, month, day] = dateString?.split('/').map(Number) || [];

  // Calculate the previous month and year
  let prevYear = year;
  let prevMonth = month - 1;

  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear -= 1;
  }

  // Get the number of days in the previous month
  const daysInPrevMonth = jalaali.jalaaliMonthLength(prevYear, prevMonth);

  // Adjust the day if it exceeds the number of days in the previous month
  const prevDay = Math.min(day, daysInPrevMonth);

  // Format the result as a Jalaali date string
  return `${prevYear}/${prevMonth.toString().padStart(2, '0')}/${prevDay
    .toString()
    .padStart(2, '0')}`;
};

export const getCurrentJalaaliDateTime = () => {
  const now = new Date();
  const jNow = jalaali.toJalaali(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
  );

  return `${jNow.jy}/${jNow.jm}/${jNow.jd}`;
};

export const getJalaaliWeekday = ({ jy, jm, jd }) => {
  const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd);
  const gregorianDate = new Date(gy, gm - 1, gd);
  // Adjust: make Saturday = 0, Friday = 6
  return (gregorianDate.getDay() + 1) % 7;
};

export const getFirstDayOfJalaaliWeek = ({ jy, jm, jd }) => {
  const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd);
  const date = new Date(gy, gm - 1, gd);

  const weekday = (date.getDay() + 1) % 7;

  date.setDate(date.getDate() - weekday);

  return jalaali.toJalaali(date);
};

export const getLastDayOfJalaaliWeek = ({ jy, jm, jd }) => {
  const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd);
  const date = new Date(gy, gm - 1, gd);

  // Weekday in Jalaali perspective: Saturday = 0, Friday = 6
  const weekday = (date.getDay() + 1) % 7;

  // Move forward to the Friday of the same week
  date.setDate(date.getDate() + (6 - weekday));

  return jalaali.toJalaali(date);
};

export const getJalaaliYearLength = (jy) => {
  return jalaali.isLeapJalaaliYear(jy) ? 366 : 365;
};

export const getDay = (jalaaliDateString, action) => {
  const [year, month, day] = jalaaliDateString?.split('/')?.map(Number) || [];
  const { gy, gm, gd } = jalaali.toGregorian(year, month, day);

  const gregorianDate =
    action === 'next'
      ? new Date(gy, gm - 1, gd + 1)
      : new Date(gy, gm - 1, gd - 1);

  const jalaaliDate = jalaali.toJalaali(gregorianDate);
  return `${jalaaliDate.jy}/${jalaaliDate.jm}/${jalaaliDate.jd}`;
};
