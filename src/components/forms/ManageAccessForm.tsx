
import React, { useState } from "react";
import { Button } from "@/components/ui-custom/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui-custom/Card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, ChevronsUpDown, SearchIcon, Trash, Shield, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { mockUsers, User } from "@/lib/types";
import { cn } from "@/lib/utils";

const accessFormSchema = z.object({
  userId: z.string().min(1, "User is required"),
  role: z.string().min(1, "Role is required"),
});

type AccessFormValues = z.infer<typeof accessFormSchema>;

interface ManageAccessFormProps {
  type: "organization" | "repository";
  title?: string;
  description?: string;
  currentMembers?: {
    id: string;
    userId: string;
    role: string;
    user: User;
  }[];
}

const ManageAccessForm: React.FC<ManageAccessFormProps> = ({
  type,
  title = "Manage Access",
  description = "Add or remove users and manage their permissions.",
  currentMembers = [],
}) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<AccessFormValues>({
    resolver: zodResolver(accessFormSchema),
    defaultValues: {
      userId: "",
      role: type === "organization" ? "member" : "read",
    },
  });

  const onSubmit = async (data: AccessFormValues) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const user = mockUsers.find(u => u.id === data.userId);
      console.log("Adding user:", data);
      toast.success(`Added ${user?.name} as ${data.role}`);
      form.reset();
      setIsLoading(false);
    }, 1000);
  };

  const handleRemoveMember = (memberId: string) => {
    const member = currentMembers.find(m => m.id === memberId);
    if (member) {
      toast.success(`Removed ${member.user.name}`);
    }
  };

  // Filter out users that are already members
  const availableUsers = mockUsers.filter(user => 
    !currentMembers.some(member => member.userId === user.id)
  );

  // Define role options based on type
  const roleOptions = type === "organization" 
    ? [
        { value: "owner", label: "Owner" },
        { value: "admin", label: "Admin" },
        { value: "member", label: "Member" },
        { value: "guest", label: "Guest" },
      ]
    : [
        { value: "admin", label: "Admin" },
        { value: "maintain", label: "Maintain" },
        { value: "write", label: "Write" },
        { value: "triage", label: "Triage" },
        { value: "read", label: "Read" },
      ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>User</FormLabel>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between"
                          >
                            {field.value
                              ? mockUsers.find((user) => user.id === field.value)?.name
                              : "Select user..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search user..." className="h-9" />
                          <CommandEmpty className="p-4 text-sm text-center">
                            No user found.
                          </CommandEmpty>
                          <CommandGroup>
                            {availableUsers.map((user) => (
                              <CommandItem
                                key={user.id}
                                value={user.name}
                                onSelect={() => {
                                  form.setValue("userId", user.id);
                                  setOpen(false);
                                }}
                              >
                                <div className="flex items-center">
                                  <img
                                    src={user.avatarUrl}
                                    alt={user.name}
                                    className="mr-2 h-6 w-6 rounded-full"
                                  />
                                  <span>{user.name}</span>
                                </div>
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    field.value === user.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="sm:w-1/3">
                    <FormLabel>Role</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roleOptions.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex items-end">
                <Button 
                  type="submit" 
                  isLoading={isLoading}
                  icon={<UserPlus className="w-4 h-4" />}
                >
                  Add
                </Button>
              </div>
            </div>
          </form>
        </Form>
        
        {currentMembers.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Current Members</h3>
            <div className="border rounded-md divide-y">
              {currentMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3"
                >
                  <div className="flex items-center">
                    <img
                      src={member.user.avatarUrl}
                      alt={member.user.name}
                      className="w-8 h-8 rounded-full mr-3"
                    />
                    <div>
                      <p className="font-medium">{member.user.name}</p>
                      <p className="text-sm text-muted-foreground">@{member.user.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center px-2 py-1 bg-secondary rounded text-xs">
                      <Shield className="w-3 h-3 mr-1" />
                      <span>{member.role}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ManageAccessForm;
