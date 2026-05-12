export default function (value) {
  const persian = '۰۱۲۳۴۵۶۷۸۹';
  return value.replace(/[۰-۹]/g, (w) => persian.indexOf(w).toString());
}
