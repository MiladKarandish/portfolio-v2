import Name from "./_components/Name";
import { cn } from "./utils/className";

export default function Home() {
  return (
    <div className={cn("w-full")}>
      <h1 className={cn("text-3xl font-bold text-text")}>Hello</h1>

      <Name />
    </div>
  );
}
