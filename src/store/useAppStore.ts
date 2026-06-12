import { create } from 'zustand';
import { Review, LostItem } from '@/types';

export interface TicketInfo {
  type: string;
  price: number;
  validDate: string;
  code: string;
  bound: boolean;
}

interface AppState {
  favorites: string[];
  parkingRecord: { area: string; spotNumber: string; enterTime: string } | null;
  squadMembers: Array<{ id: string; name: string; avatar: string; isOnline: boolean }>;
  ticket: TicketInfo | null;
  claimedCoupons: string[];
  reviews: Review[];
  lostItems: LostItem[];
  toggleFavorite: (id: string) => void;
  setParkingRecord: (record: { area: string; spotNumber: string; enterTime: string } | null) => void;
  setTicket: (ticket: TicketInfo | null) => void;
  claimCoupon: (couponId: string) => void;
  addReview: (review: Review) => void;
  addLostItem: (item: LostItem) => void;
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
  ],
  ticket: loadFromStorage<TicketInfo | null>('wss_ticket', null),
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

  setTicket: (ticket) => {
    persist('wss_ticket', ticket);
    set({ ticket });
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

  addLostItem: (item) => {
    const next = [item, ...get().lostItems];
    persist('wss_lostItems', next);
    set({ lostItems: next });
  },
}));
