import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Watch } from "./useCartStore";

// Reusing Watch interface from Cart for simplicity

interface WishlistState {
    items: Watch[];
    addItem: (watch: Watch) => void;
    removeItem: (id: string) => void;
    isInWishlist: (id: string) => boolean;
    setItems: (items: Watch[]) => void;
}

export const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (watch) => {
                const currentItems = get().items;
                if (!currentItems.find(i => i.id === watch.id)) {
                    set({ items: [...currentItems, watch] });
                }
            },
            removeItem: (id) =>
                set({ items: get().items.filter((item) => item.id !== id) }),
            isInWishlist: (id) => !!get().items.find(item => item.id === id),
            setItems: (items) => set({ items }),
        }),
        {
            name: "wishlist-storage",
        }
    )
);
