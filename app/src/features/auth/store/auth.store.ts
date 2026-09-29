import { create } from 'zustand'

type AuthState = {
  isGoogleRedirecting: boolean
  setGoogleRedirecting: (isRedirecting: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isGoogleRedirecting: false,
  setGoogleRedirecting: (isRedirecting) => set({ isGoogleRedirecting: isRedirecting }),
}))
