class Router {
  constructor(routes) {
    this.routes = routes;
    this.currentRoute = null;
    this.currentParams = {};
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());
  }

  getCurrentPath() {
    const hash = window.location.hash.slice(1) || '/';
    return hash.split('?')[0];
  }

  getQueryParams() {
    const hash = window.location.hash.slice(1) || '/';
    const qp = {};
    const parts = hash.split('?');
    if (parts.length > 1) {
      parts[1].split('&').forEach((kv) => {
        const [k, v] = kv.split('=');
        if (k) qp[decodeURIComponent(k)] = decodeURIComponent(v || '');
      });
    }
    return qp;
  }

  async handleRoute() {
    const path = this.getCurrentPath();
    const queryParams = this.getQueryParams();
    this.currentParams = queryParams;

    let matched = null;
    let routeParams = {};

    for (const route of this.routes) {
      const res = this.matchRoute(route.path, path);
      if (res) {
        matched = route;
        routeParams = res;
        break;
      }
    }

    if (!matched) {
      matched = this.routes.find((r) => r.path === '*') || this.routes[0];
    }

    this.currentRoute = matched;
    this.currentParams = { ...routeParams, ...queryParams };

    if (matched && matched.handler) {
      try {
        await matched.handler({ ...this.currentParams });
      } catch (err) {
        console.error('Route handler error:', err);
      }
    }
  }

  matchRoute(pattern, path) {
    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = path.split('/').filter(Boolean);

    if (pattern === '*') return {};
    if (patternParts.length !== pathParts.length) return null;

    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
      const pp = patternParts[i];
      const tp = pathParts[i];
      if (pp.startsWith(':')) {
        params[pp.slice(1)] = decodeURIComponent(tp);
      } else if (pp !== tp) {
        return null;
      }
    }
    return params;
  }

  navigate(path) {
    if (!path.startsWith('#')) path = '#' + path;
    window.location.hash = path;
  }

  reload() {
    this.handleRoute();
  }
}
