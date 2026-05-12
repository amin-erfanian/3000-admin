const nationalCodeDefaultError = 'کد ملی معتبر نیست ';
function isNumber(value) {
  return /^[0-9]+$/.test(value);
}

const persianCharacter = (value) => {
  const pattern = /^[\u0600-\u06FF\s]+$/;
  return pattern.test(value) || 'لطفا اطلاعات را به فارسی وارد نمایید';
};

const nationalCode = (value) => {
  let code = value;
  if (code.length === 10) {
    if (
      code == '0000000000' ||
      code == '1111111111' ||
      code == '2222222222' ||
      code == '3333333333' ||
      code == '4444444444' ||
      code == '5555555555' ||
      code == '6666666666' ||
      code == '7777777777' ||
      code == '8888888888' ||
      code == '9999999999'
    ) {
      return nationalCodeDefaultError;
    }
    let c = parseInt(code.charAt(9));
    let n =
      parseInt(code.charAt(0)) * 10 +
      parseInt(code.charAt(1)) * 9 +
      parseInt(code.charAt(2)) * 8 +
      parseInt(code.charAt(3)) * 7 +
      parseInt(code.charAt(4)) * 6 +
      parseInt(code.charAt(5)) * 5 +
      parseInt(code.charAt(6)) * 4 +
      parseInt(code.charAt(7)) * 3 +
      parseInt(code.charAt(8)) * 2;
    let r = n - parseInt(n / 11) * 11;
    if ((r == 0 && r == c) || (r == 1 && c == 1) || (r > 1 && c == 11 - r)) {
      return true;
    }

    return nationalCodeDefaultError;
  }
  return nationalCodeDefaultError;
};

const phoneNumber = (value) => {
  if (!value) return true;
  const phoneRegex = /^09\d{9}$/;
  return (
    phoneRegex.test(value) || 'شماره تلفن باید 11 رقم بوده و با 09 شروع شود'
  );
};

const confirmPassword = (value, [target]) =>
  value === target ? true : 'تکرار رمز عبور باید مطابقت داشته باشد';

const checkFileSize = (files, [maxSize]) => {
  for (let i = 0; i < files.length; i++) {
    if (files[i].size > maxSize * 1024)
      return `حجم فایل باید کمتر از ${maxSize} کیلوبایت باشد `;
  }
  return true;
};

const acceptFileTypes = (files, [...allowedExtensions]) => {
  const allowedExtensionsString = allowedExtensions.join(' یا ');

  for (let i = 0; i < files.length; i++) {
    const fileExtension = files[i].type.split('/')[1];
    if (!allowedExtensions.includes(fileExtension))
      return `پسوند فایل مورد نظر باید ${allowedExtensionsString} باشد`;
  }
  return true;
};

const determineFileUploadMode = (files, [uploadMode]) => {
  if (uploadMode === 'multiple') {
    return true;
  }
  if (files.length > 1 && uploadMode === 'single') {
    return 'لطفا فقط یک فایل بارگذاری کنید ';
  }
  return true;
};

const customRequired = (values, [label]) => {
  const requiredDefaultError = `${label} الزامی است`;
  if (values === undefined || values === null) {
    return requiredDefaultError;
  }

  if (Array.isArray(values) && values.length === 0) {
    return requiredDefaultError;
  }

  if (typeof values === 'string' && values.trim() === '') {
    return requiredDefaultError;
  }

  return true;
};

const customMin = (value, [min], { label }) => {
  if (typeof value === 'string' && value.trim().length < min) {
    return `${label} نباید کوچکتر از ${min} حرف باشد`;
  }
  return true;
};

const passwordEnglish = (value) => {
  const persianRegex = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFBCF\uFE70-\uFEFF]/;
  return persianRegex.test(value)
    ? 'لطفاً فقط از حروف و نماد انگلیسی استفاده کنید'
    : true;
};

const investmentAmount = (value) => {
  return isNumber(value) ? true : 'لطفا مبلغ را به عدد وارد کنید';
};

const numberReceipt = (value) => {
  const regex = /^[0-9/\-.]*$/;
  return regex.test(value) ? true : 'کاراکترهای مجاز - / .';
};

export default {
  persianCharacter,
  nationalCode,
  phoneNumber,
  confirmPassword,
  passwordEnglish,
  investmentAmount,
  checkFileSize,
  acceptFileTypes,
  customRequired,
  numberReceipt,
  determineFileUploadMode,
  customMin,
};
