// __tests__/api/register.test.ts
import { POST } from "@/app/api/register/route";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

// mock prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    userInvite: { findUnique: jest.fn(), update: jest.fn() },
    user: { findUnique: jest.fn(), create: jest.fn() },
  },
}));

// mock bcryptjs
jest.mock("bcryptjs", () => ({
  hash: jest.fn(() => "hashedpw"),
}));

describe("POST /api/register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 403 if no invite found", async () => {
    (prisma.userInvite.findUnique as jest.Mock).mockResolvedValueOnce(null);

    const req = new Request("http://localhost/api/register", {
      method: "POST",
      body: JSON.stringify({
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        password: "pw123",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);

    const json = await res.json();
    expect(json.error).toMatch(/No valid invite/);
  });

  it("should return 403 if invite already consumed", async () => {
    (prisma.userInvite.findUnique as jest.Mock).mockResolvedValueOnce({
      email: "jane@example.com",
      role: "EMPLOYEE",
      consumedAt: new Date(),
    });

    const req = new Request("http://localhost/api/register", {
      method: "POST",
      body: JSON.stringify({
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        password: "pw123",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("should return 400 if email already registered", async () => {
    (prisma.userInvite.findUnique as jest.Mock).mockResolvedValueOnce({
      email: "jane@example.com",
      role: "EMPLOYEE",
      consumedAt: null,
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({ id: "u1" });

    const req = new Request("http://localhost/api/register", {
      method: "POST",
      body: JSON.stringify({
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        password: "pw123",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toMatch(/already registered/);
  });

  it("should create user and update invite if valid", async () => {
    (prisma.userInvite.findUnique as jest.Mock).mockResolvedValueOnce({
      email: "jane@example.com",
      role: "EMPLOYEE",
      consumedAt: null,
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
    (prisma.user.create as jest.Mock).mockResolvedValueOnce({ id: "newUser" });
    (prisma.userInvite.update as jest.Mock).mockResolvedValueOnce({});

    const req = new Request("http://localhost/api/register", {
      method: "POST",
      body: JSON.stringify({
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        password: "pw123",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.userId).toBe("newUser");

    expect(hash).toHaveBeenCalledWith("pw123", 12);
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          firstName: "Jane",
          lastName: "Doe",
          email: "jane@example.com",
          passwordHash: "hashedpw",
          role: "EMPLOYEE",
        }),
      })
    );
    expect(prisma.userInvite.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: "jane@example.com" },
        data: expect.objectContaining({ consumedAt: expect.any(Date) }),
      })
    );
  });

  it("should return 500 on unexpected error", async () => {
    (prisma.userInvite.findUnique as jest.Mock).mockRejectedValueOnce(new Error("DB exploded"));

    const req = new Request("http://localhost/api/register", {
      method: "POST",
      body: JSON.stringify({
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        password: "pw123",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(500);

    const json = await res.json();
    expect(json.error).toMatch(/DB exploded/);
  });
});
