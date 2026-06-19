import { ReactNode } from "react";

interface MobileLayoutProps {
  children: ReactNode;
  className?: string;
}

export function MobileLayout({ children, className = "" }: MobileLayoutProps) {
  return (
    <div className="min-h-full flex justify-center">
      <div
        className={`w-full max-w-mobile min-h-full bg-app-bg flex flex-col ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
