// __tests__/api/comments.test.ts
import { POST, GET } from "@/app/api/comments/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

// mock prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { update: jest.fn() },
    recognitionComment: { create: jest.fn(), findMany: jest.fn() },
    $transaction: <T>(fn: (tx: unknown) => T) => fn(prisma),
  },
}));

// mock auth
jest.mock("@/lib/auth", () => ({
  authOptions: {},
}));
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

const mockedGetServerSession = getServerSession as jest.Mock;

describe("POST /api/comments", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if not logged in", async () => {
    mockedGetServerSession.mockResolvedValueOnce(null);

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ recognitionId: "rec1", message: "hi" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("should create a comment without points", async () => {
    mockedGetServerSession.mockResolvedValueOnce({ user: { id: "sender1" } });
    (prisma.recognitionComment.create as jest.Mock).mockResolvedValueOnce({ id: "c1" });

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        recognitionId: "rec1",
        recipientId: "user2",
        message: "Nice job!",
        pointsBoosted: 0,
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ id: "c1" });
    expect(prisma.recognitionComment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          recognitionId: "rec1",
          senderId: "sender1",
          message: "Nice job!",
          pointsBoosted: 0,
        }),
      })
    );
  });

  it("should decrement sender and increment recipient when points are boosted", async () => {
    mockedGetServerSession.mockResolvedValueOnce({ user: { id: "sender1" } });

    (prisma.user.update as jest.Mock)
      .mockResolvedValueOnce({ id: "sender1", pointsBalance: 5 }) // sender update
      .mockResolvedValueOnce({ id: "user2", pointsBalance: 15 }); // recipient update
    (prisma.recognitionComment.create as jest.Mock).mockResolvedValueOnce({ id: "c2" });

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        recognitionId: "rec2",
        recipientId: "user2",
        message: "Boosted!",
        pointsBoosted: 5,
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ id: "c2" });
    expect(prisma.user.update).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: { id: "sender1" },
        data: { pointsBalance: { decrement: 5 } },
      })
    );
    expect(prisma.user.update).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: { id: "user2" },
        data: { pointsBalance: { increment: 5 } },
      })
    );
  });

  it("should return 400 if sender doesn’t have enough points", async () => {
    mockedGetServerSession.mockResolvedValueOnce({ user: { id: "sender1" } });

    (prisma.user.update as jest.Mock).mockResolvedValueOnce({ pointsBalance: -1 });

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        recognitionId: "rec3",
        recipientId: "user2",
        message: "oops",
        pointsBoosted: 10,
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toMatch(/Not enough points/);
  });

  it("should return 404 on P2025 error", async () => {
    mockedGetServerSession.mockResolvedValueOnce({ user: { id: "sender1" } });

    (prisma.user.update as jest.Mock).mockRejectedValueOnce({ code: "P2025", meta: { cause: "not found" } });

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        recognitionId: "rec4",
        recipientId: "missing",
        message: "uh oh",
        pointsBoosted: 5,
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toMatch(/Record not found/);
  });

  it("should return 500 on unexpected error", async () => {
    mockedGetServerSession.mockResolvedValueOnce({ user: { id: "sender1" } });
    (prisma.recognitionComment.create as jest.Mock).mockRejectedValueOnce(new Error("DB exploded"));

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        recognitionId: "rec5",
        recipientId: "user2",
        message: "broken",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});

describe("GET /api/comments", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if no recognitionId", async () => {
    const req = new Request("http://localhost/api/comments");
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("should return comments when recognitionId is provided", async () => {
    (prisma.recognitionComment.findMany as jest.Mock).mockResolvedValueOnce([
      { id: "c1", message: "Great work" },
    ]);

    const req = new Request("http://localhost/api/comments?recognitionId=rec1");
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual([{ id: "c1", message: "Great work" }]);
    expect(prisma.recognitionComment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { recognitionId: "rec1" },
      })
    );
  });
});
