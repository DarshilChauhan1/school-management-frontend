"use client";

import { MoreHorizontal } from "lucide-react";
import * as React from "react";

import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

export interface RowAction {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onSelect: () => void;
  variant?: "default" | "destructive";
  disabled?: boolean;
  separatorBefore?: boolean;
}

interface RowActionsMenuProps {
  actions: RowAction[];
  triggerLabel?: string;
}

export function RowActionsMenu({
  actions,
  triggerLabel = "Open actions menu",
}: RowActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={triggerLabel}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        }
      />
      <DropdownMenuContent>
        {actions.map((action) => (
          <React.Fragment key={action.key}>
            {action.separatorBefore ? <DropdownMenuSeparator /> : null}
            <DropdownMenuItem
              variant={action.variant}
              disabled={action.disabled}
              onClick={action.onSelect}
            >
              {action.icon}
              <span>{action.label}</span>
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
