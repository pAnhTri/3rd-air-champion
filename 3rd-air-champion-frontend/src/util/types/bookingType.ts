import { guestType } from "./guestType";
import { roomType } from "./roomType";

export interface bookingType {
  guest: guestType;
  room: roomType;
  description: string;
  duration: number;
  numberOfGuests: number;
  startDate: string;
  endDate: string;
}
