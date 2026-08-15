const API_BASE_URL = 'http://localhost:8081/api';

class AuthManager {
  static STORAGE_KEY = 'biocolombia_auth';

  static login(authResponse) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authResponse));
  }

  static logout() {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static getUser() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  static isAuthenticated() {
    const u = this.getUser();
    if (!u || !u.token) return false;
    try {
      const payload = JSON.parse(atob(u.token.split('.')[1]));
      if (payload.exp && (payload.exp * 1000) < Date.now()) {
        return false;
      }
      return true;
    } catch (e) {
      return true;
    }
  }

  static getToken() {
    const u = this.getUser();
    return u ? u.token : null;
  }
}

class ApiService {
  static getAuthHeaders(includeContentType = true) {
    const headers = {};
    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }
    const token = AuthManager.getToken();
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }
    return headers;
  }

  static async _request(url, options = {}) {
    const finalOptions = {
      ...options,
      headers: this.getAuthHeaders(!(options.body instanceof FormData)),
    };
    if (options.body && !(options.body instanceof FormData) && typeof options.body !== 'string') {
      finalOptions.body = JSON.stringify(options.body);
    }
    let resp;
    try {
      resp = await fetch(`${API_BASE_URL}${url}`, finalOptions);
    } catch (err) {
      throw new Error('Sin conexión al servidor');
    }
    if (resp.status === 401) {
      AuthManager.logout();
      throw new Error('Sesión expirada');
    }
    if (!resp.ok) {
      let msg = 'Error en la solicitud';
      try {
        const data = await resp.json();
        if (data && data.error) msg = data.error;
      } catch (e) {}
      const err = new Error(msg);
      err.status = resp.status;
      throw err;
    }
    const text = await resp.text();
    if (!text) return null;
    try { return JSON.parse(text); } catch (e) { return text; }
  }

  static async login(username, password) {
    const resp = await this._request('/auth/login', {
      method: 'POST',
      body: { username, password }
    });
    return resp;
  }

  static async register(userData) {
    return this._request('/auth/register', {
      method: 'POST',
      body: userData
    });
  }

  static async getAllFauna() {
    return this._request('/fauna', { method: 'GET' });
  }
  static async createFauna(data) {
    return this._request('/fauna', { method: 'POST', body: data });
  }
  static async updateFauna(id, data) {
    return this._request(`/fauna/${id}`, { method: 'PUT', body: data });
  }
  static async deleteFauna(id) {
    return this._request(`/fauna/${id}`, { method: 'DELETE' });
  }

  static async getAllFlora() {
    return this._request('/flora', { method: 'GET' });
  }
  static async createFlora(data) {
    return this._request('/flora', { method: 'POST', body: data });
  }
  static async updateFlora(id, data) {
    return this._request(`/flora/${id}`, { method: 'PUT', body: data });
  }
  static async deleteFlora(id) {
    return this._request(`/flora/${id}`, { method: 'DELETE' });
  }

  static async getAllAvistamientos() {
    return this._request('/avistamientos', { method: 'GET' });
  }
  static async createAvistamiento(data) {
    return this._request('/avistamientos', { method: 'POST', body: data });
  }
  static async syncAvistamientosBatch(avistamientos) {
    return this._request('/avistamientos/batch', { method: 'POST', body: avistamientos });
  }
  static async updateAvistamiento(id, data) {
    return this._request(`/avistamientos/${id}`, { method: 'PUT', body: data });
  }
  static async deleteAvistamiento(id) {
    return this._request(`/avistamientos/${id}`, { method: 'DELETE' });
  }

  static async getAllUsers() {
    return this._request('/users', { method: 'GET' });
  }
  static async createUser(data) {
    return this._request('/users', { method: 'POST', body: data });
  }
  static async updateUser(id, data) {
    return this._request(`/users/${id}`, { method: 'PUT', body: data });
  }
  static async deleteUser(id) {
    return this._request(`/users/${id}`, { method: 'DELETE' });
  }
}
