
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  fetchRepositoryDetails, 
  fetchRepositoryCollaborators,
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
  Users
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import UsersList from "@/components/dashboard/UsersList";

const RepositoryDetails: React.FC = () => {
  const { repoId } = useParams<{ repoId: string }>();
  const navigate = useNavigate();
  
  const { data: repository, isLoading, error } = useQuery({
    queryKey: ['repository', repoId],
    queryFn: async () => {
      try {
        // We need to find the repository first to get owner and name
        // For now, let's redirect back since we don't have that info
        navigate("/repositories");
        return null;
      } catch (error) {
        console.error("Failed to fetch repository details:", error);
        return null;
      }
    },
    enabled: !!repoId && !!localStorage.getItem("github_token")
  });

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
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

  if (error) {
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
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">Failed to load repository details</p>
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

  return (
    <div className="space-y-8">
      <TransitionWrapper show={true} animation="fade" duration={500}>
        <Button 
          variant="outline" 
          className="mb-6"
          onClick={handleBack}
          icon={<ArrowLeft className="h-4 w-4" />}
        >
          Back to Repositories
        </Button>
      </TransitionWrapper>

      <TransitionWrapper show={true} animation="scale" duration={300}>
        <Card>
          <CardHeader className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <GitBranch className="mr-2 h-5 w-5 text-muted-foreground" />
                <span>Repository Not Found</span>
              </CardTitle>
            </div>
            <p className="text-muted-foreground">
              The repository you're looking for doesn't exist or you don't have access to it.
            </p>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/repositories")}>
              Browse All Repositories
            </Button>
          </CardContent>
        </Card>
      </TransitionWrapper>
    </div>
  );
};

export default RepositoryDetails;
