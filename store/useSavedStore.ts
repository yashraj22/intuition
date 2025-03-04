import { create } from "zustand";
import { SavedItem } from "@/types/feed"; // Import the FeedItem type
import {auth  } from "@/auth";

interface SavedStore {
	savedItems: SavedItem[]; // Store FeedItem objects instead of strings
	toggleSavedItem: (item: SavedItem) => void; // Accept a FeedItem object
	isItemSaved: (id: string) => boolean; // Check if an item is saved by ID
}

export const useSavedStore = create<SavedStore>((set, get) =>
	({
		savedItems: [], // Initial state: no saved items

		// Toggle saved item
		toggleSavedItem: async (item: SavedItem) => {
			const isSaved = get().savedItems.some(
				(savedItem) => savedItem.id === item.id,
			);
      
			
			if (isSaved) {
				set({
					savedItems: get().savedItems.filter(
						(savedItem) => savedItem.id !== item.id,
					),
				});
			} else {
				try {
          const session = await auth();
					await fetch("/api/save-post", {
						method: "POST",
						body: JSON.stringify({ userId: session?.user?.id, feedItemID: item.id }),
						headers: {
							"Content-Type": "application/json",
						},
					});
					set({ savedItems: [...get().savedItems, item] });
				} catch (error) {
					console.error("Error saving item:", error);
				}
			}
		},

		// Check if an item is saved
		isItemSaved: (id) => {
			return get().savedItems.some((item) => item.id === id);
		},
	}),
);
