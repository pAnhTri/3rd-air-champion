import { addDays, isSameDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { dayType } from "./types/dayType";
import { bookingType } from "./types/bookingType";

export const transformBookings = (
  monthMap: Map<string, dayType>,
  timeZone: string
) => {
  const propagateBooking = (
    booking: bookingType,
    currentKey: string,
    sortedKeys: string[],
    index: number,
    tracking: { startDate: string; endDate: string; duration: number },
    processedBookings: Set<string>
  ): void => {
    const finalizeBooking = () => {
      // Update the current booking after recursion unwinds
      booking.duration = tracking.duration;
      booking.endDate = tracking.endDate;
      booking.startDate = tracking.startDate;

      // Mark the next booking as processed
      const bookingIdentifier = `${tracking.startDate}-${tracking.endDate}-${booking.guest.id}`;
      processedBookings.add(bookingIdentifier);
    };

    const nextIndex = index + 1;

    // Base case: If there are no more keys, end recursion
    if (nextIndex >= sortedKeys.length) {
      finalizeBooking();
      return;
    }

    const nextKey = sortedKeys[nextIndex];
    const nextDay = monthMap.get(nextKey);

    // Find a matching booking in the next day's bookings
    const nextBooking = nextDay?.bookings.find((b) => {
      const currentDate = toZonedTime(currentKey, timeZone);
      const nextDate = toZonedTime(nextKey, timeZone);
      return (
        b.guest.id === booking.guest.id &&
        b.room.id === booking.room.id &&
        isSameDay(nextDate, addDays(currentDate, 1))
      );
    });

    if (nextBooking) {
      // Update the tracking object
      tracking.endDate = nextBooking.endDate;
      tracking.duration += 1;

      // Recursively propagate the merged booking
      propagateBooking(
        nextBooking,
        nextKey,
        sortedKeys,
        nextIndex,
        tracking,
        processedBookings
      );
    }

    finalizeBooking();
  };

  const sortedKeys = [...monthMap.keys()].sort(); // Get sorted keys
  const processedBookings = new Set<string>(); // Track processed bookings

  for (let i = 0; i < sortedKeys.length; i++) {
    const currentKey = sortedKeys[i];
    const currentDay = monthMap.get(currentKey);

    if (!currentDay) {
      continue;
    }

    currentDay.bookings.forEach((booking) => {
      // Create a unique identifier for the booking
      const bookingIdentifier = `${booking.startDate}-${booking.endDate}-${booking.guest.id}`;

      // Skip already-processed bookings
      if (
        processedBookings.has(bookingIdentifier) ||
        booking.guest.name === "AirBnB"
      ) {
        return;
      }

      const tracking = {
        startDate: booking.startDate,
        endDate: booking.endDate,
        duration: 1,
      };

      // Mark the booking as processed
      processedBookings.add(bookingIdentifier);

      // Pass the sortedKeys and current index to propagateBooking
      propagateBooking(
        booking,
        currentKey,
        sortedKeys,
        i,
        tracking,
        processedBookings
      );
    });
  }
};
