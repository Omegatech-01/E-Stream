export interface Channel {
  id: string;
  name: string;
  logo: string;
  url: string;
  category: string;
  country?: string;
  language?: string;
  nowPlaying?: string;
  isFavorite?: boolean;
  isSubscribed?: boolean;
  isGold?: boolean;
}

export interface Category {
  id: string;
  name: string;
  count?: number;
}
