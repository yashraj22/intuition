"use client";
import Image from "next/image";
import { useSavedStore } from "@/store/useSavedStore";
import { FeedItem } from "@/types/feed";
import { Bookmark, Share } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SavedPost() {
  const { savedItems, toggleSavedItem, isItemSaved } = useSavedStore();

  return (
    <div className="p-4">
      {savedItems.length === 0 ? (
        <p className="text-center text-gray-500">No saved posts yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {savedItems.map((item: FeedItem) => {
            const isSaved = isItemSaved(item.id); // Check if the item is saved

            return (
              <div
                key={item.id}
                className="relative w-full h-[400px] rounded-[10px] overflow-hidden shadow-lg"
              >
                {/* Image */}
                <Image
                  src={item.imageUrl || "/default-image.jpg"}
                  alt={item.title}
                  width={300}
                  height={500}
                  className={cn(
                    "w-full h-full object-cover transition-opacity duration-500",
                    "opacity-100" // Assuming the image is already loaded
                  )}
                  loading="lazy"
                />

                {/* Content overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/100 via-gray-700/90 to-transparent backdrop-blur-md rounded-b-3x rounded-b-[10px]">
                  <h2 className="text-md font-semibold text-white mb-2 line-clamp-2">
                    {item.title}
                  </h2>
                  <p className="text-white/80 text-xs mb-4 line-clamp-3">
                    {item.description}
                  </p>

                  {/* Author and actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-white">
                        {item.author?.charAt(0) || "A"}
                      </div>
                      <span className="text-white/80 text-xs">
                        {item.author || "Anonymous"}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleSavedItem(item)}
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
                        onClick={() => alert("Share functionality")} // Replace with your share logic
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