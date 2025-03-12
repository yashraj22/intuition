// types/feed.ts
export interface FeedItem {
  id: string;
  title: string;
  description: string; // Make sure description is always a string
  imageUrl: string | null; // Make sure imageUrl is always a string
  url: string; // Add url property
  saved: boolean;
  author: string;
}

export interface Source {
  id?: string; // Add id property
  url: string;
  name: string;
}

export interface SavedItem {

  id: string;
  title: string;
  description: string; // Make sure description is always a string
  imageUrl: string | null; // Make sure imageUrl is always a string
  url: string; // Add url property
  saved: boolean;
  author: string;

}



//type for the save item, it will be exactly the same as the FeedItem, this is 
/// for distinguish the FeedItem from the saved item

// Interface for saved items, extending FeedItem to distinguish from regular feed items
// export type SavedItem = FeedItem