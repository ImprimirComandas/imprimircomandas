export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  store_name: string;
  avatar_url: string | null;
  updated_at: string;
}

export interface AuthError {
  message: string;
}