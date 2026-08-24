"use client";

import { NavLink } from "@/components/layout/nav-link";
import { PRIMARY_NAV_ITEMS, SECONDARY_NAV_ITEMS } from "@/config/features";

export function AppSidebar() {
  return (
    <nav className="border-sidebar-border bg-sidebar sticky top-16 hidden h-[calc(100svh-4rem)] w-70 shrink-0 flex-col gap-2 border-r px-4 py-6 md:flex">
      <ul className="flex flex-1 flex-col gap-1">
        {PRIMARY_NAV_ITEMS.map((item) => (
          <li key={item.href}>
            <NavLink item={item} />
          </li>
        ))}
      </ul>
      <ul className="flex flex-col gap-1">
        {SECONDARY_NAV_ITEMS.map((item) => (
          <li key={item.href}>
            <NavLink item={item} />
          </li>
        ))}
      </ul>
    </nav>
  );
}
