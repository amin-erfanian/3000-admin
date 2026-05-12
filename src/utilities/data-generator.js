export const prepareVerifyUser = (data) => ({
  birthDate: data.birthDate,
  mobileNo: data.phoneNumber,
  nationalCode: data.nationalCode,
  // raUniqueKey: raUniqueKey,
});

export const prepareKycToken = (serialNumber, nationalCode) => ({
  nationalCode: nationalCode,
  nationalCardSerialNumber: serialNumber,
});

export const prepareCheckUserCertificate = (data) => ({
  mobileNo: data.phoneNumber,
  nationalId: data.nationalCode,
});

export const prepareSigniturePin = (temporaryToken, nationalId, mobile, dtbs, pin) => ({
  temporaryToken,
  nationalId,
  mobile,
  dtbs,
  pin,
});

export const perpareSignVerifyOtp = (nationalId, mobileNo, code) => ({
  nationalId,
  mobileNo,
  code,
});

export const perpareRevokeCertificate = (temporaryToken, nationalId, mobile) => ({
  temporaryToken,
  nationalId,
  mobile,
});
