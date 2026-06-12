export interface ScenicSpot {
  id: string;
  name: string;
  description: string;
  image: string;
  location: { lat: number; lng: number };
  category: string;
  rating: number;
  reviewCount: number;
  openTime: string;
  duration: string;
  tags: string[];
}

export interface Show {
  id: string;
  name: string;
  description: string;
  image: string;
  venue: string;
  duration: number;
  times: string[];
  category: string;
  isFavorite?: boolean;
  rating: number;
}

export interface QueueItem {
  id: string;
  name: string;
  waitTime: number;
  status: 'normal' | 'busy' | 'crowded';
  category: string;
  image: string;
}

export interface FoodShop {
  id: string;
  name: string;
  type: 'restaurant' | 'shop';
  image: string;
  rating: number;
  description: string;
  distance: string;
  hasCoupon: boolean;
  couponText?: string;
  location: string;
}

export interface Coupon {
  id: string;
  title: string;
  discount: string;
  condition: string;
  shopId: string;
  shopName: string;
  expireDate: string;
}

export interface Facility {
  id: string;
  name: string;
  type: 'toilet' | 'medical' | 'exit' | 'entrance';
  location: { lat: number; lng: number };
  distance?: string;
}

export interface SquadMember {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  location?: { lat: number; lng: number };
}

export interface ParkingRecord {
  id: string;
  area: string;
  spotNumber: string;
  enterTime: string;
  carNumber: string;
}

export interface LostItem {
  id: string;
  title: string;
  description: string;
  location: string;
  time: string;
  contact: string;
  status: 'pending' | 'found';
  type: 'lost' | 'found';
}

export interface Review {
  id: string;
  targetId: string;
  targetType: 'scenic' | 'show';
  targetName: string;
  rating: number;
  content: string;
  images: string[];
  date: string;
}

export interface RoutePlan {
  id: string;
  name: string;
  description: string;
  duration: string;
  spots: string[];
  tags: string[];
  distance: string;
}
