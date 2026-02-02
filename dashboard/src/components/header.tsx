"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowDown, ChevronDown, LogOut, Navigation, Pencil } from "lucide-react";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "./ui/dropdown-menu";

interface HeaderProps {
  title?: string;
  leftContent?: React.ReactNode;
  centerContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  showCreatorButton?: boolean;
  showModeToggle?: boolean;
  onLogout?: () => void | Promise<void>;
}

export function Header({
  title = "Dashboard",
  leftContent,
  centerContent,
  rightContent,
  showCreatorButton = true,
  showModeToggle = true,
  onLogout,
}: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border"
    >
      <div className="flex items-center gap-4 px-6 py-4">
        {/* Left section - Title + optional content */}
        <div className="flex items-center gap-4 shrink-0">
          <h1 className="text-xl font-bold">{title}</h1>
          {leftContent}
        </div>

        {/* Center section - Flexible space for search, filters, etc. */}
        {centerContent && (
          <div className="flex-1 flex items-center justify-center min-w-0">
            {centerContent}
          </div>
        )}

        {/* Spacer when no center content */}
        {!centerContent && <div className="flex-1" />}

        {/* Right section - Custom content + fixed buttons */}
        <div className="flex items-center gap-3 shrink-0">
          {rightContent}

          {showCreatorButton && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Open page selector"
                >
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Navigate to</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => router.push("/")}>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/creator")}>
                  Creator
                </DropdownMenuItem>
                {/*<DropdownMenuItem onClick={() => router.push("/settings")}>
                  Settings
                </DropdownMenuItem>*/}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {showModeToggle && <ModeToggle />}

          {onLogout && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleLogout}
                    aria-label="Logout"
                  >
                    <LogOut className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Logout</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </motion.header>
  );
}
