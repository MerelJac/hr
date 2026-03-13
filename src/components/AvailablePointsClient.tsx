"use client";
import { ArrowRight, X, Zap } from "lucide-react";
import { useState } from "react";
import BoostPointsModal from "./BoostPointsModal";
import { useRouter } from "next/navigation";

export default function AvailablePointsClient({
  available,
  toRedeemAvailable,
}: {
  available: number;
  toRedeemAvailable: number;
}) {
  const [modal, setModal] = useState(false);
  const router = useRouter();

  const boostPointsModal = () => {
    setModal(!modal);
    console.log("Boost points modal opened");
  };

  const handleBoostComplete = async () => {
    setModal(false);
    router.refresh();
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
          <Zap size={18} className="text-indigo-400 fill-indigo-300" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">To Give</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-gray-800 leading-tight">{available}</span>
            <span className="text-sm text-gray-400 font-medium">stars</span>
          </div>
        </div>
      </div>

      <button
        onClick={boostPointsModal}
        className="flex items-center gap-1.5 text-xs font-semibold text-indigo-500 hover:text-indigo-700 border border-indigo-200 hover:border-indigo-400 bg-indigo-50 hover:bg-indigo-100 rounded-xl px-3 py-2 transition-all shrink-0"
      >
        Boost
        <ArrowRight size={13} />
      </button>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">Points</p>
                <h2 className="text-base font-semibold text-gray-800 leading-tight">Boost Points</h2>
              </div>
              <button
                className="p-1.5 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-all"
                onClick={() => setModal(false)}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <BoostPointsModal
                toRedeemAvailable={toRedeemAvailable}
                onBoostComplete={handleBoostComplete}
              />
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
              <button
                className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl transition-all"
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