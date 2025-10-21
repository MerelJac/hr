"use client";

import Image from "next/image";

import { useEffect, useState } from "react";

type GiphyImage = {
  url: string;
};

type GiphyGif = {
  id: string;
  images: {
    fixed_height_small: GiphyImage;
    original: GiphyImage;
  };
};

export default function GifPicker({
  onSelect,
}: {
  onSelect: (url: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<GiphyGif[]>([]);

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
    <div className="space-y-2 border rounded p-3 bg-gray-50 flex flex-col justify-end items-end">
      <div className="flex gap-2 items-center w-full">
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
      <a href="https://giphy.com" target="_blank" rel="noopener noreferrer">
        <Image
          src={"/powered-gify.png"}
          alt="Powered by Gify"
          width={64}
          height={64}
          className="flex justify-end w-fit h-6"
        />
      </a>
    </div>
  );
}
