export default function compareJalaaliDates(dateA, dateB) {
  const [yearA, monthA, dayA] = dateA?.split('/').map(Number);
  const [yearB, monthB, dayB] = dateB?.split('/').map(Number);

  if (yearA !== yearB) return yearA - yearB;
  if (monthA !== monthB) return monthA - monthB;
  return dayA - dayB;
}
