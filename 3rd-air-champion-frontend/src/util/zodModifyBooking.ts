import { z } from "zod";

export const modifyBookingObject = z.object({
  startDate: z.date({
    required_error: "Please select a date and time",
    invalid_type_error: "That's not a date!",
  }),
  endDate: z.date({
    required_error: "Please select a date and time",
    invalid_type_error: "That's not a date!",
  }),
  duration: z
    .number({ invalid_type_error: "Must be a number" })
    .min(1, { message: "Must stay for at least 1 day" }),
});

export type modifyBookingSchema = z.infer<typeof modifyBookingObject>;
