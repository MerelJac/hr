// __tests__/api/recognition.test.ts
import { POST } from "@/app/api/recognitions/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { getAvailablePoints } from "@/lib/recognition";

// mock prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findMany: jest.fn(), update: jest.fn() },
    recognition: { create: jest.fn() },
    recognitionRecipient: { createMany: jest.fn() },
    $transaction: <T>(fn: (tx: unknown) => T) => fn(prisma),
  },
}));

// mock auth + points
jest.mock("@/lib/auth", () => ({ authOptions: {} }));
jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));
jest.mock("@/lib/recognition", () => ({
  getAvailablePoints: jest.fn(),
}));

const mockedGetServerSession = getServerSession as jest.Mock;
const mockedGetAvailablePoints = getAvailablePoints as jest.Mock;

describe("POST /api/recognition", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if not logged in", async () => {
    mockedGetServerSession.mockResolvedValueOnce(null);

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ message: "hi", recipients: [] }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("should return 400 if payload is invalid", async () => {
    mockedGetServerSession.mockResolvedValueOnce({ user: { id: "sender1" } });

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ message: "", recipients: [] }), // invalid: empty + no recipients
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toMatch(/Invalid payload/);
  });

  it("should return 400 if sender tries to award themselves", async () => {
    mockedGetServerSession.mockResolvedValueOnce({ user: { id: "sender1" } });

    const body = {
      message: "Nice job",
      recipients: [{ userId: "sender1", points: 10 }],
    };

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toMatch(/Cannot send points to yourself/);
  });

  it("should return 400 if recipient does not exist", async () => {
    mockedGetServerSession.mockResolvedValueOnce({ user: { id: "sender1" } });
    (prisma.user.findMany as jest.Mock).mockResolvedValueOnce([]); // no match

    const body = {
      message: "Nice job",
      recipients: [{ userId: "u999", points: 10 }],
    };

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toMatch(/One or more recipients do not exist/);
  });

  it("should return 400 if insufficient points", async () => {
    mockedGetServerSession.mockResolvedValueOnce({ user: { id: "sender1" } });
    (prisma.user.findMany as jest.Mock).mockResolvedValueOnce([{ id: "u2" }]);
    mockedGetAvailablePoints.mockResolvedValueOnce(5);

    const body = {
      message: "Great work",
      recipients: [{ userId: "u2", points: 10 }],
    };

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toMatch(/Insufficient points/);
    expect(json.available).toBe(5);
  });

  it("should create recognition and recipients if valid", async () => {
    mockedGetServerSession.mockResolvedValueOnce({ user: { id: "sender1" } });
    (prisma.user.findMany as jest.Mock).mockResolvedValueOnce([{ id: "u2" }]);
    mockedGetAvailablePoints.mockResolvedValueOnce(100);

    (prisma.recognition.create as jest.Mock).mockResolvedValueOnce({ id: "rec1" });
    (prisma.recognitionRecipient.createMany as jest.Mock).mockResolvedValueOnce({});
    (prisma.user.update as jest.Mock).mockResolvedValue({}); // recipients updated

    const body = {
      message: "Awesome job",
      recipients: [{ userId: "u2", points: 10 }],
    };

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.id).toBe("rec1");

    expect(prisma.recognition.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: { senderId: "sender1", message: "Awesome job" } })
    );
    expect(prisma.recognitionRecipient.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [{ recognitionId: "rec1", recipientId: "u2", points: 10 }],
      })
    );
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "u2" },
        data: { pointsBalance: { increment: 10 } },
      })
    );
  });
});
