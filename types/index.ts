export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
  colors: string[];
  color_variants: ProductColorVariant[];
  sizes: string[];
  category_id: string | null;
  stock: number;
  featured: boolean;
  created_at: string;
  category?: Category;
}

export interface ProductColorVariant {
  label: string;
  value: string;
  image_url?: string | null;
}

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  address: AddressData | null;
  created_at: string;
  updated_at: string;
}

export interface AddressData {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total: number;
  shipping_address: AddressData;
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  selected_options: {
    color?: string | null;
    colorValue?: string | null;
    colorImage?: string | null;
    size?: string | null;
  } | null;
  product?: Product;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface WishlistItem {
  product: Product;
  addedAt: string;
}
