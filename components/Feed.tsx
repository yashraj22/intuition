"use client";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { FeedItem, RssFeed } from "../types/feed";
import FeedCard from "./FeedCard";
import { Settings2, Plus, Bookmark } from "lucide-react";
import Modal from "react-modal";
import Link from "next/link";

if (typeof window !== "undefined") {
    Modal.setAppElement("body");
}

const Feed = () => {
    const [items, setItems] = useState<FeedItem[]>([]);
    const [activeCategory, setActiveCategory] = useState("Top Stories");
    const feedRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true); // Initial loading state for initial DB fetch
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newFeedUrl, setNewFeedUrl] = useState("");
    const [isUpdatingFeed, setIsUpdatingFeed] = useState(false); // Separate loading state for background updates



    useEffect(() => {
        const fetchInitialFeed = async () => {
            setLoading(true); // Start loading for initial database fetch

            try {
                const response = await fetch("/api/get-feed");
                if (!response.ok) {
                    throw new Error("Failed to fetch initial feed items from database");
                }
                const data = await response.json();
                setItems(data.data);
            } catch (error) {
                console.error("Error fetching initial feed items from database:", error);
                toast.error("Failed to load initial feed data.");
            } finally {
                setLoading(false); // End loading after initial DB fetch attempt
            }
        };

        fetchInitialFeed();
    }, []);



    const categories = ["Top Stories", "Tech & Science", "Finance", "Art"];


    const initialSources: RssFeed[] = [
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
        setIsUpdatingFeed(true); // Start updating state for background RSS fetch
        const corsProxy = "https://api.allorigins.win/raw?url=";
        const newItems: FeedItem[] = [];

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

                    let imageUrl =
                        item.querySelector("enclosure")?.getAttribute("url") ||
                        item.querySelector("media\\:content")?.getAttribute("url");

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

                    if (!imageUrl) {
                        imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
                            title
                        )}`;
                    }

                    newItems.push({
                        id: Date.now().toString() + Math.random(), // Temporary ID, ideally DB generated
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

        // Save only NEW fetched items to the database
        if (newItems.length > 0) {
            try {
                const saveResponse = await fetch("/api/save-feed", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newItems), // Send all potentially new items
                });

                if (!saveResponse.ok) {
                    throw new Error("Failed to save new feed items to the database");
                }

                const saveResult = await saveResponse.json();
                console.log("New feed items saved to database:", saveResult);
                return saveResult.data; // Assuming your backend returns the newly saved items
            } catch (error) {
                console.error("Error saving new feed items to database:", error);
                toast.error("Error updating feed with new articles."); // User feedback for update failure
            }
        }
        return []; // Return empty array if no new items were processed/saved
    };


    useEffect(() => {
        const performPeriodicFeedUpdate = async () => { // Renamed function to English
            const storedSources = JSON.parse(localStorage.getItem("sources") || "[]");
            const feedsToFetch = storedSources.length > 0 ? storedSources : initialSources;
            if (!loading) { // Only start background update if initial load is done
                const newlyFetchedItems = await fetchRssFeedItems(feedsToFetch); // Fetch and save new items
                if (newlyFetchedItems && newlyFetchedItems.length > 0) {
                    // Assuming backend returns saved new items
                    setItems(prevItems => [...prevItems, ...newlyFetchedItems]); // Append new items to current items
                    toast.success(`${newlyFetchedItems.length} new articles added!`);
                } else {
                    console.log("No new articles found during feed update.");
                    // Optionally provide feedback that feed is up-to-date: toast.info("Feed is up-to-date.");
                }
                setIsUpdatingFeed(false); // End updating state after background update attempt
            }
        };

        performPeriodicFeedUpdate(); // Immediately call on mount after initial load

        const intervalId = setInterval(performPeriodicFeedUpdate, 120000); // Update every 2 minutes (120000 ms)

        return () => clearInterval(intervalId); // Clear interval on component unmount
    }, [loading]); // Depend on loading to start background update AFTER initial load


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
                    url: item.url, // Share article URL now
                });
            } else {
                throw new Error("Share API not supported");
            }
        } catch (error) {
            console.log(error);
            toast.error("Failed to share");
        }
    };


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
            id: Date.now().toString() + Math.random(),
            name: "Custom Feed",
            url: newFeedUrl,
        };

        localStorage.setItem(
            "sources",
            JSON.stringify([...sources, newSource])
        );
        toast.success("Feed added successfully. Refreshing feeds...");

        setItems([]); // Clear existing items to force refresh
        fetchRssFeedItems([...sources, newSource]);
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
                {loading && ( // Initial page loading indicator
                    <div className="w-full h-[100dvh] flex items-center justify-center">
                        <div className="animate-float flex gap-4 items-center">
                            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-white items-center justify-center">
                              
                            </p>
                        </div>
                    </div>
                )}



                {/* {isUpdatingFeed && !loading && ( // Updating indicator, not shown during initial load
                    <div className="fixed top-24 right-4 z-50 bg-black/70 backdrop-blur-md text-white p-3 rounded-md text-sm">
                        Updating feed in background...
                    </div>
                )} */}


                {items &&
                    items.map((item, index) => (
                        <FeedCard
                            key={`${item.id}-${index}`}
                            item={item}
                            onSave={handleSave}
                            onShare={handleShare}
                        />
                    ))}
                {!loading && items.length === 0 && !isUpdatingFeed && ( // Show message if no items after initial load and no update in progress
                    <div className="w-full h-[100dvh] flex items-center justify-center text-white/60">
                        <p>No feed items available. Add RSS feeds to get started.</p>
                    </div>
                )}
            </div>



            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeRSSModal}
                style={{
                    content: {
                        backgroundColor: "#111",
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
                        backgroundColor: "rgba(0, 0, 0, 0.75)",
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