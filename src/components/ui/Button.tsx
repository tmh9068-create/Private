import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "lg",
  loading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "w-full font-bold rounded-xl transition-opacity flex items-center justify-center";

  const variants = {
    primary: "bg-majiai text-white active:opacity-80",
    secondary: "bg-gray-100 text-gray-800 active:bg-gray-200",
    outline: "border-2 border-majiai text-majiai bg-transparent",
    ghost: "text-majiai bg-transparent",
  };

  const sizes = {
    sm: "py-2 px-4 text-sm",
    md: "py-3 px-6 text-base",
    lg: "py-4 px-8 text-base",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${
        disabled || loading ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "処理中..." : children}
    </button>
  );
}
