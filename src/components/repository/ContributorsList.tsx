
import React from "react";
import { Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui-custom/Card";

interface ContributorsListProps {
  repository: any;
}

const ContributorsList: React.FC<ContributorsListProps> = ({ repository }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contributors</CardTitle>
      </CardHeader>
      <CardContent>
        {repository.collaborators && repository.collaborators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {repository.collaborators.map((collaborator: any) => (
              <div key={collaborator.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  {collaborator.user?.avatarUrl ? (
                    <img src={collaborator.user.avatarUrl} alt={collaborator.user.name} className="w-10 h-10 rounded-full" />
                  ) : (
                    <Users className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{collaborator.user?.name || collaborator.user?.username}</p>
                  <p className="text-sm text-muted-foreground capitalize">{collaborator.permission} access</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No contributors found</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ContributorsList;
