// __tests__/api/nominations.test.ts
import { POST } from "@/app/api/nominations/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

// mock prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    nomination: { findFirst: jest.fn(), create: jest.fn() },
    nominationChallenge: { findUnique: jest.fn() },
    user: { findUnique: jest.fn(), update: jest.fn() },
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

beforeEach(() => {
  jest.clearAllMocks();
  // default challenge for most tests
  (prisma.nominationChallenge.findUnique as jest.Mock).mockResolvedValue({
    id: "chal1",
    isActive: true,
    startDate: new Date("2000-01-01"),
    endDate: new Date("2100-01-01"),
    requirements: {},
  });
});

describe("POST /api/nominations", () => {
  it("should return 401 if not logged in", async () => {
    mockedGetServerSession.mockResolvedValueOnce(null);

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        challengeId: "chal1",
        nomineeId: "u1",
        reason: "Great work",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("should return 404 if challenge not found", async () => {
    mockedGetServerSession.mockResolvedValueOnce({ user: { id: "submitter1" } });
    (prisma.nominationChallenge.findUnique as jest.Mock).mockResolvedValueOnce(null);

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ challengeId: "bad-id" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it("should return 400 if challenge not active", async () => {
    mockedGetServerSession.mockResolvedValueOnce({ user: { id: "submitter1" } });
    (prisma.nominationChallenge.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "chal1",
      isActive: false,
      startDate: new Date("2000-01-01"),
      endDate: new Date("2100-01-01"),
      requirements: {},
    });

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ challengeId: "chal1" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should return 409 if already submitted this month", async () => {
    mockedGetServerSession.mockResolvedValueOnce({ user: { id: "submitter1" } });
    (prisma.nomination.findFirst as jest.Mock).mockResolvedValueOnce({ id: "existing" });

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ challengeId: "chal1", nomineeId: "u1" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(409);
  });

  it("should return 400 if nominee required but missing", async () => {
    mockedGetServerSession.mockResolvedValueOnce({ user: { id: "submitter1" } });
    (prisma.nomination.findFirst as jest.Mock).mockResolvedValueOnce(null);
    (prisma.nominationChallenge.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "chal1",
      isActive: true,
      startDate: new Date("2000-01-01"),
      endDate: new Date("2100-01-01"),
      requirements: { requiresNominee: true },
    });

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ challengeId: "chal1" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should return 400 if reason required but missing", async () => {
    mockedGetServerSession.mockResolvedValueOnce({ user: { id: "submitter1" } });
    (prisma.nomination.findFirst as jest.Mock).mockResolvedValueOnce(null);
    (prisma.nominationChallenge.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "chal1",
      isActive: true,
      startDate: new Date("2000-01-01"),
      endDate: new Date("2100-01-01"),
      requirements: { requiresReason: true },
    });

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ challengeId: "chal1", nomineeId: "u1" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should create nomination when valid", async () => {
    mockedGetServerSession.mockResolvedValueOnce({ user: { id: "submitter1" } });
    (prisma.nomination.findFirst as jest.Mock).mockResolvedValueOnce(null);
    (prisma.nomination.create as jest.Mock).mockResolvedValueOnce({
      id: "nom1",
      challengeId: "chal1",
      submitterId: "submitter1",
      status: "PENDING",
    });

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        challengeId: "chal1",
        nomineeId: "u1",
        reason: "Great job",
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual(
      expect.objectContaining({
        id: "nom1",
        challengeId: "chal1",
        submitterId: "submitter1",
        status: "PENDING",
      })
    );
  });
});
