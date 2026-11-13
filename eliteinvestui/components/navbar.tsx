"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Menu, Moon, Sun, User, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCountry, COUNTRIES, type Country } from "@/app/providers";

interface NavbarProps {
  onMenuToggle: () => void;
  sidebarCollapsed: boolean;
}

// ✅ Updated COUNTRIES with flag images (ISO 2-letter codes + flagcdn URLs)
// You can also move this to your providers file if preferred
export const COUNTRIES_WITH_FLAGS: Country[] = [
  { code: "US", name: "United States", flag: "https://flagcdn.com/w40/us.png", apiCode: "us" },
  { code: "GB", name: "United Kingdom", flag: "https://flagcdn.com/w40/gb.png", apiCode: "uk" },
  { code: "IN", name: "India", flag: "https://flagcdn.com/w40/in.png", apiCode: "in" },
  // ➕ Add more countries as needed:
  // { code: "CA", name: "Canada", flag: "https://flagcdn.com/w40/ca.png" },
  // { code: "AU", name: "Australia", flag: "https://flagcdn.com/w40/au.png" },
];

export function Navbar({ onMenuToggle, sidebarCollapsed }: NavbarProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { country, setCountry } = useCountry();

  useEffect(() => {
    setMounted(true);
  }, []);

  const cycleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else if (theme === "light") {
      setTheme("system");
    } else {
      setTheme("dark");
    }
  };

  const themeLabel =
    theme === "system" ? "System" : theme === "dark" ? "Dark" : "Light";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center border-b border-border bg-background/80 backdrop-blur-xl px-4">
      {/* Left: hamburger for mobile / breadcrumb area */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onMenuToggle}
          className="text-muted-foreground hover:text-foreground lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="hidden lg:flex items-center gap-1.5 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Homepage</span>
          <span className="text-muted-foreground/50">/</span>
          <span>Market Mood Dashboard</span>
        </div>
      </div>

      {/* Right: theme toggle, notifications, profile */}
      <div className="ml-auto flex items-center gap-2">
        
        {/* Country Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2 border-border/50 bg-background/50 backdrop-blur-sm transition-all hover:bg-muted font-medium"
            >
              {/* 🚩 Flag Image */}
              <img
                src={country.flag}
                alt={country.name}
                className="h-4 w-6 object-cover rounded-sm shadow-sm"
                loading="lazy"
              />
              <span className="text-xs hidden sm:inline-block">{country.code}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px] rounded-xl">
            {COUNTRIES_WITH_FLAGS.map((c) => (
              <DropdownMenuItem
                key={c.code}
                onClick={() => setCountry(c)}
                className="cursor-pointer gap-2 py-2"
              >
                {/* 🚩 Flag Image in dropdown */}
                <img
                  src={c.flag}
                  alt={c.name}
                  className="h-4 w-6 object-cover rounded-sm shadow-sm"
                  loading="lazy"
                />
                <span className="text-sm font-medium">{c.name}</span>
                {country.code === c.code && (
                  <span className="ml-auto flex h-2 w-2 rounded-full bg-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-4 w-px bg-border/50 mx-1" />

        {/* Theme Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={cycleTheme}
              className="text-muted-foreground hover:text-foreground"
              aria-label={`Switch theme (current: ${themeLabel})`}
            >
              {mounted ? (
                resolvedTheme === "dark" ? (
                  <Moon className="h-[18px] w-[18px]" />
                ) : (
                  <Sun className="h-[18px] w-[18px]" />
                )
              ) : (
                <div className="h-[18px] w-[18px]" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">
              Theme: {mounted ? themeLabel : "..."} (click to cycle)
            </p>
          </TooltipContent>
        </Tooltip>

        {/* Notifications */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="relative text-muted-foreground hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">Notifications</p>
          </TooltipContent>
        </Tooltip>

        {/* Profile */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground"
              aria-label="Profile"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/30">
                <User className="h-3.5 w-3.5 text-primary" />
              </div>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">Profile</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}