import { bookingType } from "./bookingType";
import { roomType } from "./roomType";

export interface dayType {
  blockedRooms: roomType[];
  bookings: bookingType[];
  isBlocked: boolean;
  isAirBnB: boolean;
  date: Date;
  numberOfGuests: number;
}
