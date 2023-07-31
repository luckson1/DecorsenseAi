"use client";

import * as React from "react";
import Link, { type LinkProps } from "next/link";
import { ViewVerticalIcon } from "@radix-ui/react-icons";

import { siteConfig } from "../lib/config";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "../lib/utils";
import { useRouter } from "next/navigation";
import { Home } from "lucide-react";
import { useSession } from "next-auth/react";

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const { data: session } = useSession();
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <ViewVerticalIcon className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <MobileLink
          href="/"
          className="flex items-center"
          onOpenChange={setOpen}
        >
          <Home className="mr-2 h-4 w-4" />
          <span className="font-bold">{siteConfig.name}</span>
        </MobileLink>
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-3">
            <MobileLink
              href={"/dream"}
              className={cn("flex items-center px-4", "font-bold text-primary")}
              onOpenChange={setOpen}
            >
              Get Ideas
            </MobileLink>
            {session && (
              <MobileLink
                href={"/my_designs"}
                className={cn(
                  "flex items-center px-4",
                  "font-bold text-primary"
                )}
                onOpenChange={setOpen}
              >
                My Designs
              </MobileLink>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

interface MobileLinkProps extends LinkProps {
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

function MobileLink({
  href,
  onOpenChange,
  className,
  children,
  ...props
}: MobileLinkProps) {
  const router = useRouter();
  return (
    <Link
      href={href}
      onClick={() => {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        router.push(href.toString());
        onOpenChange?.(false);
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </Link>
  );
}
