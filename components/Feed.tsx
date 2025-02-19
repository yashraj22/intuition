"use client";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
// import { mockFeedItems } from "../data/mockFeed";
import { FeedItem, RssFeed } from "../types/feed";
import FeedCard from "./FeedCard";
import { Settings2, Plus, Bookmark } from "lucide-react";
// import { useRouter } from "next/navigation";
import Modal from "react-modal";
import Link from "next/link";

//some function
if (typeof window !== "undefined") {
  Modal.setAppElement("body"); // Or another appropriate element
}

const Feed = () => {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("Top Stories");
  const feedRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFeedUrl, setNewFeedUrl] = useState("");

  const categories = ["Top Stories", "Tech & Science", "Finance", "Art"];

  const initialSources: RssFeed[] = [
    // Initial popular tech feeds
    { id: "1", url: "https://techcrunch.com/feed/", name: "TechCrunch" },
    {
      id: "2",
      url: "https://www.theverge.com/rss/index.xml",
      name: "The Verge",
    },
    {
      id: "3",
      url: "https://www.nasa.gov/rss/dyn/breaking_news.rss",
      name: "NASA News",
    },
  ];

  const parseHtmlContent = (html: string): string => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const fetchRssFeedItems = async (feeds: RssFeed[]) => {
    const corsProxy = "https://api.allorigins.win/raw?url=";
    const newItems: FeedItem[] = [];
    const storedFeed = JSON.parse(localStorage.getItem("Feed") || "[]"); // Add fallback empty array string

    for (const feed of feeds) {
      try {
        const response = await fetch(corsProxy + encodeURIComponent(feed.url));
        if (!response.ok) {
          throw new Error(
            `Failed to fetch ${feed.url}: ${response.status} ${response.statusText}`
          );
        }
        const data = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(data, "text/xml");

        const items = xml.querySelectorAll("item");
        for (const item of items) {
          const title = item.querySelector("title")?.textContent || "";
          const description = parseHtmlContent(
            item.querySelector("description")?.textContent || ""
          );
          const articleUrl = item.querySelector("link")?.textContent || "";

          if (title === storedFeed[0]?.title) {
            setItems(storedFeed);
            setLoading(false);
            return;
          }

          // Try to get image from RSS feed first
          let imageUrl =
            item.querySelector("enclosure")?.getAttribute("url") ||
            item.querySelector("media\\:content")?.getAttribute("url");

          // If no image in RSS, try to get it from article metadata
          if (!imageUrl && articleUrl) {
            try {
              const articleResponse = await fetch(
                corsProxy + encodeURIComponent(articleUrl)
              );
              const articleHtml = await articleResponse.text();
              const articleDoc = parser.parseFromString(
                articleHtml,
                "text/html"
              );

              // Try various meta tags for images
              imageUrl =
                articleDoc
                  .querySelector('meta[property="og:image"]')
                  ?.getAttribute("content") ||
                articleDoc
                  .querySelector('meta[name="twitter:image"]')
                  ?.getAttribute("content") ||
                articleDoc
                  .querySelector('meta[property="twitter:image"]')
                  ?.getAttribute("content") ||
                articleDoc
                  .querySelector('link[rel="image_src"]')
                  ?.getAttribute("href");
            } catch (error) {
              console.error("Error fetching article metadata:", error);
            }
          }

          // Fallback to AI-generated image if no image found
          if (!imageUrl) {
            imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
              title
            )}`;
          }

          newItems.push({
            id: Date.now().toString() + Math.random(),
            title,
            description,
            imageUrl,
            saved: false,
            author: item.querySelector("author")?.textContent || feed.name,
            url: articleUrl,
          });
        }
      } catch (error) {
        console.error("Error fetching RSS feed:", error);
        toast.error(`Failed to fetch feed: ${feed.url}`);
      }
    }
    setItems(newItems);
    localStorage.setItem("Feed", JSON.stringify([...newItems]));
    setLoading(false);
  };

  useEffect(() => {
    const storedSources = JSON.parse(localStorage.getItem("sources") || "[]"); // Add fallback empty array string
    const feedsToFetch =
      storedSources.length > 0 ? storedSources : initialSources; // Use stored or initial
    fetchRssFeedItems(feedsToFetch);
  }, []); // Empty dependency array ensures this runs only once on mount

  const loadMoreItems = async () => {
    if (loading) return;

    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newItems: FeedItem[] = [...initialSources].map((item) => ({
      id: `${parseInt(item.id) + items.length}`,
      title: item.name, // Assuming you want to use the name as the title
      description: "", // Provide a default description or modify as needed
      imageUrl: null, // Provide a default image URL or modify as needed
      saved: false,
      author: "", // Provide a default author or modify as needed
      url: item.url,
    }));

    setItems((prev) => [...prev, ...newItems]);
    setLoading(false);
  };

  const handleScroll = () => {
    if (!feedRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = feedRef.current;
    const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;

    if (scrollPercentage > 80) {
      loadMoreItems();
    }
  };

  useEffect(() => {
    const feedElement = feedRef.current;
    if (feedElement) {
      feedElement.addEventListener("scroll", handleScroll);
      return () => feedElement.removeEventListener("scroll", handleScroll);
    }
  }, [items.length]);

  const handleSave = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, saved: !item.saved } : item
      )
    );
    toast.success("Item saved successfully");
  };

  const handleShare = async (id: string) => {
    if (typeof window === "undefined") return;

    const item = items.find((i) => i.id === id);
    if (!item) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: item.title,
          text: item.description,
          url: window.location.href,
        });
      } else {
        throw new Error("Share API not supported");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to share");
    }
  };

  // functions for modal handling

  const openRSSModal = () => {
    setIsModalOpen(true);
  };

  const closeRSSModal = () => {
    setIsModalOpen(false);
    setNewFeedUrl("");
  };

  const handleAddFeed = () => {
    const sources: RssFeed[] = JSON.parse(
      localStorage.getItem("sources") || "[]"
    );
    const newSource = {
      id: Date.now().toString() + Math.random(), // Add a unique ID to each feed
      name: "Custom Feed",
      url: newFeedUrl,
    };

    localStorage.setItem(
      "sources",
      JSON.stringify([...initialSources, ...sources, newSource])
    );
    toast.success("Feed added successfully. Refreshing feeds...");

    setItems([]);
    fetchRssFeedItems([...sources, newSource]); // Pass the updated feeds array
    closeRSSModal();
  };

  return (
    <div className="bg-black min-h-screen w-[100vw]">
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-black/90 backdrop-blur-lg">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-white">Discover</h1>
          <div className="flex gap-4">
            <button
              className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center"
              onClick={openRSSModal}
            >
              <Plus className="w-5 h-5 text-white" />
            </button>

            {/* late night, commit, adding a button only */}
            <button className="text-white">
              <Link href="/saved">
                <Bookmark className="w-6 h-6" />
              </Link>
            </button>

            <button className="text-white relative">
              <Link href="/sources" className="text-white">
                <Settings2 className="w-6 h-6" />
              </Link>
            </button>
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                activeCategory === category
                  ? "bg-cyan-500 text-white"
                  : "bg-white/10 text-white/80"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </header>

      <div
        ref={feedRef}
        className="h-[100dvh] overflow-y-auto snap-y snap-mandatory overscroll-y-contain pt-28"
      >
        {loading && (
          <div className="w-full h-[100dvh] flex items-center justify-center">
            <div className="animate-float flex gap-4 items-center">
              <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-white items-center justify-center">
                Please wait till we fetch some content.
              </p>
            </div>
          </div>
        )}
        {items &&
          items.map((item, index) => (
            <FeedCard
              key={`${item.id}-${index}`}
              item={item}
              onSave={handleSave}
              onShare={handleShare}
            />
          ))}
      </div>

      {/* Modal */}

      {/* The Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeRSSModal}
        style={{
          content: {
            backgroundColor: "#111", // Example dark background
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "20px",
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.75)", // Semi-transparent overlay
          },
        }}
      >
        <h2 className="text-xl font-bold mb-4">Add RSS Feed</h2>
        <input
          type="text"
          value={newFeedUrl}
          onChange={(e) => setNewFeedUrl(e.target.value)}
          placeholder="Enter RSS Feed URL"
          className="w-full px-3 py-2 border rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleAddFeed}
            className="bg-cyan-500 text-white px-4 py-2 rounded-md mr-2 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            Add
          </button>
          <button
            onClick={closeRSSModal}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Feed;
