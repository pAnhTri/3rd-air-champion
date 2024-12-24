import mongoose from "mongoose";
import Host from "./hostSchema";
import Day from "./daySchema";

const calendarSchema = new mongoose.Schema(
  {
    host: { type: mongoose.Schema.ObjectId, ref: "Host", required: true },
  },
  { timestamps: true }
);

// Pre-hook to fetch the original host before the update
calendarSchema.pre("findOneAndUpdate", async function (next) {
  const calendarId = this.getQuery()._id;
  const update = this.getUpdate();

  const calendar = await mongoose.model("Calendar").findById(calendarId);
  (this as any).originalHostId = calendar.host;

  if (update && typeof update === "object" && !Array.isArray(update)) {
    if ("host" in update) {
      // Proceed with validation
      const newHostId = update.host;

      if (newHostId) {
        const hostExists = await Host.exists({ _id: newHostId });
        if (!hostExists) {
          return next(new Error("Host does not exist"));
        }
      }
    }
  }

  next();
});

calendarSchema.pre("save", async function (next) {
  if (!(await Host.exists({ _id: this.host })))
    return next(new Error("Host does not exist"));
  return next();
});

calendarSchema.post("save", async function (doc) {
  await Host.findByIdAndUpdate(doc.host, { calendar: doc._id }, { new: true });
});

calendarSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Host.findByIdAndUpdate(
      doc.host,
      { $unset: { calendar: "" } },
      { new: true }
    );
  }

  await Day.deleteMany({ calendar: doc._id });
});

// Post-hook to update hosts after the update
calendarSchema.post("findOneAndUpdate", async function (doc) {
  if (doc) {
    const newHostId = doc.host as mongoose.Types.ObjectId;
    const originalHostId = (this as any).originalHostId;
    // If the host has changed, remove the calendar reference from the old host
    if (originalHostId && originalHostId.toString() !== newHostId.toString()) {
      await Host.findByIdAndUpdate(originalHostId, {
        $unset: { calendar: "" },
      });
    }

    // Ensure the new host references the updated calendar
    await Host.findByIdAndUpdate(newHostId, { calendar: doc._id });
  }
});

calendarSchema.index({ host: 1 }, { unique: true });

export default mongoose.model("Calendar", calendarSchema);
