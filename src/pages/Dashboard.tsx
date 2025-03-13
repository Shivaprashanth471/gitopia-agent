
import React, { useState } from "react";
import OrganizationsList from "@/components/dashboard/OrganizationsList";
import RepositoriesList from "@/components/dashboard/RepositoriesList";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui-custom/Card";
import { Button } from "@/components/ui-custom/Button";
import TransitionWrapper from "@/components/ui-custom/TransitionWrapper";
import { GitCommit, GitPullRequest, GitMerge, Clock } from "lucide-react";
import GitHubTokenInput from "@/components/github/GitHubTokenInput";
import { getGithubToken } from "@/lib/github";

const Dashboard: React.FC = () => {
  const [hasToken, setHasToken] = useState(!!getGithubToken());

  const handleTokenSet = () => {
    setHasToken(true);
  };

  if (!hasToken) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <h1 className="text-3xl font-bold mb-6">Welcome to Gitopia</h1>
        <p className="text-muted-foreground mb-8">
          Connect your GitHub account to get started using Gitopia.
        </p>
        <GitHubTokenInput onTokenSet={handleTokenSet} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <TransitionWrapper show={true} animation="fade" duration={500}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back to your Gitopia dashboard
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              New
            </Button>
          </div>
        </div>
      </TransitionWrapper>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TransitionWrapper show={true} animation="slide-up" duration={300} className="delay-100">
          <StatsCard
            title="Commits"
            value="24"
            description="Last 30 days"
            icon={<GitCommit className="h-5 w-5" />}
            trend={12}
          />
        </TransitionWrapper>
        
        <TransitionWrapper show={true} animation="slide-up" duration={300} className="delay-200">
          <StatsCard
            title="Pull Requests"
            value="8"
            description="Open requests"
            icon={<GitPullRequest className="h-5 w-5" />}
            trend={-3}
          />
        </TransitionWrapper>
        
        <TransitionWrapper show={true} animation="slide-up" duration={300} className="delay-300">
          <StatsCard
            title="Merges"
            value="16"
            description="Last 30 days"
            icon={<GitMerge className="h-5 w-5" />}
            trend={5}
          />
        </TransitionWrapper>
        
        <TransitionWrapper show={true} animation="slide-up" duration={300} className="delay-400">
          <StatsCard
            title="Active Time"
            value="42h"
            description="This week"
            icon={<Clock className="h-5 w-5" />}
            trend={8}
          />
        </TransitionWrapper>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TransitionWrapper show={true} animation="scale" duration={300} className="delay-100">
          <RepositoriesList limit={3} />
        </TransitionWrapper>
        
        <TransitionWrapper show={true} animation="scale" duration={300} className="delay-200">
          <OrganizationsList limit={3} />
        </TransitionWrapper>
      </div>
      
      <TransitionWrapper show={true} animation="fade" duration={300} className="delay-300">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <ActivityItem
                title="Created repository frontend-app"
                timestamp="2 hours ago"
                icon={<GitCommit className="h-4 w-4" />}
              />
              <ActivityItem
                title="Added 3 files to backend-api"
                timestamp="Yesterday"
                icon={<GitCommit className="h-4 w-4" />}
              />
              <ActivityItem
                title="Merged Pull Request #42"
                timestamp="2 days ago"
                icon={<GitMerge className="h-4 w-4" />}
              />
              <ActivityItem
                title="Created organization Tech Innovations"
                timestamp="3 days ago"
                icon={<GitCommit className="h-4 w-4" />}
              />
            </div>
          </CardContent>
        </Card>
      </TransitionWrapper>
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: string;
  description?: string;
  icon?: React.ReactNode;
  trend?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-3xl font-bold mt-2">{value}</h3>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {icon && (
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              {icon}
            </div>
          )}
        </div>
        {trend !== undefined && (
          <div className="mt-4 flex items-center">
            <span
              className={`text-xs font-medium ${
                trend >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {trend >= 0 ? "+" : ""}
              {trend}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              from last period
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface ActivityItemProps {
  title: string;
  timestamp: string;
  icon?: React.ReactNode;
}

const ActivityItem: React.FC<ActivityItemProps> = ({
  title,
  timestamp,
  icon,
}) => {
  return (
    <div className="flex items-center">
      <div className="h-8 w-8 rounded-full bg-muted/30 flex items-center justify-center mr-3">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{timestamp}</p>
      </div>
    </div>
  );
};

export default Dashboard;
