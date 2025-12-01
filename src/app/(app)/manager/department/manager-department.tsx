import { prisma } from "@/lib/prisma";
import ManagerDepartmentsClient from "./manager-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { User } from "@prisma/client";

type ManagerDepartmentsProps = {
  manager: {
    department?: {
      name: string;
      users: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        role: string;
        profileImage: string | null;
      }[];
    } | null;
  } | null;
};

export default async function ManagerDepartments({ manager }: ManagerDepartmentsProps) {
  if (!manager?.department) {
    return <p>You are not assigned to a department.</p>;
  }

    const session = await getServerSession(authOptions);
    if (!session) return <div className="p-6">Please sign in.</div>;
    const me = session.user as User;

  const userIds = manager.department.users.map((u) => u.id);

  const recs = await prisma.recognition.findMany({
    where: {
      recipients: {
        some: {
          recipientId: { in: userIds },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      sender: true,
      recipients: {
        include: {
          recipient: true,
        }
      },
    },
  });

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
  });

  return (
    <ManagerDepartmentsClient
      manager={manager}
      recs={recs}
      users={users}
      me={me}
    />
  );
}
