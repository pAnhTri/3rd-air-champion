import mongoose from "mongoose";
import Host from "./hostSchema";
import Day from "./daySchema";

const roomSchema = new mongoose.Schema(
  {
    host: { type: mongoose.Schema.ObjectId, ref: "Host", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { timestamps: true }
);

roomSchema.pre("validate", function (next) {
  // Price validation
  if (this.price < 0) return next(new Error("Price must be positive number"));

  const specialCharRegex = /[`!@#$%^&*()_+=\[\]{};:"\\|,<>\/?~]/;

  if (specialCharRegex.test(this.name))
    return next(new Error("Name cannot contain special characters"));

  return next();
});

roomSchema.pre(
  ["deleteOne", "deleteMany", "findOneAndDelete"],
  async function (next) {
    const query = this.getQuery();

    (this as any).toBeDeletedRooms = await mongoose.model("Room").find(query);

    return next();
  }
);

roomSchema.pre(
  ["findOneAndUpdate", "updateOne", "updateMany"],
  async function (next) {
    const query = this.getQuery();
    const update = this.getUpdate();

    // Ensure shared variables are initialized
    (this as any).originalRooms = [];
    (this as any).originalHostIds = [];

    const rooms = await mongoose.model("Room").find(query);

    if (update && typeof update === "object" && !Array.isArray(update)) {
      if ("price" in update) {
        const newPrice = update.price;
        if (typeof newPrice !== "number" || newPrice <= 0) {
          return next(new Error("Price must be a positive number"));
        }
      }

      if ("host" in update) {
        const newHost = update.host;
        if (!(await Host.exists(newHost)))
          return next(new Error("Host does not exist"));
      }
    }

    for (const room of rooms) {
      (this as any).originalHostIds.push(room.host);
    }

    return next();
  }
);

roomSchema.post("save", async function (doc) {
  await Host.findByIdAndUpdate(
    doc.host,
    { $addToSet: { rooms: doc._id } },
    { new: true }
  );
});

roomSchema.post("findOneAndDelete", async function (doc) {
  await Host.findByIdAndUpdate(
    doc.host,
    { $pull: { rooms: doc._id } },
    { new: true }
  );

  await Day.updateMany(
    { room: doc._id },
    { $unset: { guest: "", room: "" } },
    { new: true }
  );
});

roomSchema.post("deleteMany", async function (doc) {
  const toBeDeletedRoomsIds = (this as any).toBeDeletedRooms.map(
    (room: any) => room._id
  );

  await Day.updateMany(
    { room: { $in: toBeDeletedRoomsIds } }, // Match any `guest` in the array
    { $unset: { guest: "", room: "" } }, // Unset `guest` and `room` fields
    { new: true }
  );
});
// Post-hook to update hosts after the update
roomSchema.post("findOneAndUpdate", async function (doc) {
  // Access shared variables from `this`
  const originalHostIds = (this as any).originalHostIds;

  const roomId = this.getQuery()._id;
  if (doc) {
    const newHostId = doc.host as mongoose.Types.ObjectId;

    // If the host has changed, remove the room reference from the old host
    if (
      originalHostIds[0] &&
      originalHostIds[0].toString() !== newHostId.toString()
    ) {
      await Host.findByIdAndUpdate(originalHostIds[0], {
        $pull: { rooms: roomId },
      });
    }

    // Ensure the new host references the updated room
    await Host.findByIdAndUpdate(newHostId, { $addToSet: { rooms: roomId } });
  }
});

roomSchema.post("updateMany", async function () {
  const update = this.getUpdate();

  if (update && typeof update === "object" && !Array.isArray(update)) {
    if (update.$set && "host" in update.$set) {
      const newHost = update.$set?.host;
      const rooms = await mongoose.model("Room").find({ host: newHost });
      const roomIds = rooms.map((room) => room._id);

      await Host.updateMany(
        { _id: { $ne: newHost }, rooms: { $in: roomIds } },
        { $pull: { rooms: { $in: roomIds } } }
      );

      await Host.findByIdAndUpdate(newHost, {
        $addToSet: { rooms: { $each: roomIds } },
      });
    }
  }
});

roomSchema.index({ hostId: 1, name: 1 }, { unique: true });

export default mongoose.model("Room", roomSchema);
