import mongoose from "mongoose";
import Calendar from "../calendarSchema";
import Day from "../daySchema";
import { createMockHost } from "./util/mockHost";
import Host from "../hostSchema";

describe("Calendar Schema - Valid", () => {
  it("should save single calendar", async () => {
    const host = await createMockHost("anhtp5@uci.edu");

    const calendarData = {
      host: host._id,
    };

    const calendar = new Calendar(calendarData);
    const savedCalendar = await calendar.save();

    expect(savedCalendar._id).toBeDefined();
    expect(savedCalendar.host?.toString()).toBe(host._id.toString());

    const updatedHost = await Host.findById(host._id).populate("calendar");
    expect(updatedHost).toBeDefined();
    expect(updatedHost?.calendar).toBeDefined();
    expect(updatedHost?.calendar?._id.toString()).toBe(
      savedCalendar._id.toString()
    );
  });
});

describe("Calendar Schema - Invalid", () => {
  it("should fail to save single calendar to a nonexistent host", async () => {
    const host = new mongoose.Types.ObjectId();

    const calendarData = {
      host: host._id,
    };

    const calendar = new Calendar(calendarData);
    await expect(calendar.save()).rejects.toThrow();
  });

  it("should fail if host is not an ObjectId", async () => {
    const calendarData = { host: "invalid-host-id" };
    const calendar = new Calendar(calendarData);

    await expect(calendar.save()).rejects.toThrow();
  });

  it("should fail if host is missing", async () => {
    const calendarData = {};
    const calendar = new Calendar(calendarData);

    await expect(calendar.save()).rejects.toThrow();
  });

  it("should fail to save calendar if host is deleted during save", async () => {
    const host = await createMockHost("anhtp5@uci.edu");

    const calendarData = { host: host._id };
    const calendar = new Calendar(calendarData);

    // Simulate host deletion before saving the calendar
    await Host.findByIdAndDelete(host._id);

    await expect(calendar.save()).rejects.toThrow("Host does not exist");
  });

  it("should fail to save duplicate calendars for the same host", async () => {
    const host = await createMockHost("anhtp5@uci.edu");

    const calendarData = { host: host._id };

    const calendar1 = new Calendar(calendarData);
    await calendar1.save();

    const calendar2 = new Calendar(calendarData);
    await expect(calendar2.save()).rejects.toThrow();
  });
});

describe("Calendar Schema - Deletion", () => {
  it("should remove host's calendar reference when calendar is deleted", async () => {
    const host = await createMockHost("anhtp5@uci.edu");

    const calendarData = { host: host._id };
    const calendar = new Calendar(calendarData);
    const savedCalendar = await calendar.save();

    let updatedHost = await Host.findById(host._id).populate("calendar");

    expect(updatedHost).toBeDefined();
    expect(updatedHost?.calendar).toBeDefined();
    expect(updatedHost?.calendar?._id.toString()).toBe(
      savedCalendar._id.toString()
    );

    await Calendar.findByIdAndDelete(savedCalendar._id);

    updatedHost = await Host.findById(host._id);
    expect(updatedHost?.calendar).toBeUndefined;
  });

  it("should delete all associated Day documents when a Calendar is deleted", async () => {
    // Create a mock host
    const host = await createMockHost("cascade@test.com");

    // Create and save a calendar for the host
    const calendar = new Calendar({ host: host._id });
    const savedCalendar = await calendar.save();

    // Create and save days associated with the calendar
    const days = await Promise.all(
      Array.from({ length: 3 }, (_, i) =>
        new Day({
          calendar: savedCalendar._id,
          date: new Date(Date.now() + (i + 3) * 86400000),
        }).save()
      )
    );

    // Verify the days were created
    const dayCountBeforeDelete = await Day.countDocuments({
      calendar: savedCalendar._id,
    });
    expect(dayCountBeforeDelete).toBe(3);

    // Delete the calendar
    await Calendar.findByIdAndDelete(savedCalendar._id);

    // Verify associated days are deleted
    const dayCountAfterDelete = await Day.countDocuments({
      calendar: savedCalendar._id,
    });
    expect(dayCountAfterDelete).toBe(0);
  });
});

describe("Calendar Schema - Stress", () => {
  it("should handle bulk deletion of calendars", async () => {
    const hosts = await Promise.all(
      Array.from({ length: 5 }, (_, i) =>
        createMockHost(`host${i}@example.com`)
      )
    );

    await Promise.all(
      hosts.map((host) => new Calendar({ host: host._id }).save())
    );

    await Calendar.deleteMany({});

    const remainingCalendars = await Calendar.find({});
    expect(remainingCalendars.length).toBe(0);
  });
});

describe("Calendar Schema - Read", () => {
  it("should fetch a single calendar by ID", async () => {
    const host = await createMockHost("anhtp5@uci.edu");

    const calendarData = { host: host._id };
    const calendar = new Calendar(calendarData);
    const savedCalendar = await calendar.save();

    const fetchedCalendar = await Calendar.findById(savedCalendar._id).populate(
      "host"
    );

    expect(fetchedCalendar).toBeDefined();
    expect(fetchedCalendar?.host._id.toString()).toBe(host._id.toString());
  });

  it("should fetch all calendars", async () => {
    const hosts = await Promise.all(
      Array.from({ length: 3 }, (_, i) =>
        createMockHost(`host${i}@example.com`)
      )
    );

    const calendars = await Promise.all(
      hosts.map((host) => new Calendar({ host: host._id }).save())
    );

    const fetchedCalendars = await Calendar.find({}).populate("host");

    expect(fetchedCalendars.length).toBe(3);
    calendars.forEach((calendar, index) => {
      expect(calendar.host._id.toString()).toBe(hosts[index]._id.toString());
    });
  });
});

describe("Calendar Schema - Update", () => {
  it("should update the calendar's host and reflect changes in both hosts", async () => {
    const oldHost = await createMockHost("oldhost@example.com");
    const newHost = await createMockHost("newhost@example.com");

    const calendarData = { host: oldHost._id };
    const calendar = new Calendar(calendarData);
    const savedCalendar = await calendar.save();

    // Update the host reference
    const updatedCalendar = await Calendar.findByIdAndUpdate(
      savedCalendar._id,
      { host: newHost._id },
      { new: true, runValidators: true }
    );

    // Verify the updated calendar
    expect(updatedCalendar).toBeDefined();
    expect(updatedCalendar?.host.toString()).toBe(newHost._id.toString());

    // Verify old host no longer references the calendar
    const updatedOldHost = await Host.findById(oldHost._id);
    expect(updatedOldHost?.calendar).toBeUndefined();

    // Verify new host references the calendar
    const updatedNewHost = await Host.findById(newHost._id).populate(
      "calendar"
    );
    expect(updatedNewHost?.calendar?._id.toString()).toBe(
      savedCalendar._id.toString()
    );
  });

  it("should not update calendar with invalid data", async () => {
    const host = await createMockHost("validhost@example.com");

    const calendarData = { host: host._id };
    const calendar = new Calendar(calendarData);
    const savedCalendar = await calendar.save();

    // Attempt invalid update (non-existent host)
    const invalidHostId = new mongoose.Types.ObjectId();
    await expect(
      Calendar.findByIdAndUpdate(
        savedCalendar._id,
        { host: invalidHostId },
        { new: true, runValidators: true }
      )
    ).rejects.toThrow("Host does not exist");
  });

  it("should skip validation when neither $set nor host is in the update", async () => {
    const host = await createMockHost("anhtp5@uci.edu");

    // Create and save a calendar
    const calendarData = { host: host._id };
    const calendar = new Calendar(calendarData);
    await calendar.save();

    // Perform an update that does not contain $set or host
    const updateData = { someIrrelevantField: "newValue" };

    expect(
      Calendar.findOneAndUpdate(
        { _id: calendar._id },
        updateData, // Invalid update missing $set and host
        { new: true, runValidators: true }
      )
    ).toBeDefined();
  });
});
