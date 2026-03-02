"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Header } from "@/components/header";
import { Trash2 } from "lucide-react";
import { logout } from "@/app/login/actions";

interface DashboardHeaderProps {
  totalCount: number;
  query: string;
  onQueryChange: (value: string) => void;
  onDeleteAll: () => void;
}

export function DashboardHeader({
  totalCount,
  query,
  onQueryChange,
  onDeleteAll,
}: DashboardHeaderProps) {
  return (
    <Header
      title="Main Dashboard"
      leftContent={<Badge>Total requests: {totalCount}</Badge>}
      showModeToggle
      onLogout={logout}
      rightContent={
        <div className="flex items-center gap-2">
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search messages"
            className="w-48"
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={onDeleteAll}
                  aria-label="Delete all messages"
                >
                  <Trash2 className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete all messages</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      }
    />
  );
}
