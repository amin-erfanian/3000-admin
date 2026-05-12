/**
 * @deprecated This utility is maintained for backward compatibility.
 * New code should use the period-context-manager.js utilities instead.
 *
 * This function provides a compatibility layer for legacy code that still uses
 * the old period calculation system.
 */

import {
  getYearlyDateRange,
  getMonthlyDateRange,
  getWeeklyDateRange,
  getLast7DaysRange,
  getLast30DaysRange,
  getLastSalaryRange,
  getFromStartRange,
  parseJalaaliDate,
} from './period-context-manager';
import { storeToRefs } from 'pinia';
import useTransactionStore from '@/stores/transaction';
import { getCurrentJalaaliDateTime } from './jalaali-calculations';

const transactionStore = useTransactionStore();
const { lastSalaryTransaction, firstTransaction } =
  storeToRefs(transactionStore);

/**
 * Get period type filter range (legacy compatibility function)
 * @param {string} period - The period type key
 * @param {Object} dateRange - Current date range with from/to
 * @param {Object} startDay - Start day configuration
 * @returns {Object} Date range with from/to
 */
export default function getPeriodTypeFilterRange(
  period,
  { from: currentFrom, to: currentTo } = {},
  startDay = { value: 0 },
) {
  const startDayValue = startDay?.value || 0;

  // For context-based periods, we use the provided date to determine context
  const contextDate =
    parseJalaaliDate(currentFrom) ||
    parseJalaaliDate(getCurrentJalaaliDateTime());

  switch (period) {
    case 'weekly':
      return getWeeklyDateRange(currentFrom, startDayValue);

    case 'monthly':
      return getMonthlyDateRange(contextDate.jy, contextDate.jm, startDayValue);

    case 'yearly':
      return getYearlyDateRange(contextDate.jy, startDayValue);

    case 'last7Days':
      return getLast7DaysRange();

    case 'last30Days':
      return getLast30DaysRange();

    case 'lastSalary':
      return getLastSalaryRange(lastSalaryTransaction.value?.date);

    case 'fromStart':
      return getFromStartRange(firstTransaction.value?.date);

    case 'customPeriod':
      return {
        from: currentFrom,
        to: currentTo,
      };

    default:
      return {
        from: currentFrom,
        to: currentTo,
      };
  }
}
