
import React, { useState } from "react";
import { Link } from "react-router-dom";
import TransitionWrapper from "@/components/ui-custom/TransitionWrapper";
import { Button } from "@/components/ui-custom/Button";
import OrganizationsList from "@/components/dashboard/OrganizationsList";
import CreateOrganizationForm from "@/components/forms/CreateOrganizationForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";

const Organizations: React.FC = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <div className="space-y-8">
      <TransitionWrapper show={true} animation="fade" duration={500}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Organizations</h1>
            <p className="text-muted-foreground mt-1">
              Manage your organizations and memberships
            </p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button icon={<PlusCircle className="h-4 w-4" />}>
                New Organization
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] p-0 overflow-auto max-h-[90vh]">
              <div className="p-6">
                <CreateOrganizationForm />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </TransitionWrapper>

      <TransitionWrapper show={true} animation="scale" duration={300} className="delay-100">
        <OrganizationsList />
      </TransitionWrapper>
    </div>
  );
};

export default Organizations;
