import { toast } from "sonner";
/** Short, neutral toast like the original `toast(msg)` helper. */
export const notify = (msg: string) => toast(msg, { duration: 2000 });
