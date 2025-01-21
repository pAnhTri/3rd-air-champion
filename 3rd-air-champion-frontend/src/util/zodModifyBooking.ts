import { z } from "zod";
import { isAfter, isSameDay, startOfToday } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export const modifyBookingObject = z.object({
  startDate: z.date().refine(
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
  endDate: z.date().refine(
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
});

export type modifyBookingSchema = z.infer<typeof modifyBookingObject>;
