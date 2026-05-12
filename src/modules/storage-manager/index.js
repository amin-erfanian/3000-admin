import LocalStorage from './local-storage.js';
import SessionStorage from './session-storage.js';

/**
 * Creates a storage instance based on the specified storage type.
 * @param {string} storageType - The type of storage to create ('localStorage' or 'sessionStorage').
 * @returns {BaseStorage} An instance of the appropriate storage type.
 * @throws {Error} If an invalid storage type is provided.
 */
const createStorageInstance = (storageType) => {
  switch (storageType) {
    case 'localStorage':
      return new LocalStorage();
    case 'sessionStorage':
      return new SessionStorage();
    default:
      throw new Error('Invalid storage type provided');
  }
};

export default createStorageInstance;
