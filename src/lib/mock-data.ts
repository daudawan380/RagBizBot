
export type User = {
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
};

export type PolicyFile = {
  id: string;
  name: string;
  size: string;
  uploadDate: string;
};

export const mockUser: User = {
  firstName: 'Admin',
  lastName: 'User',
  email: 'user@company.com',
  companyName: 'Innovate Inc.',
};

export const mockPolicies: PolicyFile[] = [];
