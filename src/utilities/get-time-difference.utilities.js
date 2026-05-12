export const getTimeDifference = (oldDate, newDate) => {
  if (!oldDate) return '-';

  const diffMs = new Date(newDate) - new Date(oldDate);
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMonths >= 1) return `${diffMonths} ماه قبل`;
  if (diffDays >= 1) return `${diffDays} روز و ${diffHours % 24} ساعت قبل`;
  if (diffHours >= 1)
    return `${diffHours} ساعت و ${diffMinutes % 60} دقیقه قبل`;
  return `${diffMinutes >= 1 ? diffMinutes : '1'} دقیقه قبل`;
};
