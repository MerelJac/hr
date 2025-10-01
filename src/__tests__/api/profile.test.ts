// __tests__/api/profile.test.ts
import { PATCH } from "@/app/api/profile/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

// mock prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { update: jest.fn() },
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

describe("PATCH /api/profile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if not logged in", async () => {
    mockedGetServerSession.mockResolvedValueOnce(null);

    const req = new Request("http://localhost/api/profile", {
      method: "PATCH",
      body: JSON.stringify({ birthday: "1990-01-01" }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(401);

    const json = await res.json();
    expect(json.error).toMatch(/Unauthorized/);
  });

  it("should update birthday if logged in", async () => {
    mockedGetServerSession.mockResolvedValueOnce({ user: { id: "user1" } });
    (prisma.user.update as jest.Mock).mockResolvedValueOnce({
      id: "user1",
      birthday: new Date("1990-01-01"),
    });

    const req = new Request("http://localhost/api/profile", {
      method: "PATCH",
      body: JSON.stringify({ birthday: "1990-01-01" }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toEqual({
      id: "user1",
      birthday: new Date("1990-01-01").toISOString(),
    });

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "user1" },
        data: expect.objectContaining({
          birthday: new Date("1990-01-01"),
        }),
        select: expect.objectContaining({
          id: true,
          birthday: true,
        }),
      })
    );
  });

  it("should set birthday to null if omitted", async () => {
    mockedGetServerSession.mockResolvedValueOnce({ user: { id: "user1" } });
    (prisma.user.update as jest.Mock).mockResolvedValueOnce({
      id: "user1",
      birthday: null,
    });

    const req = new Request("http://localhost/api/profile", {
      method: "PATCH",
      body: JSON.stringify({}),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toEqual({ id: "user1", birthday: null });

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "user1" },
        data: expect.objectContaining({
          birthday: null,
        }),
        select: expect.objectContaining({
          id: true,
          birthday: true,
        }),
      })
    );
  });

  it("should return 500 if prisma throws", async () => {
    mockedGetServerSession.mockResolvedValueOnce({ user: { id: "user1" } });
    (prisma.user.update as jest.Mock).mockRejectedValueOnce(
      new Error("DB error")
    );

    const req = new Request("http://localhost/api/profile", {
      method: "PATCH",
      body: JSON.stringify({ birthday: "2000-01-01" }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(500);

    const json = await res.json();
    expect(json.error).toMatch(/DB error/);
  });
});
