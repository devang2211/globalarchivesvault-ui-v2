import { useMutation } from "@tanstack/react-query"
import { signOut } from "../api/auth.api"

export const useSignOut = () => {
  return useMutation({
    mutationFn: signOut,
  })
}