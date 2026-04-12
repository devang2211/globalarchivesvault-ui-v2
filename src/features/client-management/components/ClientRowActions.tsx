import { useNavigate } from "@tanstack/react-router"
import { Eye, MoreHorizontal, Pencil } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

import { type ClientDto } from "../api/client.api"

interface ClientRowActionsProps {
  row: ClientDto
}

export const ClientRowActions = ({ row }: ClientRowActionsProps) => {
  const navigate = useNavigate()

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() =>
            navigate({ to: "/client-management/onboarding", search: { id: row.id, view: true } as any })
          }
        >
          View
          <DropdownMenuShortcut>
            <Eye size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() =>
            navigate({ to: "/client-management/onboarding", search: { id: row.id } as any })
          }
        >
          Edit
          <DropdownMenuShortcut>
            <Pencil size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
