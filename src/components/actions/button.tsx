/* eslint-disable react-refresh/only-export-components */
import type { PropsWithChildren } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonClassName = cva("flex items-center rounded");

export default function Button({
  children,
  className,
  ...rest
}: PropsWithChildren & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(buttonClassName({ className }))} {...rest}>
      {children}
    </button>
  );
}
