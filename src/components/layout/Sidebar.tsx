
import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui-custom/Button";
import { 
  Home, 
  Users, 
  Folders, 
  GitBranch, 
  PlusCircle,
  Settings,
  HelpCircle,
  X
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { mockOrganizations } from "@/lib/types";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 bg-card border-r border-border transition-transform duration-300 overflow-hidden",
          "md:translate-x-0 md:z-30 md:top-16",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile close button */}
        <div className="flex justify-between items-center p-4 md:hidden">
          <div className="flex items-center space-x-2">
            <div className="bg-primary rounded-lg w-8 h-8 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-primary-foreground"
              >
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
            </div>
            <span className="font-display font-medium text-lg">Gitopia</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex flex-col h-full overflow-y-auto">
          <nav className="flex-1 px-3 py-4">
            <ul className="space-y-1">
              <NavItem to="/" icon={<Home className="h-5 w-5" />} label="Dashboard" />
              <NavItem to="/organizations" icon={<Users className="h-5 w-5" />} label="Organizations" />
              <NavItem to="/repositories" icon={<GitBranch className="h-5 w-5" />} label="Repositories" />
              <NavItem to="/users" icon={<Users className="h-5 w-5" />} label="Users" />
            </ul>
            
            <div className="mt-8">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 pb-2">
                Your Organizations
              </h3>
              <ul className="space-y-1">
                {mockOrganizations.map((org) => (
                  <li key={org.id}>
                    <NavLink
                      to={`/organizations/${org.id}`}
                      className={({ isActive }) => cn(
                        "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                        isActive 
                          ? "bg-accent text-accent-foreground" 
                          : "text-foreground hover:bg-secondary"
                      )}
                    >
                      <div className="w-5 h-5 rounded-md overflow-hidden mr-3">
                        <img src={org.avatarUrl} alt={org.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="truncate">{org.name}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
          
          <div className="p-3 border-t border-border">
            <Button
              variant="outline" 
              className="w-full justify-start text-left"
              icon={<PlusCircle className="h-4 w-4" />}
            >
              <span>New Organization</span>
            </Button>
          </div>
          
          <div className="mt-auto p-3 border-t border-border">
            <ul className="space-y-1">
              <NavItem to="/settings" icon={<Settings className="h-5 w-5" />} label="Settings" />
              <NavItem to="/help" icon={<HelpCircle className="h-5 w-5" />} label="Help & Support" />
            </ul>
          </div>
        </div>
      </aside>
    </>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
  return (
    <li>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink
              to={to}
              className={({ isActive }) => cn(
                "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                isActive 
                  ? "bg-accent text-accent-foreground font-medium" 
                  : "text-foreground hover:bg-secondary"
              )}
            >
              <span className="mr-3">{icon}</span>
              <span>{label}</span>
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right" className="md:hidden">
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </li>
  );
};

export default Sidebar;
