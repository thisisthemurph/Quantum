
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface PageProps {
  title: string;
  children: React.ReactNode;
  actionItems?: React.ReactNode;
  className?: string;
}

export function Page({ title, actionItems, children, className }: PageProps) {
  return (
    <main className={cn("w-full p-4", className)}>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <SidebarTrigger title="Toggle sidebar ctrl+b" />
          <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
        </div>
        {actionItems && <section>{actionItems}</section>}
      </div>
      {children}
    </main>
  );
}