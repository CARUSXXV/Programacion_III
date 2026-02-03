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

    // Cargar el componente de confirmación
    const confirmContainer = document.getElementById('confirmation-container');
    if (confirmContainer) {
      const response = await fetch('components/confirmation-modal.html');
      confirmContainer.innerHTML = await response.text();
      this.attachConfirmListeners();
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
      btnClear.addEventListener('click', () => {
        this.showConfirmModal({
          title: '¿Vaciar Carrito?',
          message: 'Se eliminarán todos los productos que has seleccionado.',
          confirmText: 'Sí, vaciar',
          type: 'danger',
          onConfirm: async () => {
            await this.clearCart();
            this.showToast('Carrito vaciado correctamente');
          }
        });
      });
    }

    if (btnCheckout) {
      btnCheckout.addEventListener('click', () => {
        const total = document.getElementById('cart-total').textContent;
        if (total === '$0.00') {
          this.showToast('El carrito está vacío');
          return;
        }

        this.showConfirmModal({
          title: 'Finalizar Compra',
          message: `Estás a punto de pagar un total de ${total}.`,
          confirmText: 'Pagar Ahora',
          type: 'payment',
          onConfirm: async () => {
            await this.simulatePayment();
          }
        });
      });
    }

    // Listener para el botón de la navbar (se delega porque la navbar se recarga)
    document.addEventListener('click', (e) => {
      if (e.target.closest('#btn-open-cart')) {
        this.toggleCart(true);
      }
    });
  }

  attachConfirmListeners() {
    const btnCancel = document.getElementById('btn-confirm-cancel');
    const backdrop = document.getElementById('confirm-backdrop');
    
    if (btnCancel) btnCancel.addEventListener('click', () => this.toggleConfirmModal(false));
    if (backdrop) backdrop.addEventListener('click', () => this.toggleConfirmModal(false));
  }

  showConfirmModal({ title, message, confirmText, onConfirm, type = 'info' }) {
    const modal = document.getElementById('confirmation-modal');
    const titleEl = document.getElementById('confirm-title');
    const messageEl = document.getElementById('confirm-message');
    const btnConfirm = document.getElementById('btn-confirm-action');
    const iconContainer = document.getElementById('confirm-icon-container');
    const paymentForm = document.getElementById('payment-form-container');

    titleEl.textContent = title;
    messageEl.textContent = message;
    btnConfirm.textContent = confirmText;
    
    // Reset classes and content
    iconContainer.className = 'w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center';
    paymentForm.classList.add('hidden');
    btnConfirm.className = 'flex-1 px-4 py-3 font-black rounded-xl transition-all shadow-lg';

    if (type === 'danger') {
      iconContainer.classList.add('bg-red-500/10', 'text-red-500');
      iconContainer.innerHTML = '<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>';
      btnConfirm.classList.add('bg-red-500', 'text-white', 'hover:bg-red-600', 'shadow-red-500/20');
    } else if (type === 'payment') {
      iconContainer.classList.add('bg-primary/10', 'text-primary');
      iconContainer.innerHTML = '<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>';
      btnConfirm.classList.add('bg-primary', 'text-slate-950', 'hover:bg-primary-dark', 'shadow-primary/20');
      paymentForm.classList.remove('hidden');
    } else {
      iconContainer.classList.add('bg-blue-500/10', 'text-blue-500');
      iconContainer.innerHTML = '<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
      btnConfirm.classList.add('bg-blue-500', 'text-white', 'hover:bg-blue-600', 'shadow-blue-500/20');
    }

    // Clone and replace to remove old listeners
    const newBtnConfirm = btnConfirm.cloneNode(true);
    btnConfirm.parentNode.replaceChild(newBtnConfirm, btnConfirm);
    
    newBtnConfirm.addEventListener('click', () => {
      onConfirm();
      this.toggleConfirmModal(false);
    });

    this.toggleConfirmModal(true);
  }

  toggleConfirmModal(show) {
    const modal = document.getElementById('confirmation-modal');
    const content = document.getElementById('confirm-content');
    
    if (show) {
      modal.classList.remove('hidden');
      setTimeout(() => {
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
      }, 10);
    } else {
      content.classList.remove('scale-100', 'opacity-100');
      content.classList.add('scale-95', 'opacity-0');
      setTimeout(() => modal.classList.add('hidden'), 300);
    }
  }

  async simulatePayment() {
    const btnConfirm = document.getElementById('btn-confirm-action');
    const originalText = btnConfirm.textContent;
    
    // Mostrar estado de carga
    this.showToast('Procesando pago...');
    
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await this.clearCart();
    this.toggleCart(false);
    
    // Éxito
    this.showSuccessModal();
  }

  showSuccessModal() {
    this.showConfirmModal({
      title: '¡Pago Exitoso!',
      message: 'Tu pedido ha sido procesado. Recibirás un correo con los detalles en breve.',
      confirmText: 'Genial',
      type: 'success',
      onConfirm: () => {}
    });
    
    // Personalizar para éxito
    const iconContainer = document.getElementById('confirm-icon-container');
    iconContainer.className = 'w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-green-500/10 text-green-500';
    iconContainer.innerHTML = '<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
    
    const btnConfirm = document.getElementById('btn-confirm-action');
    btnConfirm.className = 'flex-1 px-4 py-3 bg-green-500 text-white font-black rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-500/20';
    
    const btnCancel = document.getElementById('btn-confirm-cancel');
    btnCancel.classList.add('hidden');
    
    // Restaurar botón cancelar al cerrar
    const originalToggle = this.toggleConfirmModal.bind(this);
    this.toggleConfirmModal = (show) => {
      if (!show) {
        btnCancel.classList.remove('hidden');
        this.toggleConfirmModal = originalToggle;
      }
      originalToggle(show);
    };
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
    toast.className = 'fixed bottom-6 right-6 bg-primary text-slate-950 px-6 py-3 rounded-xl font-bold shadow-2xl z-[110] transform transition-all duration-300 translate-y-20 opacity-0';
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
