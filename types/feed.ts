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
  id: string; // Add id property
  url: string;
  name: string;
}
