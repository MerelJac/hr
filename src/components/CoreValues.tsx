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
    def: "Do the right thing always. No matter the circumstance or time. Don't just take the easy route. It may take longer, it may take more effort and more time but we will do the right thing always.",
  },
  {
    id: "service",
    label: "#SelflessService",
    def: "We put the welfare of the organization and our work family first. A selfless person is larger than just one person. The basic building block of selfless service is the commitment of each team member to go a little further, endure a little longer, and look a little closer to see how they can add to the effort.",
  },
  {
    id: "problem",
    label: "#ProactivePositiveProblemSolving",
    def: "We strive to come at every problem with a positive mind and open heart and as many solutions as possible. Pointing out a problem without a solution is whining. We look at every problem as an opportunity — to learn, teach, bond, and grow.",
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
    <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-0.5">Our Mission</p>
        <p className="text-lg font-semibold text-gray-800">Call One Values</p>
      </div>

      <div className="space-y-2">
        {values.map((v) => {
          const isOpen = open === v.id;
          return (
            <div
              key={v.id}
              onClick={() => toggle(v.id)}
              className={`rounded-xl border cursor-pointer transition-all duration-200 overflow-hidden
                ${isOpen
                  ? "border-indigo-200 bg-indigo-50"
                  : "border-gray-100 bg-gray-50 hover:border-indigo-100 hover:bg-indigo-50/40"
                }`}
            >
              <div className="flex items-center gap-2 px-3 py-2.5 overflow-x-auto">
                <span className={`text-sm font-semibold transition-colors duration-200 flex-1
                  ${isOpen ? "text-indigo-600" : "text-gray-700"}`}>
                  {v.label}
                </span>
                <ChevronDown
                  size={15}
                  className={`shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-indigo-400" : "text-gray-300"
                  }`}
                />
              </div>

              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-3 pb-3 text-xs leading-relaxed text-gray-500">
                    {v.def}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}