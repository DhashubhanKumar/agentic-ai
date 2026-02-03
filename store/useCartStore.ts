import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Watch {
    id: string;
    name: string;
    brand: string;
    price: number;
    image: string;
}

interface CartItem extends Watch {
    quantity: number;
}

interface CartState {
    items: CartItem[];
    addItem: (watch: Watch) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    total: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (watch) => {
                const currentItems = get().items;
                const existingItem = currentItems.find((item) => item.id === watch.id);

                if (existingItem) {
                    set({
                        items: currentItems.map((item) =>
                            item.id === watch.id ? { ...item, quantity: item.quantity + 1 } : item
                        ),
                    });
                } else {
                    set({ items: [...currentItems, { ...watch, quantity: 1 }] });
                }
            },
            removeItem: (id) =>
                set({ items: get().items.filter((item) => item.id !== id) }),
            updateQuantity: (id, quantity) =>
                set({
                    items: get().items.map((item) =>
                        item.id === id ? { ...item, quantity } : item
                    ),
                }),
            clearCart: () => set({ items: [] }),
            total: () =>
                get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
        }),
        {
            name: "cart-storage",
        }
    )
);
