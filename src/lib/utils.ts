import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

export function cn(...inputs: unknown[]) {
  return twMerge(clsx(inputs));
}
