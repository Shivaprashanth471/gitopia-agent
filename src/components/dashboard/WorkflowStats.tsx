
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui-custom/Card";
import { Progress } from "@/components/ui/progress";
import { ChartContainer } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { GitBranch, Activity, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WorkflowStatsProps {
  organizationName: string;
  repositoryName?: string;
}

// Sample data for visualization, will be replaced with real data in production
const generateSampleWorkflowData = (orgName: string, repoName?: string) => {
  // Create more meaningful workflow names based on common CI/CD processes
  const workflows = [
    "Build", 
    "Unit Tests", 
    "Integration Tests", 
    "Code Quality", 
    "Deployment"
  ];
  
  return workflows.map(workflow => {
    // Generate realistic success percentages
    const success = Math.floor(Math.random() * 40) + 60; // 60-100% success rate
    const failures = Math.floor(Math.random() * 15); // 0-15% failure rate
    const skipped = 100 - success - failures; // Remaining percentage
    
    // Add some context to the data
    return {
      name: workflow,
      success: success,
      failures: failures,
      skipped: skipped,
      total: Math.floor(Math.random() * 100) + 20, // Total runs
      lastRun: new Date(Date.now() - Math.floor(Math.random() * 5 * 24 * 60 * 60 * 1000)).toISOString(), // Random date within last 5 days
    };
  });
};

const WorkflowStats: React.FC<WorkflowStatsProps> = ({ organizationName, repositoryName }) => {
  const { toast } = useToast();
  const context = repositoryName ? `${repositoryName} repository` : `${organizationName} organization`;
  
  const { data: workflowStats, isLoading, error } = useQuery({
    queryKey: ["workflow-stats", organizationName, repositoryName],
    queryFn: async () => {
      try {
        // In production, fetch from GitHub Actions API
        // For now, returning sample data
        return generateSampleWorkflowData(organizationName, repositoryName);
      } catch (error) {
        console.error("Failed to fetch workflow statistics:", error);
        toast({
          title: "Error",
          description: "Failed to load workflow statistics",
          variant: "destructive"
        });
        return [];
      }
    },
    enabled: !!organizationName && !!localStorage.getItem("github_token")
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex-row justify-between items-center">
          <div className="flex items-center">
            <Activity className="w-5 h-5 mr-2 text-muted-foreground" />
            <CardTitle>Workflow Statistics</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Skeleton className="h-40 w-full" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Workflow Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Failed to load workflow statistics</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row justify-between items-center">
        <div className="flex items-center">
          <Activity className="w-5 h-5 mr-2 text-muted-foreground" />
          <CardTitle>Workflow Statistics</CardTitle>
        </div>
        <div className="text-sm text-muted-foreground">
          Showing data for {context}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            success: { 
              color: "#16a34a", 
              label: "Success" 
            },
            failures: { 
              color: "#dc2626", 
              label: "Failures" 
            },
            skipped: { 
              color: "#d97706", 
              label: "Skipped" 
            },
          }}
          className="h-80 mt-4"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={workflowStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => [`${value}%`, '']} />
              <Legend />
              <Bar dataKey="success" stackId="a" fill="var(--color-success)" name="Success" />
              <Bar dataKey="failures" stackId="a" fill="var(--color-failures)" name="Failures" />
              <Bar dataKey="skipped" stackId="a" fill="var(--color-skipped)" name="Skipped" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="space-y-4 mt-8">
          <h3 className="text-lg font-medium">Workflow Status</h3>
          {workflowStats?.map((workflow) => (
            <div key={workflow.name} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  {workflow.success > 90 ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  ) : workflow.failures > 10 ? (
                    <XCircle className="h-4 w-4 text-red-500 mr-2" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                  )}
                  <p className="text-sm font-medium">{workflow.name}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                    {workflow.success}% success
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {workflow.total} runs
                  </span>
                </div>
              </div>
              <div className="h-2 mb-1">
                <Progress value={workflow.success} className="h-2" />
              </div>
              <p className="text-xs text-muted-foreground">
                Last run: {new Date(workflow.lastRun).toLocaleDateString()} ({new Date(workflow.lastRun).toLocaleTimeString()})
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowStats;
