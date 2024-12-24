import mongoose from "mongoose";
import { startOfDay, isBefore, isEqual, startOfToday } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const daySchema = new mongoose.Schema(
  {
    calendar: {
      type: mongoose.Schema.ObjectId,
      ref: "Calendar",
      required: true,
    },
    date: { type: Date, required: true },
    isAirBnB: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    room: { type: mongoose.Schema.ObjectId, ref: "Room" },
    guest: { type: mongoose.Schema.ObjectId, ref: "Guest" },
  },
  { timestamps: true }
);

daySchema.index({ calendarId: 1, date: 1 }, { unique: true });
daySchema.index({ isAirBnB: 1 });
daySchema.index({ isBlocked: 1 });

daySchema.pre("validate", function (next) {
  // Check if day already exists
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const currentDate = startOfToday();
  const inputDate = toZonedTime(this.date, timeZone);

  if (isBefore(inputDate, currentDate) || isEqual(inputDate, currentDate)) {
    return next(new Error("Date cannot be in the past."));
  }

  next();
});

daySchema.pre(
  ["updateOne", "updateMany", "findOneAndUpdate"],
  async function (next) {
    const dayId = this.getQuery()._id;
    const dayUpdate = this.getUpdate();
    const day = await mongoose.model("Day").findById(dayId);

    if (
      dayUpdate &&
      typeof dayUpdate === "object" &&
      !Array.isArray(dayUpdate)
    ) {
      if ("guest" in dayUpdate || "room" in dayUpdate) {
        if (day.isBlocked)
          return next(
            new Error("A blocked day cannot have a guest or a room assigned.")
          );
      }

      if ("date" in dayUpdate) {
        // Check if day already exists
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const currentDate = startOfToday();
        const inputDate = toZonedTime(dayUpdate.date, timeZone);

        if (
          isBefore(inputDate, currentDate) ||
          isEqual(inputDate, currentDate)
        ) {
          return next(new Error("Date cannot be in the past."));
        }
      }
    }
  }
);

daySchema.pre("save", function (next) {
  if (this.date) {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.date = toZonedTime(this.date, timeZone);
  }

  if (this.isBlocked && (this.guest || this.room)) {
    return next(
      new Error("A blocked day cannot have a guest or a room assigned.")
    );
  }
  next();
});

export default mongoose.model("Day", daySchema);
