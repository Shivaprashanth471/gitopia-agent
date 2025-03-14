import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  fetchRepositoryDetails, 
  fetchRepositoryCollaborators,
  fetchUserRepositories,
  fetchOrganizationRepositories,
  transformGithubRepository 
} from "@/lib/github";
import TransitionWrapper from "@/components/ui-custom/TransitionWrapper";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui-custom/Card";
import { Button } from "@/components/ui-custom/Button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  GitBranch, 
  ArrowLeft, 
  Star, 
  GitFork, 
  Clock, 
  Eye, 
  Lock, 
  Globe,
  Users,
  Activity,
  Search
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import UsersList from "@/components/dashboard/UsersList";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import WorkflowStats from "@/components/dashboard/WorkflowStats";
import CodeQuality from "@/components/dashboard/CodeQuality";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import DeploymentStats from "@/components/dashboard/DeploymentStats";

const RepositoryDetails: React.FC = () => {
  const { repoId } = useParams<{ repoId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Updated query to ensure proper imports are being used
  const { data: repositories, isLoading: isLoadingRepos } = useQuery({
    queryKey: ['repositories'],
    queryFn: async () => {
      try {
        // First fetch all repositories to find the one with matching ID
        const userRepos = await fetchUserRepositories();
        if (!userRepos || userRepos.length === 0) {
          // If no user repos, try organization repos
          const orgRepos = await fetchOrganizationRepositories("Kinergy-Development");
          return orgRepos.map((repo: any) => ({
            ...repo,
            id: repo.id.toString()
          }));
        }
        return userRepos.map((repo: any) => ({
          ...repo,
          id: repo.id.toString()
        }));
      } catch (error) {
        console.error("Failed to fetch repositories:", error);
        return [];
      }
    },
    enabled: !!repoId && !!localStorage.getItem("github_token")
  });

  const selectedRepo = repositories?.find(repo => repo.id === repoId);
  
  const { data: repository, isLoading, error } = useQuery({
    queryKey: ['repository-details', repoId, selectedRepo?.owner?.login, selectedRepo?.name],
    queryFn: async () => {
      try {
        if (!selectedRepo) return null;
        
        // Now we can fetch the specific repository details
        const repoDetails = await fetchRepositoryDetails(
          selectedRepo.owner.login, 
          selectedRepo.name
        );
        
        // Fetch collaborators
        const collaborators = await fetchRepositoryCollaborators(
          selectedRepo.owner.login, 
          selectedRepo.name
        );
        
        return transformGithubRepository(repoDetails, collaborators);
      } catch (error) {
        console.error("Failed to fetch repository details:", error);
        toast({
          title: "Error",
          description: "Failed to load repository details",
          variant: "destructive"
        });
        return null;
      }
    },
    enabled: !!selectedRepo && !!localStorage.getItem("github_token")
  });

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoadingRepos || isLoading) {
    return (
      <div className="space-y-8">
        <TransitionWrapper show={true} animation="fade" duration={500}>
          <div className="flex items-center mb-6">
            <Button 
              variant="outline" 
              size="sm" 
              className="mr-4"
              onClick={handleBack}
              icon={<ArrowLeft className="h-4 w-4" />}
            >
              Back
            </Button>
            <Skeleton className="h-8 w-60" />
          </div>
        </TransitionWrapper>

        <TransitionWrapper show={true} animation="scale" duration={300} className="delay-100">
          <Card>
            <CardHeader>
              <CardTitle>Repository Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TransitionWrapper>
      </div>
    );
  }

  if (error || !repository) {
    return (
      <div className="space-y-8">
        <Button 
          variant="outline" 
          className="mb-6"
          onClick={handleBack}
          icon={<ArrowLeft className="h-4 w-4" />}
        >
          Back to Repositories
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle>Repository Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">The repository you're looking for doesn't exist or you don't have access to it.</p>
            <Button 
              className="mt-4" 
              onClick={() => navigate("/repositories")}
            >
              Return to Repository List
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get owner name for API calls
  const ownerName = selectedRepo?.owner?.login || "";

  return (
    <div className="space-y-8">
      <TransitionWrapper show={true} animation="fade" duration={500}>
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <Button 
              variant="outline" 
              size="sm" 
              className="mr-4"
              onClick={handleBack}
              icon={<ArrowLeft className="h-4 w-4" />}
            >
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                {repository.name}
                <span className="ml-2">
                  {repository.isPrivate ? (
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Globe className="h-5 w-5 text-muted-foreground" />
                  )}
                </span>
              </h1>
              {repository.description && (
                <p className="text-muted-foreground mt-1">
                  {repository.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </TransitionWrapper>

      <TransitionWrapper show={true} animation="scale" duration={300} className="delay-100">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="quality">Code Quality</TabsTrigger>
            <TabsTrigger value="deployments">Deployments</TabsTrigger>
            <TabsTrigger value="contributors">Contributors</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex-row justify-between items-center">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 mr-2 text-muted-foreground" />
                    <CardTitle>Stars</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{selectedRepo?.stargazers_count || 0}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex-row justify-between items-center">
                  <div className="flex items-center">
                    <GitFork className="w-5 h-5 mr-2 text-muted-foreground" />
                    <CardTitle>Forks</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{selectedRepo?.forks_count || 0}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex-row justify-between items-center">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-muted-foreground" />
                    <CardTitle>Updated</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>{formatDistanceToNow(new Date(repository.updatedAt))} ago</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Repository Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Owner</TableCell>
                      <TableCell>{selectedRepo?.owner?.login || "Unknown"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Default Branch</TableCell>
                      <TableCell>{selectedRepo?.default_branch || "main"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Created</TableCell>
                      <TableCell>{new Date(repository.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Language</TableCell>
                      <TableCell>{selectedRepo?.language || "Not specified"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Visibility</TableCell>
                      <TableCell>{repository.isPrivate ? "Private" : "Public"}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="workflows">
            <WorkflowStats organizationName={ownerName} repositoryName={repository.name} />
          </TabsContent>
          
          <TabsContent value="quality">
            <CodeQuality organizationName={ownerName} repositoryName={repository.name} />
          </TabsContent>
          
          <TabsContent value="deployments">
            <DeploymentStats organizationName={ownerName} repositoryName={repository.name} />
          </TabsContent>
          
          <TabsContent value="contributors">
            <Card>
              <CardHeader>
                <CardTitle>Contributors</CardTitle>
              </CardHeader>
              <CardContent>
                {repository.collaborators && repository.collaborators.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {repository.collaborators.map((collaborator) => (
                      <div key={collaborator.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          {collaborator.user?.avatarUrl ? (
                            <img src={collaborator.user.avatarUrl} alt={collaborator.user.name} className="w-10 h-10 rounded-full" />
                          ) : (
                            <Users className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{collaborator.user?.name || collaborator.user?.username}</p>
                          <p className="text-sm text-muted-foreground capitalize">{collaborator.permission} access</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No contributors found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </TransitionWrapper>
    </div>
  );
};

export default RepositoryDetails;
