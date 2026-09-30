import { create } from 'zustand'

type DashboardState = {
  searchQuery: string
  setSearchQuery: (searchQuery: string) => void
}

export const useDashboardStore = create<DashboardState>((set) => ({
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}))
