import { create } from "zustand";
import { SourcesItem } from "@/types/feed"; // Import the FeedItem type

interface SourcesStore {
	SourcesItems: SourcesItem[]; // Store FeedItem objects instead of strings
	addSourceItem: (source: SourcesItem, userId: string | undefined) => void; // Accept a FeedItem object
	removeSourceItem: (source: SourcesItem) => boolean; // Check if an item is Sources by ID
	getSources: () => void;
	deleteSource: (itemId: string) => void; // Added userId parameter
}

export const useSourcesStore = create<SourcesStore>((set, get) => ({
	SourcesItems: [], // Initial state: no Sources items

	// Add Sources item
	addSourceItem: async (source: SourcesItem, userId: string | undefined) => {
		set((state) => ({
			SourcesItems: [...state.SourcesItems, source],
		}));
		console.log("POST", userId, source);
		try {
			const response = await fetch("/api/source", {
				method: "POST",
				body: JSON.stringify({ userId: userId, source: source }),
				headers: {
					"Content-Type": "application/json",
				},
			});

			const data = await response.json();
			console.log("Data", data);
		} catch (error) {
			console.error("Error saving item:", error);
		}
	},

	// Remove Sources item
	removeSourceItem: (source: SourcesItem) => {
		const isRemoved = get().SourcesItems.filter(
			(item) => item.url !== source.url,
		);
		set({ SourcesItems: isRemoved });
		return isRemoved.length !== get().SourcesItems.length;
	},

	getSources: async () => {
		try {
			const response = await fetch("/api/source", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			console.log(response);
			const data = await response.json();

			set({ SourcesItems: data.data });
		} catch (error) {
			console.error("Error", error);
		}
	},
	deleteSource: async (itemId: string) => {
		try {
			console.log("this is item id in the saved store file.", itemId);
			const response = await fetch("/api/source", {
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
				SourcesItems: state.SourcesItems.filter((item) => item.id != itemId),
			}));

			const data = await response.json();

			console.log("Deleted item respose", data);
		} catch (error) {
			console.error("Error deleting", error);
		}
	},
}));
