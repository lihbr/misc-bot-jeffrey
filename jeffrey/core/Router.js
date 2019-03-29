/**
 * Config
 */
class Router {
  constructor() {
    this._routes = [];
  }

  /**
   * Add a route to the router
   * @param {string} type - primary type (strict)
   * @param {string} subtype - secondary type (non strict, start with)
   * @param {function} callback - route callback
   */
  use(type, subtype, callback) {
    this._routes.push([type, subtype, callback]);
  }

  /**
   * Route an event
   * @param {object} event - event object
   * @return {mix} - routing result
   */
  route(event) {
    for (const route of this._routes) {
      if (
        event.type === route[0] &&
        (event.subtype === route[1] || route[1] === "*")
      ) {
        if (route[3]) {
          return route[2](event, route[3]);
        } else {
          return route[2](event);
        }
      }
    }

    return false;
  }
}

/**
 * Export
 */
module.exports = Router;
