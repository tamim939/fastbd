export interface Post {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  downloadLink: string;
  category: string;
  createdAt: any; // Firebase Timestamp
  updatedAt?: any;
  authorId: string;
  views: number;
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
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'user';
  joinedAt: any;
}
