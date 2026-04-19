import { create } from 'zustand';

export const useCartStore = create((set) => ({
  cartItems: [],
  currentShopId: null,
  activeOrderId: localStorage.getItem('activeOrderId') || null,

  setActiveOrderId: (id) => {
    if (id) {
       localStorage.setItem('activeOrderId', id);
    } else {
       localStorage.removeItem('activeOrderId');
    }
    set({ activeOrderId: id });
  },

  setShopId: (id) => set({ currentShopId: id }),

  addToCart: (item) => set((state) => {
    const existing = state.cartItems.find(i => i.id === item.id);
    if (existing) {
      return { cartItems: state.cartItems.map(i => i.id === item.id ? { ...i, quantity: i.quantity + (item.quantity || 1) } : i) };
    }
    return { cartItems: [...state.cartItems, { ...item, quantity: item.quantity || 1 }] };
  }),

  removeFromCart: (id) => set((state) => ({
    cartItems: state.cartItems.filter(i => i.id !== id)
  })),

  updateQuantity: (id, quantity) => set((state) => ({
    cartItems: state.cartItems.map(i => i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i)
  })),

  clearCart: () => set({ cartItems: [] }),

}));
