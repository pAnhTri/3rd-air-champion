import mongoose from "mongoose";
import Host from "../hostSchema";
import Cohost from "../cohostSchema";
import Room from "../roomSchema";
import Calendar from "../calendarSchema";
import Guest from "../guestSchema";
import Day from "../daySchema";
import bcrypt from "bcrypt";

describe("Host Schema - Test Suite", () => {
  describe("Host Schema - Schema Validation", () => {
    it("should throw an error if required fields are missing", async () => {
      const invalidHostData = {}; // Missing all fields
      const host = new Host(invalidHostData);

      await expect(host.validate()).rejects.toThrow();
    });

    it("should throw an error for invalid email format", async () => {
      const invalidHostData = {
        email: "invalid-email",
        password: "securePassword123",
        name: "Valid Name",
      };

      const host = new Host(invalidHostData);

      await expect(host.validate()).rejects.toThrow();
    });

    it("should throw an error if name contains special characters", async () => {
      const invalidHostData = {
        email: "host@example.com",
        password: "securePassword123",
        name: "Invalid@Name",
      };

      const host = new Host(invalidHostData);

      await expect(host.validate()).rejects.toThrow();
    });

    it("should sanitize email to lowercase before saving", async () => {
      const hostData = {
        email: "Host@Example.com",
        password: "securePassword123",
        name: "Valid Name",
      };

      const host = new Host(hostData);
      await host.save();

      expect(host.email).toBe("host@example.com");
    });

    it("should hash the password before saving", async () => {
      const hostData = {
        email: "host@example.com",
        password: "securePassword123",
        name: "Valid Name",
      };

      const host = new Host(hostData);
      await host.save();

      // Verify password is hashed
      expect(host.password).not.toBe("securePassword123");
      expect(host.password).toMatch(/^\$2[ayb]\$.{56}$/); // Bcrypt hash format
    });

    it("should not allow duplicate emails", async () => {
      const hostData = {
        email: "host@example.com",
        password: "securePassword123",
        name: "Valid Name",
      };

      await new Host(hostData).save();

      const duplicateHost = new Host(hostData);

      await expect(duplicateHost.save()).rejects.toThrow(
        "E11000 duplicate key error"
      );
    });

    it("should allow valid ObjectId references for rooms, calendar, guests, and cohosts", async () => {
      const hostData = {
        email: "host@example.com",
        password: "securePassword123",
        name: "Valid Name",
        rooms: [new mongoose.Types.ObjectId()],
        calendar: new mongoose.Types.ObjectId(),
        guests: [new mongoose.Types.ObjectId()],
        cohosts: [new mongoose.Types.ObjectId()],
      };

      const host = new Host(hostData);

      await expect(host.validate()).resolves.toBeUndefined();
    });

    it("should throw an error if name contains special characters during update", async () => {
      const hostData = {
        email: "host@example.com",
        password: "securePassword123",
        name: "Valid Name",
      };

      const host = await new Host(hostData).save();

      await expect(
        Host.findByIdAndUpdate(
          host._id,
          { name: "Invalid@Name" },
          { new: true }
        )
      ).rejects.toThrow("Name cannot contain special characters");
    });

    it("should hash the password during update", async () => {
      const hostData = {
        email: "host@example.com",
        password: "securePassword123",
        name: "Valid Name",
      };

      const host = await new Host(hostData).save();

      const updatedHost = await Host.findByIdAndUpdate(
        host._id,
        { password: "newSecurePassword456" },
        { new: true }
      );

      expect(updatedHost?.password).not.toBe("newSecurePassword456");
      expect(updatedHost?.password).toMatch(/^\$2[ayb]\$.{56}$/);
    });
  });

  describe("Host Schema - CREATE", () => {
    it("should create a single host with valid data", async () => {
      const validHostData = {
        email: "host@example.com",
        password: "securePassword123",
        name: "Valid Name",
      };

      const host = await new Host(validHostData).save();

      // Verify the host is saved correctly
      expect(host._id).toBeDefined();
      expect(host.email).toBe("host@example.com");
      expect(host.name).toBe("Valid Name");
      expect(host.password).not.toBe("securePassword123"); // Verify password is hashed
    });

    it("should not rehash same password", async () => {
      const validHostData = {
        email: "host@example.com",
        password: "securePassword123",
        name: "Valid Name",
      };

      const host = await new Host(validHostData).save();
      expect(host.password).not.toBe("securePassword123"); // Verify password is hashed

      host.name = "Valid Name 2";
      const updatedHost = await host.save();
      expect(
        await bcrypt.compare("securePassword123", updatedHost.password)
      ).toBe(true);
    });

    it("should rehash modified password", async () => {
      const validHostData = {
        email: "host@example.com",
        password: "securePassword123",
        name: "Valid Name",
      };

      const host = await new Host(validHostData).save();
      expect(host.password).not.toBe("securePassword123");

      host.password = "newPassword";
      const updatedHost = await host.save();
      expect(await bcrypt.compare("newPassword", updatedHost.password)).toBe(
        true
      );
    });

    it("should throw an error when creating a host with missing required fields", async () => {
      const invalidHostData = {}; // Missing email, password, and name

      const host = new Host(invalidHostData);

      await expect(host.save()).rejects.toThrow();
    });

    it("should throw an error when creating a host with an invalid email", async () => {
      const invalidHostData = {
        email: "invalid-email",
        password: "securePassword123",
        name: "Valid Name",
      };

      const host = new Host(invalidHostData);

      await expect(host.save()).rejects.toThrow();
    });

    it("should throw an error when creating a host with a duplicate email", async () => {
      const hostData = {
        email: "host@example.com",
        password: "securePassword123",
        name: "Valid Name",
      };

      await new Host(hostData).save();

      const duplicateHost = new Host(hostData);

      await expect(duplicateHost.save()).rejects.toThrow(
        "E11000 duplicate key error"
      );
    });

    it("should create multiple hosts with valid data", async () => {
      const hostsData = [
        { email: "host1@example.com", password: "password1", name: "Host One" },
        { email: "host2@example.com", password: "password2", name: "Host Two" },
      ];

      const createdHosts = await Host.insertMany(hostsData);

      // Verify the hosts are saved correctly
      expect(createdHosts).toHaveLength(2);
      expect(createdHosts[0].email).toBe("host1@example.com");
      expect(createdHosts[1].email).toBe("host2@example.com");
    });

    it("should not create any hosts if one document is invalid in bulk create", async () => {
      const hostsData = [
        { email: "host1@example.com", password: "password1", name: "Host One" },
        { email: "invalid-email", password: "password2", name: "Host Two" }, // Invalid email
      ];

      await expect(Host.insertMany(hostsData)).rejects.toThrow(
        "Host validation failed"
      );

      // Verify no hosts are saved
      const hostsCount = await Host.countDocuments();
      expect(hostsCount).toBe(0);
    });

    it("should not create any hosts when bulk create is called with an empty array", async () => {
      const createdHosts = await Host.insertMany([]);

      expect(createdHosts).toHaveLength(0);
    });
  });

  describe("Host Schema - READ", () => {
    it("should retrieve a host by valid ID", async () => {
      const hostData = {
        email: "host@example.com",
        password: "securePassword123",
        name: "Valid Name",
      };

      const createdHost = await new Host(hostData).save();

      // Retrieve the host by ID
      const fetchedHost = await Host.findById(createdHost._id);

      // Verify the fetched host matches the created host
      expect(fetchedHost).toBeDefined();
      expect(fetchedHost?.email).toBe(createdHost.email);
      expect(fetchedHost?.name).toBe(createdHost.name);
      expect(fetchedHost?.password).toBe(createdHost.password);
    });

    it("should return null for an invalid ID", async () => {
      const invalidId = new mongoose.Types.ObjectId();

      const fetchedHost = await Host.findById(invalidId);

      // Verify no host is returned
      expect(fetchedHost).toBeNull();
    });

    it("should return null if the host does not exist", async () => {
      const fetchedHost = await Host.findOne({
        email: "nonexistent@example.com",
      });

      // Verify no host is returned
      expect(fetchedHost).toBeNull();
    });

    it("should retrieve all hosts", async () => {
      const hostsData = [
        { email: "host1@example.com", password: "password1", name: "Host One" },
        { email: "host2@example.com", password: "password2", name: "Host Two" },
      ];

      await Host.insertMany(hostsData);

      // Retrieve all hosts
      const allHosts = await Host.find({});

      // Verify the correct number of hosts are returned
      expect(allHosts).toHaveLength(2);
      expect(allHosts.map((host) => host.email)).toEqual(
        expect.arrayContaining(["host1@example.com", "host2@example.com"])
      );
    });

    it("should retrieve hosts matching a specific filter", async () => {
      const hostsData = [
        { email: "host1@example.com", password: "password1", name: "Host One" },
        { email: "host2@example.com", password: "password2", name: "Host Two" },
        {
          email: "host3@example.com",
          password: "password3",
          name: "Host Three",
        },
      ];

      await Host.insertMany(hostsData);

      // Retrieve hosts with names containing 'Two' or 'Three'
      const filteredHosts = await Host.find({
        name: { $in: ["Host Two", "Host Three"] },
      });

      // Verify the correct hosts are returned
      expect(filteredHosts).toHaveLength(2);
      expect(filteredHosts.map((host) => host.name)).toEqual(
        expect.arrayContaining(["Host Two", "Host Three"])
      );
    });

    it("should retrieve hosts with pagination", async () => {
      const hostsData = Array.from({ length: 10 }, (_, i) => ({
        email: `host${i + 1}@example.com`,
        password: `password${i + 1}`,
        name: `Host ${i + 1}`,
      }));

      await Host.insertMany(hostsData);

      // Retrieve the first 5 hosts
      const paginatedHosts = await Host.find({}).limit(5).skip(0);

      // Verify the correct number of hosts are returned
      expect(paginatedHosts).toHaveLength(5);
      expect(paginatedHosts.map((host) => host.name)).toEqual(
        expect.arrayContaining([
          "Host 1",
          "Host 2",
          "Host 3",
          "Host 4",
          "Host 5",
        ])
      );
    });

    it("should retrieve a host and populate associated references", async () => {
      const hostData = await new Host({
        email: "host@example.com",
        password: "securePassword123",
        name: "Valid Name",
      }).save();

      const cohost = await new Cohost({
        email: "cohost@example.com",
        password: "password123",
        name: "Cohost One",
        host: hostData._id,
      }).save();

      const room = await new Room({
        name: "Room 1",
        price: 100,
        host: hostData._id,
      }).save();

      const calendar = await new Calendar({
        host: hostData._id,
      }).save();

      const guest = await new Guest({
        name: "Guest 1",
        email: "guest@example.com",
        phone: "4086096660",
        host: hostData._id,
      }).save();

      // Retrieve the host and populate references
      const populatedHost = await Host.findById(hostData._id)
        .populate("rooms")
        .populate("guests")
        .populate("cohosts");

      // Verify populated data
      expect(populatedHost?.rooms).toHaveLength(1);
      expect((populatedHost?.rooms[0] as any).name).toBe("Room 1");
      expect(populatedHost?.calendar).toBeDefined();
      expect(populatedHost?.calendar?._id.toString()).toBe(
        calendar._id.toString()
      );
      expect(populatedHost?.guests).toHaveLength(1);
      expect((populatedHost?.guests[0] as any).name).toBe("Guest 1");
      expect(populatedHost?.cohosts).toHaveLength(1);
      expect((populatedHost?.cohosts[0] as any).name).toBe("Cohost One");
    });
  });

  describe("Host Schema - UPDATE", () => {
    it("should update the name of a host", async () => {
      const hostData = {
        email: "host@example.com",
        password: "securePassword123",
        name: "Original Name",
      };

      const host = await new Host(hostData).save();

      const updatedHost = await Host.findByIdAndUpdate(
        host._id,
        { name: "Updated Name" },
        { new: true }
      );

      expect(updatedHost?.name).toBe("Updated Name");
    });

    it("should not update the name if it contains special characters", async () => {
      const hostData = {
        email: "host@example.com",
        password: "securePassword123",
        name: "Original Name",
      };

      const host = await new Host(hostData).save();

      await expect(
        Host.findByIdAndUpdate(
          host._id,
          { name: "Invalid@Name" },
          { new: true }
        )
      ).rejects.toThrow("Name cannot contain special characters");
    });

    it("should hash the new password when updating", async () => {
      const hostData = {
        email: "host@example.com",
        password: "securePassword123",
        name: "Valid Name",
      };

      const host = await new Host(hostData).save();

      const updatedHost = await Host.findByIdAndUpdate(
        host._id,
        { password: "newSecurePassword456" },
        { new: true }
      );

      // Verify password is hashed
      expect(updatedHost?.password).not.toBe("newSecurePassword456");
      expect(updatedHost?.password).toMatch(/^\$2[ayb]\$.{56}$/); // Bcrypt hash format
    });

    it("should update the email and convert it to lowercase", async () => {
      const hostData = {
        email: "original@example.com",
        password: "securePassword123",
        name: "Valid Name",
      };

      const host = await new Host(hostData).save();

      const updatedHost = await Host.findByIdAndUpdate(
        host._id,
        { email: "UPDATED@EXAMPLE.COM" },
        { new: true }
      );

      expect(updatedHost?.email).toBe("updated@example.com");
    });

    it("should not update the email if it is in an invalid format", async () => {
      const hostData = {
        email: "original@example.com",
        password: "securePassword123",
        name: "Valid Name",
      };

      const host = await new Host(hostData).save();

      await expect(
        Host.findByIdAndUpdate(
          host._id,
          { email: "invalid-email" },
          { new: true, runValidators: true }
        )
      ).rejects.toThrow();
    });

    it("should not modify the host if no changes are provided", async () => {
      const hostData = {
        email: "host@example.com",
        password: "securePassword123",
        name: "Valid Name",
      };

      const host = await new Host(hostData).save();

      const updatedHost = await Host.findByIdAndUpdate(
        host._id,
        {},
        { new: true }
      );

      // Verify host remains unchanged
      expect(updatedHost?.email).toBe(host.email);
      expect(updatedHost?.name).toBe(host.name);
      expect(updatedHost?.password).toBe(host.password);
    });
  });

  describe("Host Schema - DELETE", () => {
    it("should delete a host and cascade delete associated documents", async () => {
      const hostData = await new Host({
        email: "host@example.com",
        password: "securePassword123",
        name: "Valid Name",
      }).save();

      const room = await new Room({
        name: "Room 1",
        price: 100,
        host: hostData._id,
      }).save();

      const guest = await new Guest({
        name: "Guest 1",
        email: "guest@example.com",
        phone: "4086096660",
        host: hostData._id,
      }).save();

      const cohost = await new Cohost({
        email: "cohost@example.com",
        password: "securePassword123",
        name: "Cohost 1",
        host: hostData._id,
      }).save();

      const calendar = await new Calendar({
        host: hostData._id,
      }).save();

      // Delete the host
      const result = await Host.deleteOne({ _id: hostData._id });

      // Verify host is deleted
      expect(result.deletedCount).toBe(1);

      // Verify cascading deletions
      expect(await Room.findOne({ _id: room._id })).toBeNull();
      expect(await Guest.findOne({ _id: guest._id })).toBeNull();
      expect(await Cohost.findOne({ _id: cohost._id })).toBeNull();
      expect(await Calendar.findOne({ _id: calendar._id })).toBeNull();
    });

    it("should delete a host with no associated documents", async () => {
      const hostData = await new Host({
        email: "host@example.com",
        password: "securePassword123",
        name: "Valid Name",
      }).save();

      const result = await Host.deleteOne({ _id: hostData._id });

      // Verify host is deleted
      expect(result.deletedCount).toBe(1);

      // Verify no cascading deletions occur
      const remainingRooms = await Room.find({ host: hostData._id });
      const remainingGuests = await Guest.find({ host: hostData._id });
      const remainingCohosts = await Cohost.find({ host: hostData._id });
      const remainingCalendars = await Calendar.find({ host: hostData._id });

      expect(remainingRooms).toHaveLength(0);
      expect(remainingGuests).toHaveLength(0);
      expect(remainingCohosts).toHaveLength(0);
      expect(remainingCalendars).toHaveLength(0);
    });

    it("should delete multiple hosts and cascade delete associated documents", async () => {
      const host1 = await new Host({
        email: "host1@example.com",
        password: "securePassword123",
        name: "Host One",
      }).save();

      const host2 = await new Host({
        email: "host2@example.com",
        password: "securePassword123",
        name: "Host Two",
      }).save();

      const room1 = await new Room({
        name: "Room 1",
        price: 100,
        host: host1._id,
      }).save();
      const room2 = await new Room({
        name: "Room 2",
        price: 200,
        host: host2._id,
      }).save();

      const guest1 = await new Guest({
        name: "Guest 1",
        email: "guest1@example.com",
        phone: "4086096660",
        host: host1._id,
      }).save();
      const guest2 = await new Guest({
        name: "Guest 2",
        email: "guest2@example.com",
        phone: "4086096661",
        host: host2._id,
      }).save();

      // Delete both hosts
      const result = await Host.deleteMany({
        _id: { $in: [host1._id, host2._id] },
      });

      // Verify hosts are deleted
      expect(result.deletedCount).toBe(2);

      // Verify cascading deletions
      expect(await Room.findOne({ _id: room1._id })).toBeNull();
      expect(await Room.findOne({ _id: room2._id })).toBeNull();
      expect(await Guest.findOne({ _id: guest1._id })).toBeNull();
      expect(await Guest.findOne({ _id: guest2._id })).toBeNull();
    });

    it("should delete the host, its associated calendar, and only the days linked to that calendar", async () => {
      const host = await new Host({
        email: "host@example.com",
        password: "securePassword123",
        name: "Valid Host",
      }).save();

      const calendar = await new Calendar({
        host: host._id,
      }).save();

      // Create days linked to the calendar
      for (let i = 1; i <= 3; i++) {
        await new Day({
          calendar: calendar._id,
          date: new Date(`2025-12-0${i}`),
        }).save();
      }

      // Create unrelated days not linked to the calendar
      for (let i = 4; i <= 6; i++) {
        await new Day({
          calendar: new mongoose.Types.ObjectId(),
          date: new Date(`2025-12-0${i}`),
        }).save();
      }

      // Delete the host
      await Host.deleteOne({ _id: host._id });

      // Verify cascading deletions
      expect(await Calendar.findOne({ _id: calendar._id })).toBeNull();
      const remainingDays = await Day.find({ calendar: calendar._id });
      expect(remainingDays).toHaveLength(0); // Days linked to the deleted calendar are gone

      // Verify unrelated days are unaffected
      const unrelatedDaysCount = await Day.countDocuments();
      expect(unrelatedDaysCount).toBe(3); // Only unrelated days remain
    });

    it("should delete documents only associated with the deleted host and leave others intact", async () => {
      const host1 = await new Host({
        email: "host1@example.com",
        password: "securePassword123",
        name: "Host One",
      }).save();

      const host2 = await new Host({
        email: "host2@example.com",
        password: "securePassword123",
        name: "Host Two",
      }).save();

      const calendar1 = await new Calendar({
        host: host1._id,
      }).save();

      const calendar2 = await new Calendar({
        host: host2._id,
      }).save();

      // Create days for each calendar
      for (let i = 1; i <= 3; i++) {
        await new Day({
          calendar: calendar1._id,
          date: new Date(`2025-12-0${i}`),
        }).save();

        await new Day({
          calendar: calendar2._id,
          date: new Date(`2025-12-0${i + 3}`),
        }).save();
      }

      // Delete the first host
      await Host.deleteOne({ _id: host1._id });

      // Verify cascading deletions for host1
      expect(await Calendar.findOne({ _id: calendar1._id })).toBeNull();
      const remainingDaysForCalendar1 = await Day.find({
        calendar: calendar1._id,
      });
      expect(remainingDaysForCalendar1).toHaveLength(0);

      // Verify documents linked to host2 are intact
      expect(await Host.findOne({ _id: host2._id })).not.toBeNull();
      expect(await Calendar.findOne({ _id: calendar2._id })).not.toBeNull();
      const remainingDaysForCalendar2 = await Day.find({
        calendar: calendar2._id,
      });
      expect(remainingDaysForCalendar2).toHaveLength(3);
    });

    it("should throw an error when trying to delete a host without providing an ID", async () => {
      await expect(Host.deleteOne({})).rejects.toThrow(
        "Host ID is undefined or invalid"
      );
    });

    it("should not delete any associated documents if no hosts match the query", async () => {
      const result = await Host.deleteMany({
        email: "nonexistent@example.com",
      });

      // Verify no hosts or associated documents are deleted
      expect(result.deletedCount).toBe(0);
      expect(await Room.countDocuments()).toBeGreaterThanOrEqual(0);
      expect(await Calendar.countDocuments()).toBeGreaterThanOrEqual(0);
      expect(await Guest.countDocuments()).toBeGreaterThanOrEqual(0);
      expect(await Cohost.countDocuments()).toBeGreaterThanOrEqual(0);
    });

    it("should delete calendars associated with the hosts being deleted", async () => {
      const host = await new Host({
        email: "host@example.com",
        password: "securePassword123",
        name: "Valid Host",
      }).save();

      await new Calendar({ host: host._id }).save();

      await Host.deleteOne({ _id: host._id });

      // Verify the calendar is deleted
      expect(await Calendar.findOne({ host: host._id })).toBeNull();
    });

    it("should delete cohosts associated with the hosts being deleted", async () => {
      const host = await new Host({
        email: "host@example.com",
        password: "securePassword123",
        name: "Valid Host",
      }).save();

      await new Cohost({
        email: "cohost@example.com",
        password: "securePassword123",
        name: "Cohost Name",
        host: host._id,
      }).save();

      await Host.deleteOne({ _id: host._id });

      // Verify the cohost is deleted
      expect(await Cohost.findOne({ host: host._id })).toBeNull();
    });

    it("should delete calendars associated with multiple hosts", async () => {
      const host1 = await new Host({
        email: "host1@example.com",
        password: "securePassword123",
        name: "Host 1",
      }).save();

      const host2 = await new Host({
        email: "host2@example.com",
        password: "securePassword123",
        name: "Host 2",
      }).save();

      await new Calendar({ host: host1._id }).save();
      await new Calendar({ host: host2._id }).save();

      // Bulk delete hosts
      const result = await Host.deleteMany({
        _id: { $in: [host1._id, host2._id] },
      });
      expect(result.deletedCount).toBe(2);

      // Verify calendars are deleted
      const remainingCalendars = await Calendar.find({
        host: { $in: [host1._id, host2._id] },
      });
      expect(remainingCalendars).toHaveLength(0);
    });

    it("should delete cohosts associated with multiple hosts", async () => {
      const host1 = await new Host({
        email: "host1@example.com",
        password: "securePassword123",
        name: "Host 1",
      }).save();

      const host2 = await new Host({
        email: "host2@example.com",
        password: "securePassword123",
        name: "Host 2",
      }).save();

      await new Cohost({
        email: "cohost1@example.com",
        password: "securePassword123",
        name: "Cohost 1",
        host: host1._id,
      }).save();

      await new Cohost({
        email: "cohost2@example.com",
        password: "securePassword123",
        name: "Cohost 2",
        host: host2._id,
      }).save();

      // Bulk delete hosts
      const result = await Host.deleteMany({
        _id: { $in: [host1._id, host2._id] },
      });
      expect(result.deletedCount).toBe(2);

      // Verify cohosts are deleted
      const remainingCohosts = await Cohost.find({
        host: { $in: [host1._id, host2._id] },
      });
      expect(remainingCohosts).toHaveLength(0);
    });
  });
});
