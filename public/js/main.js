/**
 * Sistema de gestión de componentes dinámicos para RetroVault
 * Carga componentes HTML de forma modular y gestiona la navegación
 */

class ComponentManager {
  constructor() {
    this.components = {
      navbar: 'components/navbar.html',
      footer: 'components/footer.html',
      hero: 'components/hero.html',
      features: 'components/features.html',
      categories: 'components/categories.html',
      cta: 'components/cta.html',
      login: 'components/login-form.html',
      register: 'components/register-form.html',
      dashboard: 'components/dashboard.html',
      profile: 'components/profile.html',
    };

    this.currentView = null;
    this.init();
  }

  /**
   * Carga un componente HTML de forma dinámica
   * @param {string} componentName - Nombre del componente a cargar
   * @returns {Promise<string>} - HTML del componente
   */
  async loadComponent(componentName) {
    try {
      const path = this.components[componentName];
      if (!path) {
        throw new Error(`Componente ${componentName} no encontrado`);
      }

      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Error al cargar ${componentName}: ${response.status}`);
      }

      return await response.text();
    } catch (error) {
      console.error(`Error cargando componente ${componentName}:`, error);
      return '';
    }
  }

  /**
   * Inyecta un componente en un contenedor específico
   * @param {string} containerId - ID del contenedor
   * @param {string} componentName - Nombre del componente
   */
  async injectComponent(containerId, componentName) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Contenedor ${containerId} no encontrado`);
      return;
    }

    const html = await this.loadComponent(componentName);
    container.innerHTML = html;
  }

  /**
   * Carga la barra de navegación
   */
  async loadNavbar() {
    await this.injectComponent('navbar-container', 'navbar');
    this.attachNavbarListeners();
  }

  /**
   * Carga el footer
   */
  async loadFooter() {
    await this.injectComponent('footer-container', 'footer');
  }

  /**
   * Muestra una vista específica
   * @param {string} viewName - Nombre de la vista (landing, login, register, dashboard, profile)
   */
  async showView(viewName) {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '';

    let componentsToLoad = [];

    switch (viewName) {
      case 'landing':
        componentsToLoad = ['hero', 'features', 'categories', 'cta'];
        break;
      case 'login':
        componentsToLoad = ['login'];
        break;
      case 'register':
        componentsToLoad = ['register'];
        break;
      case 'dashboard':
        componentsToLoad = ['dashboard'];
        break;
      case 'profile':
        componentsToLoad = ['profile'];
        break;
      default:
        componentsToLoad = ['hero', 'features', 'categories', 'cta'];
    }

    // Cargar todos los componentes de la vista
    for (const component of componentsToLoad) {
      const html = await this.loadComponent(component);
      const section = document.createElement('section');
      section.innerHTML = html;
      if (section.firstElementChild) {
        mainContent.appendChild(section.firstElementChild);
      }
    }

    this.currentView = viewName;
    this.attachViewListeners(viewName);

    // Scroll al inicio suave
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Adjunta event listeners a la barra de navegación
   */
  attachNavbarListeners() {
    const navLogin = document.getElementById('nav-login');
    const navRegister = document.getElementById('nav-register');
    const navDashboard = document.getElementById('nav-dashboard');
    const navProfile = document.getElementById('nav-profile');
    const btnLogout = document.getElementById('btn-logout');

    if (navLogin) navLogin.addEventListener('click', (e) => { e.preventDefault(); this.showView('login'); });
    if (navRegister) navRegister.addEventListener('click', (e) => { e.preventDefault(); this.showView('register'); });
    if (navDashboard) navDashboard.addEventListener('click', (e) => { e.preventDefault(); this.showView('dashboard'); });
    if (navProfile) navProfile.addEventListener('click', (e) => { e.preventDefault(); this.showView('profile'); });

    if (btnLogout) {
      btnLogout.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.updateNavbar();
        this.showView('landing');
      });
    }
  }

  /**
   * Adjunta event listeners específicos de cada vista
   * @param {string} viewName - Nombre de la vista actual
   */
  attachViewListeners(viewName) {
    if (viewName === 'landing') {
      this.attachLandingListeners();
    } else if (viewName === 'login') {
      this.attachLoginListeners();
    } else if (viewName === 'register') {
      this.attachRegisterListeners();
    } else if (viewName === 'profile') {
      this.loadProfile();
    }
  }

  /**
   * Adjunta listeners a los botones de la landing page
   */
  attachLandingListeners() {
    const btnHeroRegister = document.getElementById('btn-hero-register');
    const btnHeroLogin = document.getElementById('btn-hero-login');
    const btnCtaRegister = document.getElementById('btn-cta-register');

    if (btnHeroRegister) btnHeroRegister.addEventListener('click', (e) => { e.preventDefault(); this.showView('register'); });
    if (btnHeroLogin) btnHeroLogin.addEventListener('click', (e) => { e.preventDefault(); this.showView('login'); });
    if (btnCtaRegister) btnCtaRegister.addEventListener('click', (e) => { e.preventDefault(); this.showView('register'); });
  }

  /**
   * Adjunta listeners al formulario de login
   */
  attachLoginListeners() {
    const loginForm = document.getElementById('login-form');
    const linkRegister = document.getElementById('link-register');

    if (linkRegister) linkRegister.addEventListener('click', (e) => { e.preventDefault(); this.showView('register'); });

    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }
  }

  /**
   * Adjunta listeners al formulario de registro
   */
  attachRegisterListeners() {
    const registerForm = document.getElementById('register-form');
    const linkLogin = document.getElementById('link-login');

    if (linkLogin) linkLogin.addEventListener('click', (e) => { e.preventDefault(); this.showView('login'); });

    if (registerForm) {
      registerForm.addEventListener('submit', (e) => this.handleRegister(e));
    }
  }

  /**
   * Maneja el envío del formulario de login
   */
  async handleLogin(e) {
    e.preventDefault();

    const loginMsg = document.getElementById('login-message');
    this.showMessage(loginMsg, 'Iniciando sesión...', 'info');

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
        this.showMessage(loginMsg, '¡Bienvenido de nuevo!', 'success');
        this.updateNavbar();
        setTimeout(() => this.showView('dashboard'), 1000);
      } else {
        this.showMessage(loginMsg, result.message || 'Credenciales inválidas', 'error');
      }
    } catch (error) {
      this.showMessage(loginMsg, 'Error de conexión con el servidor', 'error');
    }
  }

  /**
   * Maneja el envío del formulario de registro
   */
  async handleRegister(e) {
    e.preventDefault();

    const registerMsg = document.getElementById('register-message');
    this.showMessage(registerMsg, 'Procesando registro...', 'info');

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
        this.showMessage(registerMsg, '¡Registro exitoso! Redirigiendo al login...', 'success');
        document.getElementById('register-form').reset();
        setTimeout(() => this.showView('login'), 1500);
      } else {
        let errorMsg = result.message || 'Error en el registro';
        if (result.errors) {
          errorMsg += `: ${result.errors.map((err) => err.mensaje).join(', ')}`;
        }
        this.showMessage(registerMsg, errorMsg, 'error');
      }
    } catch (error) {
      this.showMessage(registerMsg, 'Error de conexión con el servidor', 'error');
    }
  }

  /**
   * Carga y muestra el perfil del usuario
   */
  async loadProfile() {
    const token = localStorage.getItem('token');
    const profileData = document.getElementById('profile-data');

    if (!token) {
      this.showView('login');
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
        this.updateNavbar();
        this.showView('login');
      }
    } catch (error) {
      profileData.innerHTML = `
        <div class="p-4 bg-red-900/20 text-red-400 border border-red-900/30 rounded-lg text-center">
          Error al cargar los datos del perfil. Por favor, intenta de nuevo.
        </div>
      `;
    }
  }

  /**
   * Muestra un mensaje de feedback
   */
  showMessage(element, text, type) {
    element.textContent = text;
    element.classList.remove('hidden', 'bg-red-900/20', 'text-red-400', 'border-red-900/30', 'bg-green-900/20', 'text-green-400', 'border-green-900/30');

    if (type === 'error') {
      element.classList.add('bg-red-900/20', 'text-red-400', 'border', 'border-red-900/30');
    } else if (type === 'success') {
      element.classList.add('bg-green-900/20', 'text-green-400', 'border', 'border-green-900/30');
    }
    element.classList.remove('hidden');
  }

  /**
   * Actualiza la barra de navegación según el estado de autenticación
   */
  updateNavbar() {
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
   * Inicializa la aplicación
   */
  async init() {
    // Cargar navbar y footer
    await this.loadNavbar();
    await this.loadFooter();

    // Actualizar UI según estado de autenticación
    this.updateNavbar();

    // Mostrar vista inicial
    const token = localStorage.getItem('token');
    if (token) {
      this.showView('dashboard');
    } else {
      this.showView('landing');
    }
  }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.app = new ComponentManager();
});