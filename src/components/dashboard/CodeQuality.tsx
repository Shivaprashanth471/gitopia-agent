
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui-custom/Card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Circle, AlertCircle, CheckCircle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface CodeQualityProps {
  organizationName: string;
}

interface CodeMetric {
  name: string;
  value: number;
  status: "good" | "warning" | "critical";
  description: string;
}

// Sample data for visualization, will be replaced with real data in production
const generateSampleCodeQuality = () => {
  return {
    metrics: [
      {
        name: "Code Coverage",
        value: Math.floor(Math.random() * 20) + 80,
        status: "good",
        description: "Percentage of code covered by tests"
      },
      {
        name: "Duplication",
        value: Math.floor(Math.random() * 10),
        status: "good",
        description: "Percentage of duplicated code"
      },
      {
        name: "Technical Debt",
        value: Math.floor(Math.random() * 4) + 2,
        status: Math.random() > 0.7 ? "warning" : "good",
        description: "Hours needed to fix all issues"
      },
      {
        name: "Code Smells",
        value: Math.floor(Math.random() * 50),
        status: Math.random() > 0.8 ? "critical" : "warning",
        description: "Number of code smells detected"
      },
      {
        name: "Bugs",
        value: Math.floor(Math.random() * 5),
        status: Math.random() > 0.7 ? "critical" : "warning",
        description: "Number of bugs detected"
      }
    ],
    issues: Array.from({ length: 5 }, (_, i) => ({
      id: `ISSUE-${i + 1}`,
      title: `Issue #${i + 1}: ${["Missing error handling", "Unused variable", "Complex method", "Hardcoded value", "Uncaught exception"][i]}`,
      severity: ["critical", "high", "medium", "low", "info"][i],
      path: `src/components/Sample${i + 1}.tsx`,
      line: Math.floor(Math.random() * 200) + 1
    }))
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

const CodeQuality: React.FC<CodeQualityProps> = ({ organizationName }) => {
  const { data: codeQuality, isLoading, error } = useQuery({
    queryKey: ["code-quality", organizationName],
    queryFn: async () => {
      try {
        // In production, fetch from SonarQube API
        // For now, returning sample data
        return generateSampleCodeQuality();
      } catch (error) {
        console.error("Failed to fetch code quality metrics:", error);
        return { metrics: [], issues: [] };
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
          <Search className="w-5 h-5 mr-2 text-muted-foreground" />
          <CardTitle>Code Quality</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
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
                    <p className="text-2xl font-bold">{metric.value}{metric.name.includes("Percentage") ? "%" : ""}</p>
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
