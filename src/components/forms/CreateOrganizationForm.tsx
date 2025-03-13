
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Users, Upload } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const organizationSchema = z.object({
  name: z.string().min(1, "Organization name is required").max(50),
  description: z.string().max(200).optional(),
  isPublic: z.boolean().default(true),
});

type OrganizationFormValues = z.infer<typeof organizationSchema>;

const CreateOrganizationForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
      description: "",
      isPublic: true,
    },
  });

  const onSubmit = async (data: OrganizationFormValues) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Creating organization:", data);
      toast.success("Organization created successfully");
      form.reset();
      setAvatarPreview(null);
      setIsLoading(false);
    }, 1000);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Organization</CardTitle>
        <CardDescription>
          Create a new organization to collaborate with others on repositories.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-24 h-24 rounded-md border-2 border-dashed border-border flex items-center justify-center bg-muted/20 overflow-hidden">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Users className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>
                <label className="cursor-pointer">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <div className="flex items-center text-sm text-primary">
                    <Upload className="w-4 h-4 mr-1" />
                    <span>Upload logo</span>
                  </div>
                </label>
              </div>
              
              <div className="flex-1 space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Inc." {...field} />
                      </FormControl>
                      <FormDescription>
                        This will be the name of your organization.
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
                          placeholder="Describe what your organization does..." 
                          className="resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        A short description of your organization.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Visibility</FormLabel>
                        <FormDescription>
                          {field.value
                            ? "Anyone can see this organization."
                            : "Only members can see this organization."}
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
              </div>
            </div>
            
            <CardFooter className="px-0 pb-0 pt-4 flex justify-end">
              <Button type="submit" isLoading={isLoading}>
                Create Organization
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreateOrganizationForm;
