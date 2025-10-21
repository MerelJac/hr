"use client";

import { useEffect, useState } from "react";
import { CircleQuestionMark } from "lucide-react";

export default function SupportButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    // If HubSpot embed script isn’t loaded yet, add it
    if (!document.querySelector("#hubspot-embed-script")) {
      const script = document.createElement("script");
      script.id = "hubspot-embed-script";
      script.src = "https://js.hsforms.net/forms/embed/v2.js";
      script.async = true;
      script.onload = () => {
        // @ts-expect-error hbspt is attached globally by HubSpot
        if (window.hbspt) {
          // @ts-expect-error hbspt is attached globally by HubSpot
          window.hbspt.forms.create({
            region: "na1",
            portalId: "43920404",
            formId: "90d24b56-af6f-4660-a8f1-f9fcf128217b",
            target: "#hs-support-form",
          });
        }
      };
      document.body.appendChild(script);
    } else {
      // If already loaded, just render the form again
      // @ts-expect-error hbspt is attached globally by HubSpot
      if (window.hbspt) {
        // @ts-expect-error hbspt is attached globally by HubSpot
        window.hbspt.forms.create({
          region: "na1",
          portalId: "43920404",
          formId: "90d24b56-af6f-4660-a8f1-f9fcf128217b",
          target: "#hs-support-form",
        });
      }
    }
  }, [open]);

  return (
    <>
      {/* Floating Support Button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Contact Support"
      >
        <CircleQuestionMark size={24} />
      </button>

      {/* Modal Overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl relative w-[90%] max-w-lg max-h-screen overflow-y-auto">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-4">Contact Support</h2>
            <div id="hs-support-form"></div>
          </div>
        </div>
      )}
    </>
  ); 
}
