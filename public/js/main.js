document.addEventListener('DOMContentLoaded', () => {
  // Elementos de navegación
  const navHome = document.getElementById('nav-home');
  const navLogin = document.getElementById('nav-login');
  const navRegister = document.getElementById('nav-register');
  const navProfile = document.getElementById('nav-profile');
  const btnLogout = document.getElementById('btn-logout');

  // Vistas
  const views = {
    home: document.getElementById('home-view'),
    login: document.getElementById('login-view'),
    register: document.getElementById('register-view'),
    profile: document.getElementById('profile-view'),
  };

  // Formularios
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  // Mensajes
  const loginMsg = document.getElementById('login-message');
  const registerMsg = document.getElementById('register-message');

  // Función para cambiar de vista
  function showView(viewName) {
    Object.values(views).forEach((v) => v.style.display = 'none');
    views[viewName].style.display = 'block';

    if (viewName === 'profile') {
      loadProfile();
    }
  }

  // Manejo de UI según estado de autenticación
  function updateUI() {
    const token = localStorage.getItem('token');
    const guestElements = document.querySelectorAll('.guest-only');
    const authElements = document.querySelectorAll('.auth-only');

    if (token) {
      guestElements.forEach((el) => el.style.display = 'none');
      authElements.forEach((el) => el.style.display = 'block');
    } else {
      guestElements.forEach((el) => el.style.display = 'block');
      authElements.forEach((el) => el.style.display = 'none');
    }
  }

  // Event Listeners Navegación
  navHome.addEventListener('click', (e) => { e.preventDefault(); showView('home'); });
  navLogin.addEventListener('click', (e) => { e.preventDefault(); showView('login'); });
  navRegister.addEventListener('click', (e) => { e.preventDefault(); showView('register'); });
  navProfile.addEventListener('click', (e) => { e.preventDefault(); showView('profile'); });

  btnLogout.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateUI();
    showView('home');
  });

  // Lógica de Registro
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    registerMsg.textContent = 'Procesando...';
    registerMsg.className = 'message';

    const userData = {
      nombre: document.getElementById('reg-nombre').value,
      email: document.getElementById('reg-email').value,
      password: document.getElementById('reg-password').value,
      rol: document.getElementById('reg-rol').value,
    };

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (result.success) {
        registerMsg.textContent = '¡Registro exitoso! Ya puedes iniciar sesión.';
        registerMsg.className = 'message success';
        registerForm.reset();
        setTimeout(() => showView('login'), 2000);
      } else {
        registerMsg.textContent = result.message || 'Error en el registro';
        registerMsg.className = 'message error';
        if (result.errors) {
          registerMsg.textContent += `: ${result.errors.map((e) => e.mensaje).join(', ')}`;
        }
      }
    } catch (error) {
      registerMsg.textContent = 'Error de conexión con el servidor';
      registerMsg.className = 'message error';
    }
  });

  // Lógica de Login
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginMsg.textContent = 'Iniciando sesión...';
    loginMsg.className = 'message';

    const credentials = {
      email: document.getElementById('login-email').value,
      password: document.getElementById('login-password').value,
    };

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        loginMsg.textContent = '¡Bienvenido de nuevo!';
        loginMsg.className = 'message success';
        updateUI();
        setTimeout(() => showView('profile'), 1000);
      } else {
        loginMsg.textContent = result.message || 'Credenciales inválidas';
        loginMsg.className = 'message error';
      }
    } catch (error) {
      loginMsg.textContent = 'Error de conexión con el servidor';
      loginMsg.className = 'message error';
    }
  });

  // Cargar Perfil
  async function loadProfile() {
    const token = localStorage.getItem('token');
    const profileData = document.getElementById('profile-data');

    if (!token) {
      showView('login');
      return;
    }

    profileData.innerHTML = '<p>Cargando datos...</p>';

    try {
      const response = await fetch('/api/auth/perfil', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (result.success) {
        const user = result.data;
        profileData.innerHTML = `
                    <div class="profile-item">ID: <span>${user.id}</span></div>
                    <div class="profile-item">Nombre: <span>${user.nombre}</span></div>
                    <div class="profile-item">Email: <span>${user.email}</span></div>
                    <div class="profile-item">Rol: <span>${user.rol}</span></div>
                    <div class="profile-item">Miembro desde: <span>${new Date(user.created_at).toLocaleDateString()}</span></div>
                `;
      } else {
        localStorage.removeItem('token');
        updateUI();
        showView('login');
      }
    } catch (error) {
      profileData.innerHTML = '<p class="error">Error al cargar el perfil</p>';
    }
  }

  // Inicialización
  updateUI();
});
