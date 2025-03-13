
import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui-custom/Card";
import { Button } from "@/components/ui-custom/Button";
import { Organization } from "@/lib/types";
import { Users, Plus, Lock, Globe } from "lucide-react";
import { fetchUserOrganizations, fetchOrganizationMembers, transformGithubOrganization } from "@/lib/github";
import { Skeleton } from "@/components/ui/skeleton";

interface OrganizationsListProps {
  limit?: number;
}

const OrganizationsList: React.FC<OrganizationsListProps> = ({ limit }) => {
  const { 
    data: organizations = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      try {
        const orgs = await fetchUserOrganizations();
        
        // For each org, fetch its members
        const orgsWithMembers = await Promise.all(
          orgs.map(async (org: any) => {
            try {
              const members = await fetchOrganizationMembers(org.login);
              return transformGithubOrganization(org, members);
            } catch (error) {
              console.error(`Error fetching members for ${org.login}:`, error);
              return transformGithubOrganization(org, []);
            }
          })
        );
        
        return orgsWithMembers;
      } catch (error) {
        console.error("Failed to fetch organizations:", error);
        return [];
      }
    },
    enabled: !!localStorage.getItem("github_token")
  });

  const displayedOrganizations = limit ? organizations.slice(0, limit) : organizations;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex-row justify-between items-center">
          <div className="flex items-center">
            <Users className="w-5 h-5 mr-2 text-muted-foreground" />
            <CardTitle>Organizations</CardTitle>
          </div>
          <Link to="/organizations">
            <Button
              variant="ghost"
              size="sm"
              icon={<Plus className="h-4 w-4" />}
            >
              New
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4">
                <div className="flex items-start">
                  <Skeleton className="h-10 w-10 rounded-md mr-4" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Organizations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Failed to load organizations</p>
        </CardContent>
      </Card>
    );
  }

  if (organizations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Organizations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground py-4 text-center">
            You don't belong to any organizations
          </p>
          <div className="flex justify-center">
            <Link to="/organizations">
              <Button icon={<Plus className="h-4 w-4" />}>
                Create Organization
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row justify-between items-center">
        <div className="flex items-center">
          <Users className="w-5 h-5 mr-2 text-muted-foreground" />
          <CardTitle>Organizations</CardTitle>
        </div>
        <Link to="/organizations">
          <Button
            variant="ghost"
            size="sm"
            icon={<Plus className="h-4 w-4" />}
          >
            New
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {displayedOrganizations.map((org) => (
            <OrganizationItem key={org.id} organization={org} />
          ))}
        </ul>
        {limit && organizations.length > limit && (
          <div className="p-4">
            <Link to="/organizations" className="text-sm text-primary hover:underline">
              View all organizations ({organizations.length})
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface OrganizationItemProps {
  organization: Organization;
}

const OrganizationItem: React.FC<OrganizationItemProps> = ({ organization }) => {
  return (
    <li className="transition-colors hover:bg-muted/10">
      <Link to={`/organizations/${organization.id}`} className="block p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-4">
            <img
              src={organization.avatarUrl}
              alt={organization.name}
              className="w-10 h-10 rounded-md shadow-sm"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center">
              <h4 className="text-base font-medium truncate">{organization.name}</h4>
              <div className="ml-2 flex-shrink-0">
                {organization.isPublic ? (
                  <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </div>
            </div>
            {organization.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                {organization.description}
              </p>
            )}
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <Users className="w-3.5 h-3.5 mr-1" />
              <span>{organization.members.length} members</span>
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
};

export default OrganizationsList;
