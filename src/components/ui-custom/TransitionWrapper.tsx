
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TransitionWrapperProps {
  children: React.ReactNode;
  show: boolean;
  duration?: number;
  animation?: "fade" | "scale" | "slide-right" | "slide-up" | "none";
  className?: string;
  onExited?: () => void;
}

export const TransitionWrapper: React.FC<TransitionWrapperProps> = ({
  children,
  show,
  duration = 300,
  animation = "fade",
  className,
  onExited,
}) => {
  const [shouldRender, setShouldRender] = useState(show);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
        onExited?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onExited]);

  if (!shouldRender) return null;

  // Animation classes based on the current state and animation type
  const getAnimationClasses = () => {
    const baseClass = "transition-all";
    const durationClass = `duration-${duration}`;
    
    if (animation === "none") return cn(baseClass, durationClass);
    
    const animationMap = {
      fade: {
        enter: "opacity-0",
        enterActive: "opacity-100",
        exit: "opacity-0",
      },
      scale: {
        enter: "opacity-0 scale-95",
        enterActive: "opacity-100 scale-100",
        exit: "opacity-0 scale-95",
      },
      "slide-right": {
        enter: "opacity-0 translate-x-4",
        enterActive: "opacity-100 translate-x-0",
        exit: "opacity-0 translate-x-4",
      },
      "slide-up": {
        enter: "opacity-0 translate-y-4",
        enterActive: "opacity-100 translate-y-0",
        exit: "opacity-0 translate-y-4",
      },
    };

    const selected = animationMap[animation];
    return isAnimating
      ? cn(baseClass, durationClass, selected.enterActive)
      : cn(baseClass, durationClass, selected.enter, selected.exit);
  };

  return (
    <div className={cn(getAnimationClasses(), className)}>
      {children}
    </div>
  );
};

export default TransitionWrapper;
