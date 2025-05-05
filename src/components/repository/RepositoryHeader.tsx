
import React from "react";
import { ArrowLeft, Lock, Globe } from "lucide-react";
import { Button } from "@/components/ui-custom/Button";

interface RepositoryHeaderProps {
  repository: any;
  onBack: () => void;
}

const RepositoryHeader: React.FC<RepositoryHeaderProps> = ({ repository, onBack }) => {
  return (
    <div className="flex justify-between items-start">
      <div className="flex items-center">
        <Button 
          variant="outline" 
          size="sm" 
          className="mr-4"
          onClick={onBack}
          icon={<ArrowLeft className="h-4 w-4" />}
        >
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            {repository.name}
            <span className="ml-2">
              {repository.isPrivate ? (
                <Lock className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Globe className="h-5 w-5 text-muted-foreground" />
              )}
            </span>
          </h1>
          {repository.description && (
            <p className="text-muted-foreground mt-1">
              {repository.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RepositoryHeader;
