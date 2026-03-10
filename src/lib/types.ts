export type PortfolioItem = {
  id: string;
  title: string;
  category: string;
  place: string;
  description: string;
  image_url: string;
  created_at: string;
};

export type BookingStatus = "pending" | "approved" | "rejected";

export type BookingRequest = {
  id: string;
  name: string;
  email: string;
  requested_slot: string;
  service_type: string;
  status: BookingStatus;
  notes: string | null;
  created_at: string;
};
