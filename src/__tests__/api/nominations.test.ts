// __tests__/api/nominations.test.ts
import { POST } from "@/app/api/nominations/route";
import { prisma } from "@/lib/prisma";
import { EOM_SUBMIT_POINTS } from "@/lib/nomination-constants";
import { getServerSession } from "next-auth";

// mock prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    nomination: { findFirst: jest.fn(), create: jest.fn() },
    user: { findUnique: jest.fn(), update: jest.fn() },
    $transaction: (fn: any) => fn(prisma),
  },
}));

// mock auth
jest.mock("@/lib/auth", () => ({
  authOptions: {},
}));
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));


const mockedGetServerSession = jest.mocked(getServerSession);
describe("POST /api/nominations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if not logged in", async () => {
    mockedGetServerSession.mockResolvedValueOnce(null);

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ type: "EOM", nomineeId: "u1", reason: "Great work" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("should return 400 for invalid type", async () => {
    mockedGetServerSession.mockResolvedValueOnce({ user: { id: "submitter1" } });

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ type: "WRONGTYPE" }),
    });

    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toMatch(/Invalid type/);
  });

  it("should return 409 if already submitted this month", async () => {
    mockedGetServerSession.mockResolvedValueOnce({ user: { id: "submitter1" } });
    (prisma.nomination.findFirst as jest.Mock).mockResolvedValueOnce({ id: "existing" });

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ type: "EOM", nomineeId: "u1" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(409);
  });

  it("should return 400 if no nomineeId for EOM", async () => {
    mockedGetServerSession.mockResolvedValueOnce({ user: { id: "submitter1" } });
    (prisma.nomination.findFirst as jest.Mock).mockResolvedValueOnce(null);

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ type: "EOM" }),
    });

    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toMatch(/Nominee required/);
  });

  it("should return 400 if nominee not found", async () => {
    mockedGetServerSession.mockResolvedValueOnce({ user: { id: "submitter1" } });
    (prisma.nomination.findFirst as jest.Mock).mockResolvedValueOnce(null);
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ type: "EOM", nomineeId: "missingId" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should create EOM nomination and increment points", async () => {
    mockedGetServerSession.mockResolvedValueOnce({ user: { id: "submitter1" } });
    (prisma.nomination.findFirst as jest.Mock).mockResolvedValueOnce(null);
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({ id: "u1" });
    (prisma.nomination.create as jest.Mock).mockResolvedValueOnce({ id: "nom1" });
    (prisma.user.update as jest.Mock).mockResolvedValueOnce({ id: "submitter1", pointsBalance: 10 });

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ type: "EOM", nomineeId: "u1", reason: "Great job" }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);

    expect(prisma.nomination.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: "EOM",
          submitterId: "submitter1",
          nomineeId: "u1",
          reason: "Great job",
        }),
      })
    );

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "submitter1" },
        data: { pointsBalance: { increment: EOM_SUBMIT_POINTS } },
      })
    );
  });

  it("should return 409 on unique constraint error", async () => {
    mockedGetServerSession.mockResolvedValueOnce({ user: { id: "submitter1" } });
    (prisma.nomination.findFirst as jest.Mock).mockRejectedValueOnce({ code: "P2002" });

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ type: "EOM", nomineeId: "u1" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(409);
  });

  it("should return 500 on unexpected error", async () => {
    mockedGetServerSession.mockResolvedValueOnce({ user: { id: "submitter1" } });
    (prisma.nomination.findFirst as jest.Mock).mockRejectedValueOnce(new Error("DB exploded"));

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ type: "EOM", nomineeId: "u1" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});
