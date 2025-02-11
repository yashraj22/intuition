export interface FeedItem {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    saved: boolean;
    author?: string;
  }
  
  export interface RssFeed {
    id: string;
    url: string;
    name: string;
  }
  