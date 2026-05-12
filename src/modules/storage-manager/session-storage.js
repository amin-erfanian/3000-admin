import BaseStorage from './base-storage.js';

/**
 * Represents a session storage implementation using the BaseStorage class.
 * @class
 * @extends BaseStorage
 */
class SessionStorage extends BaseStorage {
  /**
   * Constructs a new sessionStorage instance.
   * @constructor
   */
  constructor() {
    super(sessionStorage);
  }
}

export default SessionStorage;
