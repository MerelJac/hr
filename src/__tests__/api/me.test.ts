// __tests__/api/me.test.ts
import { GET } from "@/app/api/me/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

// mock prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: jest.fn() },
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

describe("GET /api/me", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if not logged in", async () => {
    mockedGetServerSession.mockResolvedValueOnce(null);

    const res = await GET();
    expect(res.status).toBe(401);

    const json = await res.json();
    expect(json.error).toMatch(/Unauthorized/);
  });

  it("should return the current user if logged in", async () => {
    mockedGetServerSession.mockResolvedValueOnce({ user: { id: "user1" } });
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "user1",
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      birthday: "1990-01-01",
      workAnniversary: "2020-01-01",
    });

    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toEqual({
      id: "user1",
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      birthday: "1990-01-01",
      workAnniversary: "2020-01-01",
    });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "user1" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        birthday: true,
        preferredName: true,
        workAnniversary: true,
        department: true,
        profileImage: true,
        nominationsAsNominee: false,
        submittedNominations: {
          include: {
            challenge: { select: { id: true, title: true, points: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  });

  it("should return null if user not found in DB", async () => {
    mockedGetServerSession.mockResolvedValueOnce({ user: { id: "ghost" } });
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toBeNull();
  });
});
