"use client";
import { useState, useTransition } from "react";
import Image from "next/image";
import { ArrowRight, Megaphone, Trash, Trophy, Users, RefreshCw, Sparkles } from "lucide-react";
import UserInsightsModal from "@/components/UserInsightsModal";
import AnnounceWinnersForm from "@/components/AnnounceWinnersForm";
import Link from "next/link";
import { formatDateLocal } from "@/lib/formatDate";

type ChallengeDetailProps = {
  challenge: {
    id: string;
    title: string;
    description?: string | null;
    qualification?: string | null;
    points: number;
    isActive: boolean;
    startDate: string | Date;
    endDate: string | Date;
    gifUrl: string | null;
    allowMultipleWinners?: boolean;
    hideStatusFromSubmitter?: boolean;
    nominations: {
      id: string;
      status: string;
      reason?: string;
      screenshot?: string;
      createdAt: string | Date;
      submitter?: { id: string; firstName?: string | null; lastName?: string | null; email?: string | null } | null;
      nominee?: { id: string; firstName?: string | null; lastName?: string | null; email?: string | null } | null;
    }[];
  };
  relatedRecognitions: {
    id: string;
    message: string;
    createdAt: Date;
    recipients: {
      recipient: { id: string; firstName?: string | null; lastName?: string | null; email?: string | null };
      points: number;
    }[];
  }[];
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    APPROVED: "bg-green-50 border-green-100 text-green-600",
    WON: "bg-green-50 border-green-100 text-green-600",
    REJECTED: "bg-red-50 border-red-100 text-red-500",
    SKIPPED: "bg-gray-100 border-gray-200 text-gray-400",
    PENDING: "bg-yellow-50 border-yellow-100 text-yellow-600",
  };
  const labels: Record<string, string> = { WON: "Winner", SKIPPED: "Skipped", APPROVED: "Approved", REJECTED: "Rejected", PENDING: "Pending" };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-lg border ${map[status] ?? "bg-gray-100 border-gray-200 text-gray-400"}`}>
      {labels[status] ?? status}
    </span>
  );
}

export default function ChallengeDetailClient({ challenge, relatedRecognitions }: ChallengeDetailProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [openAnnounceModal, setOpenAnnounceModal] = useState(false);

  async function updateStatus(id: string, status: "APPROVED" | "REJECTED" | "WON" | "SKIPPED") {
    const res = await fetch(`/api/nominations/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) { alert("Failed to update status"); return; }
    startTransition(() => window.location.reload());
  }

  async function resendChallengeEmail() {
    if (!confirm("Resend challenge email to all employees?")) return;
    const res = await fetch(`/api/challenges/${challenge.id}/resend-email`, { method: "POST" });
    if (!res.ok) { alert("Failed to resend challenge email"); return; }
    alert("Challenge email resent!");
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this submission? This cannot be undone.")) return;
    const res = await fetch(`/api/nominations/${id}`, { method: "DELETE" });
    if (!res.ok) { alert("Failed to delete submission"); return; }
    window.location.reload();
  }

  const pendingCount = challenge.nominations.filter((n) => n.status === "PENDING").length;

  return (
    <div className="space-y-5">

      {/* Overview card */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-2 flex-1 min-w-0">
            <p className="text-sm text-gray-600 leading-relaxed">{challenge.description}</p>

            {challenge.qualification && (
              <p className="text-xs text-gray-400 italic">{challenge.qualification}</p>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-lg border ${
                challenge.isActive ? "bg-green-50 border-green-100 text-green-600" : "bg-gray-100 border-gray-200 text-gray-400"
              }`}>
                {challenge.isActive ? "Active" : "Inactive"}
              </span>
              <span className="text-xs text-gray-400">
                {formatDateLocal(challenge.startDate)} – {formatDateLocal(challenge.endDate)}
              </span>
              <span className="flex items-center gap-1 text-xs font-medium text-yellow-600">
                ⭐ {challenge.points} pts
              </span>
              {challenge.allowMultipleWinners && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-lg border bg-indigo-50 border-indigo-100 text-indigo-500">
                  Multiple winners
                </span>
              )}
              {challenge.hideStatusFromSubmitter && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-lg border bg-gray-50 border-gray-200 text-gray-400">
                  Status hidden
                </span>
              )}
            </div>
          </div>

          {challenge.gifUrl && (
            <Image
              src={challenge.gifUrl}
              alt="Challenge GIF"
              width={120}
              height={120}
              unoptimized
              className="rounded-xl max-h-28 w-auto shrink-0"
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-100">
          <button
            onClick={resendChallengeEmail}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-500 hover:text-indigo-600 border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50 rounded-xl transition-all"
          >
            <RefreshCw size={12} />
            Resend Email Notification
          </button>

          {challenge.allowMultipleWinners && (
            <button
              onClick={() => setOpenAnnounceModal(!openAnnounceModal)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl transition-all"
            >
              <Megaphone size={12} />
              Announce Winners
            </button>
          )}
        </div>
      </div>

      {/* Announce winners form */}
      {openAnnounceModal && (
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
          <AnnounceWinnersForm
            users={Array.from(
              new Map(
                challenge.nominations
                  .filter((n) => n.nominee)
                  .map((n) => [
                    n.nominee!.id,
                    { id: n.nominee!.id || "", email: n.nominee!.email || "", firstName: n.nominee!.firstName || "", lastName: n.nominee!.lastName || "" },
                  ]),
              ).values(),
            )}
            challengeId={challenge.id}
            points={challenge.points}
          />
        </div>
      )}

      {/* Submissions */}
      <section className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Users size={15} className="text-indigo-400" />
            <h2 className="text-sm font-semibold text-gray-700">Submissions</h2>
            {pendingCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold">
                {pendingCount}
              </span>
            )}
          </div>
        </div>

        {challenge.nominations.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Users size={18} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-400">No submissions yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {challenge.nominations.map((n) => (
              <li key={n.id} className="px-5 py-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-800">
                        {n.submitter?.firstName} {n.submitter?.lastName}
                      </p>
                      <span className="text-xs text-gray-400">{n.submitter?.email}</span>
                      <button
                        onClick={() => setSelectedUserId(n.id)}
                        className="p-1 rounded-md text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all"
                        title="View insights"
                      >
                        <Sparkles size={13} />
                      </button>
                    </div>

                    {n.nominee && (
                      <p className="text-xs text-gray-500">
                        <span className="font-medium text-gray-600">Nominee:</span>{" "}
                        {n.nominee.firstName} {n.nominee.lastName} · {n.nominee.email}
                      </p>
                    )}

                    {n.reason && (
                      <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 mt-1">
                        {n.reason}
                      </p>
                    )}

                    {n.screenshot && (
                      <Image src={n.screenshot} alt="Screenshot" width={80} height={80} priority className="rounded-lg border border-gray-100 mt-1" />
                    )}

                    <p className="text-xs text-gray-400">{formatDateLocal(n.createdAt)}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {n.status !== "PENDING" && <StatusBadge status={n.status} />}
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                      title="Delete"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </div>

                {/* Actions for pending */}
                {n.status === "PENDING" && (
                  <div className="flex flex-wrap gap-2">
                    {!challenge.allowMultipleWinners && (
                      <>
                        <button
                          onClick={() => updateStatus(n.id, "APPROVED")}
                          disabled={isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white rounded-lg transition-all disabled:opacity-50"
                        >
                          ✓ Approve (+{challenge.points} pts)
                        </button>
                        <button
                          onClick={() => updateStatus(n.id, "REJECTED")}
                          disabled={isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {challenge.allowMultipleWinners && (
                      <>
                        <button
                          onClick={() => updateStatus(n.id, "WON")}
                          disabled={isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white rounded-lg transition-all disabled:opacity-50"
                        >
                          🎉 Mark as Winner
                        </button>
                        <button
                          onClick={() => updateStatus(n.id, "SKIPPED")}
                          disabled={isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-lg transition-all disabled:opacity-50"
                        >
                          Skip
                        </button>
                      </>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Winner Announcements */}
      {challenge.allowMultipleWinners && (
        <section className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <Trophy size={15} className="text-yellow-400" />
            <h2 className="text-sm font-semibold text-gray-700">Winner Announcements</h2>
          </div>

          {relatedRecognitions.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Trophy size={18} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-400">No announcements yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {relatedRecognitions.map((r) => (
                <li key={r.id} className="px-5 py-4 space-y-2">
                  <p className="text-sm text-gray-700 leading-relaxed">{r.message}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {r.recipients.map((rec) => (
                      <span key={rec.recipient.id} className="flex items-center gap-1 text-xs bg-yellow-50 border border-yellow-100 text-yellow-700 px-2 py-0.5 rounded-lg">
                        🏆 {rec.recipient.firstName} {rec.recipient.lastName} · {rec.points} pts
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-gray-400">{formatDateLocal(r.createdAt)}</span>
                    <Link
                      href={`/feed/appreciation/${r.id}`}
                      className="flex items-center gap-1 text-xs font-medium text-indigo-500 hover:text-indigo-700 transition-colors"
                    >
                      View Announcement <ArrowRight size={11} />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* User insights modal */}
      {selectedUserId && (
        <UserInsightsModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
    </div>
  );
}