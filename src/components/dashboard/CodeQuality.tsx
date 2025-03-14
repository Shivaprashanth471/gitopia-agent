
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui-custom/Card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Circle, AlertCircle, CheckCircle, Code } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui-custom/Button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";

interface CodeQualityProps {
  organizationName: string;
  repositoryName?: string;
}

interface CodeMetric {
  name: string;
  value: number;
  status: "good" | "warning" | "critical";
  description: string;
}

interface SonarQubeIssue {
  id: string;
  title: string;
  severity: string;
  path: string;
  line: number;
}

// Sample data generator as fallback
const generateSampleCodeQuality = (orgName: string, repoName?: string) => {
  // Use the repo name to create more realistic/consistent values
  let seed = 0;
  if (repoName) {
    for (let i = 0; i < repoName.length; i++) {
      seed += repoName.charCodeAt(i);
    }
  } else {
    for (let i = 0; i < orgName.length; i++) {
      seed += orgName.charCodeAt(i);
    }
  }
  
  // Generate semi-consistent metrics based on seed
  const coverage = Math.floor((seed % 30) + 65); // 65-95%
  const duplication = Math.floor((seed % 12) + 1); // 1-13%
  const technicalDebt = Math.floor((seed % 10) + 1); // 1-11 hours
  const codeSmells = Math.floor((seed % 60) + 5); // 5-65
  const bugs = Math.floor((seed % 8)); // 0-8
  
  return {
    metrics: [
      {
        name: "Code Coverage",
        value: coverage,
        status: coverage > 80 ? "good" : coverage > 70 ? "warning" : "critical",
        description: "Percentage of code covered by tests"
      },
      {
        name: "Duplication",
        value: duplication,
        status: duplication < 5 ? "good" : duplication < 10 ? "warning" : "critical",
        description: "Percentage of duplicated code"
      },
      {
        name: "Technical Debt",
        value: technicalDebt,
        status: technicalDebt < 4 ? "good" : technicalDebt < 8 ? "warning" : "critical",
        description: "Hours needed to fix all issues"
      },
      {
        name: "Code Smells",
        value: codeSmells,
        status: codeSmells < 20 ? "good" : codeSmells < 40 ? "warning" : "critical",
        description: "Number of code smells detected"
      },
      {
        name: "Bugs",
        value: bugs,
        status: bugs < 2 ? "good" : bugs < 4 ? "warning" : "critical",
        description: "Number of bugs detected"
      }
    ],
    issues: [
      {
        id: `ISSUE-1-${repoName || orgName}`,
        title: "Missing error handling in API calls",
        severity: "high",
        path: `src/api/${repoName || 'services'}/index.ts`,
        line: 42 + (seed % 30)
      },
      {
        id: `ISSUE-2-${repoName || orgName}`,
        title: "Unused variables in component",
        severity: "medium",
        path: `src/components/${repoName || 'shared'}/Button.tsx`,
        line: 13 + (seed % 20)
      },
      {
        id: `ISSUE-3-${repoName || orgName}`,
        title: "Complex method exceeds cognitive complexity threshold",
        severity: "high",
        path: `src/utils/${repoName ? repoName.toLowerCase() : 'helpers'}.ts`,
        line: 87 + (seed % 50)
      },
      {
        id: `ISSUE-4-${repoName || orgName}`,
        title: "Hardcoded credentials detected",
        severity: "critical",
        path: `src/config/${repoName || 'env'}.ts`,
        line: 7 + (seed % 10)
      },
      {
        id: `ISSUE-5-${repoName || orgName}`,
        title: "Potential memory leak in event listener",
        severity: "medium",
        path: `src/hooks/use${repoName || 'Data'}.ts`,
        line: 32 + (seed % 25)
      }
    ],
    sonarQubeConnected: false // In real app, this would be true if SonarQube token is configured
  };
};

// SonarQube token management
const getSonarQubeToken = () => localStorage.getItem("sonarqube_token");

// Fixed - make sure setSonarQubeToken actually saves the token and provides feedback
const setSonarQubeToken = (token: string) => {
  localStorage.setItem("sonarqube_token", token);
  toast.success("SonarQube token saved successfully");
  return true;
};

// Function to fetch metrics from SonarQube
const fetchSonarQubeMetrics = async (projectKey: string) => {
  const token = getSonarQubeToken();
  if (!token) throw new Error("SonarQube token not found");

  // SonarQube API endpoint for metrics
  const url = `https://sonarcloud.io/api/measures/component?component=${projectKey}&metricKeys=coverage,duplicated_lines_density,sqale_index,code_smells,bugs`;
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch SonarQube metrics: ${response.status}`);
  }

  return await response.json();
};

// Function to fetch issues from SonarQube
const fetchSonarQubeIssues = async (projectKey: string) => {
  const token = getSonarQubeToken();
  if (!token) throw new Error("SonarQube token not found");

  // SonarQube API endpoint for issues
  const url = `https://sonarcloud.io/api/issues/search?componentKeys=${projectKey}&resolved=false&ps=10`;
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch SonarQube issues: ${response.status}`);
  }

  return await response.json();
};

// Process SonarQube metrics into our format
const processSonarQubeMetrics = (data: any): CodeMetric[] => {
  if (!data || !data.component || !data.component.measures) {
    return [];
  }

  const measures = data.component.measures;
  const metricsMap = new Map();
  
  measures.forEach((measure: any) => {
    metricsMap.set(measure.metric, measure.value);
  });
  
  const metrics: CodeMetric[] = [];
  
  // Coverage
  const coverage = parseFloat(metricsMap.get("coverage") || "0");
  metrics.push({
    name: "Code Coverage",
    value: coverage,
    status: coverage > 80 ? "good" : coverage > 70 ? "warning" : "critical",
    description: "Percentage of code covered by tests"
  });
  
  // Duplication
  const duplication = parseFloat(metricsMap.get("duplicated_lines_density") || "0");
  metrics.push({
    name: "Duplication",
    value: duplication,
    status: duplication < 5 ? "good" : duplication < 10 ? "warning" : "critical",
    description: "Percentage of duplicated code"
  });
  
  // Technical Debt (sqale_index is in minutes, convert to hours)
  const debtMinutes = parseInt(metricsMap.get("sqale_index") || "0");
  const debtHours = Math.ceil(debtMinutes / 60);
  metrics.push({
    name: "Technical Debt",
    value: debtHours,
    status: debtHours < 4 ? "good" : debtHours < 8 ? "warning" : "critical",
    description: "Hours needed to fix all issues"
  });
  
  // Code Smells
  const codeSmells = parseInt(metricsMap.get("code_smells") || "0");
  metrics.push({
    name: "Code Smells",
    value: codeSmells,
    status: codeSmells < 20 ? "good" : codeSmells < 40 ? "warning" : "critical",
    description: "Number of code smells detected"
  });
  
  // Bugs
  const bugs = parseInt(metricsMap.get("bugs") || "0");
  metrics.push({
    name: "Bugs",
    value: bugs,
    status: bugs < 2 ? "good" : bugs < 4 ? "warning" : "critical",
    description: "Number of bugs detected"
  });
  
  return metrics;
};

// Process SonarQube issues into our format
const processSonarQubeIssues = (data: any): SonarQubeIssue[] => {
  if (!data || !data.issues) {
    return [];
  }
  
  return data.issues.map((issue: any) => ({
    id: issue.key,
    title: issue.message,
    severity: issue.severity.toLowerCase(),
    path: issue.component.split(':').pop() || "",
    line: issue.line || 0
  }));
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "good":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "warning":
      return <AlertCircle className="h-5 w-5 text-amber-500" />;
    case "critical":
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Circle className="h-5 w-5 text-gray-400" />;
  }
};

const CodeQuality: React.FC<CodeQualityProps> = ({ organizationName, repositoryName }) => {
  const { toast: useToastHook } = useToast();
  const [tokenInput, setTokenInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSonarQubeToken, setHasSonarQubeToken] = useState(!!getSonarQubeToken());
  
  // Check if token exists on component mount
  useEffect(() => {
    setHasSonarQubeToken(!!getSonarQubeToken());
  }, []);
  
  const context = repositoryName 
    ? `${repositoryName} repository` 
    : `${organizationName} organization`;
    
  const projectKey = repositoryName 
    ? `${organizationName}_${repositoryName}` 
    : organizationName;
    
  const { data: sonarMetrics, isLoading: isLoadingMetrics, error: metricsError, refetch: refetchMetrics } = useQuery({
    queryKey: ["sonar-metrics", projectKey, hasSonarQubeToken],
    queryFn: async () => {
      try {
        return await fetchSonarQubeMetrics(projectKey);
      } catch (error) {
        console.error("Failed to fetch SonarQube metrics:", error);
        return null;
      }
    },
    enabled: !!repositoryName && hasSonarQubeToken
  });
  
  const { data: sonarIssues, isLoading: isLoadingIssues, error: issuesError, refetch: refetchIssues } = useQuery({
    queryKey: ["sonar-issues", projectKey, hasSonarQubeToken],
    queryFn: async () => {
      try {
        return await fetchSonarQubeIssues(projectKey);
      } catch (error) {
        console.error("Failed to fetch SonarQube issues:", error);
        return null;
      }
    },
    enabled: !!repositoryName && hasSonarQubeToken
  });
  
  const isLoading = isLoadingMetrics || isLoadingIssues;
  const error = metricsError || issuesError;
  
  // Process real data or fallback to sample data
  const hasRealData = hasSonarQubeToken && sonarMetrics && sonarIssues;
  
  const codeQuality = React.useMemo(() => {
    if (hasRealData) {
      return {
        metrics: processSonarQubeMetrics(sonarMetrics),
        issues: processSonarQubeIssues(sonarIssues),
        sonarQubeConnected: true
      };
    }
    
    // Fallback to sample data
    return generateSampleCodeQuality(organizationName, repositoryName);
  }, [sonarMetrics, sonarIssues, hasRealData, organizationName, repositoryName]);

  // Fixed - Make sure handleConnectSonarQube saves the token and updates the state
  const handleConnectSonarQube = () => {
    if (!tokenInput.trim()) {
      toast.error("Please enter a SonarQube token");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Save token to localStorage
      setSonarQubeToken(tokenInput);
      
      // Update state
      setHasSonarQubeToken(true);
      
      // Reset input and submitting state
      setTokenInput("");
      
      // Refetch data with new token
      refetchMetrics();
      refetchIssues();
    } catch (error) {
      toast.error("Failed to save SonarQube token");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex-row justify-between items-center">
          <div className="flex items-center">
            <Search className="w-5 h-5 mr-2 text-muted-foreground" />
            <CardTitle>Code Quality</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error && hasSonarQubeToken) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Code Quality</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Failed to load code quality metrics</p>
          <p className="text-sm text-muted-foreground mt-2">
            There was an error connecting to SonarQube. Please check your token and project configuration.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row justify-between items-center">
        <div className="flex items-center">
          <Code className="w-5 h-5 mr-2 text-muted-foreground" />
          <CardTitle>Code Quality</CardTitle>
        </div>
        <div className="text-sm text-muted-foreground">
          Showing data for {context}
          {!codeQuality?.sonarQubeConnected && " (sample data)"}
        </div>
      </CardHeader>
      <CardContent>
        {!codeQuality?.sonarQubeConnected && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
            <h3 className="text-amber-800 font-medium flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              SonarQube not connected
            </h3>
            <p className="text-amber-700 text-sm mt-1">
              For real code quality metrics, please connect your SonarQube account. Currently showing sample data.
            </p>
            <div className="mt-3 space-y-3">
              <Input 
                placeholder="Enter SonarQube token"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                type="password"
              />
              <Button 
                size="sm" 
                onClick={handleConnectSonarQube}
                disabled={isSubmitting}
              >
                Connect SonarQube
              </Button>
            </div>
          </div>
        )}

        <Tabs defaultValue="metrics">
          <TabsList className="mb-4">
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
          </TabsList>
          
          <TabsContent value="metrics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {codeQuality?.metrics.map((metric: CodeMetric) => (
                <div key={metric.name} className="border rounded-lg p-4 flex items-start space-x-4">
                  {getStatusIcon(metric.status)}
                  <div>
                    <h3 className="font-medium">{metric.name}</h3>
                    <p className="text-2xl font-bold">{metric.value}{metric.name.includes("Coverage") || metric.name.includes("Duplication") ? "%" : ""}</p>
                    <p className="text-sm text-muted-foreground">{metric.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="issues">
            <div className="space-y-3">
              {codeQuality?.issues.map((issue) => (
                <div key={issue.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{issue.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {issue.path}:{issue.line}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      issue.severity === "critical" ? "bg-red-100 text-red-800" :
                      issue.severity === "high" ? "bg-orange-100 text-orange-800" :
                      issue.severity === "medium" ? "bg-amber-100 text-amber-800" :
                      issue.severity === "low" ? "bg-blue-100 text-blue-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {issue.severity}
                    </span>
                  </div>
                </div>
              ))}
              {codeQuality?.issues.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No issues found</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CodeQuality;
