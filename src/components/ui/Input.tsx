import { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  rightIcon?: ReactNode;
  error?: string;
}

export function Input({
  label,
  icon,
  rightIcon,
  error,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-medium mb-2">
        {label}
      </label>
      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
        {icon && (
          <div className="pl-4 text-gray-400 flex items-center">{icon}</div>
        )}
        <input
          className={`flex-1 py-4 px-3 text-base text-gray-800 bg-transparent outline-none placeholder:text-gray-400 ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="pr-4 text-gray-400 flex items-center">{rightIcon}</div>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
