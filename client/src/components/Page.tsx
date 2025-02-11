import { cn } from "@/lib/utils";
import { Fragment, ReactNode } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Command, Search } from "lucide-react";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs.ts";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar.tsx";

interface PageProps {
  title: string;
  children: ReactNode;
  actionItems?: ReactNode;
  className?: string;
}

export function Page({ title, actionItems, children, className }: PageProps) {
  const { breadcrumbs } = useBreadcrumbs();

  return (
    <main className={cn("grow flex flex-col w-full", className)}>
      <div className="flex justify-between items-center py-2 md:py-6">

        <div className="relative flex items-end justify-between gap-4 w-full md:p-0 md:pr-4 p-4">
          <SidebarTrigger
            title="Toggle sidebar ctrl+b"
            className="md:hidden rounded-full translate-x-1/2"
          />

          <Button
            variant="outline"
            className="relative hidden lg:flex items-center justify-between bg-muted py-5 text-left font-normal tracking-wide text-muted-foreground rounded-lg border shadow-md md:min-w-[450px]"
          >
            <span className="flex items-center gap-2">
              <Search />
              <span>Type a command or search...</span>
            </span>
            <span className="pointer-events-none absolute right-[0.3rem] top-0 translate-y-[50%] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <Command />
              <span className="text-xs font-mono text-muted-foreground">K</span>
            </span>
          </Button>

          {breadcrumbs &&
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Quantum</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                {breadcrumbs.crumbs && breadcrumbs.crumbs.map(({ href, text }) => (
                  <Fragment key={href}>
                    <BreadcrumbItem>
                      <BreadcrumbLink href={href}>{text}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                  </Fragment>
                ))}
                <BreadcrumbItem>
                  <BreadcrumbPage>{breadcrumbs.current}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          }
        </div>
      </div>
      <section className="grow border-l border-t rounded-tl-lg shadow-lg bg-background">
        <div className="p-4 flex justify-between items-center">
          <h1 className="text-2xl tracking-wide font-medium">{title}</h1>
          {actionItems && <section>{actionItems}</section>}
        </div>
        <div className="p-4">
          {children}
        </div>
      </section>
    </main>
  );
}
