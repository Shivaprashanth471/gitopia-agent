
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Star, GitFork, Clock, Lock, Globe } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui-custom/Card";
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";

interface RepositoryOverviewProps {
  repository: any;
  selectedRepo: any;
}

const RepositoryOverview: React.FC<RepositoryOverviewProps> = ({ repository, selectedRepo }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex-row justify-between items-center">
            <div className="flex items-center">
              <Star className="w-5 h-5 mr-2 text-muted-foreground" />
              <CardTitle>Stars</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{selectedRepo?.stargazers_count || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex-row justify-between items-center">
            <div className="flex items-center">
              <GitFork className="w-5 h-5 mr-2 text-muted-foreground" />
              <CardTitle>Forks</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{selectedRepo?.forks_count || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex-row justify-between items-center">
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-muted-foreground" />
              <CardTitle>Updated</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p>{formatDistanceToNow(new Date(repository.updatedAt))} ago</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Repository Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Owner</TableCell>
                <TableCell>{selectedRepo?.owner?.login || "Unknown"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Default Branch</TableCell>
                <TableCell>{selectedRepo?.default_branch || "main"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Created</TableCell>
                <TableCell>{new Date(repository.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Language</TableCell>
                <TableCell>{selectedRepo?.language || "Not specified"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Visibility</TableCell>
                <TableCell>{repository.isPrivate ? "Private" : "Public"}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default RepositoryOverview;
