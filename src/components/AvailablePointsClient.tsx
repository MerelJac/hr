// src/components/AvailablePointsClient.tsx
"use client";

import { MoveRight, X } from "lucide-react";
import { useState } from "react";
import BoostPointsModal from "./BoostPointsModal";

export default function AvailablePointsClient({
  available,
  toRedeemAvailable,
}: {
  available: number;
  toRedeemAvailable: number;
}) {
  const [modal, setModal] = useState(false);
  const boostPointsModal = () => {
    // put your modal logic here
    setModal(!modal);
    console.error("Boost points modal opened");
  };

  return (
    <div className="border-2 border-blue rounded-lg p-4 shadow-sm bg-white flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">{available}</h2>
        <p className="text-lg">Stars to Give</p>
        <br />
        <small
          className="cursor-pointer flex items-center gap-1 "
          onClick={boostPointsModal}
        >
          Boost Points to Give <MoveRight size={18} />
        </small>
      </div>
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative animate-fadeIn">
            {/* Close button */}
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
              onClick={() => setModal(false)}
              aria-label="Close modal"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold text-center mb-6">
              Boost Points
            </h2>

            {/* Your modal content */}
            <BoostPointsModal toRedeemAvailable={toRedeemAvailable} />

            <div className="mt-6 text-center">
              <button
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                onClick={() => setModal(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
