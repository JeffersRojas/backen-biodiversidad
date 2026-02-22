const API_BASE_URL = 'http://localhost:8080/api';

class ApiService {
    static getAuthHeaders() {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.authHeader) {
            return {
                'Content-Type': 'application/json',
                'Authorization': user.authHeader
            };
        }
        return {
            'Content-Type': 'application/json'
        };
    }

    static async login(username, password) {
        // Create Basic Auth header
        const authHeader = 'Basic ' + btoa(username + ':' + password);
        
        // Test credentials by making a request that requires auth
        try {
            const response = await fetch(`${API_BASE_URL}/fauna`, {
                headers: {
                    'Authorization': authHeader
                }
            });

            if (response.status === 401 || response.status === 403) {
                throw new Error('Credenciales inválidas');
            }
            
            if (!response.ok) {
                throw new Error('Error de conexión con el servidor');
            }

            // If successful, return user object with auth header
            // Determine role based on username (Hardcoded for this demo matching backend)
            let role = 'User';
            if (username === 'Administrador') role = 'Admin';
            if (username === 'Cliente') role = 'Client';

            return {
                username: username,
                roleId: role,
                authHeader: authHeader
            };
        } catch (error) {
            console.error('Login Error:', error);
            throw error;
        }
    }

    // Users API
    static async register(user) {
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(user)
            });
            if (response.status === 403) throw new Error('No tienes permisos para registrar usuarios (Solo Admin)');
            if (!response.ok) throw new Error('Error al registrar usuario');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    static async getAllUsers() {
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                headers: this.getAuthHeaders()
            });
            if (!response.ok) throw new Error('Error al obtener usuarios');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Fauna API
    static async getAllFauna() {
        try {
            const response = await fetch(`${API_BASE_URL}/fauna`, {
                headers: this.getAuthHeaders()
            });
            if (!response.ok) throw new Error('Error al cargar la fauna');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    static async createFauna(fauna) {
        try {
            const response = await fetch(`${API_BASE_URL}/fauna`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(fauna)
            });
            if (response.status === 403) throw new Error('No tienes permisos (Solo Admin)');
            if (!response.ok) throw new Error('Error al crear fauna');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    static async updateFauna(id, fauna) {
        try {
            const response = await fetch(`${API_BASE_URL}/fauna/${id}`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(fauna)
            });
            if (response.status === 403) throw new Error('No tienes permisos (Solo Admin)');
            if (!response.ok) throw new Error('Error al actualizar fauna');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    static async deleteFauna(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/fauna/${id}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });
            if (response.status === 403) throw new Error('No tienes permisos (Solo Admin)');
            if (!response.ok) throw new Error('Error al eliminar fauna');
            return true;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
    // Flora API
    static async getAllFlora() {
        try {
            const response = await fetch(`${API_BASE_URL}/flora`, {
                headers: this.getAuthHeaders()
            });
            if (!response.ok) throw new Error('Error al cargar la flora');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    static async createFlora(flora) {
        try {
            const response = await fetch(`${API_BASE_URL}/flora`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(flora)
            });
            if (response.status === 403) throw new Error('No tienes permisos (Solo Admin)');
            if (!response.ok) throw new Error('Error al crear flora');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    static async updateFlora(id, flora) {
        try {
            const response = await fetch(`${API_BASE_URL}/flora/${id}`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(flora)
            });
            if (response.status === 403) throw new Error('No tienes permisos (Solo Admin)');
            if (!response.ok) throw new Error('Error al actualizar flora');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    static async deleteFlora(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/flora/${id}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });
            if (response.status === 403) throw new Error('No tienes permisos (Solo Admin)');
            if (!response.ok) throw new Error('Error al eliminar flora');
            return true;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

}
