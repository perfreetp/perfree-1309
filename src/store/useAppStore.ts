import { create } from 'zustand';

interface AppState {
  favorites: string[];
  parkingRecord: { area: string; spotNumber: string; enterTime: string } | null;
  squadMembers: Array<{ id: string; name: string; avatar: string; isOnline: boolean }>;
  toggleFavorite: (id: string) => void;
  setParkingRecord: (record: { area: string; spotNumber: string; enterTime: string } | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  favorites: ['show001', 'show003'],
  parkingRecord: null,
  squadMembers: [
    { id: '1', name: '我', avatar: '', isOnline: true },
    { id: '2', name: '小明', avatar: '', isOnline: true },
    { id: '3', name: '小红', avatar: '', isOnline: false },
  ],
  toggleFavorite: (id) =>
    set((state) => ({
      favorites: state.favorites.includes(id)
        ? state.favorites.filter((f) => f !== id)
        : [...state.favorites, id],
    })),
  setParkingRecord: (record) => set({ parkingRecord: record }),
}));
