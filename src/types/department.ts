export type Department = {
  id: string;
  name: string;
};

export type DepartmentWithUsers = {
  id: string;
  name: string;
  users: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    profileImage?: string | null;
  }[];
};  