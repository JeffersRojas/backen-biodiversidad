document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const authView = document.getElementById('auth-view');
    const dashboardView = document.getElementById('dashboard-view');
    const authButtons = document.getElementById('auth-buttons');
    const authForm = document.getElementById('auth-form');
    const toggleAuthLink = document.getElementById('toggle-auth');
    const authTitle = document.getElementById('auth-title');
    const submitBtn = document.getElementById('submit-btn');
    const emailGroup = document.getElementById('email-group');
    const roleGroup = document.getElementById('role-group');
    
    const faunaList = document.getElementById('fauna-list');
    const addFaunaBtn = document.getElementById('add-fauna-btn');
    const faunaModal = document.getElementById('fauna-modal');
    const closeModal = document.querySelector('.close');
    const faunaForm = document.getElementById('fauna-form');
    const modalTitle = document.getElementById('modal-title');

    // State
    let currentUser = JSON.parse(localStorage.getItem('user'));
    let isLoginMode = true;

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
        authButtons.innerHTML = ''; // Clear header buttons
        updateAuthForm();
    }

    function showDashboard() {
        authView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        
        let roleDisplay = currentUser.roleId || 'User';
        let adminControls = '';
        
        if (roleDisplay === 'Admin') {
            adminControls = '<span style="background: #ffca28; color: #000; padding: 2px 6px; border-radius: 4px; font-size: 0.8em; margin-left: 5px;">ADMIN</span>';
            addFaunaBtn.style.display = 'inline-block';
        } else {
            addFaunaBtn.style.display = 'none'; // Hide add button for non-admins
        }

        authButtons.innerHTML = `
            <span>Hola, ${currentUser.username} ${adminControls}</span>
            <button onclick="logout()" style="margin-left: 10px; background-color: #d32f2f;">Cerrar Sesión</button>
        `;
        loadFauna();
    }

    window.logout = function() {
        localStorage.removeItem('user');
        currentUser = null;
        showAuth();
        showNotification('Sesión cerrada', 'success');
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
            toggleAuthLink.textContent = '¿No tienes cuenta? Regístrate aquí (Solo Admin puede crear reales)';
            
            // Add hint about default credentials
            if (!document.getElementById('login-hint')) {
                const hint = document.createElement('p');
                hint.id = 'login-hint';
                hint.style.fontSize = '0.8rem';
                hint.style.color = '#666';
                hint.style.marginTop = '10px';
                hint.innerHTML = 'Credenciales Demo:<br>Admin: <b>Administrador</b> / <b>Administrador</b><br>Cliente: <b>Cliente</b> / <b>Cliente</b>';
                authForm.appendChild(hint);
            } else {
                document.getElementById('login-hint').style.display = 'block';
            }

        } else {
            authTitle.textContent = 'Registrar Usuario (En BD)';
            submitBtn.textContent = 'Registrar';
            emailGroup.style.display = 'block';
            roleGroup.style.display = 'block';
            toggleAuthLink.textContent = '¿Ya tienes cuenta? Inicia sesión';
            if (document.getElementById('login-hint')) {
                document.getElementById('login-hint').style.display = 'none';
            }
        }
    }

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            if (isLoginMode) {
                // Login
                const user = await ApiService.login(username, password);
                currentUser = user;
                localStorage.setItem('user', JSON.stringify(user));
                showNotification(`Bienvenido ${user.username}`, 'success');
                showDashboard();
            } else {
                // Register
                // Note: This requires being logged in as Admin to work technically, 
                // but if we are in "Auth View" we are likely not logged in.
                // If the user tries to register without being logged in, it will fail with 401/403.
                // Ideally, user management should be inside the dashboard for Admins.
                // But for this simple view, let's try.
                
                const email = document.getElementById('email').value;
                const roleId = document.getElementById('roleId').value;
                
                const newUser = {
                    username,
                    password,
                    email,
                    roleId
                };
                
                // We need to handle the case where we can't register if not logged in
                // But the requirement was "Use all APIs".
                // Let's assume this form is for creating a new user in the DB.
                // If we are not logged in, we can't call the API if it's protected.
                // SecurityConfig says POST /api/users hasRole("Admin").
                
                if (!currentUser || currentUser.roleId !== 'Admin') {
                    throw new Error('Debes iniciar sesión como Administrador para registrar usuarios.');
                }

                await ApiService.register(newUser);
                showNotification('Usuario registrado en Base de Datos.', 'success');
                // Don't switch mode, maybe they want to register more
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
            faunaList.innerHTML = `<p style="color: red">${error.message}</p>`;
        }
    }

    function renderFauna(faunaData) {
        if (!faunaData || faunaData.length === 0) {
            faunaList.innerHTML = '<p>No hay especies registradas aún.</p>';
            return;
        }

        faunaList.innerHTML = '';
        faunaData.forEach(item => {
            const card = document.createElement('div');
            card.className = 'fauna-card';
            
            let actions = '';
            if (currentUser && currentUser.roleId === 'Admin') {
                actions = `
                    <div class="card-actions">
                        <button class="btn-edit" onclick="editFauna('${item.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn-delete" onclick="deleteFauna('${item.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                `;
            }

            card.innerHTML = `
                <h3>${item.nombreComun}</h3>
                <p><strong>Científico:</strong> <i>${item.nombreCientifico}</i></p>
                <p><strong>Familia:</strong> ${item.familia}</p>
                <p><strong>Hábitat:</strong> ${item.habitat}</p>
                <p><strong>Ubicación:</strong> ${item.ubicacionGeografica}</p>
                <p><strong>Estado:</strong> <span style="color: ${getStatusColor(item.peligroExtincion)}">${item.peligroExtincion}</span></p>
                ${actions}
            `;
            faunaList.appendChild(card);
        });
    }

    function getStatusColor(status) {
        if (status === 'Critico' || status === 'En Peligro') return '#d32f2f';
        if (status === 'Vulnerable') return '#f57c00';
        return '#388e3c';
    }

    // Modal Handling
    addFaunaBtn.addEventListener('click', () => {
        openModal();
    });

    closeModal.addEventListener('click', () => {
        faunaModal.style.display = 'none';
    });

    window.onclick = function(event) {
        if (event.target == faunaModal) {
            faunaModal.style.display = 'none';
        }
    }

    function openModal(fauna = null) {
        faunaModal.style.display = 'block';
        if (fauna) {
            modalTitle.textContent = 'Editar Especie';
            document.getElementById('fauna-id').value = fauna.id;
            document.getElementById('nombreComun').value = fauna.nombreComun;
            document.getElementById('nombreCientifico').value = fauna.nombreCientifico;
            document.getElementById('familia').value = fauna.familia;
            document.getElementById('habitat').value = fauna.habitat;
            document.getElementById('ubicacionGeografica').value = fauna.ubicacionGeografica;
            document.getElementById('peligroExtincion').value = fauna.peligroExtincion;
        } else {
            modalTitle.textContent = 'Registrar Especie';
            faunaForm.reset();
            document.getElementById('fauna-id').value = '';
        }
    }

    window.editFauna = async function(id) {
        try {
            const allFauna = await ApiService.getAllFauna();
            const fauna = allFauna.find(f => f.id === id);
            if (fauna) {
                openModal(fauna);
            }
        } catch (error) {
            showNotification('Error al cargar datos para editar', 'error');
        }
    }

    window.deleteFauna = async function(id) {
        if (confirm('¿Estás seguro de que quieres eliminar esta especie?')) {
            try {
                await ApiService.deleteFauna(id);
                showNotification('Especie eliminada', 'success');
                loadFauna();
            } catch (error) {
                showNotification('Error al eliminar', 'error');
            }
        }
    }

    faunaForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('fauna-id').value;
        const faunaData = {
            nombreComun: document.getElementById('nombreComun').value,
            nombreCientifico: document.getElementById('nombreCientifico').value,
            familia: document.getElementById('familia').value,
            habitat: document.getElementById('habitat').value,
            ubicacionGeografica: document.getElementById('ubicacionGeografica').value,
            peligroExtincion: document.getElementById('peligroExtincion').value
        };

        try {
            if (id) {
                // Update
                faunaData.id = id; 
                await ApiService.updateFauna(id, faunaData);
                showNotification('Especie actualizada', 'success');
            } else {
                // Create
                await ApiService.createFauna(faunaData);
                showNotification('Especie creada', 'success');
            }
            faunaModal.style.display = 'none';
            loadFauna();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });

    // Helper: Notification
    function showNotification(message, type) {
        const div = document.createElement('div');
        div.className = `notification ${type}`;
        div.textContent = message;
        document.body.appendChild(div);
        
        setTimeout(() => {
            div.remove();
        }, 3000);
    }
});
