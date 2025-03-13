
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui-custom/Card";
import { Progress } from "@/components/ui/progress";
import { ChartContainer } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { GitBranch, Activity } from "lucide-react";

interface WorkflowStatsProps {
  organizationName: string;
}

// Sample data for visualization, will be replaced with real data in production
const generateSampleWorkflowData = (orgName: string) => {
  const workflows = ["CI", "CD", "Tests", "Build"];
  return workflows.map(workflow => ({
    name: workflow,
    success: Math.floor(Math.random() * 40) + 60, // 60-100% success rate
    failures: Math.floor(Math.random() * 20), // 0-20% failure rate
    skipped: Math.floor(Math.random() * 10), // 0-10% skipped rate
  }));
};

const WorkflowStats: React.FC<WorkflowStatsProps> = ({ organizationName }) => {
  const { data: workflowStats, isLoading, error } = useQuery({
    queryKey: ["workflow-stats", organizationName],
    queryFn: async () => {
      try {
        // In production, fetch from GitHub Actions API
        // For now, returning sample data
        return generateSampleWorkflowData(organizationName);
      } catch (error) {
        console.error("Failed to fetch workflow statistics:", error);
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
          <BarChart data={workflowStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="success" stackId="a" fill="var(--color-success)" name="Success" />
            <Bar dataKey="failures" stackId="a" fill="var(--color-failures)" name="Failures" />
            <Bar dataKey="skipped" stackId="a" fill="var(--color-skipped)" name="Skipped" />
          </BarChart>
        </ChartContainer>

        <div className="space-y-4 mt-8">
          {workflowStats?.map((workflow) => (
            <div key={workflow.name} className="space-y-2">
              <div className="flex justify-between">
                <p className="text-sm font-medium">{workflow.name}</p>
                <p className="text-sm text-muted-foreground">{workflow.success}% success rate</p>
              </div>
              <div className="h-2">
                <Progress value={workflow.success} className="h-2" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowStats;
