import { create } from "zustand";
import { FeedItem } from "@prisma/client";
import { useSavedStore } from "./useSavedStore";

interface FeedStore {
	feedItems: FeedItem[]; // Feed items from API
	loading: boolean;
	error: string | null;
	fetchFeedItems: () => Promise<void>;
	toggleSaveItem: (item: FeedItem, userId: string | undefined) => void;
	// isItemSaved: (id: string) => boolean;
}

export const useFeedStore = create<FeedStore>((set, get) => ({
	feedItems: [],
	loading: false,
	error: null,

	fetchFeedItems: async () => {
		set({ loading: true, error: null });
		try {
			const response = await fetch("/api/get-feed", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error(`Failed to fetch feed items: ${response.status}`);
			}

			const data = await response.json();
			set({ feedItems: data.data, loading: false });
		} catch (error) {
			console.error("Error fetching feed items:", error);
			set({
				error:
					error instanceof Error ? error.message : "Failed to fetch feed items",
				loading: false,
			});
		}
	},

	// Use the saved store for bookmark functionality
	toggleSaveItem: (item: FeedItem, userId: string | undefined) => {
		// Need to use proper type for your savedStore - adapt as needed
		useSavedStore.getState().toggleSavedItem(item, userId);
	},

	// isItemSaved: (id: string) => {
	// 	// This will only give you a snapshot of the current state
	// 	// console.log(
	// 	// 	"isItemSaved called with id:",
	// 	// 	get().feedItems.map((item) => (item.id === id ? item : null)),
	// 	// 	useSavedStore.getState().isItemSaved(id),
	// 	// );
	// 	return useSavedStore.getState().isItemSaved(id);
	// },
}));
