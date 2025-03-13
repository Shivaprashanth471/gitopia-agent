
// Organization types
export interface Organization {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  createdAt: string;
  isPublic: boolean;
  members: OrganizationMember[];
}

export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: "owner" | "admin" | "member" | "guest";
  joinedAt: string;
  user: User;
}

// Repository types
export interface Repository {
  id: string;
  name: string;
  description?: string;
  organizationId?: string;
  ownerId?: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  collaborators: RepositoryCollaborator[];
}

export interface RepositoryCollaborator {
  id: string;
  userId: string;
  repositoryId: string;
  permission: "admin" | "maintain" | "write" | "triage" | "read";
  addedAt: string;
  user: User;
}

// User types
export interface User {
  id: string;
  username: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
}

// Mock data helpers
export const mockUsers: User[] = [
  {
    id: "1",
    username: "johndoe",
    name: "John Doe",
    email: "john@example.com",
    avatarUrl: "https://i.pravatar.cc/150?u=johndoe",
  },
  {
    id: "2",
    username: "janedoe",
    name: "Jane Doe",
    email: "jane@example.com",
    avatarUrl: "https://i.pravatar.cc/150?u=janedoe",
  },
  {
    id: "3",
    username: "bobsmith",
    name: "Bob Smith",
    email: "bob@example.com",
    avatarUrl: "https://i.pravatar.cc/150?u=bobsmith",
  },
];

export const mockOrganizations: Organization[] = [
  {
    id: "1",
    name: "Acme Inc",
    description: "Building innovative solutions for the future",
    avatarUrl: "https://ui-avatars.com/api/?name=Acme+Inc&background=0D8ABC&color=fff",
    createdAt: new Date().toISOString(),
    isPublic: true,
    members: [
      {
        id: "1",
        userId: "1",
        organizationId: "1",
        role: "owner",
        joinedAt: new Date().toISOString(),
        user: mockUsers[0]
      },
      {
        id: "2",
        userId: "2",
        organizationId: "1",
        role: "admin",
        joinedAt: new Date().toISOString(),
        user: mockUsers[1]
      }
    ]
  },
  {
    id: "2",
    name: "Tech Innovations",
    description: "Pushing the boundaries of technology",
    avatarUrl: "https://ui-avatars.com/api/?name=Tech+Innovations&background=6B3FA0&color=fff",
    createdAt: new Date().toISOString(),
    isPublic: false,
    members: [
      {
        id: "3",
        userId: "1",
        organizationId: "2",
        role: "admin",
        joinedAt: new Date().toISOString(),
        user: mockUsers[0]
      },
      {
        id: "4",
        userId: "3",
        organizationId: "2",
        role: "owner",
        joinedAt: new Date().toISOString(),
        user: mockUsers[2]
      }
    ]
  }
];

export const mockRepositories: Repository[] = [
  {
    id: "1",
    name: "frontend-app",
    description: "Main frontend application",
    organizationId: "1",
    isPrivate: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    collaborators: [
      {
        id: "1",
        userId: "1",
        repositoryId: "1",
        permission: "admin",
        addedAt: new Date().toISOString(),
        user: mockUsers[0]
      },
      {
        id: "2",
        userId: "2",
        repositoryId: "1",
        permission: "write",
        addedAt: new Date().toISOString(),
        user: mockUsers[1]
      }
    ]
  },
  {
    id: "2",
    name: "backend-api",
    description: "REST API for the main application",
    organizationId: "1",
    isPrivate: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    collaborators: [
      {
        id: "3",
        userId: "1",
        repositoryId: "2",
        permission: "admin",
        addedAt: new Date().toISOString(),
        user: mockUsers[0]
      },
      {
        id: "4",
        userId: "3",
        repositoryId: "2",
        permission: "read",
        addedAt: new Date().toISOString(),
        user: mockUsers[2]
      }
    ]
  },
  {
    id: "3",
    name: "design-system",
    description: "Shared UI components and design tokens",
    organizationId: "2",
    isPrivate: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    collaborators: [
      {
        id: "5",
        userId: "3",
        repositoryId: "3",
        permission: "admin",
        addedAt: new Date().toISOString(),
        user: mockUsers[2]
      }
    ]
  }
];
