
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui-custom/Card";
import { Button } from "@/components/ui-custom/Button";
import { Repository, mockRepositories } from "@/lib/types";
import { GitBranch, Plus, Lock, Globe, GitFork, Star } from "lucide-react";

interface RepositoriesListProps {
  limit?: number;
  organizationId?: string;
}

const RepositoriesList: React.FC<RepositoriesListProps> = ({ limit, organizationId }) => {
  let repositories = mockRepositories;
  
  // Filter by organization if provided
  if (organizationId) {
    repositories = repositories.filter(repo => repo.organizationId === organizationId);
  }
  
  // Apply limit if provided
  if (limit) {
    repositories = repositories.slice(0, limit);
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
          {repositories.map((repo) => (
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
        {limit && repositories.length < mockRepositories.length && (
          <div className="p-4">
            <Link to="/repositories" className="text-sm text-primary hover:underline">
              View all repositories
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
  // Find the organization that this repository belongs to
  const orgName = repository.organizationId 
    ? mockRepositories.find(r => r.id === repository.organizationId)?.name || "Unknown"
    : "Personal";

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
