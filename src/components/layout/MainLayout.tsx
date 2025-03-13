
import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import TransitionWrapper from "@/components/ui-custom/TransitionWrapper";

const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  
  // Close sidebar on route change (mobile only)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main 
        className={cn(
          "pt-16 transition-all duration-300",
          "md:pl-64"
        )}
      >
        <TransitionWrapper
          show={true}
          animation="fade"
          duration={300}
          className="p-6"
        >
          <Outlet />
        </TransitionWrapper>
      </main>
    </div>
  );
};

export default MainLayout;
