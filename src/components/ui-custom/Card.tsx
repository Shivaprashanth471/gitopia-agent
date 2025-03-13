
import React from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "glass" | "solid" | "outlined";
  hover?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = "solid",
  hover = false,
  onClick,
}) => {
  const baseClasses = "rounded-lg overflow-hidden";
  
  const variantClasses = {
    solid: "bg-card shadow-sm",
    glass: "glass-panel",
    outlined: "border border-border bg-transparent",
  };

  const hoverClasses = hover
    ? "transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]"
    : "";

  const clickableClasses = onClick ? "cursor-pointer" : "";

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        hoverClasses,
        clickableClasses,
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
}> = ({ children, className }) => (
  <div className={cn("px-6 py-5 flex justify-between items-center", className)}>
    {children}
  </div>
);

export const CardTitle: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
}> = ({ children, className }) => (
  <h3 className={cn("text-lg font-medium", className)}>{children}</h3>
);

export const CardDescription: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
}> = ({ children, className }) => (
  <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>
);

export const CardContent: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
}> = ({ children, className }) => (
  <div className={cn("px-6 py-4", className)}>{children}</div>
);

export const CardFooter: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
}> = ({ children, className }) => (
  <div className={cn("px-6 py-4 bg-muted/20 flex items-center", className)}>
    {children}
  </div>
);

export default Card;
