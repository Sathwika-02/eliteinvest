"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  FileText,
  Globe,
  LayoutDashboard,
  Settings,
  HelpCircle,
  LogOut,
  SearchCheck,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
}

const mainNavItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  {
    label: "Fundamental Evaluations",
    icon: FileText,
    href: "/fundamental-evaluations",
  },
  {
    label: "Valuation Discovery",
    icon: SearchCheck,
    href: "/fundamentalgate",
  },
  { label: "AI Assistant", icon: Globe, href: "/ai-assistant" },
  { label: "Global Basket", icon: Briefcase, href: "/global-basket" },
  { label: "Portfolio", icon: Briefcase, href: "/portfolio" },
];

const bottomNavItems: NavItem[] = [
  { label: "Settings", icon: Settings, href: "/settings" },
  { label: "Investment Purpose", icon: FileText, href: "/investment-purpose" },
  { label: "Help Desk", icon: HelpCircle, href: "/help" },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col",
        "bg-white border-r border-gray-200",
        "transition-[width] duration-300 ease-in-out will-change-[width]",
        collapsed ? "w-[68px]" : "w-[240px]",
      )}
    >
      <div
        className={cn(
          "relative flex h-14 items-center border-b border-gray-200",
          collapsed ? "px-2" : "px-4",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-3 overflow-hidden",
            collapsed && "mx-auto",
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg">
            <img
              src="/logo.svg"
              alt="Elite Invest Logo"
              className="h-12 w-12 object-contain"
            />
          </div>

          <div
            className={cn(
              "flex flex-col overflow-hidden whitespace-nowrap",
              "transition-[opacity,transform,max-width] duration-300 ease-in-out",
              collapsed
                ? "opacity-0 -translate-x-2 max-w-0"
                : "opacity-100 translate-x-0 max-w-[160px]",
            )}
          >
            <span className="truncate text-[13px] font-bold text-black leading-tight">
              EliteInvest.AI
            </span>
            <span className="truncate text-[10px] text-black/40 leading-tight">
              Better Investment
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "absolute top-1/2 -translate-y-1/2",
            "right-0 translate-x-1/2",
            "h-8 w-8 rounded-full border border-gray-200 bg-white",
            "shadow-sm",
            "grid place-items-center",
            "text-gray-500 hover:text-black hover:bg-gray-50 transition",
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-4">
        <div className="flex flex-col gap-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-[9px] text-[13px] font-medium",
                  "transition-colors duration-150",
                  collapsed && "justify-center px-2",
                  !active && "text-gray-600 hover:bg-gray-100 hover:text-black",
                  active && "bg-brand-gradient text-white",
                )}
                style={
                  active
                    ? {
                        background:
                          "linear-gradient(90deg, rgba(255,164,51,1) 0%, rgba(78,133,255,1) 100%)",
                      }
                    : undefined
                }
              >
                <Icon
                  className={cn(
                    "h-[17px] w-[17px] shrink-0 transition-colors",
                    active
                      ? "text-white"
                      : "text-gray-500 group-hover:text-black",
                  )}
                />

                <span
                  className={cn(
                    "truncate whitespace-nowrap",
                    "transition-[opacity,transform,max-width] duration-300 ease-in-out",
                    collapsed
                      ? "opacity-0 -translate-x-2 max-w-0"
                      : "opacity-100 translate-x-0 max-w-[160px]",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-gray-200 px-2.5 py-3 flex flex-col gap-1">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium",
                "transition-colors duration-150",
                collapsed && "justify-center px-2",
                active
                  ? "bg-gray-100 text-black"
                  : "text-gray-600 hover:bg-gray-100 hover:text-black",
              )}
            >
              <Icon
                className={cn(
                  "h-[17px] w-[17px] shrink-0 transition-colors",
                  active
                    ? "text-black"
                    : "text-gray-500 group-hover:text-black",
                )}
              />

              <span
                className={cn(
                  "truncate whitespace-nowrap",
                  "transition-[opacity,transform,max-width] duration-300 ease-in-out",
                  collapsed
                    ? "opacity-0 -translate-x-2 max-w-0"
                    : "opacity-100 translate-x-0 max-w-[160px]",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        <button
          type="button"
          className={cn(
            "group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium w-full",
            "transition-colors duration-150",
            "text-red-500 hover:bg-red-50",
            collapsed && "justify-center px-2",
          )}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="h-[17px] w-[17px] shrink-0" />
          <span
            className={cn(
              "truncate whitespace-nowrap",
              "transition-[opacity,transform,max-width] duration-300 ease-in-out",
              collapsed
                ? "opacity-0 -translate-x-2 max-w-0"
                : "opacity-100 translate-x-0 max-w-[160px]",
            )}
          >
            Logout Account
          </span>
        </button>
      </div>
    </aside>
  );
}