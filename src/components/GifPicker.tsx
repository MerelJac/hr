"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function GifPicker({
  onSelect,
}: {
  onSelect: (url: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
  if (open) {
    fetchTrending(); // 👈 auto load "funny" GIFs
  }
}, [open]);

async function fetchTrending() {
  const res = await fetch(
    `https://api.giphy.com/v1/gifs/trending?api_key=${process.env.NEXT_PUBLIC_GIPHY_API_KEY}&limit=8`
  );
  const json = await res.json();
  setResults(json.data || []);
}


  async function doSearch() {
    if (!search.trim()) return;
    const res = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${
        process.env.NEXT_PUBLIC_GIPHY_API_KEY
      }&q=${encodeURIComponent(search)}&limit=8`
    );
    const json = await res.json();
    setResults(json.data || []);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-blue text-white px-3 py-1 rounded"
      >
        GIF
      </button>
    );
  }

  return (
    <div className="space-y-2 border rounded p-3 bg-gray-50">
      <div className="flex gap-2 items-center">
        <input
          type="text"
          placeholder="Search GIFs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-2 py-1 flex-1"
        />
        <button
          type="button"
          onClick={doSearch}
          className="bg-blue text-white px-3 rounded"
        >
          Search
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-gray-600"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
        {results.map((r) => (
          <Image
            key={r.id}
            src={r.images.fixed_height_small.url}
            alt="gif"
            width={100}
            height={100}
            className="cursor-pointer rounded hover:opacity-80"
            onClick={() => {
              onSelect(r.images.original.url);
              setOpen(false);
              setSearch("");
              setResults([]);
            }}
          />
        ))}
      </div>
    </div>
  );
}
