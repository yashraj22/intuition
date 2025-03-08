"use client";
import { useEffect } from 'react';
import Image from "next/image";
import { useSavedStore } from "@/store/useSavedStore";
import { Bookmark, Share } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from 'next-auth/react';

export default function SavedPost() {
    const { savedItems, toggleSavedItem, isItemSaved, fetchSavedPost } = useSavedStore();
    const { data: session } = useSession();
    const userId = session?.user?.id;

    useEffect(() => {
        if (userId) {
            console.log("Fetching saved posts for user:", userId);
            fetchSavedPost();
        }
    }, [userId, fetchSavedPost]);

    useEffect(() => {
        console.log("Current savedItems in store:", savedItems);
    }, [savedItems]);

    return (
        <div className="p-4 bg-black text-white min-h-screen">
            {savedItems.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-[calc(100vh-7rem)]">
                    <h1 className="text-gray-400 text-xl ">No Saved Posts here.</h1>
                    <Image
                        src="/emptypage.svg"
                        width={500}
                        height={500}
                        alt="nothing is here"
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {savedItems.map((savedItem) => { // renamed item to savedItem
                        const isSaved = isItemSaved(savedItem.feedItem.id); // Access feedItem.id
                        const item = savedItem.feedItem; // Access the feedItem object.

                        return (
                            <div
                                key={item.id}
                                className="relative w-full h-[400px] rounded-[10px] overflow-hidden shadow-lg"
                            >
                                <Image
                                    src={item.imageUrl || "/default-image.jpg"}
                                    alt={item.title}
                                    width={300}
                                    height={500}
                                    className={cn(
                                        "w-full h-full object-cover transition-opacity duration-500",
                                        "opacity-100"
                                    )}
                                    loading="lazy"
                                />
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/100 via-gray-700/90 to-transparent backdrop-blur-md rounded-b-3x rounded-b-[10px]">
                                    <h2 className="text-md font-semibold text-white mb-2 line-clamp-2">
                                        {item.title}
                                    </h2>
                                    <p className="text-white/80 text-xs mb-4 line-clamp-3">
                                        {item.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-white">
                                                {item.author?.charAt(0) || "A"}
                                            </div>
                                            <span className="text-white/80 text-xs">
                                                {item.author || "Anonymous"}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => toggleSavedItem(item, userId)}
                                                className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center"
                                            >
                                                <Bookmark
                                                    className={cn(
                                                        "w-4 h-4 transition-colors duration-300",
                                                        isSaved ? "fill-white text-white" : "text-white"
                                                    )}
                                                />
                                            </button>
                                            <button
                                                onClick={() => alert("Share functionality")}
                                                className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center"
                                            >
                                                <Share className="w-4 h-4 text-white" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}