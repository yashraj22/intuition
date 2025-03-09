import { create } from "zustand";
import { SavedItem } from "@/types/feed"; // Import the FeedItem type

interface SavedStore {
	savedItems: SavedItem[]; // Store FeedItem objects instead of strings
	toggleSavedItem: (item: SavedItem, userId: string | undefined) => void; // Accept a FeedItem object
	isItemSaved: (id: string) => boolean; // Check if an item is saved by ID
	fetchSavedPost: () => void;
    deleteSavedPost: (itemId: string) => void; // Added userId parameter
}

export const useSavedStore = create<SavedStore>((set, get) => ({
	savedItems: [], // Initial state: no saved items

	// Toggle saved item
	toggleSavedItem: async (item: SavedItem, userId: string | undefined) => {

			

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
				await fetch("/api/saved", {
					method: "POST",
					body: JSON.stringify({ userId: userId, feedItemID: item.id }),
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

	deleteSavedPost: async ( itemId : string ) => {
		try{
	
			console.log("this is item id in the saved store file.", itemId);
			const response = await fetch("/api/saved", {
				method :"DELETE",
				headers : {
					"Content-Type" : "application/json",
				},
				body : JSON.stringify ({itemId: itemId}),
			})
	
			if(!response.ok){
				throw new Error(`HTTP ERROR ${response.status}`)
			}
	
			set((state) => ({
				savedItems: state.savedItems.filter((item) => item.id != itemId),
			}));
	
			const data = await response.json();
	
			console.log("Deleted item respose", data);
		}
		catch(error){
			console.error("Error deleting",error);
		}
	},






	// Check if an item is saved
	isItemSaved: (id) => {
		return get().savedItems.some((item) => item.id === id);
	  },
}));
