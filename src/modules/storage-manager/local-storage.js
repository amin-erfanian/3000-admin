import BaseStorage from './base-storage.js';

/**
 * Represents a local storage implementation using the BaseStorage class.
 * @class
 * @extends BaseStorage
 */
class LocalStorage extends BaseStorage {
  /**
   * Constructs a new LocalStorage instance.
   * @constructor
   */
  constructor() {
    super(localStorage);
  }
}

export default LocalStorage;
