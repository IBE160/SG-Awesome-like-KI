import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
<<<<<<< HEAD

=======
 
>>>>>>> 99235f1ebb1f80e9a405908b456d0e44e62489cb
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
