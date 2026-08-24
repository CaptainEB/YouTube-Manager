"use client";

import { Menu } from "lucide-react";
import { useState } from "react";

import { NavLink } from "@/components/layout/nav-link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { PRIMARY_NAV_ITEMS, SECONDARY_NAV_ITEMS } from "@/config/features";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-sidebar text-sidebar-foreground w-70 p-0">
        <SheetHeader className="border-sidebar-border border-b">
          <SheetTitle className="text-primary">YouTube Manager</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-1 flex-col justify-between gap-2 p-4">
          <ul className="flex flex-col gap-1">
            {PRIMARY_NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <NavLink item={item} onNavigate={() => setOpen(false)} />
              </li>
            ))}
          </ul>
          <ul className="flex flex-col gap-1">
            {SECONDARY_NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <NavLink item={item} onNavigate={() => setOpen(false)} />
              </li>
            ))}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
