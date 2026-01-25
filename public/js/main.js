document.addEventListener('DOMContentLoaded', () => {
  // Elementos de navegación
  const navLogin = document.getElementById('nav-login');
  const navRegister = document.getElementById('nav-register');
  const navDashboard = document.getElementById('nav-dashboard');
  const navProfile = document.getElementById('nav-profile');
  const btnLogout = document.getElementById('btn-logout');

  // Botones de la landing page
  const btnHeroRegister = document.getElementById('btn-hero-register');
  const btnHeroLogin = document.getElementById('btn-hero-login');
  const btnCtaRegister = document.getElementById('btn-cta-register');

  // Links de autenticación
  const linkRegister = document.getElementById('link-register');
  const linkLogin = document.getElementById('link-login');

  // Vistas
  const views = {
    landing: document.getElementById('landing-view'),
    login: document.getElementById('login-view'),
    register: document.getElementById('register-view'),
    dashboard: document.getElementById('dashboard-view'),
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
    Object.values(views).forEach((v) => {
      v.style.display = 'none';
    });
    views[viewName].style.display = 'block';

    if (viewName === 'profile') {
      loadProfile();
    }

    // Scroll al inicio
    window.scrollTo(0, 0);
  }

  // Manejo de UI según estado de autenticación
  function updateUI() {
    const token = localStorage.getItem('token');
    const guestElements = document.querySelectorAll('.guest-only');
    const authElements = document.querySelectorAll('.auth-only');

    if (token) {
      guestElements.forEach((el) => {
        el.style.display = 'none';
      });
      authElements.forEach((el) => {
        el.style.display = 'block';
      });
    } else {
      guestElements.forEach((el) => {
        el.style.display = 'block';
      });
      authElements.forEach((el) => {
        el.style.display = 'none';
      });
    }
  }

  // Event Listeners Navegación
  navLogin.addEventListener('click', (e) => {
    e.preventDefault();
    showView('login');
  });

  navRegister.addEventListener('click', (e) => {
    e.preventDefault();
    showView('register');
  });

  navDashboard.addEventListener('click', (e) => {
    e.preventDefault();
    showView('dashboard');
  });

  navProfile.addEventListener('click', (e) => {
    e.preventDefault();
    showView('profile');
  });

  btnLogout.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateUI();
    showView('landing');
  });

  // Botones de la landing page
  btnHeroRegister.addEventListener('click', (e) => {
    e.preventDefault();
    showView('register');
  });

  btnHeroLogin.addEventListener('click', (e) => {
    e.preventDefault();
    showView('login');
  });

  btnCtaRegister.addEventListener('click', (e) => {
    e.preventDefault();
    showView('register');
  });

  // Links de autenticación
  linkRegister.addEventListener('click', (e) => {
    e.preventDefault();
    showView('register');
  });

  linkLogin.addEventListener('click', (e) => {
    e.preventDefault();
    showView('login');
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
    };

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (result.success) {
        registerMsg.textContent = '¡Registro exitoso! Redirigiendo...';
        registerMsg.className = 'message success';
        registerForm.reset();
        setTimeout(() => showView('login'), 1500);
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
        loginMsg.textContent = '¡Bienvenido!';
        loginMsg.className = 'message success';
        updateUI();
        setTimeout(() => showView('dashboard'), 1000);
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
        const createdDate = new Date(user.created_at).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        profileData.innerHTML = `
          <div class="profile-item">
            <span>ID:</span>
            <span>${user.id}</span>
          </div>
          <div class="profile-item">
            <span>Nombre:</span>
            <span>${user.nombre}</span>
          </div>
          <div class="profile-item">
            <span>Email:</span>
            <span>${user.email}</span>
          </div>
          <div class="profile-item">
            <span>Rol:</span>
            <span>${user.rol === 'admin' ? 'Administrador' : 'Cliente'}</span>
          </div>
          <div class="profile-item">
            <span>Miembro desde:</span>
            <span>${createdDate}</span>
          </div>
        `;
      } else {
        localStorage.removeItem('token');
        updateUI();
        showView('login');
      }
    } catch (error) {
      profileData.innerHTML = '<p style="color: #ef4444;">Error al cargar el perfil</p>';
    }
  }

  // Inicialización
  updateUI();
  showView('landing');
});
