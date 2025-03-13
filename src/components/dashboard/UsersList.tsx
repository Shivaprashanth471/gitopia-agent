
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui-custom/Card";
import { User, mockUsers } from "@/lib/types";
import { Users } from "lucide-react";

interface UsersListProps {
  limit?: number;
  showTitle?: boolean;
}

const UsersList: React.FC<UsersListProps> = ({ limit, showTitle = true }) => {
  const users = limit ? mockUsers.slice(0, limit) : mockUsers;

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
          {users.map((user) => (
            <UserItem key={user.id} user={user} />
          ))}
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
        <h4 className="text-base font-medium truncate">{user.name}</h4>
        <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
      </div>
    </li>
  );
};

export default UsersList;
