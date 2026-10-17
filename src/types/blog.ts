export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  body: string;
  published_at: string | null;
  author: string;
  is_premium: boolean;
  category?: string;
  excerpt?: string;
  read_time_mins?: number;
  created_at?: string;
}

export interface BlogFilterOptions {
  category?: string;
  premiumOnly?: boolean;
}
