/**
 * Módulo de gestión del carrito para RetroVault
 */

class CartManager {
  constructor(app) {
    this.app = app;
    this.isOpen = false;
    this.init();
  }

  async init() {
    // Cargar el componente del carrito
    const container = document.getElementById('cart-container');
    if (container) {
      const response = await fetch('components/cart-modal.html');
      container.innerHTML = await response.text();
      this.attachListeners();
      this.updateBadge();
    }
  }

  attachListeners() {
    const btnClose = document.getElementById('btn-close-cart');
    const backdrop = document.getElementById('cart-backdrop');
    const btnClear = document.getElementById('btn-clear-cart');
    const btnCheckout = document.getElementById('btn-checkout');

    if (btnClose) btnClose.addEventListener('click', () => this.toggleCart(false));
    if (backdrop) backdrop.addEventListener('click', () => this.toggleCart(false));
    
    if (btnClear) {
      btnClear.addEventListener('click', async () => {
        if (confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
          await this.clearCart();
        }
      });
    }

    if (btnCheckout) {
      btnCheckout.addEventListener('click', () => {
        alert('¡Gracias por tu compra! (Funcionalidad de pago en desarrollo)');
        this.clearCart();
        this.toggleCart(false);
      });
    }

    // Listener para el botón de la navbar (se delega porque la navbar se recarga)
    document.addEventListener('click', (e) => {
      if (e.target.closest('#btn-open-cart')) {
        this.toggleCart(true);
      }
    });
  }

  async toggleCart(show) {
    const modal = document.getElementById('cart-modal');
    const content = document.getElementById('cart-content');
    
    if (!modal || !content) return;

    if (show) {
      modal.classList.remove('hidden');
      setTimeout(() => content.classList.remove('translate-x-full'), 10);
      await this.loadCartItems();
    } else {
      content.classList.add('translate-x-full');
      setTimeout(() => modal.classList.add('hidden'), 300);
    }
    this.isOpen = show;
  }

  async loadCartItems() {
    const container = document.getElementById('cart-items-container');
    const totalElement = document.getElementById('cart-total');
    const token = localStorage.getItem('token');

    if (!token) return;

    try {
      const response = await fetch('/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        container.innerHTML = data.items.map(item => `
          <div class="flex gap-4 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <div class="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold">
              ${item.nombre.charAt(0)}
            </div>
            <div class="flex-grow">
              <h4 class="text-sm font-bold text-white">${item.nombre}</h4>
              <p class="text-xs text-slate-400">${item.cantidad} x $${item.precio.toFixed(2)}</p>
              <p class="text-sm font-bold text-primary mt-1">$${item.subtotal.toFixed(2)}</p>
            </div>
          </div>
        `).join('');
        totalElement.textContent = `$${data.total.toFixed(2)}`;
      } else {
        container.innerHTML = `
          <div class="text-center py-12">
            <div class="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
            </div>
            <p class="text-slate-400">Tu carrito está vacío</p>
            <button onclick="window.location.hash='products'; document.getElementById('btn-close-cart').click();" class="mt-4 text-primary text-sm font-bold hover:underline">Ir a la tienda</button>
          </div>
        `;
        totalElement.textContent = '$0.00';
      }
      this.updateBadge(data.items ? data.items.length : 0);
    } catch (error) {
      container.innerHTML = '<p class="text-red-400 text-center">Error al cargar el carrito</p>';
    }
  }

  async addToCart(productId) {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.hash = 'login';
      return;
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId, cantidad: 1 })
      });

      if (response.ok) {
        // Feedback visual
        this.showToast('Producto añadido al carrito');
        await this.updateBadge();
        if (this.isOpen) await this.loadCartItems();
      }
    } catch (error) {
      console.error('Error al añadir al carrito:', error);
    }
  }

  async clearCart() {
    const token = localStorage.getItem('token');
    try {
      await fetch('/api/cart', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      await this.loadCartItems();
      await this.updateBadge();
    } catch (error) {
      console.error('Error al vaciar el carrito:', error);
    }
  }

  async updateBadge(count) {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;

    if (count === undefined) {
      const token = localStorage.getItem('token');
      if (!token) {
        badge.classList.add('hidden');
        return;
      }
      try {
        const response = await fetch('/api/cart', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        count = data.items ? data.items.length : 0;
      } catch (e) {
        count = 0;
      }
    }

    if (count > 0) {
      badge.textContent = count;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-6 right-6 bg-primary text-slate-950 px-6 py-3 rounded-xl font-bold shadow-2xl z-[100] transform transition-all duration-300 translate-y-20 opacity-0';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.remove('translate-y-20', 'opacity-0');
    }, 100);

    setTimeout(() => {
      toast.classList.add('translate-y-20', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}
