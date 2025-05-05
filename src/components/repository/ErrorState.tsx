
import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui-custom/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui-custom/Card";

interface ErrorStateProps {
  onBack: () => void;
  onReturnToList: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ onBack, onReturnToList }) => {
  return (
    <div className="space-y-8">
      <Button 
        variant="outline" 
        className="mb-6"
        onClick={onBack}
        icon={<ArrowLeft className="h-4 w-4" />}
      >
        Back to Repositories
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Repository Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">The repository you're looking for doesn't exist or you don't have access to it.</p>
          <Button 
            className="mt-4" 
            onClick={onReturnToList}
          >
            Return to Repository List
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorState;
