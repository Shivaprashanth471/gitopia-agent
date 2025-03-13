
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  fetchOrganizationDetails, 
  fetchOrganizationMembers,
  fetchOrganizationRepositories,
  transformGithubOrganization,
  transformGithubRepository
} from "@/lib/github";
import TransitionWrapper from "@/components/ui-custom/TransitionWrapper";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui-custom/Card";
import { Button } from "@/components/ui-custom/Button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  ArrowLeft, 
  GitBranch, 
  Globe, 
  Lock,
  Calendar
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import UsersList from "@/components/dashboard/UsersList";
import RepositoriesList from "@/components/dashboard/RepositoriesList";

const OrganizationDetails: React.FC = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  
  const { data: organizations } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      try {
        return await fetchOrganizationDetails("");
      } catch (error) {
        console.error("Failed to fetch organizations:", error);
        return [];
      }
    },
    enabled: false // Just to have the organizations data type
  });

  const { data: organization, isLoading, error } = useQuery({
    queryKey: ['organization', orgId],
    queryFn: async () => {
      try {
        // For the initial implementation, let's get the organization data
        // from the available organizations by ID
        // In a real app, we'd make a specific API call for the org details
        const orgs = await fetchOrganizationMembers("github"); // Example org
        return {
          name: "GitHub",
          description: "How people build software",
          avatarUrl: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
          isPublic: true,
          createdAt: new Date().toISOString(),
          id: orgId || "123",
          members: orgs.map((member: any) => ({
            id: member.id,
            user: {
              id: member.id,
              username: member.login,
              name: member.login,
              avatarUrl: member.avatar_url
            }
          }))
        };
      } catch (error) {
        console.error("Failed to fetch organization details:", error);
        return null;
      }
    },
    enabled: !!orgId && !!localStorage.getItem("github_token")
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
              <CardTitle>Organization Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
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

  if (error || !organization) {
    return (
      <div className="space-y-8">
        <Button 
          variant="outline" 
          className="mb-6"
          onClick={handleBack}
          icon={<ArrowLeft className="h-4 w-4" />}
        >
          Back to Organizations
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">Failed to load organization details</p>
            <Button 
              className="mt-4" 
              onClick={() => navigate("/organizations")}
            >
              Return to Organizations List
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                {organization.name}
                <span className="ml-2">
                  {organization.isPublic ? (
                    <Globe className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  )}
                </span>
              </h1>
              {organization.description && (
                <p className="text-muted-foreground mt-1">
                  {organization.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </TransitionWrapper>

      <TransitionWrapper show={true} animation="scale" duration={300} className="delay-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex-row justify-between items-center">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-muted-foreground" />
                <CardTitle>Created</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p>{formatDistanceToNow(new Date(organization.createdAt))} ago</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex-row justify-between items-center">
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-muted-foreground" />
                <CardTitle>Members</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p>{organization.members.length} members</p>
            </CardContent>
          </Card>
        </div>
      </TransitionWrapper>

      <TransitionWrapper show={true} animation="scale" duration={300} className="delay-200">
        <UsersList 
          organizationId={organization.id} 
          organizationName={organization.name} 
        />
      </TransitionWrapper>

      <TransitionWrapper show={true} animation="scale" duration={300} className="delay-300">
        <RepositoriesList 
          organizationId={organization.id}
          organizationName={organization.name}
        />
      </TransitionWrapper>
    </div>
  );
};

export default OrganizationDetails;
