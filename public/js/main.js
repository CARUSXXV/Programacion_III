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

  /**
   * Función para cambiar de vista
   * @param {string} viewName - Nombre de la vista a mostrar
   */
  function showView(viewName) {
    Object.values(views).forEach((v) => {
      if (v) v.classList.add('hidden');
    });
    
    const targetView = views[viewName];
    if (targetView) {
      targetView.classList.remove('hidden');
    }

    if (viewName === 'profile') {
      loadProfile();
    }

    // Scroll al inicio suave
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Manejo de UI según estado de autenticación
   */
  function updateUI() {
    const token = localStorage.getItem('token');
    const guestElements = document.querySelectorAll('.guest-only');
    const authElements = document.querySelectorAll('.auth-only');

    if (token) {
      guestElements.forEach((el) => el.classList.add('hidden'));
      authElements.forEach((el) => el.classList.remove('hidden'));
    } else {
      guestElements.forEach((el) => el.classList.remove('hidden'));
      authElements.forEach((el) => el.classList.add('hidden'));
    }
  }

  /**
   * Mostrar mensajes de feedback
   */
  function showMessage(element, text, type) {
    element.textContent = text;
    element.classList.remove('hidden', 'bg-red-900/20', 'text-red-400', 'border-red-900/30', 'bg-green-900/20', 'text-green-400', 'border-green-900/30');
    
    if (type === 'error') {
      element.classList.add('bg-red-900/20', 'text-red-400', 'border', 'border-red-900/30');
    } else {
      element.classList.add('bg-green-900/20', 'text-green-400', 'border', 'border-green-900/30');
    }
    element.classList.remove('hidden');
  }

  // Event Listeners Navegación
  if (navLogin) navLogin.addEventListener('click', (e) => { e.preventDefault(); showView('login'); });
  if (navRegister) navRegister.addEventListener('click', (e) => { e.preventDefault(); showView('register'); });
  if (navDashboard) navDashboard.addEventListener('click', (e) => { e.preventDefault(); showView('dashboard'); });
  if (navProfile) navProfile.addEventListener('click', (e) => { e.preventDefault(); showView('profile'); });

  if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      updateUI();
      showView('landing');
    });
  }

  // Botones de la landing page
  if (btnHeroRegister) btnHeroRegister.addEventListener('click', (e) => { e.preventDefault(); showView('register'); });
  if (btnHeroLogin) btnHeroLogin.addEventListener('click', (e) => { e.preventDefault(); showView('login'); });
  if (btnCtaRegister) btnCtaRegister.addEventListener('click', (e) => { e.preventDefault(); showView('register'); });

  // Links de autenticación
  if (linkRegister) linkRegister.addEventListener('click', (e) => { e.preventDefault(); showView('register'); });
  if (linkLogin) linkLogin.addEventListener('click', (e) => { e.preventDefault(); showView('login'); });

  // Lógica de Registro
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      showMessage(registerMsg, 'Procesando registro...', 'info');

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
          showMessage(registerMsg, '¡Registro exitoso! Redirigiendo al login...', 'success');
          registerForm.reset();
          setTimeout(() => showView('login'), 1500);
        } else {
          let errorMsg = result.message || 'Error en el registro';
          if (result.errors) {
            errorMsg += `: ${result.errors.map((err) => err.mensaje).join(', ')}`;
          }
          showMessage(registerMsg, errorMsg, 'error');
        }
      } catch (error) {
        showMessage(registerMsg, 'Error de conexión con el servidor', 'error');
      }
    });
  }

  // Lógica de Login
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      showMessage(loginMsg, 'Iniciando sesión...', 'info');

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
          showMessage(loginMsg, '¡Bienvenido de nuevo!', 'success');
          updateUI();
          setTimeout(() => showView('dashboard'), 1000);
        } else {
          showMessage(loginMsg, result.message || 'Credenciales inválidas', 'error');
        }
      } catch (error) {
        showMessage(loginMsg, 'Error de conexión con el servidor', 'error');
      }
    });
  }

  // Cargar Perfil
  async function loadProfile() {
    const token = localStorage.getItem('token');
    const profileData = document.getElementById('profile-data');

    if (!token) {
      showView('login');
      return;
    }

    profileData.innerHTML = `
      <div class="animate-pulse space-y-4">
        <div class="h-12 bg-slate-800 rounded-lg"></div>
        <div class="h-12 bg-slate-800 rounded-lg"></div>
        <div class="h-12 bg-slate-800 rounded-lg"></div>
      </div>
    `;

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
          <div class="flex justify-between items-center p-4 bg-dark rounded-lg border-l-4 border-primary">
            <span class="text-slate-400 font-medium">ID de Usuario</span>
            <span class="text-slate-100 font-bold">#${user.id}</span>
          </div>
          <div class="flex justify-between items-center p-4 bg-dark rounded-lg border-l-4 border-primary">
            <span class="text-slate-400 font-medium">Nombre Completo</span>
            <span class="text-slate-100 font-bold">${user.nombre}</span>
          </div>
          <div class="flex justify-between items-center p-4 bg-dark rounded-lg border-l-4 border-primary">
            <span class="text-slate-400 font-medium">Correo Electrónico</span>
            <span class="text-slate-100 font-bold">${user.email}</span>
          </div>
          <div class="flex justify-between items-center p-4 bg-dark rounded-lg border-l-4 border-primary">
            <span class="text-slate-400 font-medium">Rol de Acceso</span>
            <span class="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase">
              ${user.rol === 'admin' ? 'Administrador' : 'Cliente'}
            </span>
          </div>
          <div class="flex justify-between items-center p-4 bg-dark rounded-lg border-l-4 border-primary">
            <span class="text-slate-400 font-medium">Miembro desde</span>
            <span class="text-slate-100 font-bold">${createdDate}</span>
          </div>
        `;
      } else {
        localStorage.removeItem('token');
        updateUI();
        showView('login');
      }
    } catch (error) {
      profileData.innerHTML = `
        <div class="p-4 bg-red-900/20 text-red-400 border border-red-900/30 rounded-lg text-center">
          Error al cargar los datos del perfil. Por favor, intenta de nuevo.
        </div>
      `;
    }
  }

  // Inicialización
  updateUI();
  
  // Si hay un token, ir al dashboard, si no, a la landing
  if (localStorage.getItem('token')) {
    showView('dashboard');
  } else {
    showView('landing');
  }
});
