"use client";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { FeedItem, Source } from "../types/feed";
import FeedCard from "./FeedCard";
import { Settings2, Plus, Bookmark } from "lucide-react";
import Modal from "react-modal";
import Link from "next/link";
import SignIn from "@/components/sign-in";
import { useSession } from "next-auth/react";
import SignOut from "./sign-out";
import { useFeedStore } from "@/store/useFeedStore";
import { useSavedStore } from "@/store/useSavedStore";
import { fetchRssItems } from "@/lib/actions";

if (typeof window !== "undefined") {
	Modal.setAppElement("body");
}

const Feed = () => {
	const [items, setItems] = useState<FeedItem[]>([]);
	const [activeCategory, setActiveCategory] = useState("Top Stories");
	const feedRef = useRef<HTMLDivElement>(null);
	// const [loading, setLoading] = useState(true); // Initial loading state for initial DB fetch
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [newFeedUrl, setNewFeedUrl] = useState("");
	const [newFeedName, setNewFeedName] = useState("");
	const [isUpdatingFeed, setIsUpdatingFeed] = useState(false); // Separate loading state for background updates
	const { status, data: session } = useSession();
	const { feedItems, loading, fetchFeedItems, saveFeed } = useFeedStore();
	const { fetchSavedPost } = useSavedStore();

	useEffect(() => {
		// if (session?.user?.id) {
		// 	const userId = session.user.id;
		// 	console.log("Fetching saved posts for user:", userId);
		// 	fetchSavedPost();
		// }
		fetchSavedPost();
		fetchFeedItems();
	}, []);

	useEffect(() => {
		const storedSources = JSON.parse(localStorage.getItem("sources") || "[]");
		if (storedSources.length === 0) {
			localStorage.setItem("sources", JSON.stringify(initialSources));
		}
	}, []);

	const categories = ["Top Stories", "Tech & Science", "Finance", "Art"];

	const initialSources: Source[] = [
		{ url: "https://techcrunch.com/feed/", name: "TechCrunch" },
		{
			url: "https://www.theverge.com/rss/index.xml",
			name: "The Verge",
		},
		{
			url: "https://www.nasa.gov/rss/dyn/breaking_news.rss",
			name: "NASA News",
		},
	];

	const fetchSources = async (sources: Source[]) => {
		if (isUpdatingFeed) return; // Prevent concurrent updates
		setIsUpdatingFeed(true);
		const newItems: FeedItem[] = [];

		for (const source of sources) {
			if (source.url.match(/(feed|rss|\.xml|atom)/i)) {
				const fetchedItems = await fetchRssItems(source);
				newItems.push(...fetchedItems);
			}
		}

		// Save only NEW fetched items to the database
		updateFeed(newItems);

		setIsUpdatingFeed(false);
		return [];
	};

	const updateFeed = async (newItems: FeedItem[]) => {
		try {
			const saveResult = await saveFeed(newItems);
			console.log("New source items saved to database:", saveResult);

			// Update state with only the newly saved items
			if (saveResult.data && saveResult.data.length > 0) {
				setItems((prevItems) => {
					// Create a Set of existing IDs for O(1) lookup
					const existingIds = new Set(prevItems.map((item) => item.id));

					// Only add items that don't already exist in the current state
					const uniqueNewItems: FeedItem[] = saveResult.data.filter(
						(item: FeedItem) => !existingIds.has(item.id),
					);

					if (uniqueNewItems.length > 0) {
						toast.success(`${uniqueNewItems.length} new articles added!`);
					}

					return [...prevItems, ...uniqueNewItems];
				});
			}
		} catch (error) {
			console.error("Error saving new source items to database:", error);
			toast.error("Error updating source with new articles.");
		}
	};

	useEffect(() => {
		const performPeriodicFeedUpdate = async () => {
			const storedSources = JSON.parse(localStorage.getItem("sources") || "[]");
			const feedsToFetch =
				storedSources.length > 0 ? storedSources : initialSources;

			if (!loading) {
				await fetchSources(feedsToFetch);
			}
		};

		// Initial fetch when component mounts
		performPeriodicFeedUpdate();

		// Set up interval with a longer delay (e.g., 30 minutes = 1800000ms)
		const intervalId = setInterval(performPeriodicFeedUpdate, 1800000);

		return () => clearInterval(intervalId);
	}, [loading]);

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

	const handleAddFeed = async () => {
		const sources: Source[] = JSON.parse(
			localStorage.getItem("sources") || "[]",
		);
		const newSource = {
			// id: (sources.length + 1).toString(),
			name: newFeedName,
			url: newFeedUrl,
		};

		if (
			newFeedUrl.match(
				/^https?:\/\/www\.youtube\.com\/(@|channel\/UC[\w-]{21}|[\w@-]+)(?:\?app=desktop)?$/,
			)
		) {
			const corsProxy = "https://api.allorigins.win/raw?url=";
			const response = await fetch(corsProxy + encodeURIComponent(newFeedUrl));
			const data = await response.text();
			const parser = new DOMParser();
			const xml = parser.parseFromString(data, "text/html");
			const rssUrl = xml
				.querySelector('link[type="application/rss+xml"]')
				?.getAttribute("href");
			if (rssUrl) {
				newSource.url = rssUrl;
			}
		}

		localStorage.setItem("sources", JSON.stringify([...sources, newSource]));
		toast.success("Feed added successfully. Refreshing feeds...");

		setItems([]); // Clear existing items to force refresh
		// fetchSources([...sources, newSource]);
		closeRSSModal();
	};

	return (
		<div className="bg-black min-h-screen w-[100vw]">
			<header className="fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-black/90 backdrop-blur-lg">
				<div className="flex items-center justify-between mb-4">
					<h1 className="text-3xl font-bold text-white">Discover</h1>
					<div className="flex gap-3">
						<button
							className="w-7 h-7 rounded-full bg-cyan-500 flex items-center justify-center mt-[4%]"
							onClick={openRSSModal}>
							<Plus className="w-5 h-5 text-white " />
						</button>
						<button className="text-white">
							<Link href="/saved">
								<Bookmark className="w-6 h-6" />
							</Link>
						</button>
						<button className="text-white relative">
							<Link
								href="/sources"
								className="text-white">
								<Settings2 className="w-6 h-6" />
							</Link>
						</button>
						{status === "authenticated" ? <SignOut /> : <SignIn />}
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
							}`}>
							{category}
						</button>
					))}
				</div>
			</header>

			<div
				ref={feedRef}
				className="h-[100dvh] overflow-y-auto snap-y snap-mandatory overscroll-y-contain pt-28">
				{loading && ( // Initial page loading indicator
					<div className="w-full h-[100dvh] flex items-center justify-center">
						<div className="animate-float flex gap-4 items-center">
							<div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
							<p className="text-white items-center justify-center"></p>
						</div>
					</div>
				)}

				{/* {isUpdatingFeed && !loading && ( // Updating indicator, not shown during initial load
                    <div className="fixed top-24 right-4 z-50 bg-black/70 backdrop-blur-md text-white p-3 rounded-md text-sm">
                        Updating source in background...
                    </div>
                )} */}

				{feedItems &&
					feedItems.map((item, index) => (
						<FeedCard
							key={`${item.id}-${index}`}
							item={item}
							onShare={handleShare}
						/>
					))}
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
				}}>
				<h2 className="text-xl font-bold mb-4">Add RSS Feed</h2>
				<input
					type="text"
					value={newFeedUrl}
					onChange={(e) => setNewFeedUrl(e.target.value)}
					placeholder="Enter RSS Feed URL"
					className="w-full px-3 py-2 border rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-2"
				/>
				<input
					type="text"
					value={newFeedName}
					onChange={(e) => setNewFeedName(e.target.value)}
					placeholder="Enter RSS Feed Name"
					className="w-full px-3 py-2 border rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
				/>
				<div className="mt-5 flex-col items-center justify-center">
					<div className="mt-4 mb-4 flex justify-center">
						<button
							onClick={handleAddFeed}
							className="bg-cyan-500 text-white px-4 py-2 rounded-md mr-2 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500">
							Add
						</button>
						<select style={{ color: "black" }}>
							<option>Blog</option>
							<option>Youtube</option>
							<option>Podcast</option>
						</select>
					</div>
					<button
						onClick={closeRSSModal}
						className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500">
						Cancel
					</button>
				</div>
			</Modal>
		</div>
	);
};

export default Feed;
