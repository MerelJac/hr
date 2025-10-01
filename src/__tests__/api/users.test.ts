// __tests__/api/users.test.ts
import { PATCH, DELETE } from "@/app/api/users/[id]/route";
import { prisma } from "@/lib/prisma";

// mock prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { update: jest.fn(), delete: jest.fn() },
    session: { deleteMany: jest.fn() },
    $transaction: <T>(fn: (tx: unknown) => T) => fn(prisma),
  },
}));

// mock auth
jest.mock("@/lib/auth", () => ({
  authOptions: {},
}));
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(() => ({ user: { role: "SUPER_ADMIN" } })),
}));

describe("PATCH /api/users/[id]", () => {
  it("should update role and deactivate sessions", async () => {
    (prisma.user.update as jest.Mock).mockResolvedValue({
      id: "123",
      isActive: false,
    });

    const req = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({ role: "EMPLOYEE", isActive: false }),
    });

    const res = await PATCH(req, { params: { id: "123" } });

    const json = await res.json();

    expect(json.ok).toBe(true);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "123" } })
    );
    expect(prisma.session.deleteMany).toHaveBeenCalledWith({
      where: { userId: "123" },
    });
  });
});

describe("DELETE /api/users/[id]", () => {
  it("should delete a user and sessions", async () => {
    (prisma.user.delete as jest.Mock).mockResolvedValue({ id: "123" });

    const req = new Request("http://localhost", { method: "DELETE" });

    const res = await DELETE(req, { params: { id: "123" } });

    const json = await res.json();

    expect(json.ok).toBe(true);
    expect(prisma.session.deleteMany).toHaveBeenCalledWith({
      where: { userId: "123" },
    });
    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: "123" } });
  });
});
