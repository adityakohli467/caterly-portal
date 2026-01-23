"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownMenuProps {
  children: React.ReactNode
  trigger: React.ReactNode
  align?: "left" | "right"
  className?: string
}

export function DropdownMenu({ children, trigger, align = "right", className }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[data-dropdown]')) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  return (
    <div className="relative" data-dropdown>
      <div onClick={() => setOpen(!open)} className="cursor-pointer">
        {trigger}
      </div>
      {open && (
        <div
          className={cn(
            "absolute z-50 mt-2 min-w-[280px] rounded-lg border border-gray-200 bg-white shadow-2xl",
            align === "right" ? "right-0" : "left-0",
            className
          )}
        >
          {children}
        </div>
      )}
    </div>
  )
}

interface DropdownMenuItemProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  asChild?: boolean
}

export function DropdownMenuItem({ children, onClick, className, asChild }: DropdownMenuItemProps) {
  const handleClick = () => {
    onClick?.()
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      className: cn(
        "flex w-full items-center gap-3 px-4 py-3 text-sm text-black hover:bg-gray-100 cursor-pointer transition-colors",
        className
      ),
      onClick: handleClick,
    })
  }

  return (
    <div
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3 text-sm text-black hover:bg-gray-100 cursor-pointer transition-colors",
        className
      )}
      onClick={handleClick}
    >
      {children}
    </div>
  )
}

