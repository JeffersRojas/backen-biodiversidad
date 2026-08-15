class LocalDB {
  constructor() {
    this.DB_NAME = 'BioColombiaDB';
    this.DB_VERSION = 1;
    this.STORE_AVISTAMIENTOS = 'avistamientos';
    this.STORE_SPECIES_DICT = 'species_dict';
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error('IndexedDB no soportado'));
        return;
      }

      const req = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      req.onupgradeneeded = (e) => {
        const db = e.target.result;

        if (!db.objectStoreNames.contains(this.STORE_AVISTAMIENTOS)) {
          const store = db.createObjectStore(this.STORE_AVISTAMIENTOS, { keyPath: 'idLocal' });
          store.createIndex('estado', 'estadoSincronizacion', { unique: false });
          store.createIndex('fecha', 'fechaHoraRegistro', { unique: false });
          store.createIndex('usuarioId', 'usuarioId', { unique: false });
        }

        if (!db.objectStoreNames.contains(this.STORE_SPECIES_DICT)) {
          const dict = db.createObjectStore(this.STORE_SPECIES_DICT, { keyPath: 'id' });
          dict.createIndex('categoria', 'categoria', { unique: false });
          dict.createIndex('nombreComun', 'nombreComun', { unique: false });
        }
      };

      req.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(this);
      };

      req.onerror = (e) => reject(e.target.error);
    });
  }

  async requestPersist() {
    try {
      if (navigator.storage && navigator.storage.persist) {
        const isPersisted = await navigator.storage.persist();
        return isPersisted;
      }
    } catch (e) {
      console.warn('No se pudo solicitar almacenamiento persistente', e);
    }
    return false;
  }

  async getStorageInfo() {
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const est = await navigator.storage.estimate();
        return {
          usage: est.usage || 0,
          quota: est.quota || 0,
          percentage: est.quota ? Math.round((est.usage / est.quota) * 100) : 0
        };
      }
    } catch (e) {}
    return { usage: 0, quota: 0, percentage: 0 };
  }

  _tx(storeName, mode) {
    const tx = this.db.transaction(storeName, mode);
    return {
      store: tx.objectStore(storeName),
      done: new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      })
    };
  }

  _promisify(req) {
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async addAvistamiento(avistamiento) {
    const { store, done } = this._tx(this.STORE_AVISTAMIENTOS, 'readwrite');
    store.put(avistamiento);
    await done;
    return avistamiento;
  }

  async getAvistamiento(idLocal) {
    const { store } = this._tx(this.STORE_AVISTAMIENTOS, 'readonly');
    return this._promisify(store.get(idLocal));
  }

  async getAllAvistamientos() {
    const { store } = this._tx(this.STORE_AVISTAMIENTOS, 'readonly');
    const results = await this._promisify(store.getAll());
    return results.sort((a, b) => new Date(b.fechaHoraRegistro) - new Date(a.fechaHoraRegistro));
  }

  async getPendingAvistamientos() {
    const all = await this.getAllAvistamientos();
    return all.filter((a) => a.estadoSincronizacion !== 'SYNCED');
  }

  async getSyncedAvistamientos() {
    const all = await this.getAllAvistamientos();
    return all.filter((a) => a.estadoSincronizacion === 'SYNCED');
  }

  async getTodayCount() {
    const all = await this.getAllAvistamientos();
    const today = new Date().toISOString().slice(0, 10);
    return all.filter((a) => (a.fechaHoraRegistro || '').startsWith(today)).length;
  }

  async updateAvistamiento(idLocal, updates) {
    const existing = await this.getAvistamiento(idLocal);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    await this.addAvistamiento(updated);
    return updated;
  }

  async deleteAvistamiento(idLocal) {
    const { store, done } = this._tx(this.STORE_AVISTAMIENTOS, 'readwrite');
    store.delete(idLocal);
    await done;
  }

  async clearAll() {
    const { store, done } = this._tx(this.STORE_AVISTAMIENTOS, 'readwrite');
    store.clear();
    await done;
  }

  async saveSpeciesDictionary(species) {
    const { store, done } = this._tx(this.STORE_SPECIES_DICT, 'readwrite');
    for (const s of species) {
      store.put(s);
    }
    await done;
  }

  async searchSpecies(query, categoria) {
    const { store } = this._tx(this.STORE_SPECIES_DICT, 'readonly');
    const all = await this._promisify(store.getAll());
    const q = (query || '').toLowerCase().trim();
    return all.filter((s) => {
      if (categoria && s.categoria !== categoria) return false;
      if (!q) return true;
      return (
        (s.nombreComun || '').toLowerCase().includes(q) ||
        (s.nombreCientifico || '').toLowerCase().includes(q)
      );
    }).slice(0, 50);
  }
}

const DB = new LocalDB();
