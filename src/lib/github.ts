
import { toast } from "sonner";

const BASE_URL = "https://api.github.com";

// GitHub token state
let githubToken: string | null = localStorage.getItem("github_token");

// Token management functions
export const setGithubToken = (token: string) => {
  githubToken = token;
  localStorage.setItem("github_token", token);
  toast.success("GitHub token saved successfully");
  return true;
};

export const getGithubToken = () => {
  return githubToken;
};

export const clearGithubToken = () => {
  githubToken = null;
  localStorage.removeItem("github_token");
  toast.success("GitHub token removed");
};

// Helper for fetching from GitHub API
const githubFetch = async (endpoint: string, options: RequestInit = {}) => {
  if (!githubToken) {
    throw new Error("GitHub token not found");
  }

  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    Authorization: `Bearer ${githubToken}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("GitHub API Error:", error);
    toast.error(error instanceof Error ? error.message : "Failed to fetch data from GitHub");
    throw error;
  }
};

// GitHub API endpoints
export const fetchUserProfile = async () => {
  return await githubFetch("/user");
};

export const fetchUserOrganizations = async () => {
  return await githubFetch("/user/orgs");
};

export const fetchOrganizationDetails = async (orgName: string) => {
  return await githubFetch(`/orgs/${orgName}`);
};

export const fetchOrganizationMembers = async (orgName: string) => {
  return await githubFetch(`/orgs/${orgName}/members`);
};

export const fetchUserRepositories = async () => {
  return await githubFetch("/user/repos?sort=updated&per_page=100");
};

export const fetchOrganizationRepositories = async (orgName: string) => {
  return await githubFetch(`/orgs/${orgName}/repos?sort=updated&per_page=100`);
};

export const fetchRepositoryDetails = async (owner: string, repo: string) => {
  return await githubFetch(`/repos/${owner}/${repo}`);
};

export const fetchRepositoryCollaborators = async (owner: string, repo: string) => {
  return await githubFetch(`/repos/${owner}/${repo}/collaborators`);
};

// Transform GitHub API responses to our app's data model
export const transformGithubUser = (user: any) => {
  return {
    id: user.id.toString(),
    username: user.login,
    name: user.name || user.login,
    email: user.email || undefined,
    avatarUrl: user.avatar_url,
  };
};

export const transformGithubOrganization = (org: any, members = []) => {
  return {
    id: org.id.toString(),
    name: org.login,
    description: org.description || undefined,
    avatarUrl: org.avatar_url,
    createdAt: org.created_at,
    isPublic: !org.private,
    members: members.map((member: any) => ({
      id: `${org.id}-${member.id}`,
      userId: member.id.toString(),
      organizationId: org.id.toString(),
      role: "member", // GitHub API doesn't easily expose roles
      joinedAt: new Date().toISOString(),
      user: transformGithubUser(member),
    })),
  };
};

export const transformGithubRepository = (repo: any, collaborators = []) => {
  return {
    id: repo.id.toString(),
    name: repo.name,
    description: repo.description || undefined,
    organizationId: repo.owner.type === "Organization" ? repo.owner.id.toString() : undefined,
    ownerId: repo.owner.id.toString(),
    isPrivate: repo.private,
    createdAt: repo.created_at,
    updatedAt: repo.updated_at,
    collaborators: collaborators.map((collab: any) => ({
      id: `${repo.id}-${collab.id}`,
      userId: collab.id.toString(),
      repositoryId: repo.id.toString(),
      permission: collab.permissions.admin 
        ? "admin" 
        : collab.permissions.maintain
          ? "maintain"
          : collab.permissions.push
            ? "write"
            : collab.permissions.triage
              ? "triage"
              : "read",
      addedAt: new Date().toISOString(),
      user: transformGithubUser(collab),
    })),
  };
};
