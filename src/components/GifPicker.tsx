"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

type GiphyImage = { url: string };
type GiphyGif = {
  id: string;
  images: {
    fixed_height_small: GiphyImage;
    original: GiphyImage;
  };
};

export default function GifPicker({ onSelect }: { onSelect: (url: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<GiphyGif[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) fetchTrending();
  }, [open]);

  async function fetchTrending() {
    setLoading(true);
    const res = await fetch(
      `https://api.giphy.com/v1/gifs/trending?api_key=${process.env.NEXT_PUBLIC_GIPHY_API_KEY}&limit=12`
    );
    const json = await res.json();
    setResults(json.data || []);
    setLoading(false);
  }

  async function doSearch() {
    if (!search.trim()) return;
    setLoading(true);
    const res = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${process.env.NEXT_PUBLIC_GIPHY_API_KEY}&q=${encodeURIComponent(search)}&limit=12`
    );
    const json = await res.json();
    setResults(json.data || []);
    setLoading(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs font-semibold text-indigo-500 hover:text-indigo-700 border border-indigo-200 hover:border-indigo-400 bg-indigo-50 hover:bg-indigo-100 rounded-lg px-2.5 py-1.5 transition-all"
      >
        <span>GIF</span>
      </button>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden mt-2">
      {/* Search bar */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100">
        <Search size={14} className="text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Search GIFs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && doSearch()}
          className="flex-1 text-sm text-gray-700 placeholder:text-gray-300 bg-transparent focus:outline-none"
          autoFocus
        />
        {search && (
          <button
            type="button"
            onClick={() => { setSearch(""); fetchTrending(); }}
            className="text-gray-300 hover:text-gray-500 transition"
          >
            <X size={13} />
          </button>
        )}
        <button
          type="button"
          onClick={doSearch}
          className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 border border-indigo-200 hover:border-indigo-400 bg-indigo-50 hover:bg-indigo-100 rounded-lg px-2.5 py-1 transition-all"
        >
          Search
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setSearch(""); setResults([]); }}
          className="p-1 rounded-md text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-all"
        >
          <X size={14} />
        </button>
      </div>

      {/* Grid */}
      <div className="p-2 max-h-52 overflow-y-auto">
        {loading ? (
          <div className="grid grid-cols-4 gap-1.5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-4 gap-1.5">
            {results.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  onSelect(r.images.original.url);
                  setOpen(false);
                  setSearch("");
                  setResults([]);
                }}
                className="relative aspect-square overflow-hidden rounded-lg hover:ring-2 hover:ring-indigo-400 transition-all group"
              >
                <Image
                  src={r.images.fixed_height_small.url}
                  alt="gif"
                  fill
                  unoptimized
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </button>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-gray-400 py-6">No results found</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end px-3 py-2 border-t border-gray-100 bg-gray-50">
        <a href="https://giphy.com" target="_blank" rel="noopener noreferrer">
          <Image
            src="/powered-gify.png"
            alt="Powered by Giphy"
            width={64}
            height={16}
            className="h-4 w-auto opacity-60 hover:opacity-100 transition"
          />
        </a>
      </div>
    </div>
  );
}