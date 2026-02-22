document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements - Views
    const authView = document.getElementById('auth-view');
    const dashboardView = document.getElementById('dashboard-view');
    const faunaSection = document.getElementById('fauna-section');
    const floraSection = document.getElementById('flora-section');

    // DOM Elements - Auth
    const authForm = document.getElementById('auth-form');
    const toggleAuthLink = document.getElementById('toggle-auth');
    const authTitle = document.getElementById('auth-title');
    const submitBtn = document.getElementById('submit-btn');
    const emailGroup = document.getElementById('email-group');
    const roleGroup = document.getElementById('role-group');
    const userInfoDisplay = document.getElementById('user-info-display');

    // DOM Elements - Fauna
    const faunaList = document.getElementById('fauna-list');
    const addFaunaBtn = document.getElementById('add-fauna-btn');
    const faunaModal = document.getElementById('fauna-modal');
    const faunaForm = document.getElementById('fauna-form');
    const faunaModalTitle = document.getElementById('fauna-modal-title');

    // DOM Elements - Flora
    const floraList = document.getElementById('flora-list');
    const addFloraBtn = document.getElementById('add-flora-btn');
    const floraModal = document.getElementById('flora-modal');
    const floraForm = document.getElementById('flora-form');
    const floraModalTitle = document.getElementById('flora-modal-title');

    // State
    let currentUser = JSON.parse(localStorage.getItem('user'));
    let isLoginMode = true;
    let currentTab = 'fauna';

    // Global Functions for HTML onClick access
    window.switchTab = function(tabName) {
        currentTab = tabName;
        
        // Update Nav UI
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        if (tabName === 'fauna') {
            document.querySelector('.nav-item:nth-child(1)').classList.add('active');
            faunaSection.classList.remove('hidden');
            floraSection.classList.add('hidden');
            loadFauna();
        } else if (tabName === 'flora') {
            document.querySelector('.nav-item:nth-child(2)').classList.add('active');
            faunaSection.classList.add('hidden');
            floraSection.classList.remove('hidden');
            loadFlora();
        }
    };

    window.logout = function() {
        localStorage.removeItem('user');
        currentUser = null;
        showAuth();
        showNotification('Sesión cerrada correctamente', 'success');
    };

    window.closeModal = function(modalId) {
        document.getElementById(modalId).classList.remove('active');
    };

    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('active');
        }
    };

    // Initialize
    init();

    function init() {
        if (currentUser) {
            showDashboard();
        } else {
            showAuth();
        }
    }

    // --- Navigation & Auth Views ---

    function showAuth() {
        authView.classList.remove('hidden');
        dashboardView.classList.add('hidden');
        updateAuthForm();
    }

    function showDashboard() {
        authView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        
        // Update User Info
        let roleBadge = currentUser.roleId === 'Admin' 
            ? '<span class="role-badge">ADMIN</span>' 
            : '<span class="role-badge" style="background-color: #e0e0e0;">USER</span>';
            
        userInfoDisplay.innerHTML = `
            <span>Hola, <strong>${currentUser.username}</strong></span>
            ${roleBadge}
        `;

        // Configure buttons based on role
        if (currentUser.roleId !== 'Admin') {
            addFaunaBtn.style.display = 'none';
            addFloraBtn.style.display = 'none';
        } else {
            addFaunaBtn.style.display = 'flex';
            addFloraBtn.style.display = 'flex';
        }

        // Load initial tab
        window.switchTab(currentTab);
    }

    // --- Auth Logic ---

    toggleAuthLink.addEventListener('click', () => {
        isLoginMode = !isLoginMode;
        updateAuthForm();
    });

    function updateAuthForm() {
        if (isLoginMode) {
            authTitle.textContent = 'Iniciar Sesión';
            submitBtn.textContent = 'Entrar';
            emailGroup.style.display = 'none';
            roleGroup.style.display = 'none';
            toggleAuthLink.textContent = '¿No tienes cuenta? Regístrate aquí';
        } else {
            authTitle.textContent = 'Crear Usuario';
            submitBtn.textContent = 'Registrar';
            emailGroup.style.display = 'block';
            roleGroup.style.display = 'block';
            toggleAuthLink.textContent = '¿Ya tienes cuenta? Inicia sesión';
        }
    }

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            if (isLoginMode) {
                const user = await ApiService.login(username, password);
                currentUser = user;
                localStorage.setItem('user', JSON.stringify(user));
                showNotification(`Bienvenido ${user.username}`, 'success');
                showDashboard();
            } else {
                // Register Logic
                const email = document.getElementById('email').value;
                const roleId = document.getElementById('roleId').value;
                
                // Hack: If no user is logged in, we can't create a real user in DB if the endpoint is protected.
                // Assuming we can create a user if we are admin, or the endpoint is public.
                // For this demo, we'll try to register.
                
                if (!currentUser && roleId === 'admin') {
                     // Initial Admin bootstrapping if needed, but backend is protected.
                     // Assuming user is already logged in as admin to create another admin, 
                     // or the user is trying to register as a normal user.
                }

                if (!currentUser) {
                     // Try to register as user/client. If backend allows public registration, good.
                     // If not, we might need to be logged in.
                     // Based on SecurityConfig: POST /api/users is hasRole("Admin").
                     // So we cannot register if we are not logged in as Admin.
                     throw new Error('Solo un Administrador autenticado puede crear nuevos usuarios.');
                }
                
                const newUser = { username, password, email, roleId };
                await ApiService.register(newUser);
                showNotification('Usuario registrado exitosamente', 'success');
                authForm.reset();
            }
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });

    // --- Fauna Logic ---

    async function loadFauna() {
        faunaList.innerHTML = '<p>Cargando...</p>';
        try {
            const fauna = await ApiService.getAllFauna();
            renderFauna(fauna);
        } catch (error) {
            faunaList.innerHTML = `<p style="color: var(--error-color)">Error: ${error.message}</p>`;
        }
    }

    function renderFauna(items) {
        if (!items || items.length === 0) {
            faunaList.innerHTML = '<p>No hay especies registradas.</p>';
            return;
        }

        faunaList.innerHTML = '';
        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';
            
            let actions = '';
            if (currentUser && currentUser.roleId === 'Admin') {
                actions = `
                    <div class="card-actions">
                        <button class="btn-icon btn-edit" onclick="openFaunaModal('${item.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon btn-delete" onclick="deleteFauna('${item.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                `;
            }

            let conservacionClass = 'safe';
            if (item.peligroExtincion === 'Vulnerable') conservacionClass = 'vulnerable';
            if (item.peligroExtincion === 'En Peligro') conservacionClass = 'danger';
            if (item.peligroExtincion === 'Critico' || item.peligroExtincion === 'En Peligro Crítico') conservacionClass = 'critical';

            card.innerHTML = `
                <div class="card-content">
                    <h3>${item.nombreComun}</h3>
                    <span class="card-meta"><i>${item.nombreCientifico}</i></span>
                    
                    <div class="card-detail"><i class="fas fa-dna"></i> ${item.familia}</div>
                    <div class="card-detail"><i class="fas fa-tree"></i> ${item.habitat}</div>
                    <div class="card-detail"><i class="fas fa-map-marker-alt"></i> ${item.ubicacionGeografica}</div>
                    
                    <span class="tag ${conservacionClass}">${item.peligroExtincion}</span>
                </div>
                ${actions}
            `;
            faunaList.appendChild(card);
        });
    }

    addFaunaBtn.addEventListener('click', () => {
        openFaunaModal();
    });

    window.openFaunaModal = async function(id = null) {
        faunaForm.reset();
        document.getElementById('fauna-id').value = '';
        
        if (id) {
            faunaModalTitle.textContent = 'Editar Especie';
            // Fetch item details (or find in current list if we stored it)
            // For simplicity, we can fetch all and find, or assume we have it.
            // Let's fetch again or find in DOM? Better to have a getById but we don't have it in API wrapper easily
            // We can just iterate the current list if we stored it globally, but we didn't.
            // Let's implement a simple find from the loaded list if possible, or just re-fetch all.
            // Or add getById to API. For now, let's just populate with what we can if we had the object.
            // Since we don't have the object passed here, let's fetch all (cached in browser potentially) or just use API.
            // To make it robust, let's just use the API to get all and find. 
            // Optimally: pass the object or ID.
            
            try {
                // Quick hack: get from UI or re-fetch list. 
                // Let's just re-fetch list and find.
                const all = await ApiService.getAllFauna();
                const item = all.find(f => f.id === id);
                if (item) {
                    document.getElementById('fauna-id').value = item.id;
                    document.getElementById('fauna-nombreComun').value = item.nombreComun;
                    document.getElementById('fauna-nombreCientifico').value = item.nombreCientifico;
                    document.getElementById('fauna-familia').value = item.familia;
                    document.getElementById('fauna-habitat').value = item.habitat;
                    document.getElementById('fauna-ubicacionGeografica').value = item.ubicacionGeografica;
                    document.getElementById('fauna-peligroExtincion').value = item.peligroExtincion;
                }
            } catch (e) { console.error(e); }
        } else {
            faunaModalTitle.textContent = 'Registrar Especie';
        }
        faunaModal.classList.add('active');
    };

    faunaForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('fauna-id').value;
        const data = {
            nombreComun: document.getElementById('fauna-nombreComun').value,
            nombreCientifico: document.getElementById('fauna-nombreCientifico').value,
            familia: document.getElementById('fauna-familia').value,
            habitat: document.getElementById('fauna-habitat').value,
            ubicacionGeografica: document.getElementById('fauna-ubicacionGeografica').value,
            peligroExtincion: document.getElementById('fauna-peligroExtincion').value
        };

        try {
            if (id) {
                data.id = id;
                await ApiService.updateFauna(id, data);
                showNotification('Especie actualizada', 'success');
            } else {
                await ApiService.createFauna(data);
                showNotification('Especie creada', 'success');
            }
            closeModal('fauna-modal');
            loadFauna();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });

    window.deleteFauna = async function(id) {
        if (confirm('¿Estás seguro de eliminar esta especie?')) {
            try {
                await ApiService.deleteFauna(id);
                showNotification('Especie eliminada', 'success');
                loadFauna();
            } catch (error) {
                showNotification(error.message, 'error');
            }
        }
    };

    // --- Flora Logic ---

    async function loadFlora() {
        floraList.innerHTML = '<p>Cargando...</p>';
        try {
            const flora = await ApiService.getAllFlora();
            renderFlora(flora);
        } catch (error) {
            floraList.innerHTML = `<p style="color: var(--error-color)">Error: ${error.message}</p>`;
        }
    }

    function renderFlora(items) {
        if (!items || items.length === 0) {
            floraList.innerHTML = '<p>No hay plantas registradas.</p>';
            return;
        }

        floraList.innerHTML = '';
        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';
            
            let actions = '';
            if (currentUser && currentUser.roleId === 'Admin') {
                actions = `
                    <div class="card-actions">
                        <button class="btn-icon btn-edit" onclick="openFloraModal('${item.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon btn-delete" onclick="deleteFlora('${item.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                `;
            }

            let conservacionClass = 'safe';
            if (item.estadoConservacion.includes('Vulnerable')) conservacionClass = 'vulnerable';
            if (item.estadoConservacion.includes('En Peligro')) conservacionClass = 'danger';
            if (item.estadoConservacion.includes('Crítico')) conservacionClass = 'critical';

            card.innerHTML = `
                <div class="card-content">
                    <h3>${item.nombreComun}</h3>
                    <span class="card-meta"><i>${item.nombreCientifico}</i></span>
                    
                    <div class="card-detail"><i class="fas fa-leaf"></i> ${item.tipo} | ${item.familia}</div>
                    <div class="card-detail"><i class="fas fa-tree"></i> ${item.habitat}</div>
                    <div class="card-detail"><i class="fas fa-map-marker-alt"></i> ${item.ubicacionGeografica}</div>
                    
                    <span class="tag ${conservacionClass}">${item.estadoConservacion}</span>
                </div>
                ${actions}
            `;
            floraList.appendChild(card);
        });
    }

    addFloraBtn.addEventListener('click', () => {
        openFloraModal();
    });

    window.openFloraModal = async function(id = null) {
        floraForm.reset();
        document.getElementById('flora-id').value = '';
        
        if (id) {
            floraModalTitle.textContent = 'Editar Planta';
            try {
                const all = await ApiService.getAllFlora();
                const item = all.find(f => f.id === id);
                if (item) {
                    document.getElementById('flora-id').value = item.id;
                    document.getElementById('flora-nombreComun').value = item.nombreComun;
                    document.getElementById('flora-nombreCientifico').value = item.nombreCientifico;
                    document.getElementById('flora-familia').value = item.familia;
                    document.getElementById('flora-tipo').value = item.tipo;
                    document.getElementById('flora-habitat').value = item.habitat;
                    document.getElementById('flora-ubicacionGeografica').value = item.ubicacionGeografica;
                    document.getElementById('flora-estadoConservacion').value = item.estadoConservacion;
                }
            } catch (e) { console.error(e); }
        } else {
            floraModalTitle.textContent = 'Registrar Planta';
        }
        floraModal.classList.add('active');
    };

    floraForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('flora-id').value;
        const data = {
            nombreComun: document.getElementById('flora-nombreComun').value,
            nombreCientifico: document.getElementById('flora-nombreCientifico').value,
            familia: document.getElementById('flora-familia').value,
            tipo: document.getElementById('flora-tipo').value,
            habitat: document.getElementById('flora-habitat').value,
            ubicacionGeografica: document.getElementById('flora-ubicacionGeografica').value,
            estadoConservacion: document.getElementById('flora-estadoConservacion').value
        };

        try {
            if (id) {
                data.id = id;
                await ApiService.updateFlora(id, data);
                showNotification('Planta actualizada', 'success');
            } else {
                await ApiService.createFlora(data);
                showNotification('Planta creada', 'success');
            }
            closeModal('flora-modal');
            loadFlora();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });

    window.deleteFlora = async function(id) {
        if (confirm('¿Estás seguro de eliminar esta planta?')) {
            try {
                await ApiService.deleteFlora(id);
                showNotification('Planta eliminada', 'success');
                loadFlora();
            } catch (error) {
                showNotification(error.message, 'error');
            }
        }
    };

    // --- Notifications ---
    
    window.showNotification = function(message, type = 'success') {
        const notif = document.createElement('div');
        notif.className = `notification ${type}`;
        notif.textContent = message;
        document.body.appendChild(notif);
        
        setTimeout(() => {
            notif.remove();
        }, 3000);
    };
});
