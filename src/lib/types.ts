export type Role = "customer" | "seller" | "seller_staff" | "admin";

export type ApiSuccess<T> = {
  statusCode: number;
  message: string;
  data: T;
};

export type ApiFailure = {
  statusCode: number;
  message: string;
  errors?: unknown;
};

export type AuthUser = {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  seller_id?: string;
};

export type AuthPayload = {
  user: AuthUser;
  token: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon_url?: string | null;
  is_active?: boolean;
};

export type Brand = {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  is_verified?: boolean;
};

export type ProductImage = {
  id: string;
  url: string;
  is_primary?: boolean;
  sort_order?: number;
};

export type ProductVariant = {
  id: string;
  sku?: string;
  color?: string | null;
  size?: string | null;
  material?: string | null;
  price: number;
  stock_qty: number;
  image_url?: string | null;
  is_active?: boolean;
};

export type Product = {
  id: string;
  seller_id: string;
  category_id: string;
  brand_id: string;
  title: string;
  slug?: string;
  description?: string | null;
  base_price: number;
  discount_percent?: number;
  condition?: string | null;
  status?: string | null;
  total_sold?: number;
  avg_rating?: number;
  review_count?: number;
  product_variants?: ProductVariant[];
  product_images?: ProductImage[];
  brands?: Brand;
  categories?: Category;
  sellers?: { id: string; shop_name: string; shop_slug?: string };
};

export type Campaign = {
  id: string;
  title: string;
  slug: string;
  banner_url?: string | null;
  is_active?: boolean;
  start_date?: string | null;
  end_date?: string | null;
  products?: Product[];
};

export type Address = {
  id: string;
  user_id?: string;
  label?: string | null;
  full_name: string;
  phone: string;
  city: string;
  area?: string | null;
  street: string;
  postal_code?: string | null;
  is_default?: boolean;
};

export type OrderItem = {
  id: string;
  variant_id: string;
  seller_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  status?: string;
  product_variants?: ProductVariant & { products?: Product };
};

export type Order = {
  id: string;
  order_number: string;
  status: string;
  subtotal: number;
  discount_amount?: number;
  shipping_fee?: number;
  total_amount: number;
  payment_method?: string;
  payment_status?: string;
  notes?: string | null;
  placed_at?: string;
  order_items?: OrderItem[];
};

export type Seller = {
  id: string;
  user_id: string;
  shop_name: string;
  shop_slug?: string;
  description?: string | null;
  logo_url?: string | null;
  ntn_number?: string;
  bank_name?: string;
  status?: string;
  rating?: number;
  approved_at?: string | null;
};

export type Wallet = {
  id?: string;
  balance: number;
  currency?: string;
  is_locked?: boolean;
};

export type WalletTransaction = {
  id: string;
  type: string;
  amount: number;
  purpose?: string;
  status?: string;
  created_at?: string;
};

export type Review = {
  id: string;
  rating: number;
  comment?: string | null;
  is_verified_purchase?: boolean;
  created_at?: string;
  users?: { id: string; full_name: string };
};

export type ProductQuestion = {
  id: string;
  question: string;
  answer?: string | null;
  created_at?: string;
  answered_at?: string | null;
  users?: { id: string; full_name: string };
};

export type Settlement = {
  id: string;
  seller_id: string;
  gross_amount: number;
  commission: number;
  net_amount: number;
  status: string;
  period_start?: string;
  period_end?: string;
  settled_at?: string | null;
};

export type InventoryLog = {
  id: string;
  variant_id: string;
  action: string;
  quantity_change: number;
  qty_after: number;
  created_at?: string;
};

export type AdminLog = {
  id: string;
  admin_id: string;
  action: string;
  target_type?: string;
  target_id?: string;
  details?: unknown;
  ip_address?: string;
  created_at?: string;
};

export type CartItem = {
  productId: string;
  productTitle: string;
  imageUrl?: string | null;
  variantId: string;
  variantLabel: string;
  unitPrice: number;
  quantity: number;
  stockQty: number;
};
