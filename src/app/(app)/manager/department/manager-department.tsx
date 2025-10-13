
import Image from "next/image";
import RecognitionsForUsers from "@/components/RecognitionsForUsers";

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

export default function ManagerDepartments({
  manager,
}: ManagerDepartmentsProps) {

  if (!manager?.department) {
    return <p>You are not assigned to a department.</p>;
  }

  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-2">
        {manager.department.name} Department
      </h3>

      {manager.department.users.length === 0 ? (
        <p className="text-sm text-gray-500">
          No employees in your department.
        </p>
      ) : (
        <ul className="space-y-1">
          {manager.department.users.map((u) => (
            <li key={u.id} className="flex items-center gap-2">
              <Image
                src={u.profileImage ?? "/default-profile-image.svg"}
                alt="Profile"
                width={64}
                height={64}
                className="rounded-full w-12 h-12 border-2 border-blue-500"
              />
              <span>
                {u.firstName} {u.lastName}
              </span>
              <span className="text-gray-500 text-sm">({u.email})</span>
            </li>
          ))}
        </ul>
      )}
      <RecognitionsForUsers
        userIds={manager.department.users.map((u) => u.id)}
      />
    </div>
  );
}
