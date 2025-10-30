/**
 * Tests for /api/comments route
 */

import { POST, GET } from "@/app/api/comments/route";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

// ✅ Mock Prisma inside the factory so prismaMock is scoped correctly
jest.mock("@/lib/prisma", () => {
  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    recognitionComment: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  return {
    prisma: {
      ...prismaMock,
      $transaction: async <T>(fn: (tx: typeof prismaMock) => T) =>
        fn(prismaMock),
    },
  };
});

// ✅ Mock handleApiError to keep test output simple
jest.mock("@/lib/handleApiError", () => ({
  handleApiError: (e: any) =>
    new Response(JSON.stringify({ error: e.message || "error" }), {
      status: e.status || 500,
    }),
}));

// ✅ Mock auth
jest.mock("@/lib/auth", () => ({
  authOptions: {},
}));
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

// Get mocks after jest.mock() runs
const mockedGetServerSession = getServerSession as jest.Mock;
const { prisma } = jest.requireMock("@/lib/prisma");

// ------------------------------
// TESTS
// ------------------------------
describe("POST /api/comments", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.user.findUnique.mockReset();
    prisma.user.update.mockReset();
    prisma.recognitionComment.create.mockReset();
  });

  it("returns 401 if not logged in", async () => {
    mockedGetServerSession.mockResolvedValueOnce(null);

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ recognitionId: "rec1", message: "hi" }),
    });

    const res = await POST(req as unknown as NextRequest);
    expect(res.status).toBe(401);
  });

  it("creates a comment without points", async () => {
    mockedGetServerSession.mockResolvedValueOnce({ user: { id: "u1" } });
    prisma.user.findUnique.mockResolvedValueOnce({ monthlyBudget: 10 });
    prisma.recognitionComment.create.mockResolvedValueOnce({ id: "c1" });

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        recognitionId: "rec1",
        recipientId: "u2",
        message: "Nice job!",
        pointsBoosted: 0,
      }),
    });

    const res = await POST(req as unknown as NextRequest);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ id: "c1" });
    expect(prisma.recognitionComment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          recognitionId: "rec1",
          senderId: "u1",
          message: "Nice job!",
          pointsBoosted: 0,
        }),
      })
    );
  });

  it("returns 400 if sender doesn’t have enough points", async () => {
    mockedGetServerSession.mockResolvedValueOnce({ user: { id: "u1" } });
    prisma.user.findUnique.mockResolvedValueOnce({ monthlyBudget: 5 }); // less than 10
    prisma.recognitionComment.create.mockResolvedValueOnce({ id: "c_fail" });

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        recognitionId: "rec3",
        recipientId: "u2",
        message: "oops",
        pointsBoosted: 10,
      }),
    });

    const res = await POST(req as unknown as NextRequest);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toMatch(/Not enough points/);
  });

  it("decrements sender and increments recipient when points are boosted", async () => {
    mockedGetServerSession.mockResolvedValueOnce({ user: { id: "u1" } });

    prisma.user.findUnique.mockResolvedValueOnce({ monthlyBudget: 20 });
    prisma.user.update
      .mockResolvedValueOnce({ id: "u1", monthlyBudget: 15 })
      .mockResolvedValueOnce({ id: "u2", pointsBalance: 10 });

    // ✅ make sure this test defines its own create result
    prisma.recognitionComment.create.mockResolvedValueOnce({ id: "c2" });

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        recognitionId: "rec2",
        recipientId: "u2",
        message: "Boosted!",
        pointsBoosted: 5,
      }),
    });

    const res = await POST(req as unknown as NextRequest);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ id: "c2" });

    expect(prisma.user.update).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: { id: "u1" },
        data: { monthlyBudget: { decrement: 5 } },
      })
    );
    expect(prisma.user.update).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: { id: "u2" },
        data: { pointsBalance: { increment: 5 } },
      })
    );
  });
});

describe("GET /api/comments", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 if no recognitionId", async () => {
    const req = new Request("http://localhost/api/comments");
    const res = await GET(req as unknown as NextRequest);
    expect(res.status).toBe(400);
  });

  it("returns comments when recognitionId is provided", async () => {
    prisma.recognitionComment.findMany.mockResolvedValueOnce([
      { id: "c1", message: "Good job" },
    ]);

    const req = new Request("http://localhost/api/comments?recognitionId=rec1");
    const res = await GET(req as unknown as NextRequest);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual([{ id: "c1", message: "Good job" }]);
  });
});
