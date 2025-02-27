import { create } from "zustand";
import { FeedItem } from "@/types/feed"; // Import the FeedItem type

interface SavedStore {
  savedItems: FeedItem[]; // Store FeedItem objects instead of strings
  toggleSavedItem: (item: FeedItem) => void; // Accept a FeedItem object
  isItemSaved: (id: string) => boolean; // Check if an item is saved by ID
}

export const useSavedStore = create<SavedStore>((set, get) => ({
  savedItems: [], // Initial state: no saved items

  // Toggle saved item
  toggleSavedItem: (item) => {
    set((state) => {
      const isSaved = state.savedItems.some((savedItem) => savedItem.id === item.id);
      if (isSaved) {
        // Remove the item if it's already saved
        return { savedItems: state.savedItems.filter((savedItem) => savedItem.id !== item.id) };
      } else {
        // Add the item if it's not saved
        return { savedItems: [...state.savedItems, item] };
      }
    });
  },

  // Check if an item is saved
  isItemSaved: (id) => {
    return get().savedItems.some((item) => item.id === id);
  },
}));