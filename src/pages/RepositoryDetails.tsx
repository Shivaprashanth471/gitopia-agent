
import React from "react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import WorkflowStats from "@/components/dashboard/WorkflowStats";
import CodeQuality from "@/components/dashboard/CodeQuality";
import DeploymentStats from "@/components/dashboard/DeploymentStats";
import { useToast } from "@/hooks/use-toast";

// Import our new components
import RepositoryHeader from "@/components/repository/RepositoryHeader";
import RepositoryOverview from "@/components/repository/RepositoryOverview";
import ContributorsList from "@/components/repository/ContributorsList";
import LoadingState from "@/components/repository/LoadingState";
import ErrorState from "@/components/repository/ErrorState";

const RepositoryDetails: React.FC = () => {
  const { repoId } = useParams<{ repoId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fetch repositories to find the one with matching ID
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
  
  // Fetch repository details and collaborators
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

  // Show loading state while data is being fetched
  if (isLoadingRepos || isLoading) {
    return <LoadingState onBack={handleBack} />;
  }

  // Show error state if there was an error or repository not found
  if (error || !repository) {
    return <ErrorState onBack={handleBack} onReturnToList={() => navigate("/repositories")} />;
  }

  // Get owner name for API calls
  const ownerName = selectedRepo?.owner?.login || "";

  return (
    <div className="space-y-8">
      <TransitionWrapper show={true} animation="fade" duration={500}>
        <RepositoryHeader repository={repository} onBack={handleBack} />
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
          
          <TabsContent value="overview">
            <RepositoryOverview repository={repository} selectedRepo={selectedRepo} />
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
            <ContributorsList repository={repository} />
          </TabsContent>
        </Tabs>
      </TransitionWrapper>
    </div>
  );
};

export default RepositoryDetails;
