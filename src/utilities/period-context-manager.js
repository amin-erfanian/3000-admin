import jalaali from 'jalaali-js';
import {
  addDaysToJalaali,
  getCurrentJalaaliDateTime,
  getFirstDayOfJalaaliWeek,
  getJalaaliYearLength,
} from './jalaali-calculations';

const formatJalaaliDate = ({ jy, jm, jd }) => `${jy}/${jm}/${jd}`;

export const parseJalaaliDate = (dateString) => {
  if (!dateString) return null;
  const [jy, jm, jd] = dateString.split('/').map(Number);
  return { jy, jm, jd };
};

export const initializePeriodContexts = () => {
  const now = getCurrentJalaaliDateTime();
  const { jy, jm } = parseJalaaliDate(now);

  return {
    contextYear: jy,
    contextMonth: jm,

    yearlyContext: {
      year: jy,
      startDayOffset: 0,
    },

    monthlyContext: {
      month: jm,
      startDayOffset: 0,
    },

    weeklyContext: {
      weekStartDate: initializeWeeklyContextForMonth(jy, jm),
      startDayOffset: 0,
    },

    last7Days: {
      date: null,
    },

    last30Days: {
      date: null,
    },

    lastSalary: {
      date: null,
    },

    fromStart: {
      date: null,
    },

    customPeriod: {
      from: null,
      to: null,
    },
  };
};

export const getYearlyDateRange = (contextYear, startDayOffset = 0) => {
  const normalizedStartDay = Math.min(
    getJalaaliYearLength(contextYear) - 1,
    startDayOffset,
  );
  const normalizedEndDay = Math.min(
    getJalaaliYearLength(contextYear + 1) - 1,
    startDayOffset - 1,
  );

  const fromDate = addDaysToJalaali(
    { jy: contextYear, jm: 1, jd: 1 },
    normalizedStartDay,
  );
  const toDate = addDaysToJalaali(
    { jy: contextYear + 1, jm: 1, jd: 1 },
    normalizedEndDay,
  );

  return {
    from: formatJalaaliDate(fromDate),
    to: formatJalaaliDate(toDate),
  };
};

export const getMonthlyDateRange = (contextYear, month, startDayOffset = 0) => {
  const thisMonthLength = jalaali.jalaaliMonthLength(contextYear, month);
  const normalizedStartDay = Math.min(startDayOffset + 1, thisMonthLength);

  const from = `${contextYear}/${month}/${normalizedStartDay || 1}`;

  const nextMonth = month === 12 ? 1 : month + 1;
  const nextMonthYear = month === 12 ? contextYear + 1 : contextYear;
  const nextMonthLength = jalaali.jalaaliMonthLength(nextMonthYear, nextMonth);

  const to = startDayOffset
    ? `${nextMonthYear}/${nextMonth}/${Math.min(
        startDayOffset,
        nextMonthLength,
      )}`
    : `${contextYear}/${month}/${thisMonthLength}`;

  return { from, to };
};

export const getWeeklyDateRange = (weekStartDate, startDayOffset = 0) => {
  const parsedDate = parseJalaaliDate(weekStartDate);
  if (!parsedDate) {
    const now = parseJalaaliDate(getCurrentJalaaliDateTime());
    const currentSaturday = getFirstDayOfJalaaliWeek(now);
    const start = addDaysToJalaali(currentSaturday, startDayOffset);
    const end = addDaysToJalaali(start, 6);

    return {
      from: formatJalaaliDate(start),
      to: formatJalaaliDate(end),
    };
  }

  const start = addDaysToJalaali(parsedDate, startDayOffset);
  const end = addDaysToJalaali(start, 6);

  return {
    from: formatJalaaliDate(start),
    to: formatJalaaliDate(end),
  };
};

export const getLast7DaysRange = () => {
  const now = parseJalaaliDate(getCurrentJalaaliDateTime());
  return {
    from: formatJalaaliDate(addDaysToJalaali(now, -7)),
    to: formatJalaaliDate(now),
  };
};

export const getLast30DaysRange = () => {
  const now = parseJalaaliDate(getCurrentJalaaliDateTime());
  return {
    from: formatJalaaliDate(addDaysToJalaali(now, -30)),
    to: formatJalaaliDate(now),
  };
};

export const getLastSalaryRange = (lastSalaryDate) => {
  const now = getCurrentJalaaliDateTime();
  return {
    from: lastSalaryDate || false,
    to: now,
  };
};

export const getFromStartRange = (firstTransactionDate) => {
  const now = getCurrentJalaaliDateTime();
  return {
    from: firstTransactionDate || '1300/01/01',
    to: now,
  };
};

export const getDefaultCustomPeriodRange = () => {
  const now = getCurrentJalaaliDateTime();
  const { jy } = parseJalaaliDate(now);
  return {
    from: `${jy}/01/01`, // First day of current year
    to: now,
  };
};

export const shiftYearlyContext = (currentYear, direction) => {
  return direction === 'next' ? currentYear + 1 : currentYear - 1;
};

export const shiftMonthlyContext = (contextYear, currentMonth, direction) => {
  if (direction === 'next') {
    if (currentMonth === 12) {
      return { year: contextYear + 1, month: 1 };
    }
    return { year: contextYear, month: currentMonth + 1 };
  } else {
    if (currentMonth === 1) {
      return { year: contextYear - 1, month: 12 };
    }
    return { year: contextYear, month: currentMonth - 1 };
  }
};

export const shiftWeeklyContext = (weekStartDate, direction) => {
  const parsedDate = parseJalaaliDate(weekStartDate);
  const differDays = direction === 'next' ? 7 : -7;
  const newDate = addDaysToJalaali(parsedDate, differDays);
  return formatJalaaliDate(newDate);
};

export const updateContextYear = (contexts, newYear) => {
  return {
    ...contexts,
    contextYear: newYear,
    yearlyContext: {
      ...contexts.yearlyContext,
      year: newYear,
    },

    weeklyContext: {
      weekStartDate: initializeWeeklyContextForMonth(
        newYear,
        contexts.contextMonth,
      ),
      startDayOffset: contexts.weeklyContext.startDayOffset,
    },
  };
};

export const updateContextMonth = (contexts, newMonth) => {
  return {
    ...contexts,
    contextMonth: newMonth,
    monthlyContext: {
      ...contexts.monthlyContext,
      month: newMonth,
    },

    weeklyContext: {
      weekStartDate: initializeWeeklyContextForMonth(
        contexts.contextYear,
        newMonth,
      ),
      startDayOffset: contexts.weeklyContext.startDayOffset,
    },
  };
};

export const initializeWeeklyContextForMonth = (contextYear, contextMonth) => {
  const firstDayOfMonth = { jy: contextYear, jm: contextMonth, jd: 1 };
  const firstSaturday = getFirstDayOfJalaaliWeek(firstDayOfMonth);

  if (firstSaturday.jm === contextMonth && firstSaturday.jy === contextYear) {
    return formatJalaaliDate(firstSaturday);
  } else {
    return formatJalaaliDate(addDaysToJalaali(firstSaturday, 7));
  }
};
