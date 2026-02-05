/**
 * Módulo de gestión de productos para RetroVault
 */

class ProductManager {
  constructor(app) {
    this.app = app;
  }

  /**
   * Carga y muestra la lista de productos
   * @param {Object} params - Parámetros para filtrar productos, ej: { category: 'juegos' }
   */
  async loadProducts(params = {}) {
    const token = localStorage.getItem('token');
    const productsGrid = document.getElementById('products-grid');

    if (!token) {
      this.app.showView('login');
      return;
    }

    // Mostrar skeleton loading
    productsGrid.innerHTML = `
      <div class="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${Array(3).fill(0).map(() => `
          <div class="bg-dark-secondary rounded-lg p-4 animate-pulse">
            <div class="h-40 bg-slate-800 rounded-lg mb-4"></div>
            <div class="h-4 bg-slate-800 rounded mb-2"></div>
            <div class="h-4 bg-slate-800 rounded w-3/4"></div>
          </div>
        `).join('')}
      </div>
    `;

    let apiUrl = '/api/products';
    if (params.category) {
      apiUrl += `?category=${params.category}`;
    }

    try {
      const response = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();
      if (result.message === "Token expirado") { localStorage.removeItem("token"); this.app.updateNavbar(); this.app.showView("login"); return; }

      if (result.success && result.data.length > 0) {
        const products = result.data;
        productsGrid.innerHTML = products.map((product) => `
          <div class="bg-dark-secondary border border-slate-800 rounded-lg overflow-hidden hover:border-primary transition-all hover:shadow-lg hover:shadow-primary/10">
            <div class="bg-gradient-to-r from-primary/10 to-primary/5 h-32 flex items-center justify-center">
              <span class="text-4xl font-bold text-primary/30">${product.nombre.charAt(0)}</span>
            </div>
            <div class="p-4">
              <h3 class="text-lg font-bold text-slate-100 mb-2">${product.nombre}</h3>
              <p class="text-sm text-slate-400 mb-3">${product.descripcion || 'Sin descripción'}</p>
              <div class="flex justify-between items-center">
                <span class="text-xs font-mono text-primary">${product.codigo}</span>
                <span class="text-xl font-bold text-primary">$${parseFloat(product.precio).toFixed(2)}</span>
              </div>
            </div>
          </div>
        `).join('');
      } else {
        productsGrid.innerHTML = `
          <div class="col-span-full text-center py-12">
            <p class="text-slate-400 text-lg">No hay productos disponibles en esta categoría.</p>
          </div>
        `;
      }
    } catch (error) {
      productsGrid.innerHTML = `
        <div class="col-span-full text-center py-12">
          <p class="text-red-400">Error al cargar los productos.</p>
        </div>
      `;
    }
  }

  /**
   * Maneja la creación de un nuevo producto desde el modal del dashboard
   */
  async handleCreateProduct(e) {
    e.preventDefault();

    const token = localStorage.getItem('token');
    const productMsg = document.getElementById('add-product-message');

    this.app.showMessage(productMsg, 'Creando producto...', 'info');

    const productData = {
      nombre: document.getElementById('prod-nombre').value,
      codigo: document.getElementById('prod-codigo').value,
      precio: parseFloat(document.getElementById('prod-precio').value),
      descripcion: document.getElementById('prod-descripcion').value,
      categoria: document.getElementById('prod-categoria').value,
    };

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      const result = await response.json();
      if (result.message === "Token expirado") { localStorage.removeItem("token"); this.app.updateNavbar(); this.app.showView("login"); return; }

      if (result.success) {
        this.app.showMessage(productMsg, '¡Producto creado exitosamente!', 'success');
        document.getElementById('add-product-form').reset();
        setTimeout(() => {
          document.getElementById('add-product-modal').classList.add('hidden');
          this.app.showView('products', { category: productData.categoria });
        }, 1000);
      } else {
        let errorMsg = result.message || 'Error al crear el producto';
        if (result.errors) {
          errorMsg += `: ${result.errors.map((err) => err.mensaje).join(', ')}`;
        }
        this.app.showMessage(productMsg, errorMsg, 'error');
      }
    } catch (error) {
      this.app.showMessage(productMsg, 'Error de conexión con el servidor', 'error');
    }
  }
}
