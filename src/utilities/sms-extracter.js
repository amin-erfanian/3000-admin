import jalaali from 'jalaali-js';
import persianToEnglishDigits from './persian-to-english-digits.utilities';

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const EXPENSE_KEYWORDS = [
  'برداشت',
  'پرداخت',
  'خرید',
  'پرید',
  'هزینه',
  'انتقال',
  'کارت به کارت',
  'کسر',
  'بدهکار',
  'خرج',
];

// Keywords that indicate balance/remaining amount (NOT transaction amounts)
const BALANCE_KEYWORDS = [
  'مانده',
  'ماندە',
  'موجودی',
  'موجودي',
  'باقیمانده',
  'باقيمانده',
  'اعتبار',
];

const INCOME_KEYWORDS = [
  'واریز',
  'واريز', // alternative Arabic 'ي'
  'نشست',
  'دریافت',
  'دريافت', // alternative Arabic 'ي'
  'افزایش',
  'افزايش', // alternative Arabic 'ي'
  'وصول',
  'واریزی',
  'واريزي', // alternative Arabic 'ي'
  'واریزی',
  'شارژ شد',
  'بستانکار',
  'افزوده شد',
];

// Keywords and patterns that indicate OTP/password messages (not transactions)
const OTP_KEYWORDS = [
  'رمز پویا',
  'رمزپویا',
  'کد تایید',
  'کدتایید',
  'کد یکبار مصرف',
  'کدیکبارمصرف',
  'رمز یکبار مصرف',
  'رمزیکبارمصرف',
  'کد فعالسازی',
  'کدفعالسازی',
  'کد امنیتی',
  'کدامنیتی',
  'otp',
  // Note: Removed standalone 'رمز' and 'کد' as they cause false positives
  // (e.g., "کدشعبه" = branch code, "کدملی" = national code)
];

// Patterns that indicate OTP messages (e.g., "کد شما: 1234")
const OTP_PATTERNS = [
  /کد\s*(?:شما|تایید|یکبار\s*مصرف|امنیتی|فعالسازی)[\s:]*\d{4,8}/i,
  /رمز\s*(?:پویا|یکبار\s*مصرف|شما)[\s:]*\d{4,8}/i,
  /(?:otp|رمز|کد)[\s:]*\d{4,8}/i,
  /\d{4,8}\s*(?:کد|رمز|otp)/i,
];

const MONTH_NAME_MAP = {
  فروردین: '01',
  فروردين: '01',
  اردیبهشت: '02',
  ارديبهشت: '02',
  خرداد: '03',
  تیر: '04',
  تير: '04',
  مرداد: '05',
  شهریور: '06',
  شهريور: '06',
  مهر: '07',
  آبان: '08',
  آذر: '09',
  اذر: '09',
  دی: '10',
  دي: '10',
  بهمن: '11',
  اسفند: '12',
};

const MONTH_NAME_PATTERN = Array.from(new Set(Object.keys(MONTH_NAME_MAP)))
  .map(escapeRegExp)
  .join('|');

const NUMERIC_DATE_REGEXES = [
  /((?:13|14)\d{2})[./-]([12]\d|3[01]|0?[1-9]|1[0-2])[./-]([12]\d|3[01]|0?[1-9])/,
  /(\d{2})[./-]([12]\d|3[01]|0?[1-9]|1[0-2])[./-]([12]\d|3[01]|0?[1-9])/,
];

const DATE_WITH_MONTH_REGEX = MONTH_NAME_PATTERN
  ? new RegExp(
      `((?:13|14)\\d{2}|\\d{2})[\\s./-]+(${MONTH_NAME_PATTERN})[\\s./-]+((?:0?[1-9])|[12]\\d|3[01])`,
      'u',
    )
  : null;

const DATE_WITH_MONTH_REVERSED_REGEX = MONTH_NAME_PATTERN
  ? new RegExp(
      `((?:0?[1-9])|[12]\\d|3[01])[\\s./-]+(${MONTH_NAME_PATTERN})[\\s./-]+((?:13|14)\\d{2}|\\d{2})`,
      'u',
    )
  : null;

const TIME_REGEX = /\b([01]?\d|2[0-3])[_:-]([0-5]\d)\b/;
const AMOUNT_REGEX =
  /([+-]?\d[\d,٬]*(?:\.\d+)?)(?:\s|\u200c)*(ریال|ريال|تومان|تومن|تومان)/g;
const SIGNED_AMOUNT_REGEX = /([+-])(\d[\d,٬]*(?:\.\d+)?)/g;
// Amount with trailing +/- sign (e.g., "430,000+")
const TRAILING_SIGNED_AMOUNT_REGEX = /(\d[\d,٬]*(?:\.\d+)?)([+-])/g;
const PARTIAL_DATE_REGEX = /(?:^|\s)(\d{1,2})[./_-](\d{1,2})(?=[_\s:-]|$|\b)/;
// Compact 4-digit date format (MMDD or DDMM) followed by time separator
const COMPACT_DATE_REGEX =
  /\b(\d{2})(\d{2})[_:-]([01]?\d|2[0-3])[_:-]([0-5]\d)\b/;
// YYMMDD date format followed by time (6 digits + separator + time)
const YYMMDD_TIME_REGEX =
  /\b(\d{2})(\d{2})(\d{2})[_:-]([01]?\d|2[0-3])[_:-]([0-5]\d)\b/;
// Date-time combined with dash: YYYY/M/DD-H:MM or YY/MM/DD-HH:MM
const DATE_TIME_COMBINED_REGEX =
  /((?:13|14)?\d{1,4})[./-](0?[1-9]|1[0-2])[./-](0?[1-9]|[12]\d|3[01])[_:-]([01]?\d|2[0-3])[_:-]([0-5]\d)/;

const buildEmptyResult = () => ({
  type: null,
  date: null,
  time: null,
  amount: null,
});

function isOtpOrPasswordMessage(text) {
  if (!text || typeof text !== 'string') {
    return false;
  }

  const normalized = text.replace(/\s+/g, ' ').toLowerCase();
  const normalizedFarsi = persianToEnglishDigits(normalized);

  // Check for OTP keywords - if found, return true immediately
  if (
    OTP_KEYWORDS.some((keyword) => normalized.includes(keyword.toLowerCase()))
  ) {
    return true;
  }

  // Check for OTP patterns
  if (OTP_PATTERNS.some((pattern) => pattern.test(normalizedFarsi))) {
    return true;
  }

  // Check if message is primarily a short numeric code (4-8 digits) without transaction context
  const shortCodePattern = /^\s*(?:کد|رمز|otp)[\s:]*(\d{4,8})\s*$/i;
  if (shortCodePattern.test(normalizedFarsi)) {
    return true;
  }

  // Check if message contains a short numeric code (4-8 digits) but no transaction context
  // This catches OTP messages that might not have explicit OTP keywords
  const hasShortCode = /\b\d{4,8}\b/.test(normalizedFarsi);
  const hasTransactionKeyword = [...EXPENSE_KEYWORDS, ...INCOME_KEYWORDS].some(
    (keyword) => normalized.includes(keyword.toLowerCase()),
  );

  // Reset lastIndex for global regexes before testing
  AMOUNT_REGEX.lastIndex = 0;
  SIGNED_AMOUNT_REGEX.lastIndex = 0;

  const hasAmount =
    AMOUNT_REGEX.test(normalizedFarsi) ||
    SIGNED_AMOUNT_REGEX.test(normalizedFarsi);

  // Reset again after testing
  AMOUNT_REGEX.lastIndex = 0;
  SIGNED_AMOUNT_REGEX.lastIndex = 0;

  // If message has a short code but no transaction keywords or amounts, it might be OTP
  // Only flag as OTP if the message is very short (likely just a code)
  if (
    hasShortCode &&
    !hasTransactionKeyword &&
    !hasAmount &&
    normalized.length < 50
  ) {
    // Additional check: if it's mostly just numbers and OTP-related words, it's likely OTP
    const numericRatio =
      (normalizedFarsi.match(/\d/g) || []).length / normalizedFarsi.length;
    if (numericRatio > 0.3) {
      // Message is mostly numbers - likely an OTP code
      return true;
    }
  }

  return false;
}

function isValidTransaction(extractedData) {
  if (!extractedData) {
    return false;
  }

  // Must have amount - this is the most critical indicator of a transaction
  const hasAmount =
    extractedData.amount !== null && extractedData.amount !== undefined;

  if (!hasAmount) {
    return false;
  }

  // Should have at least one of: type OR date
  // This ensures we're not treating generic bank notifications as transactions
  const hasType =
    extractedData.type !== null && extractedData.type !== undefined;
  const hasDate =
    extractedData.date !== null && extractedData.date !== undefined;

  // If we have amount + (type OR date), it's likely a real transaction
  if (hasType || hasDate) {
    return true;
  }

  // If we only have amount but no type or date, it might be a notification
  // Return false to be safe
  return false;
}

export default function extractSmsMetadata(rawText) {
  if (typeof rawText !== 'string') {
    return buildEmptyResult();
  }

  const trimmed = rawText.trim();
  if (!trimmed) {
    return buildEmptyResult();
  }

  // Step 1: Early return if this is an OTP/password message (not a transaction)
  if (isOtpOrPasswordMessage(trimmed)) {
    return buildEmptyResult();
  }

  const normalizedWhitespace = trimmed.replace(/_/g, ' ').replace(/\s+/g, ' ');
  const textWithEnglishDigits = persianToEnglishDigits(normalizedWhitespace);

  // Step 2: Try extracting transaction data
  const amount = extractAmount(textWithEnglishDigits);
  const extractedData = {
    type: detectTransactionType(
      normalizedWhitespace,
      textWithEnglishDigits,
      amount,
    ),
    date: extractDate(textWithEnglishDigits),
    time: extractTime(textWithEnglishDigits),
    amount: amount,
  };

  // Step 3: Validate that we have enough data to be confident it's a transaction
  // Only return the data if we're certain it's a real transaction message
  if (!isValidTransaction(extractedData)) {
    return buildEmptyResult();
  }

  return extractedData;
}

function detectTransactionType(text, numericText, amountObj) {
  const sanitized = text.replace(/\s+/g, ' ');

  // Check for polarity from amount object first (+ or - signs take precedence)
  if (amountObj && amountObj.polarity) {
    if (amountObj.polarity === '+') return 'income';
    if (amountObj.polarity === '-') return 'expense';
  }

  // Then check for explicit income keywords
  if (INCOME_KEYWORDS.some((keyword) => sanitized.includes(keyword))) {
    return 'income';
  }

  // Finally check for expense keywords
  if (EXPENSE_KEYWORDS.some((keyword) => sanitized.includes(keyword))) {
    return 'expense';
  }

  return null;
}

function extractDate(text) {
  // Try date-time combined format first (YYYY/M/DD-H:MM or YY/MM/DD-HH:MM)
  const combinedDateTime = extractCombinedDateTime(text);
  if (combinedDateTime && combinedDateTime.date) {
    return combinedDateTime.date;
  }

  // Try YYMMDD-HH:MM format (6-digit date + time)
  const yymmddDate = extractYYMMDDDate(text);
  if (yymmddDate) {
    return yymmddDate;
  }

  // Try full year format (YYYY/MM/DD)
  for (const regex of NUMERIC_DATE_REGEXES) {
    const payload = matchDateByRegex(text, regex, { source: 'numeric' });
    if (payload) {
      // If it's a 4-digit year, we're confident it's YMD
      if (payload.parts.year.length === 4) {
        return payload;
      }
      // For 2-digit dates (YY/MM/DD format), validate the result
      // Persian banks typically use YY/MM/DD, so YMD order is preferred
      const month = Number(payload.parts.month);
      const day = Number(payload.parts.day);
      if (month <= 12 && day <= 31) {
        return payload;
      }
      // If YMD doesn't make sense, try DMY (DD/MM/YY)
      const dmyPayload = matchDateByRegex(text, regex, {
        source: 'numeric',
        order: 'DMY',
      });
      if (dmyPayload) {
        const dmyMonth = Number(dmyPayload.parts.month);
        const dmyDay = Number(dmyPayload.parts.day);
        if (dmyMonth <= 12 && dmyDay <= 31) {
          return dmyPayload;
        }
      }
      // If neither makes sense, return the original (might be edge case)
      return payload;
    }
  }

  const namedMonthPayload = matchDateByRegex(text, DATE_WITH_MONTH_REGEX, {
    monthIsText: true,
    order: 'YMD',
    source: 'named-month',
  });

  if (namedMonthPayload) {
    return namedMonthPayload;
  }

  const reversed = matchDateByRegex(text, DATE_WITH_MONTH_REVERSED_REGEX, {
    monthIsText: true,
    order: 'DMY',
    source: 'named-month',
  });
  if (reversed) {
    return reversed;
  }

  // Try compact 4-digit date format (MMDD or DDMM) before time
  const compactDate = extractCompactDate(text);
  if (compactDate) {
    return compactDate;
  }

  return extractPartialDate(text);
}

function extractTime(text) {
  // Try combined date-time format first
  const combinedDateTime = extractCombinedDateTime(text);
  if (combinedDateTime && combinedDateTime.time) {
    return combinedDateTime.time;
  }

  // Try YYMMDD-HH:MM format
  const yymmddTime = extractYYMMDDTime(text);
  if (yymmddTime) {
    return yymmddTime;
  }

  // Try standard time regex
  const match = text.match(TIME_REGEX);
  if (!match) {
    return null;
  }
  const hours = match[1].padStart(2, '0');
  const minutes = match[2].padStart(2, '0');
  return {
    raw: match[0],
    value: `${hours}:${minutes}`,
  };
}

function extractAmount(text) {
  const sanitized = text.replace(/\u200c/g, '');
  let candidates = [];

  // Reset regex lastIndex since we're using global flag
  AMOUNT_REGEX.lastIndex = 0;
  SIGNED_AMOUNT_REGEX.lastIndex = 0;
  TRAILING_SIGNED_AMOUNT_REGEX.lastIndex = 0;

  // Pattern 1: Amount with explicit currency (highest priority)
  const currencyMatches = [...sanitized.matchAll(AMOUNT_REGEX)];
  for (const match of currencyMatches) {
    const sign = match[1]?.startsWith('-')
      ? '-'
      : match[1]?.startsWith('+')
      ? '+'
      : null;
    const rawNumber = match[1]?.replace(/^[+-]/, '');
    const numericValue = Number(rawNumber.replace(/[,٬]/g, ''));

    if (!Number.isNaN(numericValue) && numericValue > 0) {
      // Check if amount comes immediately AFTER a balance keyword (within ~20 chars before)
      const matchIndex = match.index;
      const contextBefore = sanitized.substring(
        Math.max(0, matchIndex - 20),
        matchIndex,
      );
      const hasBalanceBefore = BALANCE_KEYWORDS.some((kw) =>
        contextBefore.includes(kw),
      );

      // Skip if this amount appears right after a balance keyword
      if (hasBalanceBefore) {
        continue;
      }

      candidates.push({
        raw: match[0].trim(),
        value: numericValue,
        currency: normalizeCurrency(match[2]),
        polarity: sign,
        priority: 100, // Highest priority - has explicit currency
        index: matchIndex,
      });
    }
  }

  // Pattern 2: Trailing sign format (e.g., "430,000+" or "3,000,000+")
  const trailingSignMatches = [
    ...sanitized.matchAll(TRAILING_SIGNED_AMOUNT_REGEX),
  ];
  for (const match of trailingSignMatches) {
    const rawNumber = match[1];
    const numericValue = Number(rawNumber.replace(/[,٬]/g, ''));
    const sign = match[2];

    if (!Number.isNaN(numericValue) && numericValue > 0) {
      // Check if amount comes immediately AFTER a balance keyword (within ~20 chars before)
      const matchIndex = match.index;
      const contextBefore = sanitized.substring(
        Math.max(0, matchIndex - 20),
        matchIndex,
      );
      const hasBalanceBefore = BALANCE_KEYWORDS.some((kw) =>
        contextBefore.includes(kw),
      );

      // Skip if this amount appears right after a balance keyword
      if (hasBalanceBefore) {
        continue;
      }

      // Check if this isn't part of a date pattern (avoid things like "04/09/08")
      const hasComma = rawNumber.includes(',') || rawNumber.includes('٬');
      const priority = hasComma ? 90 : numericValue > 1000 ? 70 : 30;

      candidates.push({
        raw: match[0].trim(),
        value: numericValue,
        currency: 'ریال',
        polarity: sign,
        priority: priority,
        index: matchIndex,
      });
    }
  }

  // Pattern 3: Leading sign format (e.g., "+1,000,000" or "-430,000")
  const leadingSignMatches = [...sanitized.matchAll(SIGNED_AMOUNT_REGEX)];
  for (const match of leadingSignMatches) {
    const sign = match[1];
    const rawNumber = match[2];
    const numericValue = Number(rawNumber.replace(/[,٬]/g, ''));

    if (!Number.isNaN(numericValue) && numericValue > 0) {
      // Check if amount comes immediately AFTER a balance keyword (within ~20 chars before)
      const matchIndex = match.index;
      const contextBefore = sanitized.substring(
        Math.max(0, matchIndex - 20),
        matchIndex,
      );
      const hasBalanceBefore = BALANCE_KEYWORDS.some((kw) =>
        contextBefore.includes(kw),
      );

      // Skip if this amount appears right after a balance keyword
      if (hasBalanceBefore) {
        continue;
      }

      const hasComma = rawNumber.includes(',') || rawNumber.includes('٬');
      const priority = hasComma ? 85 : numericValue > 1000 ? 65 : 25;

      candidates.push({
        raw: match[0].trim(),
        value: numericValue,
        currency: 'ریال',
        polarity: sign,
        priority: priority,
        index: matchIndex,
      });
    }
  }

  // Pattern 4: Amounts with commas near transaction keywords
  const amountPattern = /(\d{1,3}(?:[,٬]\d{3})+(?:\.\d+)?)/g;
  const amountMatches = [...sanitized.matchAll(amountPattern)];
  for (const match of amountMatches) {
    const rawNumber = match[1];
    const numericValue = Number(rawNumber.replace(/[,٬]/g, ''));

    if (!Number.isNaN(numericValue) && numericValue > 0) {
      const matchIndex = match.index;

      // Check if amount comes immediately AFTER a balance keyword (within ~20 chars before)
      const contextBefore = sanitized.substring(
        Math.max(0, matchIndex - 20),
        matchIndex,
      );
      const hasBalanceBefore = BALANCE_KEYWORDS.some((kw) =>
        contextBefore.includes(kw),
      );

      // Skip if this amount appears right after a balance keyword
      if (hasBalanceBefore) {
        continue;
      }

      // Check if this amount is near transaction keywords
      const contextStart = Math.max(0, matchIndex - 30);
      const contextEnd = Math.min(
        sanitized.length,
        matchIndex + match[0].length + 10,
      );
      const context = sanitized.substring(contextStart, contextEnd);

      const hasTransactionContext =
        EXPENSE_KEYWORDS.some((kw) => context.includes(kw)) ||
        INCOME_KEYWORDS.some((kw) => context.includes(kw));

      const priority = hasTransactionContext ? 80 : 60;

      candidates.push({
        raw: match[0].trim(),
        value: numericValue,
        currency: 'ریال',
        polarity: null,
        priority: priority,
        index: matchIndex,
      });
    }
  }

  // Remove duplicates (same value at similar position)
  candidates = candidates.filter((candidate, index, self) => {
    return (
      index ===
      self.findIndex(
        (c) =>
          c.value === candidate.value &&
          Math.abs(c.index - candidate.index) < 5,
      )
    );
  });

  // Sort by priority (highest first), then by value (largest first)
  candidates.sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    return b.value - a.value;
  });

  // Return the best candidate
  if (candidates.length > 0) {
    const best = candidates[0];
    return {
      raw: best.raw,
      value: best.value,
      currency: best.currency,
      normalized: `${best.value} ${best.currency}`,
      polarity: best.polarity,
    };
  }

  return null;
}

function extractCombinedDateTime(text) {
  // Match combined date-time format: YYYY/M/DD-H:MM or YY/MM/DD-HH:MM
  const match = text.match(DATE_TIME_COMBINED_REGEX);
  if (!match) return null;

  let year = match[1];
  const month = match[2];
  const day = match[3];
  const hours = match[4].padStart(2, '0');
  const minutes = match[5].padStart(2, '0');

  // Normalize year
  if (year.length <= 2) {
    year = normalizeYear(year);
  } else if (year.length === 3) {
    year = '1' + year;
  }
  // If year.length === 4, it's already normalized

  const normalizedMonth = padTwoDigits(month);
  const normalizedDay = padTwoDigits(day);

  if (!year || !normalizedMonth || !normalizedDay) {
    return null;
  }

  const raw = match[0];
  return {
    date: {
      raw: raw,
      value: `${year}/${normalizedMonth}/${normalizedDay}`,
      parts: {
        year: year,
        month: normalizedMonth,
        day: normalizedDay,
      },
      source: 'combined-datetime',
    },
    time: {
      raw: raw,
      value: `${hours}:${minutes}`,
    },
  };
}

function extractYYMMDDDate(text) {
  // Match YYMMDD-HH:MM format like "040910-12:04"
  const match = text.match(YYMMDD_TIME_REGEX);
  if (!match) return null;

  const yy = match[1];
  const mm = match[2];
  const dd = match[3];

  // Validate month and day
  const month = Number(mm);
  const day = Number(dd);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const year = normalizeYear(yy);
  const raw = `${yy}${mm}${dd}`;

  return buildDatePayload(raw, year, mm, dd, 'yymmdd');
}

function extractYYMMDDTime(text) {
  // Match YYMMDD-HH:MM format like "040910-12:04"
  const match = text.match(YYMMDD_TIME_REGEX);
  if (!match) return null;

  const hours = match[4].padStart(2, '0');
  const minutes = match[5].padStart(2, '0');

  return {
    raw: match[0],
    value: `${hours}:${minutes}`,
  };
}

function extractCompactDate(text) {
  // Match compact format like "0902-12:40" where 0902 is MMDD or DDMM
  const match = text.match(COMPACT_DATE_REGEX);
  if (!match) return null;

  const first = Number(match[1]);
  const second = Number(match[2]);

  if (!first || !second) {
    return null;
  }

  // Determine if it's MMDD or DDMM format
  // If first part is > 12, it's likely DDMM (day > 12, month <= 12)
  // If first part <= 12 and second > 12, it's likely MMDD
  // If both <= 12, prefer MMDD (more common in bank messages)
  let month, day;
  if (first > 12 && second <= 12) {
    // DDMM format
    day = first;
    month = second;
  } else if (first <= 12 && second > 12) {
    // MMDD format
    month = first;
    day = second;
  } else if (first <= 12 && second <= 12) {
    // Both could be valid, prefer MMDD
    month = first;
    day = second;
  } else {
    // Both > 12, invalid - try swapping
    if (second <= 12) {
      day = first;
      month = second;
    } else {
      return null;
    }
  }

  // Validate day
  if (day > 31 || month > 12) {
    return null;
  }

  const year = getCurrentJalaaliYear();
  const raw = `${match[1]}${match[2]}`;

  return buildDatePayload(raw, year, month, day, 'compact');
}

function extractPartialDate(text) {
  const match = text.match(PARTIAL_DATE_REGEX);
  if (!match) return null;

  const left = Number(match[1]);
  const right = Number(match[2]);

  if (!left || !right) {
    return null;
  }

  // Default assumption: left is month, right is day (MM/DD or MM-DD)
  let month = left;
  let day = right;

  // If inferred month is invalid (>12) but the inferred day is valid, swap them
  if (month > 12 && day <= 12) {
    [month, day] = [day, month];
  }

  // If the inferred day is clearly invalid (>31) while the month looks valid, swap
  if (day > 31 && month <= 12) {
    [month, day] = [day, month];
  }

  // Validate the final result
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const year = getCurrentJalaaliYear();

  return buildDatePayload(match[0].trim(), year, month, day, 'partial');
}

function matchDateByRegex(text, regex, options = {}) {
  if (!regex) {
    return null;
  }

  const match = text.match(regex);
  if (!match) {
    return null;
  }

  const [raw, first, second, third] = match;
  const order = options.order || 'YMD';

  const { year, monthToken, day } =
    order === 'DMY'
      ? { year: third, monthToken: second, day: first }
      : { year: first, monthToken: second, day: third };

  const month = options.monthIsText ? mapMonthName(monthToken) : monthToken;

  return buildDatePayload(raw, year, month, day, options.source);
}

function buildDatePayload(raw, year, month, day, source) {
  const normalizedYear = normalizeYear(year);
  const normalizedMonth = padTwoDigits(month);
  const normalizedDay = padTwoDigits(day);

  if (!normalizedYear || !normalizedMonth || !normalizedDay) {
    return null;
  }

  return {
    raw,
    value: `${normalizedYear}/${normalizedMonth}/${normalizedDay}`,
    parts: {
      year: normalizedYear,
      month: normalizedMonth,
      day: normalizedDay,
    },
    source,
  };
}

function mapMonthName(token = '') {
  const trimmed = token.trim();
  if (!trimmed) {
    return null;
  }

  return (
    MONTH_NAME_MAP[trimmed] ||
    MONTH_NAME_MAP[trimmed.replace(/ماه$/u, '')] ||
    null
  );
}

function normalizeYear(value = '') {
  const digits = value.toString().replace(/[^\d]/g, '');
  if (!digits) {
    return null;
  }

  if (digits.length === 4) {
    return digits;
  }

  if (digits.length === 3) {
    return `1${digits}`;
  }

  if (digits.length <= 2) {
    const padded = digits.padStart(2, '0');
    const prefix = Number(padded) >= 50 ? '13' : '14';
    return `${prefix}${padded}`;
  }

  return digits.slice(-4);
}

function padTwoDigits(value = '') {
  const digits = value.toString().replace(/[^\d]/g, '');
  if (!digits) {
    return null;
  }
  return digits.padStart(2, '0');
}

function normalizeCurrency(value = '') {
  const cleaned = value.replace(/\u200c/g, '');
  if (/تو?مان|تومن/.test(cleaned)) {
    return 'تومان';
  }
  return 'ریال';
}

function getCurrentJalaaliYear() {
  const today = new Date();
  const { jy } = jalaali.toJalaali(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate(),
  );
  return jy.toString();
}
