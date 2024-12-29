import { z } from "zod";
import mongoose from "mongoose";
import { isAfter, isSameDay, startOfToday } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export const bookDaysZodObject = z.object({
  room: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid room",
  }),
  guest: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid guest",
  }),
  isAirBnB: z.boolean(),
  date: z.date().refine(
    (val) => {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const currentDate = startOfToday();
      const localDate = toZonedTime(val.toISOString().split("T")[0], timeZone);

      return (
        isAfter(localDate, currentDate) || isSameDay(localDate, currentDate)
      );
    },
    {
      message: "Cannot book a date in the past",
    }
  ),
  duration: z
    .number({ invalid_type_error: "Must be a number" })
    .min(1, { message: "Must stay for at least 1 day" }),
  numberOfGuests: z
    .number({ invalid_type_error: "Must be a number" })
    .min(1, { message: "Must be at least 1 guest" }),
});

export type bookDaySchema = z.infer<typeof bookDaysZodObject>;
