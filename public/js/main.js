/**
 * Sistema de gestión de componentes dinámicos para RetroVault
 * Carga componentes HTML de forma modular y gestiona la navegación
 */

class ComponentManager {
  constructor() {
    this.components = {
      navbar: "components/navbar.html",
      footer: "components/footer.html",
      hero: "components/hero.html",
      features: "components/features.html",
      categories: "components/categories.html",
      cta: "components/cta.html",
      login: "components/login-form.html",
      register: "components/register-form.html",
      dashboard: "components/dashboard.html",
      profile: "components/profile.html",
      productsList: "components/products-list.html",
    };

    this.currentView = null;
    this.productManager = new ProductManager(this);
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
      return "";
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
    await this.injectComponent("navbar-container", "navbar");
    // CRÍTICO: Actualizar visibilidad justo después de inyectar el HTML
    this.updateNavbar();
    this.attachNavbarListeners();
  }

  /**
   * Carga el footer
   */
  async loadFooter() {
    await this.injectComponent("footer-container", "footer");
  }

  /**
   * Genera el HTML para el indicador de carga.
   * @returns {string} - HTML del loader
   */
  getLoaderHTML() {
    return `
      <div class="absolute inset-0 bg-slate-950 flex items-center justify-center z-50">
        <div class="flex flex-col items-center justify-center space-y-6">
          <div class="relative w-20 h-20">
            <div class="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
          </div>
          <div class="text-center space-y-2">
            <p class="text-white font-black text-sm uppercase tracking-[0.3em] animate-pulse">CARGANDO VISTA</p>
            <p class="text-slate-500 text-xs uppercase font-bold tracking-widest">Un momento por favor...</p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Muestra una vista específica de forma optimizada
   * @param {string} viewName - Nombre de la vista
   * @param {Object} params - Parámetros de la URL (filtros, etc.)
   */
  async showView(viewName, params = {}) {
    const mainContent = document.getElementById("main-content");

    // Ocultamos el contenido para la transición
    mainContent.classList.remove("visible");

    try {
      let components =
        viewName === "landing"
          ? ["hero", "features", "categories", "cta"]
          : [
              this.components[viewName]
                ? viewName
                : viewName === "products"
                  ? "productsList"
                  : viewName,
            ];

      // Carga de HTML
      const htmls = await Promise.all(
        components.map((c) => this.loadComponent(c)),
      );
      let finalHTML = htmls
        .map((h) => `<section class="w-full overflow-hidden">${h}</section>`)
        .join("");

      // --- Lógica de pre-procesamiento de botones (Software/Hardware) ---
      if (viewName === "products") {
        const activeCategory = params.category || "all";
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = finalHTML;

        tempDiv.querySelectorAll("[data-category]").forEach((btn) => {
          const isSelected =
            btn.getAttribute("data-category") === activeCategory;
          btn.className = isSelected
            ? "whitespace-nowrap px-6 py-2.5 bg-primary text-slate-950 text-xs font-black rounded-xl uppercase tracking-widest shadow-lg shadow-primary/20"
            : "whitespace-nowrap px-6 py-2.5 bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold rounded-xl uppercase tracking-widest";
        });
        finalHTML = tempDiv.innerHTML;
      }

      // Inyección y Sincronización con el monitor
      mainContent.innerHTML = finalHTML;

      // Esperamos a que el navegador procese el nuevo HTML antes de mostrarlo
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        this.attachViewListeners(viewName, params);
        // Pequeño delay para asegurar que el CSS se aplicó
        setTimeout(() => mainContent.classList.add("visible"), 10);
      });
    } catch (error) {
      console.error("Error crítico:", error);
    }
  }
  /**
   * Enrutador principal de la aplicación
   */
  router() {
    const hash = window.location.hash.slice(1);

    // Si entran a la raíz (vacío), redirigimos internamente una sola vez
    if (!hash) {
      const destination = localStorage.getItem("token")
        ? "dashboard"
        : "landing";
      // Cambiamos el hash sin disparar eventos extraños
      window.location.replace(`#${destination}`);
      return;
    }

    const [path, queryString] = hash.split("?");
    const params = new URLSearchParams(queryString);
    const viewParams = Object.fromEntries(params.entries());

    const validViews = [
      "landing",
      "login",
      "register",
      "dashboard",
      "profile",
      "products",
    ];
    const viewName = validViews.includes(path) ? path : "landing";

    // BLOQUEO: Si el hash es el mismo que el actual, no recargar nada
    if (this.currentView === window.location.hash) return;

    this.currentView = window.location.hash;
    this.showView(viewName, viewParams);
  }
  /**
   * Adjunta event listeners a la barra de navegación
   */
  attachNavbarListeners() {
    document.getElementById("nav-logo").addEventListener("click", (e) => {
      e.preventDefault();
      window.location.hash = localStorage.getItem("token")
        ? "dashboard"
        : "landing";
    });

    const navLogin = document.getElementById("nav-login");
    const navRegister = document.getElementById("nav-register");
    const navDashboard = document.getElementById("nav-dashboard");
    const navProfile = document.getElementById("nav-profile");
    const btnLogout = document.getElementById("btn-logout");

    if (navLogin)
      navLogin.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.hash = "login";
      });
    if (navRegister)
      navRegister.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.hash = "register";
      });
    if (navDashboard)
      navDashboard.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.hash = "dashboard";
      });
    if (navProfile)
      navProfile.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.hash = "profile";
      });

    if (btnLogout) {
      btnLogout.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        this.updateNavbar();
        window.location.hash = "login";
      });
    }
  }

  /**
   * Adjunta event listeners específicos de cada vista
   * @param {string} viewName - Nombre de la vista actual
   */
  attachViewListeners(viewName, params = {}) {
    if (viewName === "landing") {
      this.attachLandingListeners();
    } else if (viewName === "login") {
      this.attachLoginListeners();
    } else if (viewName === "register") {
      this.attachRegisterListeners();
    } else if (viewName === "profile") {
      this.loadProfile();
    } else if (viewName === "dashboard") {
      this.attachDashboardListeners();
    } else if (viewName === "products") {
      // Dentro de attachViewListeners añade el caso para 'products'
      this.productManager.loadProducts(params);
      this.attachProductListListeners(); // <--- Nueva función
    }
  }

  attachProductListListeners() {
    const filterContainer =
      document.querySelector("[data-category]")?.parentElement;
    if (!filterContainer) return;

    // Ya no necesitamos repintar los colores aquí, showView ya lo hizo.
    // Solo escuchamos los clics.
    filterContainer.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-category]");
      if (!btn) return;

      const category = btn.getAttribute("data-category");
      window.location.hash =
        category === "all" ? "products" : `products?category=${category}`;
    });
  }
  /**
   * Adjunta los listeners para el dashboard
   */
  attachDashboardListeners() {
    const user = JSON.parse(localStorage.getItem("user"));
    const btnAddProduct = document.getElementById("btn-add-product");

    if (user && user.rol === "admin") {
      btnAddProduct.classList.remove("hidden");
    }

    const modal = document.getElementById("add-product-modal");
    const btnCloseModal = document.getElementById("btn-close-modal");
    const btnCancelModal = document.getElementById("btn-cancel-modal");
    const addProductForm = document.getElementById("add-product-form");

    btnAddProduct.addEventListener("click", () =>
      modal.classList.remove("hidden"),
    );
    btnCloseModal.addEventListener("click", () =>
      modal.classList.add("hidden"),
    );
    btnCancelModal.addEventListener("click", () =>
      modal.classList.add("hidden"),
    );

    addProductForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.productManager.handleCreateProduct(e);
    });

    const btnCatJuegos = document.getElementById("btn-cat-juegos");
    const btnCatConsolas = document.getElementById("btn-cat-consolas");
    const btnCatTodos = document.getElementById("btn-cat-todos");

    if (btnCatJuegos)
      btnCatJuegos.addEventListener(
        "click",
        () => (window.location.hash = "products?category=juegos"),
      );
    if (btnCatConsolas)
      btnCatConsolas.addEventListener(
        "click",
        () => (window.location.hash = "products?category=consolas"),
      );
    if (btnCatTodos)
      btnCatTodos.addEventListener(
        "click",
        () => (window.location.hash = "products"),
      );
  }

  /**
   * Adjunta listeners a los botones de la landing page
   */
  attachLandingListeners() {
    const btnHeroRegister = document.getElementById("btn-hero-register");
    const btnHeroLogin = document.getElementById("btn-hero-login");
    const btnCtaRegister = document.getElementById("btn-cta-register");

    if (btnHeroRegister)
      btnHeroRegister.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.hash = "register";
      });
    if (btnHeroLogin)
      btnHeroLogin.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.hash = "login";
      });
    if (btnCtaRegister)
      btnCtaRegister.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.hash = "register";
      });
  }

  /**
   * Adjunta listeners al formulario de login
   */
  attachLoginListeners() {
    const loginForm = document.getElementById("login-form");
    const linkRegister = document.getElementById("link-register");

    if (linkRegister)
      linkRegister.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.hash = "register";
      });

    if (loginForm) {
      loginForm.addEventListener("submit", (e) => this.handleLogin(e));
    }
  }

  /**
   * Adjunta listeners al formulario de registro
   */
  attachRegisterListeners() {
    const registerForm = document.getElementById("register-form");
    const linkLogin = document.getElementById("link-login");

    if (linkLogin)
      linkLogin.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.hash = "login";
      });

    if (registerForm) {
      registerForm.addEventListener("submit", (e) => this.handleRegister(e));
    }
  }

  /**
   * Maneja el envío del formulario de login
   */
  async handleLogin(e) {
    e.preventDefault();

    const loginMsg = document.getElementById("login-message");
    this.showMessage(loginMsg, "Iniciando sesión...", "info");

    const credentials = {
      email: document.getElementById("login-email").value,
      password: document.getElementById("login-password").value,
    };

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("user", JSON.stringify(result.data.user));
        this.showMessage(loginMsg, "¡Bienvenido de nuevo!", "success");
        this.updateNavbar();
        setTimeout(() => {
          window.location.hash = "dashboard";
        }, 1000);
      } else {
        this.showMessage(
          loginMsg,
          result.message || "Credenciales inválidas",
          "error",
        );
      }
    } catch (error) {
      this.showMessage(loginMsg, "Error de conexión con el servidor", "error");
    }
  }

  /**
   * Maneja el envío del formulario de registro
   */
  async handleRegister(e) {
    e.preventDefault();

    const registerMsg = document.getElementById("register-message");
    this.showMessage(registerMsg, "Procesando registro...", "info");

    const userData = {
      nombre: document.getElementById("reg-nombre").value,
      email: document.getElementById("reg-email").value,
      password: document.getElementById("reg-password").value,
    };

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (result.success) {
        this.showMessage(
          registerMsg,
          "¡Registro exitoso! Redirigiendo al login...",
          "success",
        );
        document.getElementById("register-form").reset();
        setTimeout(() => {
          window.location.hash = "login";
        }, 1500);
      } else {
        let errorMsg = result.message || "Error en el registro";
        if (result.errors) {
          errorMsg += `: ${result.errors.map((err) => err.mensaje).join(", ")}`;
        }
        this.showMessage(registerMsg, errorMsg, "error");
      }
    } catch (error) {
      this.showMessage(
        registerMsg,
        "Error de conexión con el servidor",
        "error",
      );
    }
  }

  /**
   * Carga y muestra el perfil del usuario
   */
  async loadProfile() {
    const token = localStorage.getItem("token");
    const profileData = document.getElementById("profile-data");

    if (!token) {
      window.location.hash = "login";
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
      const response = await fetch("/api/auth/perfil", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (result.success) {
        const user = result.data;
        const createdDate = new Date(user.created_at).toLocaleDateString(
          "es-ES",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          },
        );

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
              ${user.rol === "admin" ? "Administrador" : "Cliente"}
            </span>
          </div>
          <div class="flex justify-between items-center p-4 bg-dark rounded-lg border-l-4 border-primary">
            <span class="text-slate-400 font-medium">Miembro desde</span>
            <span class="text-slate-100 font-bold">${createdDate}</span>
          </div>
        `;
      } else {
        localStorage.removeItem("token");
        this.updateNavbar();
        window.location.hash = "login";
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
    element.classList.remove(
      "hidden",
      "bg-red-900/20",
      "text-red-400",
      "border-red-900/30",
      "bg-green-900/20",
      "text-green-400",
      "border-green-900/30",
    );

    if (type === "error") {
      element.classList.add(
        "bg-red-900/20",
        "text-red-400",
        "border",
        "border-red-900/30",
      );
    } else if (type === "success") {
      element.classList.add(
        "bg-green-900/20",
        "text-green-400",
        "border",
        "border-green-900/30",
      );
    }
    element.classList.remove("hidden");
  }

  /**
   * Actualiza la barra de navegación según el estado de autenticación
   */
  updateNavbar() {
    const token = localStorage.getItem("token");
    // Buscamos todos los elementos que tengan estas clases
    const guestElements = document.querySelectorAll(".guest-only");
    const authElements = document.querySelectorAll(".auth-only");

    guestElements.forEach((el) => {
      if (token) {
        el.classList.add("hidden"); // Si hay token, ocultamos invitados
      } else {
        el.classList.remove("hidden"); // Si no hay, mostramos invitados
      }
    });

    authElements.forEach((el) => {
      if (token) {
        el.classList.remove("hidden"); // Si hay token, mostramos auth
      } else {
        el.classList.add("hidden"); // Si no hay, ocultamos auth
      }
    });
  }

  /**
   * Inicializa la aplicación
   */
  async init() {
    // 1. Cargamos Navbar y Footer primero
    await Promise.all([this.loadNavbar(), this.loadFooter()]);

    // 2. Escuchamos el hash para cambios futuros
    window.addEventListener("hashchange", () => this.router());

    // 3. Ejecutamos el router para la vista inicial
    await this.router();
  }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  window.app = new ComponentManager();
});
