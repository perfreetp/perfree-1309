import { create } from 'zustand';
import { Review, LostItem, SingleTicket } from '@/types';

interface AppState {
  favorites: string[];
  parkingRecord: { area: string; spotNumber: string; enterTime: string } | null;
  squadMembers: Array<{ id: string; name: string; avatar: string; isOnline: boolean }>;
  tickets: SingleTicket[];
  claimedCoupons: string[];
  reviews: Review[];
  lostItems: LostItem[];
  toggleFavorite: (id: string) => void;
  setParkingRecord: (record: { area: string; spotNumber: string; enterTime: string } | null) => void;
  addTickets: (tickets: SingleTicket[]) => void;
  removeTicket: (ticketId: string) => void;
  clearTickets: () => void;
  claimCoupon: (couponId: string) => void;
  addReview: (review: Review) => void;
  removeReview: (reviewId: string) => void;
  addLostItem: (item: LostItem) => void;
  removeLostItem: (itemId: string) => void;
}

const loadFromStorage = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('[Store] localStorage读取失败:', e);
  }
  return fallback;
};

const saveToStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('[Store] localStorage写入失败:', e);
  }
};

const persist = (key: string, value: any) => saveToStorage(key, value);

export const useAppStore = create<AppState>((set, get) => ({
  favorites: loadFromStorage('wss_favorites', ['show001', 'show003']),
  parkingRecord: loadFromStorage('wss_parking', null),
  squadMembers: [
    { id: '1', name: '我', avatar: '', isOnline: true },
    { id: '2', name: '小明', avatar: '', isOnline: true },
    { id: '3', name: '小红', avatar: '', isOnline: false },
    { id: '4', name: '爸爸', avatar: '', isOnline: true },
    { id: '5', name: '妈妈', avatar: '', isOnline: false },
  ],
  tickets: loadFromStorage<SingleTicket[]>('wss_tickets', []),
  claimedCoupons: loadFromStorage<string[]>('wss_coupons', []),
  reviews: loadFromStorage<Review[]>('wss_reviews', []),
  lostItems: loadFromStorage<LostItem[]>('wss_lostItems', []),

  toggleFavorite: (id) => {
    const curr = get().favorites;
    const next = curr.includes(id) ? curr.filter((f) => f !== id) : [...curr, id];
    persist('wss_favorites', next);
    set({ favorites: next });
  },

  setParkingRecord: (record) => {
    persist('wss_parking', record);
    set({ parkingRecord: record });
  },

  addTickets: (newTickets) => {
    const next = [...get().tickets, ...newTickets];
    persist('wss_tickets', next);
    set({ tickets: next });
  },

  removeTicket: (ticketId) => {
    const next = get().tickets.filter((t) => t.id !== ticketId);
    persist('wss_tickets', next);
    set({ tickets: next });
  },

  clearTickets: () => {
    persist('wss_tickets', []);
    set({ tickets: [] });
  },

  claimCoupon: (couponId) => {
    const curr = get().claimedCoupons;
    if (curr.includes(couponId)) return;
    const next = [...curr, couponId];
    persist('wss_coupons', next);
    set({ claimedCoupons: next });
  },

  addReview: (review) => {
    const next = [review, ...get().reviews];
    persist('wss_reviews', next);
    set({ reviews: next });
  },

  removeReview: (reviewId) => {
    const next = get().reviews.filter((r) => r.id !== reviewId);
    persist('wss_reviews', next);
    set({ reviews: next });
  },

  addLostItem: (item) => {
    const next = [item, ...get().lostItems];
    persist('wss_lostItems', next);
    set({ lostItems: next });
  },

  removeLostItem: (itemId) => {
    const next = get().lostItems.filter((l) => l.id !== itemId);
    persist('wss_lostItems', next);
    set({ lostItems: next });
  },
}));
