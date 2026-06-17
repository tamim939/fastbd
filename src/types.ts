export interface DownloadButton {
  label: string;
  link: string;
}

export interface Post {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  buttons: DownloadButton[];
  category: string;
  createdAt: any; // Firebase Timestamp
  updatedAt?: any;
  authorId: string;
  views: number;
  downloads: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface SliderImage {
  url: string;
  link: string;
}

export interface AppSettings {
  notice: string;
  sliderImages: SliderImage[];
  popup?: {
    isEnabled: boolean;
    title: string;
    imageUrl: string;
    telegramLink: string;
  };
}

export interface UserProfile {
  uid: string;
  email?: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'user';
  joinedAt: any;
  downloadCount?: number;
  bio?: string;
  telegramId?: number;
  username?: string;
}
