
import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui-custom/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui-custom/Card";
import { Skeleton } from "@/components/ui/skeleton";
import TransitionWrapper from "@/components/ui-custom/TransitionWrapper";

interface LoadingStateProps {
  onBack: () => void;
}

const LoadingState: React.FC<LoadingStateProps> = ({ onBack }) => {
  return (
    <div className="space-y-8">
      <TransitionWrapper show={true} animation="fade" duration={500}>
        <div className="flex items-center mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            className="mr-4"
            onClick={onBack}
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
};

export default LoadingState;
