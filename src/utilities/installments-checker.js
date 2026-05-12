import { toGregorian } from 'jalaali-js';

function getDaysDifference(jalaaliDate) {
  const { year, month, day } = jalaaliDate;
  const gregorian = toGregorian(year, month, day);

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const targetDate = new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd);
  targetDate.setHours(0, 0, 0, 0);

  const timeDiff = targetDate - now;
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
}

function isWithinNextMonth(daysDiff) {
  return daysDiff >= 0 && daysDiff <= 30;
}

export function getNextMonthInstallments(loans) {
  const allInstallments = [];

  loans.forEach((loan) => {
    const {
      id,
      title,
      amount,
      totalPaymentsCount,
      firstPayDate,
      currency,
      paidPayments = [],
    } = loan;

    if (!firstPayDate) return;

    const installmentAmount =
      typeof amount === 'string'
        ? parseFloat(amount.replace(/,/g, ''))
        : amount;

    const paidCount = paidPayments.length;

    const [year, month, day] = firstPayDate.split('/').map(Number);

    for (let i = paidCount; i < Number(totalPaymentsCount); i++) {
      const paymentMonth = ((month + i - 1) % 12) + 1;
      const paymentYear = year + Math.floor((month + i - 1) / 12);

      const monthLength = getJalaaliMonthLength(paymentYear, paymentMonth);
      const adjustedDay = day > monthLength ? monthLength : day;

      const paymentDate = {
        year: paymentYear,
        month: paymentMonth,
        day: adjustedDay,
        formatted: `${paymentYear}/${String(paymentMonth).padStart(
          2,
          '0',
        )}/${String(adjustedDay).padStart(2, '0')}`,
      };

      const daysDiff = getDaysDifference(paymentDate);

      if (isWithinNextMonth(daysDiff)) {
        allInstallments.push({
          loanId: id,
          loanTitle: title,
          amount: installmentAmount,
          date: paymentDate,
          installmentNumber: i + 1,
          currency,
        });
      }

      if (daysDiff > 60) {
        break;
      }
    }
  });

  return allInstallments;
}

function getJalaaliMonthLength(year, month) {
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  return isJalaaliLeapYear(year) ? 30 : 29;
}

function isJalaaliLeapYear(year) {
  const breaks = [
    -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097,
    2192, 2262, 2324, 2394, 2456, 3178,
  ];

  const gy = year + 621;
  let leapJ = -14;
  let jp = breaks[0];

  let jump;
  for (let i = 1; i <= breaks.length; i += 1) {
    const jm = breaks[i];
    jump = jm - jp;
    if (year < jm) break;
    leapJ = leapJ + Math.floor(jump / 33) * 8 + Math.floor((jump % 33) / 4);
    jp = jm;
  }

  let n = year - jp;
  if (n < 0) n = -n;

  if (jump - n < 6) n = n - jump + Math.floor((jump + 4) / 33) * 33;

  let leap = Math.floor(((n + 1) % 33) - 1) % 4;
  if (leap === -1) leap = 4;

  return leap === 0;
}
