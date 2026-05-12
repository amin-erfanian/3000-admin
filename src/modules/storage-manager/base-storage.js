/**
 * Represents a base storage class.
 * @class
 */
class BaseStorage {
  /**
   * Constructs a new BaseStorage instance.
   * @constructor
   * @param {Storage} storage - The storage instance to use (e.g., localStorage, sessionStorage).
   */
  constructor(storage) {
    this.storage = storage;
  }

  /**
   * Stores data in the storage.
   * @memberof BaseStorage
   * @param {string} key - The key under which to store the data.
   * @param {*} value - The value to store.
   */
  setItem(key, value) {
    this.storage.setItem(key, value);
  }

  /**
   * Retrieves data from the storage.
   * @memberof BaseStorage
   * @param {string} key - The key under which the data is stored.
   * @returns {*} The retrieved data.
   */
  getItem(key) {
    const storedValue = this.storage.getItem(key);

    if (!storedValue) return null;

    return storedValue;
  }

  /**
   * Removes data from the storage.
   * @memberof BaseStorage
   * @param {string} key - The key of the data to remove.
   */
  remove(key) {
    this.storage.removeItem(key);
  }

  /**
   * Clears all data from the storage.
   * @memberof BaseStorage
   */
  clear() {
    this.storage.clear();
  }
}

export default BaseStorage;
