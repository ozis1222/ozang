import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  items: JSON.parse(localStorage.getItem('cart') || '[]'),

  addItem: (product, quantity = 1) => {
    const items = get().items;
    const existing = items.find(i => i._id === product._id);
    let newItems;
    if (existing) {
      newItems = items.map(i => i._id === product._id ? { ...i, quantity: i.quantity + quantity } : i);
    } else {
      newItems = [...items, { ...product, quantity }];
    }
    localStorage.setItem('cart', JSON.stringify(newItems));
    set({ items: newItems });
  },

  removeItem: (id) => {
    const newItems = get().items.filter(i => i._id !== id);
    localStorage.setItem('cart', JSON.stringify(newItems));
    set({ items: newItems });
  },

  updateQty: (id, quantity) => {
    const newItems = get().items.map(i => i._id === id ? { ...i, quantity } : i);
    localStorage.setItem('cart', JSON.stringify(newItems));
    set({ items: newItems });
  },

  clear: () => {
    localStorage.removeItem('cart');
    set({ items: [] });
  },

  total: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
  count: () => get().items.reduce((s, i) => s + i.quantity, 0),
}));

export default useCartStore;
