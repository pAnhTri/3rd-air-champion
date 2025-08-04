import { z } from "zod";

export const modifyBookingObject = z.object({
  startDate: z.date({
    message: "Please select a date and time",
  }),
  endDate: z.date({
    message: "Please select a date and time",
  }),
  duration: z
    .number("Must be a number")
    .min(1, { message: "Must stay for at least 1 day" }),
});

export type modifyBookingSchema = z.infer<typeof modifyBookingObject>;
