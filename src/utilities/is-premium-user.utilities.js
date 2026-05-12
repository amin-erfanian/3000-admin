import { jwtVerify, importSPKI } from 'jose';

const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtYDK42LmRzdAUzODwjczJOseZxiH1vDRoVKLLSOqx6Nake4Myj/JL4kQWmKyrgvlH8QWbk7ifKw895QPyj3VGDrmfWPSX0V0zpyKgiP/v13hL99U/ZddITYLCVuPTJA0Pa8J8vmcEscfFLuB51NZud6VWMGFUQVLof6iuWy4aPxw9voChCVpc8yieo4Sogw3AUuiNVQbd2SQP5b90GlJOyo4l5HfNu1RKLxyVeqklk5Vf3DeUnx7Dhl9LB9OrmtBMj1MwVGi+1AWxc70y37pBGpZvcPNruORclqL9cfdNGkGJ4cSHz/kyygY4oHenG8BIU6jQ20JrtMcr02/O3iE8QIDAQAB
-----END PUBLIC KEY-----`;

let cachedPublicKey = null;

async function getPublicKey() {
  if (!cachedPublicKey) {
    cachedPublicKey = await importSPKI(PUBLIC_KEY, 'RS256');
  }
  return cachedPublicKey;
}

export const isPremiumUser = async () => {
  const premiumToken = localStorage.getItem('premium-token');
  if (!premiumToken) return false;

  const token = localStorage.getItem('token');
  if (!token) return false;
  const authPayload = JSON.parse(atob(token.split('.')[1]));

  try {
    const publicKey = await getPublicKey();

    const { payload: premiumPayload } = await jwtVerify(
      premiumToken,
      publicKey,
      {
        algorithms: ['RS256'], // force algorithm
        subject: 'premium',
        audience: 'premium-access',
      },
    );

    // custom validation
    if (authPayload._id !== premiumPayload.uid) {
      throw new Error('INVALID_TOKEN');
    }

    return true;
  } catch (e) {
    console.warn('Premium validation failed:', e);
    return false;
  }
};

const SECONDS_PER_DAY = 24 * 60 * 60;

export const getPremiumRemainingDays = () => {
  const premiumToken = localStorage.getItem('premium-token');
  if (!premiumToken) return 0;

  try {
    const payload = JSON.parse(atob(premiumToken.split('.')[1]));
    const exp = payload.exp; // Unix timestamp in seconds
    if (typeof exp !== 'number') return 0;

    const nowSeconds = Math.floor(Date.now() / 1000);
    const remainingSeconds = exp - nowSeconds;
    if (remainingSeconds <= 0) return 0;

    return Math.floor(remainingSeconds / SECONDS_PER_DAY);
  } catch {
    return 0;
  }
};