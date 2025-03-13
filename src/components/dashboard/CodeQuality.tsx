
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui-custom/Card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Circle, AlertCircle, CheckCircle, Code } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui-custom/Button";
import { useToast } from "@/hooks/use-toast";

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

// Sample data for visualization, will be replaced with real SonarQube data in production
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
  const { toast } = useToast();
  const context = repositoryName 
    ? `${repositoryName} repository` 
    : `${organizationName} organization`;
  
  const { data: codeQuality, isLoading, error } = useQuery({
    queryKey: ["code-quality", organizationName, repositoryName],
    queryFn: async () => {
      try {
        // In production, fetch from SonarQube API
        // For now, returning sample data
        return generateSampleCodeQuality(organizationName, repositoryName);
      } catch (error) {
        console.error("Failed to fetch code quality metrics:", error);
        toast({
          title: "Error",
          description: "Failed to load code quality metrics",
          variant: "destructive"
        });
        return { metrics: [], issues: [], sonarQubeConnected: false };
      }
    },
    enabled: !!organizationName && !!localStorage.getItem("github_token")
  });

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

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Code Quality</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Failed to load code quality metrics</p>
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
            <Button size="sm" className="mt-3">
              Connect SonarQube
            </Button>
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
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CodeQuality;
