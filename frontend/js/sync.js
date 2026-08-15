class SyncManager {
  constructor() {
    this.isSyncing = false;
    this.listeners = [];
  }

  onUpdate(fn) {
    this.listeners.push(fn);
  }

  _emit(state) {
    this.listeners.forEach((fn) => {
      try { fn(state); } catch (e) {}
    });
  }

  isOnline() {
    return navigator.onLine;
  }

  async registerBackgroundSync() {
    try {
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        const reg = await navigator.serviceWorker.ready;
        await reg.sync.register('sync-avistamientos');
        return true;
      }
    } catch (e) {
      console.warn('Background Sync no disponible:', e);
    }
    return false;
  }

  async trySyncNow() {
    if (this.isSyncing) return { status: 'ALREADY_SYNCING' };
    if (!this.isOnline()) return { status: 'OFFLINE' };

    this.isSyncing = true;
    this._emit({ status: 'SYNCING', progress: 0 });

    try {
      const user = AuthManager.getUser();
      if (!user) {
        this.isSyncing = false;
        return { status: 'NO_AUTH' };
      }

      const pending = await DB.getPendingAvistamientos();
      if (pending.length === 0) {
        this.isSyncing = false;
        this._emit({ status: 'DONE', synced: 0, total: 0 });
        return { status: 'NOTHING_TO_SYNC' };
      }

      let synced = 0;
      let failed = 0;

      const BATCH_SIZE = 10;
      for (let i = 0; i < pending.length; i += BATCH_SIZE) {
        const batch = pending.slice(i, i + BATCH_SIZE);
        const payload = batch.map((a) => {
          const { idLocal, ...rest } = a;
          return { idLocal, ...rest };
        });

        try {
          const result = await ApiService.syncAvistamientosBatch(payload);
          const syncedIds = result.map((r) => r.idLocal).filter(Boolean);
          const successMap = {};
          result.forEach((r) => { if (r.idLocal) successMap[r.idLocal] = r; });

          for (const local of batch) {
            if (successMap[local.idLocal]) {
              await DB.updateAvistamiento(local.idLocal, {
                estadoSincronizacion: 'SYNCED',
                fechaHoraSincronizacion: new Date().toISOString(),
                id: successMap[local.idLocal].id || local.id
              });
              synced++;
            } else {
              await DB.updateAvistamiento(local.idLocal, {
                estadoSincronizacion: 'ERROR',
                intentosSincronizacion: (local.intentosSincronizacion || 0) + 1,
                errorSincronizacion: 'Rechazado por el servidor'
              });
              failed++;
            }
          }
        } catch (err) {
          for (const local of batch) {
            await DB.updateAvistamiento(local.idLocal, {
              estadoSincronizacion: 'PENDING',
              intentosSincronizacion: (local.intentosSincronizacion || 0) + 1,
              errorSincronizacion: err.message || 'Error de conexión'
            });
          }
          failed += batch.length;
          this.isSyncing = false;
          this._emit({ status: 'ERROR', error: err.message, synced, failed, total: pending.length });
          return { status: 'ERROR', error: err.message, synced, failed };
        }

        this._emit({ status: 'SYNCING', progress: Math.round(((i + BATCH_SIZE) / pending.length) * 100), synced, total: pending.length });
      }

      this.isSyncing = false;
      this._emit({ status: 'DONE', synced, failed, total: pending.length });
      return { status: 'OK', synced, failed, total: pending.length };

    } catch (err) {
      this.isSyncing = false;
      this._emit({ status: 'ERROR', error: err.message });
      return { status: 'ERROR', error: err.message };
    }
  }

  startForegroundListener() {
    const doSync = async () => {
      if (this.isOnline() && !this.isSyncing) {
        const user = AuthManager.getUser();
        if (user) {
          await this.trySyncNow();
        }
      }
    };

    window.addEventListener('online', () => {
      this._emit({ network: 'online' });
      setTimeout(doSync, 2000);
    });

    window.addEventListener('offline', () => {
      this._emit({ network: 'offline' });
    });

    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible') {
        await doSync();
      }
    });
  }
}

const SyncMgr = new SyncManager();
