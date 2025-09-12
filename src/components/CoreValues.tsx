// src/components/CoreValues.tsx
"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

type CoreValue = {
  id: string;
  label: string;
  def: string;
};

const values: CoreValue[] = [
  {
    id: "light",
    label: "#BetheLight",
    def: "Be the light during dark times. Be positive, and be a beacon to our teams, our customers, our vendors, and our Call One/Hello Direct family.",
  },
  {
    id: "right",
    label: "#DotheRightThing",
    def: "Do the right thing always.  No matter the circumstance or time. Don't just take the easy route. It may take longer, it may take more effort and more time but we will do the right thing always.",
  },
  {
    id: "service",
    label: "#SelflessService",
    def: "We put the welfare of the organization and our work family first.  A selfless person is larger than just one person. The basic building block of selfless service is the commitment of each team member to go a little further, endure a little longer, and look a little closer to see how they can add to the effort.",
  },
  {
    id: "problem",
    label: "#ProactivePositiveProblemSolving",
    def: "We strive to come at every problem with a positive mind and open heart and as many solutions as possible. pointing out a problem without a solution is whining. We look at every problem as an opportunity. An opportunity to learn, teach, bond, and grow.",
  },
  {
    id: "evolution",
    label: "#EmbraceEvolution",
    def: "We will strive to be better every day. If we want something different, we must do something different. We must constantly look for ways to improve, learn new skills, become more efficient and to better the customer experience.",
  },
];

export default function CoreValues() {
  const [open, setOpen] = useState<string | null>(null);

  function toggle(id: string) {
    setOpen((prev) => (prev === id ? null : id));
  }

  return (
    <div className="coreValues space-y-2">
      <div className="headerSection mb-4">
        <p className="text-xl font-semibold">Call One Mission</p>
      </div>

      {values.map((v) => (
        <div
          key={v.id}
          className="coreFilterSection border-4 rounded-lg p-2 cursor-pointer min-w-xs max-w-xs"
          onClick={() => toggle(v.id)}
        >
          <div className="flex items-center">
            <p className="text-md font-medium break-words">{v.label}</p>
            <div className="flex-1" />
            <ChevronDown
              className={`w-5 h-5 transition-transform ${
                open === v.id ? "rotate-180" : ""
              }`}
            />
          </div>
          {open === v.id && (
            <div className="mt-2 text-sm text-gray-700">
              {/* You can drop in expanded details here */}
              {v.def || "Description for " + v.label}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
