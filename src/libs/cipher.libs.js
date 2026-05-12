import CryptoJS from 'crypto-js';

/**
 * Represents cipher class.
 * @class
 */
class Cipher {
  /**
   * Constructs a new BaseStorage instance.
   * @constructor
   * @param {string} secretKey - The storage instance for encrypt and decrypt data.
   */
  constructor(secretKey) {
    this.secretKey = secretKey;
  }

  /**
   * Encrypts the provided data using the secret key.
   * @memberof Cipher
   * @param {*} data - The data to encrypt.
   * @returns {string} The encrypted data.
   */

  encrypt(data) {
    const payload = JSON.stringify(data);
    return CryptoJS.AES.encrypt(payload, this.secretKey).toString();
  }

  /**
   * Decrypts the provided encrypted data using the secret key.
   * @memberof Cipher
   * @param {string} encryptedData - The encrypted data to decrypt.
   * @returns {*} The decrypted data.
   */
  decrypt(encryptedData) {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.secretKey);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      throw Error('Data is not encrypted');
    }
  }
}

const secretKey = '3d953812-824c-4fcc-95cf-e4136e771eb3';

const cipher = new Cipher(secretKey);

export default cipher;
