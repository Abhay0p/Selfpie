import { create } from 'zustand';

export const useCart = create((set, get) => ({
  cart: [],
  selectedShopId: null,

  setShop: (shopId) => set({ selectedShopId: shopId, cart: [] }), // Reset cart if shop changes

  addItem: (product) => set((state) => {
    const existing = state.cart.find((item) => item._id === product._id);
    if (existing) {
      return {
        cart: state.cart.map((item) =>
          item._id === product._id ? { ...item, qty: item.qty + 1 } : item
        ),
      };
    }
    return { cart: [...state.cart, { ...product, qty: 1 }] };
  }),

  removeItem: (productId) => set((state) => ({
    cart: state.cart.map((item) =>
      item._id === productId ? { ...item, qty: Math.max(0, item.qty - 1) } : item
    ).filter((item) => item.qty > 0),
  })),

  getTotal: () => get().cart.reduce((acc, item) => acc + item.price * item.qty, 0),
  
  clearCart: () => set({ cart: [] }),
}));