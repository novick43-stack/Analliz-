import React from "react";

interface SkeletonProps {
    className?: string;
    variant?: "rect" | "circle" | "text";
}

const Skeleton: React.FC<SkeletonProps> = ({ className = "", variant = "rect" }) => {
    const baseClasses = "animate-shimmer bg-gray-100 dark:bg-slate-800";
    const variantClasses = {
        rect: "rounded-lg",
        circle: "rounded-full",
        text: "rounded h-4 w-full mb-2"
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        />
    );
};

export default Skeleton;
