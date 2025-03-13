
import React, { useState } from "react";
import TransitionWrapper from "@/components/ui-custom/TransitionWrapper";
import { Button } from "@/components/ui-custom/Button";
import UsersList from "@/components/dashboard/UsersList";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui-custom/Card";
import { Input } from "@/components/ui/input";
import { SearchIcon, UserPlus } from "lucide-react";

const Users: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-8">
      <TransitionWrapper show={true} animation="fade" duration={500}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Users</h1>
            <p className="text-muted-foreground mt-1">
              Find and manage users in your organizations and repositories
            </p>
          </div>
          <Button icon={<UserPlus className="h-4 w-4" />}>
            Invite User
          </Button>
        </div>
      </TransitionWrapper>

      <TransitionWrapper show={true} animation="fade" duration={300} className="delay-100">
        <Card>
          <CardHeader>
            <CardTitle>Search Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by username, name, or email..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </TransitionWrapper>

      <TransitionWrapper show={true} animation="scale" duration={300} className="delay-200">
        <UsersList />
      </TransitionWrapper>
    </div>
  );
};

export default Users;
