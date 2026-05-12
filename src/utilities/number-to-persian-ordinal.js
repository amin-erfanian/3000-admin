export default function numberToPersianOrdinal(n) {
  const ordinals = [
    'صفرم',
    'اول',
    'دوم',
    'سوم',
    'چهارم',
    'پنجم',
    'ششم',
    'هفتم',
    'هشتم',
    'نهم',
    'دهم',
    'یازدهم',
    'دوازدهم',
    'سیزدهم',
    'چهاردهم',
    'پانزدهم',
    'شانزدهم',
    'هفدهم',
    'هجدهم',
    'نوزدهم',
  ];

  const tensOrdinals = [
    '',
    '',
    'بیست',
    'سی‌',
    'چهل',
    'پنجاه',
    'شصت',
    'هفتاد',
    'هشتاد',
    'نود',
  ];

  const tens = [
    '',
    '',
    'بیستم',
    'سی‌ام',
    'چهلم',
    'پنجاهم',
    'شصتم',
    'هفتادم',
    'هشتادم',
    'نودم',
  ];

  if (n < 20) return ordinals[n];
  if (n < 100) {
    if (n % 10 === 0) {
      return tens[Math.floor(n / 10)];
    } else {
      const ordinal = n % 10 === 1 ? 'یکم' : ordinals[n % 10];
      return tensOrdinals[Math.floor(n / 10)] + ' و ' + ordinal;
    }
  }
  let hundredPart = Math.floor(n / 100);
  let remainder = n % 100;

  let hundredWord = ordinals[hundredPart] + 'صدم';
  if (remainder === 0) return hundredWord;

  return (
    hundredWord.replace('صدم', 'صد و ') + numberToPersianOrdinal(remainder)
  );
}
