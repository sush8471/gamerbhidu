export type DbGame = {
  id: string;
  title: string;
  slug: string;
  image_url: string;
  selling_price: number | null;
  original_price: number | null;
  discount_percentage: number | null;
  genre: string[];
  tags: string[];
  series: string | null;
  description: string | null;
  release_status: "released" | "upcoming";
  visible: boolean;
  steam_app_id: number | null;
  created_at?: string;
};

export type GameFormData = {
  title: string;
  slug: string;
  image_url: string;
  selling_price: string;
  original_price: string;
  discount_percentage: string;
  genre: string;
  tags: string;
  series: string;
  description: string;
  release_status: "released" | "upcoming";
  visible: boolean;
  steam_app_id: string;
};
