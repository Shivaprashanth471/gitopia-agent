
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui-custom/Card";
import { User } from "@/lib/types";
import { Users } from "lucide-react";
import { fetchOrganizationMembers, transformGithubUser } from "@/lib/github";
import { Skeleton } from "@/components/ui/skeleton";

interface UsersListProps {
  limit?: number;
  showTitle?: boolean;
  organizationId?: string;
  organizationName?: string;
}

const UsersList: React.FC<UsersListProps> = ({ 
  limit, 
  showTitle = true,
  organizationId,
  organizationName
}) => {
  const { 
    data: users = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['users', { organizationId, organizationName }],
    queryFn: async () => {
      try {
        if (!organizationName) {
          // Without an organization name, we can't fetch members
          return [];
        }
        
        const members = await fetchOrganizationMembers(organizationName);
        return members.map((user: any) => transformGithubUser(user));
      } catch (error) {
        console.error("Failed to fetch users:", error);
        return [];
      }
    },
    enabled: !!localStorage.getItem("github_token") && !!organizationName
  });

  const displayedUsers = limit ? users.slice(0, limit) : users;

  if (isLoading) {
    return (
      <Card>
        {showTitle && (
          <CardHeader className="flex-row justify-between items-center">
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-muted-foreground" />
              <CardTitle>Users</CardTitle>
            </div>
          </CardHeader>
        )}
        <CardContent className={showTitle ? "p-0" : ""}>
          <div className="divide-y divide-border">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        {showTitle && (
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <p className="text-red-500">Failed to load users</p>
        </CardContent>
      </Card>
    );
  }

  if (users.length === 0 && organizationName) {
    return (
      <Card>
        {showTitle && (
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <p className="text-muted-foreground py-4 text-center">
            No users found for this organization
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!organizationName) {
    return (
      <Card>
        {showTitle && (
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <p className="text-muted-foreground py-4 text-center">
            Select an organization to view its members
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader className="flex-row justify-between items-center">
          <div className="flex items-center">
            <Users className="w-5 h-5 mr-2 text-muted-foreground" />
            <CardTitle>Users</CardTitle>
          </div>
        </CardHeader>
      )}
      <CardContent className={showTitle ? "p-0" : ""}>
        <ul className="divide-y divide-border">
          {displayedUsers.map((user) => (
            <UserItem key={user.id} user={user} />
          ))}
          {displayedUsers.length === 0 && (
            <li className="py-8 text-center">
              <p className="text-muted-foreground">No users found</p>
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
};

interface UserItemProps {
  user: User;
}

const UserItem: React.FC<UserItemProps> = ({ user }) => {
  return (
    <li className="transition-colors hover:bg-muted/10 p-4 flex items-center space-x-3">
      <div className="flex-shrink-0">
        <img
          src={user.avatarUrl}
          alt={user.name || user.username}
          className="w-10 h-10 rounded-full shadow-sm object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-base font-medium truncate">{user.name || user.username}</h4>
        <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
      </div>
    </li>
  );
};

export default UsersList;
