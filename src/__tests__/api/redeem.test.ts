// __tests__/api/redeem.test.ts
import { POST } from "@/app/api/redeem/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

// mock prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: jest.fn(), update: jest.fn() },
    rewardCatalog: { findFirst: jest.fn() },
    redemption: { create: jest.fn() },
    $transaction: <T>(fn: (tx: unknown) => T) => fn(prisma),
  },
}));

// mock auth
jest.mock("@/lib/auth", () => ({ authOptions: {} }));
jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));

const mockedGetServerSession = getServerSession as jest.Mock;

describe("POST /api/redeem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if not logged in", async () => {
    mockedGetServerSession.mockResolvedValueOnce(null);

    const req = new Request("http://localhost/api/redeem", {
      method: "POST",
      body: JSON.stringify({  amount: 20 }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("should return 400 if required fields missing", async () => {
    mockedGetServerSession.mockResolvedValueOnce({ user: { id: "u1" } });

    const req = new Request("http://localhost/api/redeem", {
      method: "POST",
      body: JSON.stringify({ type: "AMAZON" }), // amount missing
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/Missing fields/);
  });

  it("should return 400 if amount is <10 or not multiple of 5", async () => {
    mockedGetServerSession.mockResolvedValueOnce({ user: { id: "u1" } });

    const req = new Request("http://localhost/api/redeem", {
      method: "POST",
      body: JSON.stringify({ type: "AMAZON", amount: 7 }), // invalid
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/Minimum \$10, increments of \$5/);
  });

  it("should return 400 if user does not have enough points", async () => {
    mockedGetServerSession.mockResolvedValueOnce({ user: { id: "u1" } });
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "u1",
      pointsBalance: 50,
    });

    const req = new Request("http://localhost/api/redeem", {
      method: "POST",
      body: JSON.stringify({ type: "AMAZON", amount: 20 }), // requires 200 pts
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/Not enough points/);
  });

  it("should return 400 if no catalog found", async () => {
    mockedGetServerSession.mockResolvedValueOnce({ user: { id: "u1" } });
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "u1",
      pointsBalance: 1000,
      email: "me@test.com",
    });
    (prisma.rewardCatalog.findFirst as jest.Mock).mockResolvedValueOnce(null);

    const req = new Request("http://localhost/api/redeem", {
      method: "POST",
      body: JSON.stringify({ type: "AMAZON", amount: 20 }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/No catalog template found/);
  });

  it("should create redemption if valid", async () => {
    mockedGetServerSession.mockResolvedValueOnce({ user: { id: "u1" } });
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "u1",
      pointsBalance: 1000,
      email: "me@test.com",
    });
    (prisma.rewardCatalog.findFirst as jest.Mock).mockResolvedValueOnce({
      id: "cat1",
    });
    (prisma.redemption.create as jest.Mock).mockResolvedValueOnce({
      id: "red1",
      status: "PENDING",
    });

    const req = new Request("http://localhost/api/redeem", {
      method: "POST",
      body: JSON.stringify({ type: "AMAZON", amount: 20, idemKey: "abc123" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.redemption).toEqual({ id: "red1", status: "PENDING" });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { pointsBalance: { decrement: 200 } },
    });
    expect(prisma.redemption.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "u1",
          catalogId: "cat1",
          type: "AMAZON",
          valueCents: 2000,
          pointsSpent: 200,
          idemKey: "abc123",
          status: "PENDING",
        }),
      })
    );
  });
});
