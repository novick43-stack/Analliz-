import React from "react";

interface SkeletonProps {
    className?: string;
    variant?: "rect" | "circle" | "text";
}

const Skeleton: React.FC<SkeletonProps> = ({ className = "", variant = "rect" }) => {
    const baseClasses = "animate-pulse bg-muted/50 dark:bg-muted/30 border border-border/50 shadow-inner relative overflow-hidden";
    const variantClasses = {
        rect: "rounded-[1.5rem]",
        circle: "rounded-full",
        text: "rounded h-4 w-full mb-2"
    };

    return (
        <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent animate-shimmer -translate-x-full"></div>
        </div>
    );
};

export default Skeleton;
