
import React, { useState } from "react";
import { Button } from "@/components/ui-custom/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui-custom/Card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { BookTemplate, GitBranch } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { mockOrganizations } from "@/lib/types";

const repositorySchema = z.object({
  name: z.string()
    .min(1, "Repository name is required")
    .max(50)
    .regex(/^[a-zA-Z0-9_.-]+$/, "Repository name can only contain letters, numbers, hyphens, underscores, and periods"),
  description: z.string().max(200).optional(),
  owner: z.string().min(1, "Owner is required"),
  isPrivate: z.boolean().default(false),
  includeReadme: z.boolean().default(true),
});

type RepositoryFormValues = z.infer<typeof repositorySchema>;

const CreateRepositoryForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<RepositoryFormValues>({
    resolver: zodResolver(repositorySchema),
    defaultValues: {
      name: "",
      description: "",
      owner: "personal",
      isPrivate: false,
      includeReadme: true,
    },
  });

  const onSubmit = async (data: RepositoryFormValues) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Creating repository:", data);
      toast.success("Repository created successfully");
      form.reset();
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Repository</CardTitle>
        <CardDescription>
          Create a new repository to store and collaborate on your code.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="owner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Owner</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select owner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">Personal Account</SelectItem>
                        {mockOrganizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Choose who will own this repository.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repository Name</FormLabel>
                  <FormControl>
                    <Input placeholder="my-awesome-project" {...field} />
                  </FormControl>
                  <FormDescription>
                    Use letters, numbers, hyphens, underscores, and periods.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your repository..." 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    A short description of your repository.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isPrivate"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Privacy</FormLabel>
                    <FormDescription>
                      {field.value
                        ? "Private repositories are only visible to you and people you explicitly grant access."
                        : "Public repositories are visible to anyone."}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="includeReadme"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5 flex items-center">
                    <BookTemplate className="w-5 h-5 mr-2 text-muted-foreground" />
                    <div>
                      <FormLabel className="text-base">Initialize with README</FormLabel>
                      <FormDescription>
                        Create a README.md file with some initial content.
                      </FormDescription>
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <CardFooter className="px-0 pb-0 pt-4 flex justify-end">
              <Button type="submit" isLoading={isLoading} icon={<GitBranch className="w-4 h-4" />}>
                Create Repository
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreateRepositoryForm;
