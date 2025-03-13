
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui-custom/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui-custom/Card";
import { AlertCircle, CheckCircle, Github, ShieldAlert } from "lucide-react";
import { getGithubToken, setGithubToken, clearGithubToken } from "@/lib/github";

interface GitHubTokenInputProps {
  onTokenSet?: () => void;
}

const GitHubTokenInput: React.FC<GitHubTokenInputProps> = ({ onTokenSet }) => {
  const [token, setToken] = useState("");
  const [hasToken, setHasToken] = useState(!!getGithubToken());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setHasToken(!!getGithubToken());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;

    setIsLoading(true);
    // Save token to localStorage
    const success = setGithubToken(token);

    if (success) {
      setHasToken(true);
      setToken("");
      if (onTokenSet) onTokenSet();
    }
    
    setIsLoading(false);
  };

  const handleClearToken = () => {
    clearGithubToken();
    setHasToken(false);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center">
          <Github className="mr-2 h-5 w-5" />
          GitHub Authentication
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasToken ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center text-green-500">
              <CheckCircle className="mr-2 h-5 w-5" />
              <span>GitHub token is set</span>
            </div>
            <Button variant="destructive" size="sm" onClick={handleClearToken}>
              Remove Token
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800/30">
                <div className="flex items-center">
                  <ShieldAlert className="h-4 w-4 mr-2" />
                  <span>
                    Your token is stored locally in your browser and is not sent to our servers.
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="github-token">GitHub Personal Access Token</Label>
                <Input
                  id="github-token"
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_..."
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Create a token with <code>repo</code>, <code>read:org</code>, and <code>user</code> scopes at{" "}
                  <a 
                    href="https://github.com/settings/tokens/new" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-primary hover:underline"
                  >
                    GitHub Token Settings
                  </a>
                </p>
              </div>
            </div>
            
            <CardFooter className="px-0 py-4">
              <Button type="submit" isLoading={isLoading} className="w-full">
                Set GitHub Token
              </Button>
            </CardFooter>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default GitHubTokenInput;
