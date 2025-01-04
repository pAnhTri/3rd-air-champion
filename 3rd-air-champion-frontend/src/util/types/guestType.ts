import { pricingType } from "./pricingType";

export interface guestType {
  id: string;
  name: string;
  notes: string;
  pricing: pricingType[];
  numberOfGuests: number;
  phone: string;
  returning: boolean;
  email: string;
}
