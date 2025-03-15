import { create } from "zustand";
import { SavedItem, FeedItem } from "@/types/feed"; // Import the FeedItem type

interface SavedStore {
	savedItems: SavedItem[]; // Store FeedItem objects instead of strings
	toggleSavedItem: (item: FeedItem, userId: string | undefined) => void; // Accept a FeedItem object
	isItemSaved: (id: string) => boolean; // Check if an item is saved by ID
	fetchSavedPost: () => void;
	deleteSavedPost: (itemId: string) => void; // Added userId parameter
}

export const useSavedStore = create<SavedStore>((set, get) => ({
	savedItems: [], // Initial state: no saved items

	// Toggle saved item
	toggleSavedItem: async (item: FeedItem, userId: string | undefined) => {
		const isSaved = get().savedItems.some((savedItem) => {
			return savedItem.feedItem.id === item.id;
		});

		const savedItemId = get().savedItems.find(
			(savedItem) => savedItem.feedItem.id === item.id,
		)?.id;

		if (isSaved) {
			get().deleteSavedPost(savedItemId as string);
			set({
				savedItems: get().savedItems.filter(
					(savedItem) => savedItem.id !== item.id,
				),
			});
		} else {
			try {
				const response = await fetch("/api/saved", {
					method: "POST",
					body: JSON.stringify({ userId: userId, feedItemID: item.id }),
					headers: {
						"Content-Type": "application/json",
					},
				});

				const data = await response.json();

				const savedItem = {
					...data.data,
					// id: item.id, // This will need to be updated with the ID from the API response
					feedItem: item,
				};
				set({ savedItems: [...get().savedItems, savedItem] });
			} catch (error) {
				console.error("Error saving item:", error);
			}
		}
	},

	fetchSavedPost: async () => {
		try {
			const response = await fetch("/api/saved", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			const data = await response.json();

			set({ savedItems: data.data });
		} catch (error) {
			console.error("Error", error);
		}
	},

	deleteSavedPost: async (itemId: string) => {
		try {
			const response = await fetch("/api/saved", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ itemId: itemId }),
			});

			if (!response.ok) {
				throw new Error(`HTTP ERROR ${response.status}`);
			}

			set((state) => ({
				savedItems: state.savedItems.filter((item) => item.id != itemId),
			}));
		} catch (error) {
			console.error("Error deleting", error);
		}
	},

	// Check if an item is saved
	isItemSaved: (id) => {
		return get().savedItems.some((item) => item.feedItem?.id === id);
	},
}));
