import mongoose from "mongoose";
import Day from "../daySchema";
import Calendar from "../calendarSchema";
import Room from "../roomSchema";
import Guest from "../guestSchema";
import { createMockHost } from "./util/mockHost";

describe("Day Schema - Test Suite", () => {
  describe("Day Schema - Schema Validation", () => {
    it("should create a valid day document", async () => {
      const host = await createMockHost("anhtp5@uci.edu");
      const calendar = await new Calendar({
        host: host,
      }).save();
      const dayData = {
        calendar: calendar._id,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow's date
      };

      const day = new Day(dayData);
      const savedDay = await day.save();

      expect(savedDay._id).toBeDefined();
      expect(savedDay.calendar.toString()).toBe(calendar._id.toString());
      expect(savedDay.isAirBnB).toBe(false);
      expect(savedDay.isBlocked).toBe(false);
    });

    it("should throw a validation error for missing required fields", async () => {
      const day = new Day({});

      await expect(day.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it("should throw an error if the date is in the past", async () => {
      const host = await createMockHost("anhtp5@uci.edu");
      const calendar = await new Calendar({
        host: host,
      }).save();
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday's date

      const dayData = {
        calendar: calendar._id,
        date: pastDate,
      };

      const day = new Day(dayData);

      await expect(day.save()).rejects.toThrow("Date cannot be in the past.");
    });

    it("should throw an error if a blocked day has a guest assigned", async () => {
      const host = await createMockHost("anhtp5@uci.edu");
      const calendar = await new Calendar({
        host: host,
      }).save();
      const guest = await new Guest({
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "4086096660",
        host: host,
      }).save();

      const dayData = {
        calendar: calendar._id,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow's date
        isBlocked: true,
        bookings: { guest: [guest._id] },
      };

      const day = new Day(dayData);

      await expect(day.save()).rejects.toThrow(
        "A blocked day cannot have a guest or a room assigned."
      );
    });

    it("should throw an error if a blocked day has a room assigned", async () => {
      const host = await createMockHost("anhtp5@uci.edu");
      const calendar = await new Calendar({
        host: host,
      }).save();
      const room = await new Room({
        host: host,
        name: "Deluxe Room",
        price: 150,
      }).save();

      const dayData = {
        calendar: calendar._id,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow's date
        isBlocked: true,
        bookings: { room: [room._id] },
      };

      const day = new Day(dayData);

      await expect(day.save()).rejects.toThrow(
        "A blocked day cannot have a guest or a room assigned."
      );
    });

    it("should enforce unique constraint on calendar and date", async () => {
      const host = await createMockHost("anhtp5@uci.edu");
      const calendar = await new Calendar({
        host: host,
      }).save();

      const dayData = {
        calendar: calendar._id,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow's date
      };

      await new Day(dayData).save();

      const duplicateDay = new Day(dayData);

      await expect(duplicateDay.save()).rejects.toThrow(
        "E11000 duplicate key error"
      );
    });
  });

  describe("Day Schema - CREATE", () => {
    it("should create a valid day", async () => {
      const host = await createMockHost("host@example.com");
      const calendar = await new Calendar({ host: host._id }).save();

      const dayData = {
        calendar: calendar._id,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow's date
      };

      const day = new Day(dayData);
      const savedDay = await day.save();

      expect(savedDay._id).toBeDefined();
      expect(savedDay.calendar.toString()).toBe(calendar._id.toString());
      expect(savedDay.isAirBnB).toBe(false); // Default value
      expect(savedDay.isBlocked).toBe(false); // Default value
    });

    it("should throw a validation error for missing required fields", async () => {
      const day = new Day({}); // Missing calendar and date

      await expect(day.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it("should throw an error if the date is in the past", async () => {
      const host = await createMockHost("host@example.com");
      const calendar = await new Calendar({ host: host._id }).save();

      const dayData = {
        calendar: calendar._id,
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday's date
      };

      const day = new Day(dayData);

      await expect(day.save()).rejects.toThrow("Date cannot be in the past.");
    });

    it("should throw an error if a blocked day has a guest assigned", async () => {
      const host = await createMockHost("host@example.com");
      const calendar = await new Calendar({ host: host._id }).save();
      const guest = await new Guest({
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "1234567890",
        host: host._id,
      }).save();

      const dayData = {
        calendar: calendar._id,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow's date
        isBlocked: true,
        bookings: [{ guest: [guest._id] }],
      };

      const day = new Day(dayData);

      await expect(day.save()).rejects.toThrow(
        "A blocked day cannot have a guest or a room assigned."
      );
    });

    it("should throw an error if a blocked day has a room assigned", async () => {
      const host = await createMockHost("host@example.com");
      const calendar = await new Calendar({ host: host._id }).save();
      const room = await new Room({
        host: host._id,
        name: "Deluxe Room",
        price: 150,
      }).save();

      const dayData = {
        calendar: calendar._id,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow's date
        isBlocked: true,
        bookings: [{ rooms: [room._id] }],
      };

      const day = new Day(dayData);

      await expect(day.save()).rejects.toThrow(
        "A blocked day cannot have a guest or a room assigned."
      );
    });

    it("should enforce unique constraint on calendar and date", async () => {
      const host = await createMockHost("host@example.com");
      const calendar = await new Calendar({ host: host._id }).save();

      const dayData = {
        calendar: calendar._id,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow's date
      };

      await new Day(dayData).save();

      const duplicateDay = new Day(dayData);

      await expect(duplicateDay.save()).rejects.toThrow(
        "E11000 duplicate key error"
      );
    });
  });

  describe("Day Schema - READ", () => {
    it("should fetch a day by ID", async () => {
      const host = await createMockHost("host@example.com");
      const calendar = await new Calendar({ host: host._id }).save();

      const dayData = {
        calendar: calendar._id,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow's date
      };

      const savedDay = await new Day(dayData).save();
      const fetchedDay = await Day.findById(savedDay._id);

      expect(fetchedDay).toBeDefined();
      expect(fetchedDay?._id.toString()).toBe(savedDay._id.toString());
      expect(fetchedDay?.calendar.toString()).toBe(calendar._id.toString());
    });

    it("should fetch all days for a specific calendar", async () => {
      const host = await createMockHost("host@example.com");
      const calendar = await new Calendar({ host: host._id }).save();

      const day1 = await new Day({
        calendar: calendar._id,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      }).save();

      const day2 = await new Day({
        calendar: calendar._id,
        date: new Date(Date.now() + 48 * 60 * 60 * 1000), // Day after tomorrow
      }).save();

      const fetchedDays = await Day.find({ calendar: calendar._id });

      expect(fetchedDays).toHaveLength(2);
      expect(fetchedDays.map((day) => day.date)).toEqual(
        expect.arrayContaining([day1.date, day2.date])
      );
    });

    it("should fetch all days within a specific date range", async () => {
      const host = await createMockHost("host@example.com");
      const calendar = await new Calendar({ host: host._id }).save();

      const day1 = await new Day({
        calendar: calendar._id,
        date: new Date(2025, 11, 1),
      }).save();

      const day2 = await new Day({
        calendar: calendar._id,
        date: new Date(2025, 11, 15),
      }).save();

      const day3 = await new Day({
        calendar: calendar._id,
        date: new Date(2026, 0, 1),
      }).save();

      const fetchedDays = await Day.find({
        calendar: calendar._id,
        date: { $gte: new Date("2025-12-01"), $lte: new Date("2025-12-31") },
      });

      expect(fetchedDays).toHaveLength(2);
      expect(fetchedDays.map((day) => day.date)).toEqual(
        expect.arrayContaining([day1.date, day2.date])
      );
    });

    it("should fetch all blocked days", async () => {
      const host = await createMockHost("host@example.com");
      const calendar = await new Calendar({ host: host._id }).save();

      const blockedDay = await new Day({
        calendar: calendar._id,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        isBlocked: true,
      }).save();

      const normalDay = await new Day({
        calendar: calendar._id,
        date: new Date(Date.now() + 48 * 60 * 60 * 1000),
        isBlocked: false,
      }).save();

      const fetchedDays = await Day.find({ isBlocked: true });

      expect(fetchedDays).toHaveLength(1);
      expect(fetchedDays[0]._id.toString()).toBe(blockedDay._id.toString());
    });

    it("should fetch days with pagination and sort by date", async () => {
      const host = await createMockHost("host@example.com");
      const calendar = await new Calendar({ host: host._id }).save();

      for (let i = 1; i <= 10; i++) {
        await new Day({
          calendar: calendar._id,
          date: new Date(2025, 11, i),
        }).save();
      }

      const fetchedDays = await Day.find({ calendar: calendar._id })
        .sort({ date: 1 }) // Ascending order
        .limit(5) // Limit to 5 documents
        .skip(5); // Skip the first 5 documents

      expect(fetchedDays).toHaveLength(5);
      expect(fetchedDays[0].date.toISOString().split("T")[0]).toBe(
        new Date("2025-12-06").toISOString().split("T")[0]
      );
    });
  });

  describe("Day Schema - UPDATE", () => {
    it("should update the isBlocked field of a day", async () => {
      const host = await createMockHost("host@example.com");
      const calendar = await new Calendar({ host: host._id }).save();

      const dayData = {
        calendar: calendar._id,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow's date
        isBlocked: false,
      };

      const savedDay = await new Day(dayData).save();

      const updatedDay = await Day.findByIdAndUpdate(
        savedDay._id,
        { isBlocked: true },
        { new: true, runValidators: true }
      );

      expect(updatedDay).toBeDefined();
      expect(updatedDay?.isBlocked).toBe(true);
    });

    it("should throw an error when assigning a guest to a blocked day", async () => {
      const host = await createMockHost("host@example.com");
      const calendar = await new Calendar({ host: host._id }).save();
      const guest = await new Guest({
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "1234567890",
        host: host._id,
      }).save();

      const dayData = {
        calendar: calendar._id,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow's date
        isBlocked: true,
      };

      const savedDay = await new Day(dayData).save();

      await expect(
        Day.findByIdAndUpdate(
          savedDay._id,
          { bookings: [{ guest: guest._id }] },
          { new: true, runValidators: true }
        )
      ).rejects.toThrow(
        "A blocked day cannot have a guest or a room assigned."
      );
    });

    it("should update the date field of a day", async () => {
      const host = await createMockHost("host@example.com");
      const calendar = await new Calendar({ host: host._id }).save();

      const dayData = {
        calendar: calendar._id,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow's date
      };

      const savedDay = await new Day(dayData).save();

      const newDate = new Date(Date.now() + 48 * 60 * 60 * 1000); // Day after tomorrow
      const updatedDay = await Day.findByIdAndUpdate(
        savedDay._id,
        { date: newDate },
        { new: true, runValidators: true }
      );

      expect(updatedDay).toBeDefined();
      expect(updatedDay?.date.toISOString()).toBe(newDate.toISOString());
    });

    it("should update multiple days to set isBlocked to true", async () => {
      const host = await createMockHost("host@example.com");
      const calendar = await new Calendar({ host: host._id }).save();

      for (let i = 1; i <= 3; i++) {
        await new Day({
          calendar: calendar._id,
          date: new Date(`2025-12-${i}`),
          isBlocked: false,
        }).save();
      }

      const updatedDays = await Day.updateMany(
        { calendar: calendar._id },
        { isBlocked: true }
      );

      expect(updatedDays.modifiedCount).toBe(3);

      const fetchedDays = await Day.find({ calendar: calendar._id });
      fetchedDays.forEach((day) => {
        expect(day.isBlocked).toBe(true);
      });
    });

    it("should throw an error when updating date to a past value", async () => {
      const host = await createMockHost("host@example.com");
      const calendar = await new Calendar({ host: host._id }).save();

      const dayData = {
        calendar: calendar._id,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow's date
      };

      const savedDay = await new Day(dayData).save();

      await expect(
        Day.findByIdAndUpdate(
          savedDay._id,
          { date: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Yesterday's date
          { new: true, runValidators: true }
        )
      ).rejects.toThrow("Date cannot be in the past.");
    });
  });

  describe("Day Schema - DELETE", () => {
    it("should delete a single day by ID", async () => {
      const host = await createMockHost("host@example.com");
      const calendar = await new Calendar({ host: host._id }).save();

      const dayData = {
        calendar: calendar._id,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow's date
      };

      const savedDay = await new Day(dayData).save();

      // Delete the day
      await Day.findByIdAndDelete(savedDay._id);

      // Verify the day no longer exists
      const deletedDay = await Day.findById(savedDay._id);
      expect(deletedDay).toBeNull();
    });

    it("should delete all days for a specific calendar", async () => {
      const host = await createMockHost("host@example.com");
      const calendar = await new Calendar({ host: host._id }).save();

      for (let i = 1; i <= 5; i++) {
        await new Day({
          calendar: calendar._id,
          date: new Date(`2025-12-${i}`),
        }).save();
      }

      // Verify all days are created
      const initialCount = await Day.countDocuments({ calendar: calendar._id });
      expect(initialCount).toBe(5);

      // Bulk delete all days for the calendar
      const result = await Day.deleteMany({ calendar: calendar._id });

      // Verify deletion count
      expect(result.deletedCount).toBe(5);

      // Verify no days remain for the calendar
      const remainingCount = await Day.countDocuments({
        calendar: calendar._id,
      });
      expect(remainingCount).toBe(0);
    });

    it("should not throw an error when attempting to delete a nonexistent day", async () => {
      const nonexistentId = new mongoose.Types.ObjectId();

      const result = await Day.findByIdAndDelete(nonexistentId);

      // Verify no document was deleted
      expect(result).toBeNull();
    });

    it("should delete some days and retain the rest", async () => {
      const host = await createMockHost("host@example.com");
      const calendar = await new Calendar({ host: host._id }).save();

      for (let i = 1; i <= 10; i++) {
        await new Day({
          calendar: calendar._id,
          date: new Date(2025, 11, i),
        }).save();
      }

      // Bulk delete days within a specific date range
      const result = await Day.deleteMany({
        calendar: calendar._id,
        date: { $lte: new Date(2025, 11, 5) },
      });

      // Verify deletion count
      expect(result.deletedCount).toBe(5);

      // Verify remaining documents
      const remainingDays = await Day.find({ calendar: calendar._id });
      expect(remainingDays).toHaveLength(5);
      expect(remainingDays.map((day) => day.date.toISOString())).toEqual(
        expect.arrayContaining([
          new Date(2025, 11, 6).toISOString(),
          new Date(2025, 11, 7).toISOString(),
          new Date(2025, 11, 8).toISOString(),
          new Date(2025, 11, 9).toISOString(),
          new Date(2025, 11, 10).toISOString(),
        ])
      );
    });

    it("should not throw an error when attempting to bulk delete from an empty collection", async () => {
      const result = await Day.deleteMany({
        calendar: new mongoose.Types.ObjectId(),
      });

      // Verify no documents were deleted
      expect(result.deletedCount).toBe(0);
    });
  });
});
