import { create } from "zustand";
import { Source } from "@/types/feed"; // Import the FeedItem type

interface SourcesStore {
	Sources: Source[]; // Store FeedItem objects instead of strings
	addSourceItem: (source: Source, userId: string | undefined) => void; // Accept a FeedItem object
	removeSourceItem: (source: Source) => boolean; // Check if an item is Sources by ID
	getSources: () => void;
	deleteSource: (itemId: string) => void; // Added userId parameter
}

export const useSourcesStore = create<SourcesStore>((set, get) => ({
	Sources: [], // Initial state: no Sources items

	// Add Sources item
	addSourceItem: async (source: Source, userId: string | undefined) => {
		set((state) => ({
			Sources: [...state.Sources, source],
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
	removeSourceItem: (source: Source) => {
		const isRemoved = get().Sources.filter((item) => item.url !== source.url);
		set({ Sources: isRemoved });
		return isRemoved.length !== get().Sources.length;
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

			set({ Sources: data.data });
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
				Sources: state.Sources.filter((item) => item.id != itemId),
			}));

			const data = await response.json();

			console.log("Deleted item respose", data);
		} catch (error) {
			console.error("Error deleting", error);
		}
	},
}));
