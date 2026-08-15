const App = {
  router: null,
  photos: [null, null],
  selectedCategoria: null,
  catalogoTab: 'fauna',
  catalogoData: { fauna: [], flora: [] },

  async init() {
    this.bindGlobalEvents();
    this.updateNetworkBadge();

    // 1. PINTAR INMEDIATAMENTE (FCP rápido). Si ya está autenticado,
    //    mostrar app-shell sin esperar IndexedDB/Service Worker.
    const authed = AuthManager.isAuthenticated();
    if (authed) {
      this.showAppShell();
    } else {
      this.showLogin();
    }
    if (!window.location.hash) {
      window.location.hash = authed ? '#/' : '#/login';
    }
    this.setupRouter();

    // 2. Iniciar async EN SEGUNDO PLANO, despues del primer paint.
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => this._initAsync());
    } else {
      setTimeout(() => this._initAsync(), 200);
    }
  },

  async _initAsync() {
    try { await this.registerServiceWorker(); } catch (e) {}
    try { await DB.init(); } catch (e) { console.warn('IndexedDB no disponible', e); }
    try { await DB.requestPersist(); } catch (e) {}
    try { this.initSyncManager(); } catch (e) {}
    try { this.refreshStorageInfo(); } catch (e) {}
    try { this.bindCatalogTabs(); } catch (e) {}
    try {
      if (AuthManager.isAuthenticated()) {
        this.precargarDiccionarioEspecies();
        this.refreshAll();
      }
    } catch (e) {}
  },

  bindGlobalEvents() {
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) logoutBtn.onclick = () => this.logout();

    const syncBtn = document.getElementById('btn-sync');
    if (syncBtn) syncBtn.onclick = () => this.forceSync();

    window.addEventListener('online', () => {
      this.updateNetworkBadge();
      this.refreshDashboardStats();
    });
    window.addEventListener('offline', () => {
      this.updateNetworkBadge();
      this.refreshDashboardStats();
    });

    navigator.serviceWorker && navigator.serviceWorker.addEventListener('message', (e) => {
      if (e.data && e.data.type === 'BACKGROUND_SYNC_TRIGGER') {
        SyncMgr.trySyncNow();
      }
    });
  },

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.register('./sw.js');
        console.log('Service Worker registrado:', reg.scope);
      } catch (e) {
        console.warn('No se pudo registrar Service Worker:', e);
      }
    }
  },

  initSyncManager() {
    SyncMgr.onUpdate((state) => {
      this.showSyncState(state);
      if (state.status === 'DONE' || state.status === 'ERROR' || state.status === 'NOTHING_TO_SYNC') {
        this.refreshAll();
      }
    });
    SyncMgr.startForegroundListener();
    SyncMgr.registerBackgroundSync();
  },

  setupRouter() {
    this.router = new Router([
      { path: '/login', handler: () => this.renderLogin() },
      { path: '/', handler: () => this.requireAuth(() => this.renderDashboard()) },
      { path: '/nuevo-registro', handler: () => this.requireAuth(() => this.renderNuevoRegistro()) },
      { path: '/pendientes', handler: () => this.requireAuth(() => this.renderPendientes()) },
      { path: '/historico', handler: () => this.requireAuth(() => this.renderHistorico()) },
      { path: '/catalogo', handler: () => this.requireAuth(() => this.renderCatalogo()) },
      { path: '*', handler: () => {
        if (AuthManager.isAuthenticated()) this.navigate('/'); else this.navigate('/login');
      }}
    ]);
  },

  requireAuth(callback) {
    if (!AuthManager.isAuthenticated()) {
      this.navigate('/login');
      return;
    }
    this.showAppShell();
    this.updateUserChip();
    callback && callback();
  },

  navigate(path) {
    if (this.router) this.router.navigate(path);
    else window.location.hash = path.startsWith('#') ? path : '#' + path;
  },

  showAppShell() {
    document.getElementById('view-login').classList.add('hidden');
    document.getElementById('app-shell').classList.remove('hidden');
  },

  showLogin() {
    document.getElementById('app-shell').classList.add('hidden');
    document.getElementById('view-login').classList.remove('hidden');
  },

  showView(id) {
    ['view-dashboard','view-nuevo','view-pendientes','view-historico','view-catalogo'].forEach((v) => {
      const el = document.getElementById(v);
      if (el) el.classList.add('hidden');
    });
    const tgt = document.getElementById(id);
    if (tgt) tgt.classList.remove('hidden');
    document.querySelectorAll('.bn-item').forEach((it) => {
      it.classList.toggle('active', it.dataset.route === this.router.getCurrentPath());
    });
  },

  updateUserChip() {
    const u = AuthManager.getUser();
    if (!u) return;
    const nameEl = document.getElementById('user-name');
    const roleEl = document.getElementById('user-role');
    const avatarEl = document.getElementById('user-avatar');
    if (nameEl) nameEl.textContent = u.username || 'Usuario';
    if (roleEl) roleEl.textContent = u.role || 'Client';
    if (avatarEl) avatarEl.textContent = (u.username || 'U').charAt(0).toUpperCase();
  },

  updateNetworkBadge() {
    const online = navigator.onLine;
    const badge = document.getElementById('login-network-badge');
    if (badge) {
      badge.classList.toggle('online', online);
      badge.classList.toggle('offline', !online);
      badge.querySelector('.network-text').textContent = online ? 'En línea' : 'Sin conexión';
    }
    const onEl = document.getElementById('status-badge-online');
    const offEl = document.getElementById('status-badge-offline');
    if (onEl) onEl.classList.toggle('hidden', !online);
    if (offEl) offEl.classList.toggle('hidden', online);
  },

  async refreshStorageInfo() {
    const info = await DB.getStorageInfo();
    const el = document.getElementById('storage-pct');
    if (el) el.textContent = info.percentage + '%';
  },

  // =============== LOGIN ===============
  renderLogin() {
    this.showLogin();
    const form = document.getElementById('form-auth');
    const btnText = document.getElementById('btn-auth-text');
    const btnLoader = document.getElementById('btn-auth-loader');
    const errEl = document.getElementById('auth-error');

    document.getElementById('auth-username').value = '';
    document.getElementById('auth-password').value = '';
    errEl.classList.add('hidden');

    form.onsubmit = async (e) => {
      e.preventDefault();
      errEl.classList.add('hidden');
      const username = document.getElementById('auth-username').value.trim();
      const password = document.getElementById('auth-password').value;
      if (!username || !password) {
        this.showError(errEl, 'Ingresa usuario y contraseña');
        return;
      }

      btnText.textContent = 'Autenticando...';
      btnLoader.classList.remove('hidden');

      try {
        let resp;
        if (navigator.onLine) {
          resp = await ApiService.login(username, password);
        } else {
          const stored = AuthManager.getUser();
          if (stored && stored.username === username && (stored.passwordHash || stored.token)) {
            resp = stored;
          } else {
            throw new Error('Sin conexión y sin sesión previa');
          }
        }
        AuthManager.login(resp);

        const progress = document.getElementById('auth-progress');
        const fill = document.getElementById('progress-fill');
        progress.classList.remove('hidden');
        for (let i = 0; i <= 100; i += 10) {
          fill.style.width = i + '%';
          await new Promise(r => setTimeout(r, 40));
          if (i === 40) this.precargarDiccionarioEspecies().catch(() => {});
        }
        await new Promise(r => setTimeout(r, 200));
        progress.classList.add('hidden');
        this.navigate('/');
      } catch (err) {
        this.showError(errEl, err.message || 'Error de autenticación');
      } finally {
        btnText.textContent = 'Iniciar Sesión';
        btnLoader.classList.add('hidden');
      }
    };
  },

  showError(el, msg) {
    el.textContent = msg;
    el.classList.remove('hidden');
  },

  async precargarDiccionarioEspecies() {
    try {
      if (!navigator.onLine) return;
      const [fauna, flora] = await Promise.all([
        ApiService.getAllFauna().catch(() => []),
        ApiService.getAllFlora().catch(() => [])
      ]);
      const dict = [];
      fauna.forEach((f) => dict.push({
        id: 'F-' + (f.id || f.nombreComun),
        categoria: 'Fauna',
        nombreComun: f.nombreComun,
        nombreCientifico: f.nombreCientifico,
        familia: f.familia,
        habitat: f.habitat,
        estado: f.peligroExtincion,
        data: f
      }));
      flora.forEach((f) => dict.push({
        id: 'FL-' + (f.id || f.nombreComun),
        categoria: 'Flora',
        nombreComun: f.nombreComun,
        nombreCientifico: f.nombreCientifico,
        familia: f.familia,
        tipo: f.tipo,
        habitat: f.habitat,
        estado: f.estadoConservacion,
        data: f
      }));
      this.catalogoData.fauna = dict.filter(d => d.categoria === 'Fauna');
      this.catalogoData.flora = dict.filter(d => d.categoria === 'Flora');
      await DB.saveSpeciesDictionary(dict);
    } catch (e) { console.warn(e); }
  },

  logout() {
    AuthManager.logout();
    this.navigate('/login');
    this.toast('Sesión cerrada');
  },

  // =============== DASHBOARD ===============
  renderDashboard() {
    this.showView('view-dashboard');
    this.refreshDashboardStats();
    const today = new Date();
    const fechaEl = document.getElementById('dashboard-date');
    if (fechaEl) fechaEl.textContent = today.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const fab = document.getElementById('fab-nuevo');
    if (fab) fab.onclick = () => this.navigate('/nuevo-registro');
  },

  async refreshDashboardStats() {
    const todayCount = await DB.getTodayCount();
    const pending = await DB.getPendingAvistamientos();
    const synced = await DB.getSyncedAvistamientos();
    const all = await DB.getAllAvistamientos();

    this.setStat('stat-today', todayCount);
    this.setStat('stat-pending', pending.length);
    this.setStat('stat-synced', synced.length);
    this.setStat('stat-total', all.length);

    const pendingCountEl = document.getElementById('pending-count');
    if (pendingCountEl) pendingCountEl.textContent = pending.length;

    const recent = document.getElementById('recent-list');
    if (recent) {
      const last = all.slice(0, 5);
      recent.innerHTML = last.length ? '' : '<p class="empty-hint">Aún no hay registros. Pulsa "Nuevo Avistamiento" para comenzar.</p>';
      last.forEach((a) => recent.appendChild(this.buildListItemCard(a, true)));
    }
    this.refreshStorageInfo();
  },

  setStat(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  },

  // =============== NUEVO REGISTRO ===============
  renderNuevoRegistro() {
    this.showView('view-nuevo');
    this.photos = [null, null];
    this.selectedCategoria = null;

    const form = document.getElementById('form-avistamiento');
    form.reset();
    document.getElementById('av-idLocal').value = 'av_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);

    ['preview-1','preview-2'].forEach((p) => {
      const el = document.getElementById(p);
      if (el) { el.classList.add('hidden'); el.src = ''; }
    });
    ['remove-1','remove-2'].forEach((p) => {
      const el = document.getElementById(p);
      if (el) el.classList.add('hidden');
    });
    document.querySelectorAll('.slot-empty').forEach(s => s.style.display = 'flex');

    this.initCategoriaChips();
    this.initSpeciesSearch();
    this.initPhotoInputs();
    this.initGpsButton();
    this.refreshGpsTime();

    form.onsubmit = async (e) => {
      e.preventDefault();
      await this.saveAvistamientoLocal();
    };

    setTimeout(() => this.refreshGps(), 200);
  },

  initCategoriaChips() {
    document.querySelectorAll('#categoria-chips .chip').forEach((chip) => {
      chip.classList.remove('active');
      chip.onclick = () => {
        document.querySelectorAll('#categoria-chips .chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.selectedCategoria = chip.dataset.cat;
        const reinoMap = { Fauna: 'Animalia', Flora: 'Plantae', Fúngico: 'Fungi' };
        const reinoEl = document.getElementById('av-reino');
        if (reinoEl && reinoMap[this.selectedCategoria] && !reinoEl.value) {
          reinoEl.value = reinoMap[this.selectedCategoria];
        }
      };
    });
  },

  initSpeciesSearch() {
    const input = document.getElementById('av-buscar');
    const list = document.getElementById('species-list');
    const populate = async (q) => {
      const dict = await DB.searchSpecies(q, null);
      list.innerHTML = dict.slice(0, 30).map(d =>
        `<option value="${this.escapeHtml(d.nombreComun + (d.nombreCientifico ? ' / ' + d.nombreCientifico : ''))}" data-id="${d.id}">${d.categoria}</option>`
      ).join('');
    };
    populate('');
    input.addEventListener('input', (e) => populate(e.target.value));
    input.addEventListener('change', async () => {
      const dict = await DB.searchSpecies(input.value.split('/')[0].trim(), null);
      if (dict.length) {
        const d = dict[0];
        document.getElementById('av-nombreComun').value = d.nombreComun || '';
        document.getElementById('av-nombreCientifico').value = d.nombreCientifico || '';
        document.getElementById('av-familia').value = d.familia || '';
        document.getElementById('av-habitat').value = d.habitat || '';
        document.querySelectorAll('#categoria-chips .chip').forEach(c => {
          if (c.dataset.cat === d.categoria) c.click();
        });
      }
    });
  },

  initPhotoInputs() {
    for (let i = 1; i <= 2; i++) {
      const input = document.getElementById(`photo-input-${i}`);
      const remove = document.getElementById(`remove-${i}`);
      const preview = document.getElementById(`preview-${i}`);
      const slotEmpty = input.previousElementSibling.querySelector('.slot-empty');
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const progress = document.getElementById('photo-progress');
        const progressText = document.getElementById('photo-progress-text');
        progress.classList.remove('hidden');
        progressText.textContent = `Procesando foto ${i}...`;
        try {
          const res = await ImageCompressor.compressFile(file, 1280, 720, 0.75);
          this.photos[i - 1] = res.dataUrl;
          preview.src = res.dataUrl;
          preview.classList.remove('hidden');
          slotEmpty.style.display = 'none';
          remove.classList.remove('hidden');
          progressText.textContent = `Foto ${i} comprimida: ~${res.sizeKB} KB`;
          setTimeout(() => progress.classList.add('hidden'), 1200);
        } catch (err) {
          progressText.textContent = 'Error: ' + err.message;
          setTimeout(() => progress.classList.add('hidden'), 2000);
        } finally {
          input.value = '';
        }
      };
      remove.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.photos[i - 1] = null;
        preview.classList.add('hidden');
        preview.src = '';
        slotEmpty.style.display = 'flex';
        remove.classList.add('hidden');
      };
    }
  },

  initGpsButton() {
    const btn = document.getElementById('btn-refresh-gps');
    if (btn) btn.onclick = () => this.refreshGps();
  },

  refreshGpsTime() {
    const el = document.getElementById('gps-time');
    if (el) el.textContent = new Date().toLocaleString('es-CO');
  },

  refreshGps() {
    const statusEl = document.getElementById('gps-status');
    const statusText = document.getElementById('gps-status-text');
    const latEl = document.getElementById('gps-lat');
    const lngEl = document.getElementById('gps-lng');
    const precEl = document.getElementById('gps-precision');

    if (!('geolocation' in navigator)) {
      statusEl.className = 'gps-status error';
      statusText.textContent = 'Geolocalización no disponible en este navegador';
      return;
    }

    statusEl.className = 'gps-status loading';
    statusText.textContent = 'Obteniendo coordenadas...';

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        latEl.textContent = latitude.toFixed(6) + '°';
        lngEl.textContent = longitude.toFixed(6) + '°';
        precEl.textContent = '±' + Math.round(accuracy) + ' m';
        document.getElementById('gps-lat-val') && (document.getElementById('gps-lat-val').value = latitude);
        statusEl.className = accuracy < 50 ? 'gps-status success' : 'gps-status warn';
        statusText.textContent = accuracy < 50 ? 'Señal GPS de alta precisión ✓' : 'Precisión moderada — intenta moverte a un área abierta';
        this.refreshGpsTime();

        document.getElementById('av-gps-lat') || Object.defineProperty(document.getElementById('form-avistamiento'), 'latVal', { value: latitude, configurable: true, writable: true });
        document.getElementById('form-avistamiento').lngVal = longitude;
        document.getElementById('form-avistamiento').precVal = accuracy;
      },
      (err) => {
        statusEl.className = 'gps-status error';
        statusText.textContent = 'No se pudo obtener GPS: ' + (err.message || 'Error desconocido') + '. Puedes guardar sin coordenadas.';
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  },

  async saveAvistamientoLocal() {
    const form = document.getElementById('form-avistamiento');
    const btn = document.getElementById('btn-save-local');
    const nombreComun = document.getElementById('av-nombreComun').value.trim();
    if (!nombreComun) {
      this.toast('El nombre común es obligatorio', 'error');
      return;
    }
    btn.disabled = true;

    try {
      const idLocal = document.getElementById('av-idLocal').value;
      const user = AuthManager.getUser();
      const formData = {
        idLocal: idLocal || ('av_' + Date.now() + '_' + Math.random().toString(36).slice(2,7)),
        usuarioId: user ? user.username : 'anon',
        usuarioNombre: user ? user.username : 'Anónimo',
        categoria: this.selectedCategoria,
        reino: document.getElementById('av-reino').value.trim(),
        filo: document.getElementById('av-filo').value.trim(),
        clase: '',
        nombreComun,
        nombreCientifico: document.getElementById('av-nombreCientifico').value.trim(),
        familia: document.getElementById('av-familia').value.trim(),
        cantidadIndividuos: parseInt(document.getElementById('av-cantidad').value) || 1,
        notasObservacion: document.getElementById('av-notas').value.trim(),
        habitat: document.getElementById('av-habitat').value.trim(),
        latitud: form.latVal || null,
        longitud: form.lngVal || null,
        precisionGpsMetros: form.precVal || null,
        fotosBase64: this.photos.filter(Boolean),
        fechaHoraRegistro: new Date().toISOString(),
        estadoSincronizacion: 'PENDING',
        intentosSincronizacion: 0,
        errorSincronizacion: ''
      };

      await DB.addAvistamiento(formData);

      this.toast('✓ Guardado en el teléfono con éxito', 'success');
      setTimeout(async () => {
        if (navigator.onLine) {
          await SyncMgr.trySyncNow();
        }
        this.navigate('/');
      }, 600);
    } catch (err) {
      this.toast('Error al guardar: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
    }
  },

  // =============== PENDIENTES ===============
  renderPendientes() {
    this.showView('view-pendientes');
    this.refreshPendientes();
    document.getElementById('btn-force-sync').onclick = () => this.forceSync();
  },

  async refreshPendientes() {
    const list = await DB.getPendingAvistamientos();
    const el = document.getElementById('pendientes-list');
    const sum = document.getElementById('pendientes-summary');
    if (sum) sum.textContent = list.length + ' registro' + (list.length === 1 ? '' : 's') + ' por sincronizar';
    el.innerHTML = list.length ? '' : '<p class="empty-hint">¡Todo sincronizado! No hay registros pendientes.</p>';
    list.forEach((a) => el.appendChild(this.buildListItemCard(a, true, true)));
  },

  // =============== HISTORICO ===============
  renderHistorico() {
    this.showView('view-historico');
    this.refreshHistorico();
  },

  async refreshHistorico() {
    const list = await DB.getAllAvistamientos();
    const el = document.getElementById('historico-list');
    const sum = document.getElementById('historico-summary');
    if (sum) sum.textContent = list.length + ' registro' + (list.length === 1 ? '' : 's') + ' guardados';
    el.innerHTML = list.length ? '' : '<p class="empty-hint">Aún no hay registros históricos.</p>';
    list.forEach((a) => el.appendChild(this.buildListItemCard(a, false)));
  },

  buildListItemCard(a, actions = false, isPending = false) {
    const card = document.createElement('div');
    card.className = 'record-card ' + (a.estadoSincronizacion === 'SYNCED' ? 'synced' : 'pending');
    const catIcon = a.categoria === 'Flora' ? '🌿' : (a.categoria === 'Fúngico' ? '🍄' : '🐾');
    const estadoBadge = a.estadoSincronizacion === 'SYNCED'
      ? '<span class="badge badge-success">✓ Sincronizado</span>'
      : a.estadoSincronizacion === 'ERROR'
        ? '<span class="badge badge-error">⚠ Error</span>'
        : '<span class="badge badge-warn">⧗ Pendiente</span>';
    const foto = (a.fotosBase64 && a.fotosBase64[0])
      ? `<div class="rc-thumb" style="background-image:url('${a.fotosBase64[0]}')"></div>`
      : `<div class="rc-thumb placeholder"><span style="font-size:2rem">${catIcon}</span></div>`;
    const gps = (a.latitud != null)
      ? `<span class="rc-gps">📍 ${Number(a.latitud).toFixed(4)}, ${Number(a.longitud).toFixed(4)}</span>`
      : `<span class="rc-gps muted">📍 Sin coordenadas</span>`;

    card.innerHTML = `
      ${foto}
      <div class="rc-body">
        <div class="rc-head">
          <span class="rc-cat">${catIcon} ${a.categoria || 'Sin categoría'}</span>
          ${estadoBadge}
        </div>
        <div class="rc-title">${this.escapeHtml(a.nombreComun || 'Sin nombre')}</div>
        ${a.nombreCientifico ? `<div class="rc-sci"><i>${this.escapeHtml(a.nombreCientifico)}</i></div>` : ''}
        <div class="rc-meta">
          <span>🕒 ${new Date(a.fechaHoraRegistro).toLocaleString('es-CO')}</span>
          ${a.cantidadIndividuos ? `<span>👤 ${a.cantidadIndividuos}</span>` : ''}
        </div>
        <div class="rc-meta2">${gps}</div>
        ${actions ? `
          <div class="rc-actions">
            <button class="btn-mini" data-action="edit" data-id="${a.idLocal}">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
              Editar
            </button>
            <button class="btn-mini danger" data-action="delete" data-id="${a.idLocal}">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
              Eliminar
            </button>
          </div>` : `
          <div class="rc-actions">
            <button class="btn-mini" data-action="view" data-id="${a.idLocal}">Ver detalles</button>
          </div>`}
      </div>
    `;

    card.querySelectorAll('button[data-action]').forEach(btn => {
      btn.onclick = async () => {
        const action = btn.dataset.action;
        if (action === 'delete') {
          if (confirm('¿Eliminar este registro?')) {
            await DB.deleteAvistamiento(a.idLocal);
            this.toast('Registro eliminado');
            this.refreshAll();
          }
        } else if (action === 'edit') {
          this.navigate('/nuevo-registro');
          setTimeout(() => this.cargarParaEdicion(a), 100);
        } else if (action === 'view') {
          this.showDetail(a);
        }
      };
    });
    return card;
  },

  async cargarParaEdicion(a) {
    document.getElementById('av-idLocal').value = a.idLocal;
    document.getElementById('av-nombreComun').value = a.nombreComun || '';
    document.getElementById('av-nombreCientifico').value = a.nombreCientifico || '';
    document.getElementById('av-reino').value = a.reino || '';
    document.getElementById('av-filo').value = a.filo || '';
    document.getElementById('av-familia').value = a.familia || '';
    document.getElementById('av-cantidad').value = a.cantidadIndividuos || 1;
    document.getElementById('av-habitat').value = a.habitat || '';
    document.getElementById('av-notas').value = a.notasObservacion || '';

    if (a.categoria) {
      const chip = document.querySelector(`#categoria-chips .chip[data-cat="${a.categoria}"]`);
      if (chip) chip.click();
    }

    if (a.latitud != null) {
      document.getElementById('gps-lat').textContent = Number(a.latitud).toFixed(6) + '°';
      document.getElementById('gps-lng').textContent = Number(a.longitud).toFixed(6) + '°';
      document.getElementById('gps-precision').textContent = a.precisionGpsMetros ? '±' + Math.round(a.precisionGpsMetros) + ' m' : '—';
      document.getElementById('gps-status').className = 'gps-status success';
      document.getElementById('gps-status-text').textContent = 'Coordenadas cargadas del registro';
      document.getElementById('form-avistamiento').latVal = a.latitud;
      document.getElementById('form-avistamiento').lngVal = a.longitud;
      document.getElementById('form-avistamiento').precVal = a.precisionGpsMetros;
    }

    if (a.fotosBase64 && a.fotosBase64.length) {
      for (let i = 0; i < Math.min(a.fotosBase64.length, 2); i++) {
        const dataUrl = a.fotosBase64[i];
        this.photos[i] = dataUrl;
        const preview = document.getElementById(`preview-${i+1}`);
        const remove = document.getElementById(`remove-${i+1}`);
        const slotEmpty = document.querySelector(`#photo-input-${i+1}`).previousElementSibling.querySelector('.slot-empty');
        preview.src = dataUrl;
        preview.classList.remove('hidden');
        remove.classList.remove('hidden');
        slotEmpty.style.display = 'none';
      }
    }
  },

  showDetail(a) {
    const modal = document.getElementById('detail-modal');
    const content = document.getElementById('detail-content');
    const fotos = (a.fotosBase64 || []).map((f, i) => `<img src="${f}" class="detail-img" alt="Foto ${i+1}">`).join('');
    content.innerHTML = `
      <button class="modal-close" onclick="App.closeDetail()">×</button>
      <h2>${this.escapeHtml(a.nombreComun || 'Sin nombre')}</h2>
      ${a.nombreCientifico ? `<p class="detail-sci"><i>${this.escapeHtml(a.nombreCientifico)}</i></p>` : ''}
      <div class="detail-grid">
        <div><label>Categoría</label><div>${a.categoria || '—'}</div></div>
        <div><label>Reino</label><div>${a.reino || '—'}</div></div>
        <div><label>Filo / Clase</label><div>${a.filo || '—'}</div></div>
        <div><label>Familia</label><div>${a.familia || '—'}</div></div>
        <div><label>Hábitat</label><div>${a.habitat || '—'}</div></div>
        <div><label>Individuos</label><div>${a.cantidadIndividuos || 1}</div></div>
        <div><label>Fecha y Hora</label><div>${new Date(a.fechaHoraRegistro).toLocaleString('es-CO')}</div></div>
        <div><label>Estado</label><div>${a.estadoSincronizacion}</div></div>
      </div>
      ${a.latitud != null ? `
        <div class="detail-gps">
          <label>Ubicación GPS</label>
          <div>📍 ${Number(a.latitud).toFixed(6)}, ${Number(a.longitud).toFixed(6)} ${a.precisionGpsMetros ? '(±' + Math.round(a.precisionGpsMetros) + 'm)' : ''}</div>
        </div>` : ''}
      ${a.notasObservacion ? `<div class="detail-notes"><label>Notas</label><p>${this.escapeHtml(a.notasObservacion)}</p></div>` : ''}
      ${fotos ? `<div class="detail-gallery">${fotos}</div>` : ''}
    `;
    modal.classList.remove('hidden');
  },

  closeDetail() {
    document.getElementById('detail-modal').classList.add('hidden');
  },

  // =============== CATALOGO ===============
  renderCatalogo() {
    this.showView('view-catalogo');
    this.loadCatalogoData();
    document.getElementById('catalog-search').oninput = () => this.renderCatalogoList();
  },

  bindCatalogTabs() {
    document.querySelectorAll('.catalog-tabs .tab-btn').forEach((t) => {
      t.onclick = () => {
        document.querySelectorAll('.catalog-tabs .tab-btn').forEach(x => x.classList.remove('active'));
        t.classList.add('active');
        this.catalogoTab = t.dataset.tab;
        this.renderCatalogoList();
      };
    });
  },

  async loadCatalogoData() {
    try {
      if (this.catalogoData.fauna.length === 0 && navigator.onLine) {
        const fauna = await ApiService.getAllFauna().catch(() => []);
        this.catalogoData.fauna = fauna;
      }
      if (this.catalogoData.flora.length === 0 && navigator.onLine) {
        const flora = await ApiService.getAllFlora().catch(() => []);
        this.catalogoData.flora = flora;
      }
    } catch (e) {}
    this.renderCatalogoList();
  },

  renderCatalogoList() {
    const list = document.getElementById('catalog-list');
    const q = (document.getElementById('catalog-search').value || '').toLowerCase().trim();
    const data = this.catalogoTab === 'fauna' ? this.catalogoData.fauna : this.catalogoData.flora;
    const filtered = data.filter((d) => {
      if (!q) return true;
      return (d.nombreComun || '').toLowerCase().includes(q)
        || (d.nombreCientifico || '').toLowerCase().includes(q)
        || (d.familia || '').toLowerCase().includes(q);
    });
    if (!filtered.length) {
      list.innerHTML = `<p class="empty-hint">${data.length ? 'Sin resultados para la búsqueda.' : 'Sin datos de catálogo. Conéctate para descargar.'}</p>`;
      return;
    }
    list.innerHTML = '';
    filtered.slice(0, 200).forEach((d) => {
      const card = document.createElement('div');
      card.className = 'record-card synced';
      const estado = this.catalogoTab === 'fauna' ? d.peligroExtincion : d.estadoConservacion;
      const icon = this.catalogoTab === 'fauna' ? '🐾' : '🌿';
      card.innerHTML = `
        <div class="rc-thumb placeholder"><span style="font-size:2rem">${icon}</span></div>
        <div class="rc-body">
          <div class="rc-head">
            <span class="rc-cat">${icon} ${this.escapeHtml(d.familia || '')}</span>
            ${estado ? `<span class="badge badge-info">${this.escapeHtml(estado)}</span>` : ''}
          </div>
          <div class="rc-title">${this.escapeHtml(d.nombreComun || '')}</div>
          ${d.nombreCientifico ? `<div class="rc-sci"><i>${this.escapeHtml(d.nombreCientifico)}</i></div>` : ''}
          <div class="rc-meta2">
            <span class="rc-gps">🌍 ${this.escapeHtml(d.ubicacionGeografica || d.habitat || '')}</span>
          </div>
        </div>
      `;
      list.appendChild(card);
    });
  },

  // =============== UTILIDADES ===============
  refreshAll() {
    this.refreshDashboardStats();
    this.refreshPendientes().catch(()=>{});
    this.refreshHistorico().catch(()=>{});
    this.refreshStorageInfo();
  },

  async forceSync() {
    if (!navigator.onLine) {
      this.toast('Sin conexión — no se puede sincronizar', 'error');
      return;
    }
    const pending = await DB.getPendingAvistamientos();
    if (pending.length === 0) {
      this.toast('Nada pendiente por sincronizar');
      return;
    }
    this.toast(`Enviando ${pending.length} registro(s)...`);
    const result = await SyncMgr.trySyncNow();
    if (result.status === 'OK') {
      this.toast(`✓ Sincronizados ${result.synced}` + (result.failed ? `, fallidos ${result.failed}` : ''), 'success');
    } else if (result.status === 'OFFLINE') {
      this.toast('Sin conexión', 'error');
    } else if (result.status === 'ERROR') {
      this.toast('Error de sincronización: ' + (result.error || ''), 'error');
    }
  },

  showSyncState(state) {
    const toast = document.getElementById('sync-toast');
    const icon = document.getElementById('sync-icon');
    const text = document.getElementById('sync-text');
    if (state.network) return;

    if (state.status === 'SYNCING') {
      toast.classList.remove('hidden');
      toast.className = 'sync-toast syncing';
      icon.innerHTML = '<div class="sw-loader"></div>';
      text.textContent = `Sincronizando... ${state.synced || 0}/${state.total || ''} ${state.progress ? '(' + state.progress + '%)' : ''}`;
      return;
    }
    if (state.status === 'DONE') {
      toast.className = 'sync-toast success';
      icon.textContent = '✓';
      text.textContent = state.total ? `Sincronizados ${state.synced} de ${state.total}` : 'Todo actualizado';
      setTimeout(() => toast.classList.add('hidden'), 2800);
      return;
    }
    if (state.status === 'ERROR') {
      toast.className = 'sync-toast error';
      icon.textContent = '!';
      text.textContent = 'Error: ' + (state.error || 'Desconocido');
      setTimeout(() => toast.classList.add('hidden'), 4000);
      return;
    }
    if (state.status === 'NOTHING_TO_SYNC') {
      toast.className = 'sync-toast success';
      icon.textContent = '✓';
      text.textContent = 'Todo sincronizado';
      setTimeout(() => toast.classList.add('hidden'), 1800);
    }
  },

  toast(msg, type = 'info', duration = 2500) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = 'toast show ' + type;
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.remove('show'), duration);
  },

  escapeHtml(str) {
    return (str || '').toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
