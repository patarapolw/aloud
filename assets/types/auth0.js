/**
 * @template T
 * @callback AsyncGetter<T>
 * @returns {Promise<T>}
 */

/**
 * @typedef Auth0Client
 * @property {AsyncGetter<string>} getTokenSilently
 * @property {AsyncGetter<string>} getTokenWithPopup
 * @property {AsyncGetter<User>} getUser
 * @property {AsyncGetter<boolean>} isAuthenticated
 * @property {Function} logout
 */
