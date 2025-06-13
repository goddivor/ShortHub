/* eslint-disable react-refresh/only-export-components */
import type { PropsWithChildren } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeClassName = cva(
  "flex items-center px-4 py-1 bg-red-100 text-red-600 font-medium rounded"
);

export default function Badge({
  children,
  className,
  ...rest
}: PropsWithChildren & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(badgeClassName({ className }))} {...rest}>
      {children}
    </div>
  );
}
