
import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui-custom/Card";
import { Button } from "@/components/ui-custom/Button";
import { Repository } from "@/lib/types";
import { GitBranch, Plus, Lock, Globe, GitFork, Star } from "lucide-react";
import { fetchUserRepositories, fetchOrganizationRepositories, transformGithubRepository } from "@/lib/github";
import { Skeleton } from "@/components/ui/skeleton";

interface RepositoriesListProps {
  limit?: number;
  organizationId?: string;
}

const RepositoriesList: React.FC<RepositoriesListProps> = ({ limit, organizationId }) => {
  const { 
    data: repositories = [],
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['repositories', { organizationId }],
    queryFn: async () => {
      try {
        let repos;
        
        if (organizationId) {
          // Find the organization name from the ID
          // This is a simplified approach - in a real app, you might need to store org name->id mappings
          const orgs = await fetchUserOrganizations();
          const org = orgs.find((o: any) => o.id.toString() === organizationId);
          
          if (!org) {
            throw new Error(`Organization with ID ${organizationId} not found`);
          }
          
          repos = await fetchOrganizationRepositories(org.login);
        } else {
          repos = await fetchUserRepositories();
        }
        
        // Transform the repos to match our data model
        return repos.map((repo: any) => transformGithubRepository(repo));
      } catch (error) {
        console.error("Failed to fetch repositories:", error);
        return [];
      }
    },
    enabled: !!localStorage.getItem("github_token")
  });

  // Apply limit if provided
  const displayedRepositories = limit ? repositories.slice(0, limit) : repositories;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex-row justify-between items-center">
          <div className="flex items-center">
            <GitBranch className="w-5 h-5 mr-2 text-muted-foreground" />
            <CardTitle>Repositories</CardTitle>
          </div>
          <Link to="/repositories/new">
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
                <div className="space-y-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex space-x-4">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-32" />
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
          <CardTitle>Repositories</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Failed to load repositories</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row justify-between items-center">
        <div className="flex items-center">
          <GitBranch className="w-5 h-5 mr-2 text-muted-foreground" />
          <CardTitle>Repositories</CardTitle>
        </div>
        <Link to="/repositories/new">
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
          {displayedRepositories.map((repo) => (
            <RepositoryItem key={repo.id} repository={repo} />
          ))}
          {repositories.length === 0 && (
            <li className="py-8 text-center">
              <p className="text-muted-foreground">No repositories found</p>
              <Link to="/repositories/new" className="mt-2 inline-block">
                <Button size="sm" icon={<Plus className="h-4 w-4" />}>
                  Create repository
                </Button>
              </Link>
            </li>
          )}
        </ul>
        {limit && repositories.length > limit && (
          <div className="p-4">
            <Link to="/repositories" className="text-sm text-primary hover:underline">
              View all repositories ({repositories.length})
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface RepositoryItemProps {
  repository: Repository;
}

const RepositoryItem: React.FC<RepositoryItemProps> = ({ repository }) => {
  // For this display version, we'll just use the repo name for the org name
  const orgName = repository.organizationId ? "Organization" : "Personal";

  return (
    <li className="transition-colors hover:bg-muted/10">
      <Link to={`/repositories/${repository.id}`} className="block p-4">
        <div className="flex items-start">
          <div className="flex-1 min-w-0">
            <div className="flex items-center">
              <h4 className="text-base font-medium truncate">
                <span className="text-muted-foreground">{orgName} / </span>
                {repository.name}
              </h4>
              <div className="ml-2 flex-shrink-0">
                {repository.isPrivate ? (
                  <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                ) : (
                  <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </div>
            </div>
            {repository.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {repository.description}
              </p>
            )}
            <div className="mt-2 flex items-center space-x-4 text-xs text-muted-foreground">
              <div className="flex items-center">
                <GitFork className="w-3.5 h-3.5 mr-1" />
                <span>0 forks</span>
              </div>
              <div className="flex items-center">
                <Star className="w-3.5 h-3.5 mr-1" />
                <span>0 stars</span>
              </div>
              <div className="flex items-center">
                <span>Updated {new Date(repository.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
};

export default RepositoriesList;
