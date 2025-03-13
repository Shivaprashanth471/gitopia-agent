
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui-custom/Card";
import { Button } from "@/components/ui-custom/Button";
import { Organization, mockOrganizations } from "@/lib/types";
import { Users, Plus, Lock, Globe } from "lucide-react";

interface OrganizationsListProps {
  limit?: number;
}

const OrganizationsList: React.FC<OrganizationsListProps> = ({ limit }) => {
  const organizations = limit ? mockOrganizations.slice(0, limit) : mockOrganizations;

  return (
    <Card>
      <CardHeader className="flex-row justify-between items-center">
        <div className="flex items-center">
          <Users className="w-5 h-5 mr-2 text-muted-foreground" />
          <CardTitle>Organizations</CardTitle>
        </div>
        <Link to="/organizations">
          <Button
            variant="ghost"
            size="sm"
            icon={<Plus className="h-4 w-4" />}
          >
            New
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {organizations.map((org) => (
            <OrganizationItem key={org.id} organization={org} />
          ))}
        </ul>
        {limit && organizations.length < mockOrganizations.length && (
          <div className="p-4">
            <Link to="/organizations" className="text-sm text-primary hover:underline">
              View all organizations
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface OrganizationItemProps {
  organization: Organization;
}

const OrganizationItem: React.FC<OrganizationItemProps> = ({ organization }) => {
  return (
    <li className="transition-colors hover:bg-muted/10">
      <Link to={`/organizations/${organization.id}`} className="block p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-4">
            <img
              src={organization.avatarUrl}
              alt={organization.name}
              className="w-10 h-10 rounded-md shadow-sm"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center">
              <h4 className="text-base font-medium truncate">{organization.name}</h4>
              <div className="ml-2 flex-shrink-0">
                {organization.isPublic ? (
                  <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </div>
            </div>
            {organization.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                {organization.description}
              </p>
            )}
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <Users className="w-3.5 h-3.5 mr-1" />
              <span>{organization.members.length} members</span>
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
};

export default OrganizationsList;
