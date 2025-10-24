"use client";

import { useState } from "react";
import { Gift, SquareArrowOutUpRight, X } from "lucide-react";

export default function RewardToolbox({
  links,
}: {
  links: { label: string; url: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Open button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        <Gift size={18} />
        Reward Toolbox
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          {/* Modal box */}
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative animate-fadeIn">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Gift size={20} className="text-blue-600" />
              Reward Toolbox
            </h2>

            {links.length > 0 ? (
              <ul className="space-y-2">
                {links.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-row items-center justify-between  border rounded-lg px-3 py-2 hover:bg-blue-50 hover:text-blue-600 transition "
                    >
                      {link.label}
                      <SquareArrowOutUpRight size={16} />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No links available.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
