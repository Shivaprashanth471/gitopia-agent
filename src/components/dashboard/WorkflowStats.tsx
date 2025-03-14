
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui-custom/Card";
import { Progress } from "@/components/ui/progress";
import { ChartContainer } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { GitBranch, Activity, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchRepositoryWorkflows, fetchRepositoryWorkflowRuns, fetchWorkflowRuns, getGithubToken } from "@/lib/github";

interface WorkflowStatsProps {
  organizationName: string;
  repositoryName?: string;
}

interface WorkflowRun {
  id: number;
  name: string;
  workflow_id: number;
  status: string;
  conclusion: string | null;
  created_at: string;
  display_title: string;
}

interface ProcessedWorkflowData {
  name: string;
  success: number;
  failures: number;
  skipped: number;
  total: number;
  lastRun: string;
}

// Fetch workflow runs from GitHub API
const fetchAllWorkflowData = async (owner: string, repo: string) => {
  try {
    // Fetch all workflows
    const workflows = await fetchRepositoryWorkflows(owner, repo);
    
    // Fetch all workflow runs
    const workflowRuns = await fetchRepositoryWorkflowRuns(owner, repo);
    
    return { workflows, workflowRuns };
  } catch (error) {
    console.error("Failed to fetch workflow data:", error);
    throw error;
  }
};

// Process workflow runs data to get statistics
const processWorkflowData = (workflowRuns: any, workflows: any): ProcessedWorkflowData[] => {
  if (!workflowRuns?.workflow_runs || !workflows?.workflows) {
    return [];
  }
  
  const runs = workflowRuns.workflow_runs;
  
  // Create map of workflow IDs to names
  const workflowNames = new Map();
  workflows.workflows.forEach((wf: any) => {
    workflowNames.set(wf.id, {
      name: wf.name,
      path: wf.path
    });
  });
  
  // Group runs by workflow ID
  const workflowMap = new Map<number, WorkflowRun[]>();
  
  runs.forEach((run: WorkflowRun) => {
    const workflowId = run.workflow_id;
    if (!workflowMap.has(workflowId)) {
      workflowMap.set(workflowId, []);
    }
    workflowMap.get(workflowId)?.push(run);
  });
  
  // Calculate statistics for each workflow
  return Array.from(workflowMap.entries()).map(([workflowId, runs]) => {
    const workflow = workflowNames.get(workflowId);
    const workflowName = workflow ? workflow.name : "Unknown Workflow";
    
    // Extract workflow type from the path to categorize Build, Test, Quality, Deployment, etc.
    const workflowPath = workflow?.path || '';
    let inferredType = "Unknown";
    
    if (workflowPath) {
      const lcPath = workflowPath.toLowerCase();
      if (lcPath.includes('build')) inferredType = "Build";
      else if (lcPath.includes('test') && lcPath.includes('integration')) inferredType = "Integration Tests";
      else if (lcPath.includes('test') && lcPath.includes('unit')) inferredType = "Unit Tests";
      else if (lcPath.includes('test')) inferredType = "Tests";
      else if (lcPath.includes('lint') || lcPath.includes('quality')) inferredType = "Code Quality";
      else if (lcPath.includes('deploy')) inferredType = "Deployment";
      else if (lcPath.includes('release')) inferredType = "Release";
      else if (lcPath.includes('pr') || lcPath.includes('pull')) inferredType = "PR Checks";
    }
    
    // Display the inferred type as part of the name if available
    const displayName = inferredType !== "Unknown" ? `${inferredType} (${workflowName})` : workflowName;
    
    const total = runs.length;
    const successes = runs.filter(run => run.conclusion === "success").length;
    const failures = runs.filter(run => run.conclusion === "failure").length;
    const skipped = runs.filter(run => run.conclusion === "skipped" || run.conclusion === "cancelled").length;
    
    // Calculate percentages
    const successPercent = total > 0 ? Math.round((successes / total) * 100) : 0;
    const failurePercent = total > 0 ? Math.round((failures / total) * 100) : 0;
    const skippedPercent = total > 0 ? 100 - successPercent - failurePercent : 0;
    
    // Find the most recent run
    const sortedRuns = [...runs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const lastRun = sortedRuns.length > 0 ? sortedRuns[0].created_at : new Date().toISOString();
    
    return {
      name: displayName,
      success: successPercent,
      failures: failurePercent,
      skipped: skippedPercent,
      total,
      lastRun
    };
  });
};

// Generate sample data for fallback or demo mode
const generateSampleWorkflowData = (orgName: string, repoName?: string) => {
  // Use seed-based generation for consistency
  let seed = 0;
  const nameToUse = repoName || orgName;
  for (let i = 0; i < nameToUse.length; i++) {
    seed += nameToUse.charCodeAt(i);
  }
  
  // Create more realistic workflow types
  const workflowTypes = [
    "Build", 
    "Unit Tests", 
    "Integration Tests", 
    "Code Quality", 
    "Deployment"
  ];
  
  return workflowTypes.map(workflowType => {
    // Generate realistic success percentages based on workflow type
    let baseSuccess = 70;
    if (workflowType === "Build") baseSuccess = 85;
    else if (workflowType === "Unit Tests") baseSuccess = 80;
    else if (workflowType === "Deployment") baseSuccess = 75;
    
    // Add some variance based on seed
    const variance = (seed % 20) - 10; // -10 to +10
    let success = Math.min(100, Math.max(50, baseSuccess + variance));
    
    const failures = Math.min(30, 100 - success - Math.min(10, seed % 15));
    const skipped = 100 - success - failures;
    
    return {
      name: workflowType,
      success: success,
      failures: failures,
      skipped: skipped,
      total: 10 + (seed % 30), // Total runs
      lastRun: new Date(Date.now() - (seed % 5) * 24 * 60 * 60 * 1000).toISOString(), // Recent date
    };
  });
};

const WorkflowStats: React.FC<WorkflowStatsProps> = ({ organizationName, repositoryName }) => {
  const { toast } = useToast();
  const context = repositoryName ? `${repositoryName} repository` : `${organizationName} organization`;
  const [isUsingRealData, setIsUsingRealData] = useState(false);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["workflow-data", organizationName, repositoryName],
    queryFn: async () => {
      if (!repositoryName) return null;
      try {
        const data = await fetchAllWorkflowData(organizationName, repositoryName);
        setIsUsingRealData(true);
        return data;
      } catch (error) {
        console.error("Failed to fetch workflow data:", error);
        setIsUsingRealData(false);
        return null;
      }
    },
    enabled: !!organizationName && !!repositoryName && !!getGithubToken()
  });
  
  // Process the workflow data if available
  const workflowStats = React.useMemo(() => {
    if (data?.workflowRuns && data?.workflows) {
      return processWorkflowData(data.workflowRuns, data.workflows);
    }
    
    // Fallback to sample data
    if (error || !data || !repositoryName) {
      return generateSampleWorkflowData(organizationName, repositoryName);
    }
    
    return [];
  }, [data, error, organizationName, repositoryName]);

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

  if (workflowStats.length === 0) {
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
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground">No workflow data available</p>
            {!isUsingRealData && repositoryName && (
              <p className="text-sm text-muted-foreground mt-2">
                Using sample data as a placeholder
              </p>
            )}
          </div>
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
          {!isUsingRealData && " (sample data)"}
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
