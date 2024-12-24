import * as React from "react";

import { cn } from "@/lib/utils";
import { IoEye } from "react-icons/io5";
import { IoEyeOff } from "react-icons/io5";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  isPassword?: boolean;
  showPassword?: boolean;
  setShowPassword?: React.Dispatch<React.SetStateAction<boolean>>;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      isPassword = false,
      showPassword,
      setShowPassword,
      ...props
    },
    ref
  ) => {
    return (
      <>
        {isPassword ? (
          <>
            <div
              className={cn(
                "flex h-9 w-full rounded-md border border-input bg-transparent text-sm shadow-sm transition-colors focus:visible:ring-1 items-center pr-2",
                className
              )}
            >
              <input
                className="flex-1 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50  px-3 py-1 bg-transparent border-none outline-none focus-visible:ring-0"
                ref={ref}
                type={showPassword ? "text" : "password"}
                {...props}
              />
              <div
                className="h-4 w-4 rounded-full"
                onClick={() =>
                  setShowPassword && setShowPassword((prev) => !prev)
                }
              >
                {showPassword ? (
                  <IoEyeOff className="text-slate-300 hover:text-slate-200 transition-all" />
                ) : (
                  <IoEye className="text-slate-300 hover:text-slate-200 transition-all" />
                )}
              </div>
            </div>
          </>
        ) : (
          <input
            type={type}
            className={cn(
              "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
            ref={ref}
            {...props}
          />
        )}
      </>
    );
  }
);
Input.displayName = "Input";

export { Input };
