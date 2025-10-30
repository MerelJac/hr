import { POST, DELETE } from "@/app/api/invites/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

// mock prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    userInvite: {
      findFirst: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    },
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

describe("POST /api/invites", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 403 if not SUPER_ADMIN", async () => {
    mockedGetServerSession.mockResolvedValueOnce({
      user: { role: "EMPLOYEE" },
    });

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com", role: "ADMIN" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("should return 400 if email is missing", async () => {
    mockedGetServerSession.mockResolvedValueOnce({
      user: { id: "1", role: "SUPER_ADMIN" },
    });

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ role: "ADMIN" }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toMatch(/Email required/);
  });

  it("should create or refresh invite when SUPER_ADMIN", async () => {
    mockedGetServerSession.mockResolvedValueOnce({
      user: { id: "super1", role: "SUPER_ADMIN" },
    });
    (prisma.userInvite.upsert as jest.Mock).mockResolvedValueOnce({
      id: "inv1",
      email: "test@example.com",
      role: "ADMIN", // ✅ simple string only
      createdAt: "2025-10-30", // ✅ no Date() instances
    });

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com", role: "ADMIN" }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ id: "inv1", email: "test@example.com" });

    expect(prisma.userInvite.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: "test@example.com" },
        create: expect.objectContaining({
          email: "test@example.com",
          role: "ADMIN",
          createdById: "super1",
        }),
        update: expect.objectContaining({
          role: "ADMIN",
          consumedAt: null,
        }),
      })
    );
  });
});

describe("DELETE /api/invites", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 403 if not SUPER_ADMIN", async () => {
    mockedGetServerSession.mockResolvedValueOnce({
      user: { role: "EMPLOYEE" },
    });

    const req = new Request(
      "http://localhost/api/invites?email=test@example.com",
      {
        method: "DELETE",
      }
    );

    const res = await DELETE(req);
    expect(res.status).toBe(403);
  });

  it("should return 400 if email is missing", async () => {
    mockedGetServerSession.mockResolvedValueOnce({
      user: { role: "SUPER_ADMIN" },
    });

    const req = new Request("http://localhost/api/invites", {
      method: "DELETE",
    });

    const res = await DELETE(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toMatch(/Email required/);
  });

  it("should delete invite if SUPER_ADMIN and email is provided", async () => {
    mockedGetServerSession.mockResolvedValueOnce({
      user: { role: "SUPER_ADMIN" },
    });

    // ✅ mock findFirst so delete() actually gets triggered
    (prisma.userInvite.findFirst as jest.Mock).mockResolvedValueOnce({
      id: "inv1",
      email: "test@example.com",
    });
    (prisma.userInvite.delete as jest.Mock).mockResolvedValueOnce({});

    const req = new Request(
      "http://localhost/api/invites?email=test@example.com",
      { method: "DELETE" }
    );

    const res = await DELETE(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ ok: true });

    // ✅ match how the actual route deletes by id
    expect(prisma.userInvite.delete).toHaveBeenCalledWith({
      where: { id: "inv1" },
    });
  });
});
