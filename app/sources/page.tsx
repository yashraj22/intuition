"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Source } from "../../types/feed";
import { Trash2, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";

const SourcesPage = () => {
  const [feeds, setFeeds] = useState<Source[]>([]);
  const [newFeedUrl, setNewFeedUrl] = useState("");
  const [newFeedName, setNewFeedName] = useState("");

  useEffect(() => {
    const storedFeeds = JSON.parse(localStorage.getItem("rssFeeds") || "[]");
    setFeeds(storedFeeds);
  }, []);

  const handleAddFeed = () => {
    if (!newFeedUrl || !newFeedName) {
      toast.error("Please enter both feed URL and name");
      return;
    }

    const newFeed = {
      id: Date.now().toString(),
      url: newFeedUrl,
      name: newFeedName,
    };

    const updatedFeeds = [...feeds, newFeed];
    localStorage.setItem("rssFeeds", JSON.stringify(updatedFeeds));
    setFeeds(updatedFeeds);
    setNewFeedUrl("");
    setNewFeedName("");
    toast.success("Feed added successfully");
  };

  const handleRemoveFeed = (id: string) => {
    const updatedFeeds = feeds.filter((feed) => feed.id !== id);
    localStorage.setItem("rssFeeds", JSON.stringify(updatedFeeds));
    setFeeds(updatedFeeds);
    toast.success("Feed removed successfully");
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/" className="mr-4">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold">Manage Sources</h1>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 mb-6">
          <h2 className="text-xl mb-4">Add New Source</h2>
          <div className="space-y-4">
            <input
              type="text"
              value={newFeedName}
              onChange={(e) => setNewFeedName(e.target.value)}
              placeholder="Feed Name"
              className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <input
              type="text"
              value={newFeedUrl}
              onChange={(e) => setNewFeedUrl(e.target.value)}
              placeholder="RSS Feed URL"
              className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button
              onClick={handleAddFeed}
              className="w-full bg-cyan-500 text-white px-4 py-2 rounded-md hover:bg-cyan-600 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Feed
            </button>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-4">
          <h2 className="text-xl mb-4">Current Sources</h2>
          <div className="space-y-3">
            {feeds.map((feed) => (
              <div
                key={feed.id}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-md"
              >
                <div>
                  <h3 className="font-medium">{feed.name}</h3>
                  <p className="text-sm text-gray-400">{feed.url}</p>
                </div>
                <button
                  onClick={() => handleRemoveFeed(feed.id)}
                  className="p-2 text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            {feeds.length === 0 && (
              <p className="text-gray-400 text-center py-4">
                No sources added yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SourcesPage;
