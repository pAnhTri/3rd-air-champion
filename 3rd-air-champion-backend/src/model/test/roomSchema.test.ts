import mongoose from "mongoose";
import Room from "../roomSchema";
import Host from "../hostSchema";
import Day from "../daySchema";
import { createMockHost } from "./util/mockHost";

describe("Room Schema - Test Suite", () => {
  describe("Room Schema - Schema Validation", () => {
    it("should validate a valid room document", async () => {
      const roomData = {
        host: new mongoose.Types.ObjectId(),
        name: "Deluxe Room",
        price: 120,
      };

      const room = new Room(roomData);
      const savedRoom = await room.save();

      expect(savedRoom._id).toBeDefined();
      expect(savedRoom.name).toBe(roomData.name);
      expect(savedRoom.price).toBe(roomData.price);
    });

    it("should throw validation error for missing host", async () => {
      const roomData = {
        name: "Deluxe Room",
        price: 120,
      };

      const room = new Room(roomData);

      await expect(room.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    test.each([{}, { name: "<input> Denied </input>" }, { name: null }])(
      "should throw validation error for invalid: %p",
      async ({ name }) => {
        const roomData = {
          name,
          host: new mongoose.Types.ObjectId(),
          price: 120,
        };

        const room = new Room(roomData);

        await expect(room.save()).rejects.toThrow();
      }
    );

    test.each([{}, { price: -1 }, { price: null }, { price: "One" }])(
      "should throw validation error for invalid price: %p",
      async ({ price }) => {
        const roomData = {
          host: new mongoose.Types.ObjectId(),
          name: "Deluxe Room",
          price,
        };

        const room = new Room(roomData);

        await expect(room.save()).rejects.toThrow();
      }
    );

    test.each([{}, { host: null }, { host: 123 }, { host: "123" }])(
      "should throw validation error for invalid host: %p",
      async ({ host }) => {
        const roomData = {
          host,
          name: "Deluxe Room",
          price: 120,
        };

        const room = new Room(roomData);

        await expect(room.save()).rejects.toThrow(
          mongoose.Error.ValidationError
        );
      }
    );

    it("should enforce unique constraint on host and name", async () => {
      const host = new mongoose.Types.ObjectId();

      const roomData = {
        host,
        name: "Deluxe Room",
        price: 120,
      };

      const duplicateRoomData = {
        host,
        name: "Deluxe Room",
        price: 150,
      };

      const room1 = new Room(roomData);
      await room1.save();

      const room2 = new Room(duplicateRoomData);

      await expect(room2.save()).rejects.toThrow();
    });
  });

  describe("Room Schema - CRUD - CREATE", () => {
    it("should create a valid room successfully", async () => {
      const roomData = {
        host: new mongoose.Types.ObjectId(),
        name: "Deluxe Room",
        price: 120,
      };

      const room = new Room(roomData);
      const savedRoom = await room.save();

      expect(savedRoom._id).toBeDefined();
      expect(savedRoom.host.toString()).toBe(roomData.host.toString());
      expect(savedRoom.name).toBe(roomData.name);
      expect(savedRoom.price).toBe(roomData.price);
    });

    it("should throw an error for duplicate host and name", async () => {
      const host = new mongoose.Types.ObjectId();

      const roomData = {
        host,
        name: "Deluxe Room",
        price: 120,
      };

      const duplicateRoomData = {
        host,
        name: "Deluxe Room", // Same name, same host
        price: 150,
      };

      const room1 = new Room(roomData);
      await room1.save();

      const room2 = new Room(duplicateRoomData);

      await expect(room2.save()).rejects.toThrow();
    });

    it("should throw an error when required fields are missing", async () => {
      const roomData = {
        price: 120, // Missing host and name
      };

      const room = new Room(roomData);

      await expect(room.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it("should throw an error for invalid price", async () => {
      const roomData = {
        host: new mongoose.Types.ObjectId(),
        name: "Deluxe Room",
        price: -10, // Invalid price
      };

      const room = new Room(roomData);

      await expect(room.save()).rejects.toThrow(
        "Price must be positive number"
      );
    });

    it("should create a room with valid edge-case data", async () => {
      const roomData = {
        host: new mongoose.Types.ObjectId(),
        name: "Room 123", // Valid name
        price: 0.01, // Edge-case price
      };

      const room = new Room(roomData);
      const savedRoom = await room.save();

      expect(savedRoom._id).toBeDefined();
      expect(savedRoom.name).toBe(roomData.name);
      expect(savedRoom.price).toBe(roomData.price);
    });

    it("should create a room and associate it with a host", async () => {
      const hostData = await createMockHost("anhtp5@uci.edu");

      // Create and save a host
      const host = new Host(hostData);
      const savedHost = await host.save();

      const roomData = {
        host: savedHost._id,
        name: "Deluxe Room",
        price: 120,
      };

      // Create and save a room
      const room = new Room(roomData);
      const savedRoom = await room.save();

      // Verify room was saved correctly
      expect(savedRoom._id).toBeDefined();
      expect(savedRoom.host.toString()).toBe(savedHost._id.toString());

      // Verify host has the room in its rooms array
      const updatedHost = await Host.findById(savedHost._id).populate("rooms");
      expect(updatedHost).toBeDefined();
      expect(updatedHost?.rooms.map((room) => room._id.toString())).toContain(
        savedRoom._id.toString()
      );
    });

    it("should allow a host to store multiple rooms", async () => {
      const hostData = await createMockHost("anhtp5@uci.edu");

      const roomData1 = {
        host: hostData._id,
        name: "Room 1",
        price: 100,
      };

      const roomData2 = {
        host: hostData._id,
        name: "Room 2",
        price: 200,
      };

      // Create and save two rooms
      const room1 = await new Room(roomData1).save();
      const room2 = await new Room(roomData2).save();

      // Verify both rooms are associated with the host
      const updatedHost = await Host.findById(hostData._id)
        .populate("rooms")
        .orFail();
      expect(updatedHost).toBeDefined();
      expect(updatedHost.rooms).toHaveLength(2);
      expect(
        updatedHost.rooms.map((room) => {
          if (room instanceof Room) {
            return room.name;
          }
        })
      ).toEqual(expect.arrayContaining(["Room 1", "Room 2"]));
    });
  });

  describe("Room Schema - CRUD - READ", () => {
    it("should fetch a room by ID", async () => {
      const roomData = {
        host: new mongoose.Types.ObjectId(),
        name: "Suite Room",
        price: 200,
      };

      const room = new Room(roomData);
      const savedRoom = await room.save();

      const fetchedRoom = await Room.findById(savedRoom._id);

      expect(fetchedRoom).toBeDefined();
      expect(fetchedRoom?._id.toString()).toBe(savedRoom._id.toString());
      expect(fetchedRoom?.name).toBe(savedRoom.name);
      expect(fetchedRoom?.price).toBe(savedRoom.price);
    });

    it("should fetch all rooms for a specific host", async () => {
      const host = new mongoose.Types.ObjectId();

      const rooms = [
        { host, name: "Room 1", price: 100 },
        { host, name: "Room 2", price: 150 },
        { host, name: "Room 3", price: 200 },
      ];

      await Room.insertMany(rooms);

      const fetchedRooms = await Room.find({ host });

      expect(fetchedRooms).toHaveLength(3);
      fetchedRooms.forEach((room, index) => {
        expect(room.host.toString()).toBe(host.toString());
        expect(room.name).toBe(rooms[index].name);
        expect(room.price).toBe(rooms[index].price);
      });
    });

    it("should return null for nonexistent room by ID", async () => {
      const nonexistentId = new mongoose.Types.ObjectId();

      const fetchedRoom = await Room.findById(nonexistentId);

      expect(fetchedRoom).toBeNull();
    });

    it("should fetch rooms with a price greater than a specified value", async () => {
      const rooms = [
        {
          host: new mongoose.Types.ObjectId(),
          name: "Budget Room",
          price: 50,
        },
        {
          host: new mongoose.Types.ObjectId(),
          name: "Deluxe Room",
          price: 150,
        },
        {
          host: new mongoose.Types.ObjectId(),
          name: "Luxury Room",
          price: 300,
        },
      ];

      await Room.insertMany(rooms);

      const fetchedRooms = await Room.find({ price: { $gt: 100 } });

      expect(fetchedRooms).toHaveLength(2);
      expect(fetchedRooms.map((room) => room.name)).toEqual([
        "Deluxe Room",
        "Luxury Room",
      ]);
    });

    it("should fetch rooms sorted by price in ascending order", async () => {
      const rooms = [
        {
          host: new mongoose.Types.ObjectId(),
          name: "Budget Room",
          price: 50,
        },
        {
          host: new mongoose.Types.ObjectId(),
          name: "Deluxe Room",
          price: 150,
        },
        {
          host: new mongoose.Types.ObjectId(),
          name: "Luxury Room",
          price: 300,
        },
      ];

      await Room.insertMany(rooms);

      const fetchedRooms = await Room.find({}).sort({ price: 1 });

      expect(fetchedRooms).toHaveLength(3);
      expect(fetchedRooms.map((room) => room.name)).toEqual([
        "Budget Room",
        "Deluxe Room",
        "Luxury Room",
      ]);
    });
  });

  describe("Room Schema - CRUD - UPDATE", () => {
    it("should update the room price", async () => {
      const roomData = {
        host: new mongoose.Types.ObjectId(),
        name: "Deluxe Room",
        price: 120,
      };

      const room = new Room(roomData);
      const savedRoom = await room.save();

      const updatedRoom = await Room.findByIdAndUpdate(
        savedRoom._id,
        { price: 150 },
        { new: true, runValidators: true }
      );

      expect(updatedRoom).toBeDefined();
      expect(updatedRoom?.price).toBe(150);
    });

    it("should throw an error when updating with a duplicate name for the same host", async () => {
      const hostId = new mongoose.Types.ObjectId();

      const room1 = new Room({
        host: hostId,
        name: "Deluxe Room",
        price: 120,
      });
      const room2 = new Room({
        host: hostId,
        name: "Premium Room",
        price: 200,
      });

      await room1.save();
      await room2.save();

      await expect(
        Room.findByIdAndUpdate(
          room2._id,
          { name: "Deluxe Room" },
          { new: true, runValidators: true }
        )
      ).rejects.toThrow();
    });

    it("should throw an error for invalid price update", async () => {
      const roomData = {
        host: new mongoose.Types.ObjectId(),
        name: "Luxury Room",
        price: 300,
      };

      const room = new Room(roomData);
      const savedRoom = await room.save();

      await expect(
        Room.findByIdAndUpdate(
          savedRoom._id,
          { price: -10 }, // Invalid price
          { new: true, runValidators: true }
        )
      ).rejects.toThrow();
    });

    it("should update the room name and reflect the change", async () => {
      const roomData = {
        host: new mongoose.Types.ObjectId(),
        name: "Old Room Name",
        price: 120,
      };

      const room = new Room(roomData);
      const savedRoom = await room.save();

      const updatedRoom = await Room.findByIdAndUpdate(
        savedRoom._id,
        { name: "Updated Room Name" },
        { new: true, runValidators: true }
      );

      expect(updatedRoom).toBeDefined();
      expect(updatedRoom?.name).toBe("Updated Room Name");
    });

    it("should update the host and ensure the new host is reflected", async () => {
      const oldHost = await new Host({
        email: "oldhost@example.com",
        password: "password123",
        name: "Old Host",
      }).save();

      const newHost = await new Host({
        email: "newhost@example.com",
        password: "password123",
        name: "New Host",
      }).save();

      const room = new Room({
        host: oldHost._id,
        name: "Room with Old Host",
        price: 150,
      });
      const savedRoom = await room.save();

      const updatedRoom = await Room.findByIdAndUpdate(
        savedRoom._id,
        { host: newHost._id },
        { new: true, runValidators: true }
      );

      expect(updatedRoom).toBeDefined();
      expect(updatedRoom?.host.toString()).toBe(newHost._id.toString());

      // Verify the room is no longer associated with the old host
      const updatedOldHost = await Host.findById(oldHost._id).populate("rooms");
      expect(updatedOldHost?.rooms).not.toContainEqual(savedRoom._id);

      // Verify the room is now associated with the new host
      const updatedNewHost = await Host.findById(newHost._id).populate("rooms");
      expect(
        updatedNewHost?.rooms.map((room) => room._id.toString())
      ).toContain(savedRoom._id.toString());
    });

    it("should update the prices of multiple rooms", async () => {
      const host = await createMockHost("host@example.com");

      const room1 = await new Room({
        host: host._id,
        name: "Room 1",
        price: 100,
      }).save();

      const room2 = await new Room({
        host: host._id,
        name: "Room 2",
        price: 150,
      }).save();

      // Bulk update prices
      const result = await Room.updateMany({ host: host._id }, { price: 200 });
      expect(result.modifiedCount).toBe(2);

      // Verify updated prices
      const updatedRooms = await Room.find({ host: host._id });
      updatedRooms.forEach((room) => {
        expect(room.price).toBe(200);
      });
    });

    it("should reassign rooms to a new host in bulk and update host references", async () => {
      const oldHost = await new Host({
        email: "oldhost@example.com",
        password: "password123",
        name: "Old Host",
      }).save();

      const newHost = await new Host({
        email: "newhost@example.com",
        password: "password123",
        name: "New Host",
      }).save();

      const room1 = await new Room({
        host: oldHost._id,
        name: "Room 1",
        price: 100,
      }).save();

      const room2 = await new Room({
        host: oldHost._id,
        name: "Room 2",
        price: 150,
      }).save();

      // Bulk update host
      const result = await Room.updateMany(
        { host: oldHost._id },
        { host: newHost._id }
      );
      expect(result.modifiedCount).toBe(2);

      // Verify old host no longer has the rooms
      const updatedOldHost = await Host.findById(oldHost._id).populate("rooms");
      expect(updatedOldHost?.rooms).toHaveLength(0);

      // Verify new host now references the rooms
      const updatedNewHost = await Host.findById(newHost._id).populate("rooms");
      expect(updatedNewHost?.rooms).toHaveLength(2);
      expect(updatedNewHost?.rooms.map((room) => room._id.toString())).toEqual(
        expect.arrayContaining([room1._id.toString(), room2._id.toString()])
      );
    });

    it("should reject bulk updates with invalid price values", async () => {
      const host = await createMockHost("host@example.com");

      const room1 = await new Room({
        host: host._id,
        name: "Room 1",
        price: 100,
      }).save();

      const room2 = await new Room({
        host: host._id,
        name: "Room 2",
        price: 150,
      }).save();

      // Attempt to set negative price for multiple rooms
      await expect(
        Room.updateMany({ host: host._id }, { price: -50 })
      ).rejects.toThrow("Price must be a positive number");
    });

    it("should reject bulk updates with nonexistent host ID", async () => {
      const host = await createMockHost("host@example.com");

      const room1 = await new Room({
        host: host._id,
        name: "Room 1",
        price: 100,
      }).save();

      const room2 = await new Room({
        host: host._id,
        name: "Room 2",
        price: 150,
      }).save();

      const nonexistentHostId = new mongoose.Types.ObjectId();

      // Attempt to assign rooms to a nonexistent host
      await expect(
        Room.updateMany({ host: host._id }, { host: nonexistentHostId })
      ).rejects.toThrow("Host does not exist");
    });
  });

  describe("Room Schema - CRUD - DELETE", () => {
    it("should delete a room by ID", async () => {
      const roomData = {
        host: new mongoose.Types.ObjectId(),
        name: "Deluxe Room",
        price: 120,
      };

      const room = new Room(roomData);
      const savedRoom = await room.save();

      // Delete the room
      await Room.findByIdAndDelete(savedRoom._id);

      // Verify the room no longer exists
      const deletedRoom = await Room.findById(savedRoom._id);
      expect(deletedRoom).toBeNull();
    });

    it("should remove the room reference from the host when the room is deleted", async () => {
      const hostData = await createMockHost("host@example.com");

      const roomData = {
        host: hostData._id,
        name: "Deluxe Room",
        price: 120,
      };

      const room = new Room(roomData);
      const savedRoom = await room.save();

      // Verify the host initially references the room
      const updatedHost = await Host.findById(hostData._id);
      expect(updatedHost?.rooms.map((room) => room.toString())).toContain(
        savedRoom._id.toString()
      );

      // Delete the room
      await Room.findByIdAndDelete(savedRoom._id);

      // Verify the room reference is removed from the host
      const hostAfterDeletion = await Host.findById(hostData._id).populate(
        "rooms"
      );
      expect(
        hostAfterDeletion?.rooms.map((room) => room.toString())
      ).not.toContain(savedRoom._id.toString());
    });

    it("should not affect unrelated hosts when deleting a room", async () => {
      const host1 = await new Host({
        email: "host1@example.com",
        password: "password123",
        name: "Host 1",
      }).save();

      const host2 = await new Host({
        email: "host2@example.com",
        password: "password123",
        name: "Host 2",
      }).save();

      const room = new Room({
        host: host1._id,
        name: "Room for Host 1",
        price: 150,
      });
      const savedRoom = await room.save();

      // Verify room is associated with host1
      const updatedHost1 = await Host.findById(host1._id);
      expect(updatedHost1?.rooms.map((room) => room.toString())).toContain(
        savedRoom._id.toString()
      );

      // Verify no rooms are associated with host2
      const updatedHost2 = await Host.findById(host2._id).populate("rooms");
      expect(updatedHost2?.rooms).toHaveLength(0);

      // Delete the room
      await Room.findByIdAndDelete(savedRoom._id);

      // Verify the room reference is removed from host1
      const host1AfterDeletion = await Host.findById(host1._id).populate(
        "rooms"
      );
      expect(
        host1AfterDeletion?.rooms.map((room) => room.toString())
      ).not.toContain(savedRoom._id.toString());

      // Verify host2 is unaffected
      const host2AfterDeletion = await Host.findById(host2._id).populate(
        "rooms"
      );
      expect(host2AfterDeletion?.rooms).toHaveLength(0);
    });
  });

  it("should remove room from Day documents and unset guest when Room is deleted", async () => {
    // Create a mock host
    const host = await createMockHost("test@cascade.com");

    // Create and save a Guest
    const room = new Room({
      host: host._id,
      name: "Room for Host 1",
      price: 150,
    });
    const savedRoom = await room.save();

    // Create and save a Day document referencing the Guest
    const day = new Day({
      calendar: new mongoose.Types.ObjectId(),
      date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      guest: new mongoose.Types.ObjectId(),
      room: savedRoom._id,
    });
    const savedDay = await day.save();

    // Verify the Day document before Room deletion
    let dayBefore = await Day.findById(savedDay._id).orFail();
    expect(dayBefore).toBeDefined();
    expect(dayBefore.room?.toString()).toBe(savedRoom._id.toString());
    expect(dayBefore.guest).toBeDefined();

    // Delete the Room
    await Room.findByIdAndDelete(savedRoom._id);

    // Verify the Day document after Room deletion
    const dayAfter = await Day.findById(savedDay._id).orFail();
    expect(dayAfter).toBeDefined();
    expect(dayAfter.guest).toBeUndefined();
    expect(dayAfter.room).toBeUndefined();
  });

  it("should remove room references from hosts when rooms are deleted in bulk", async () => {
    const host1 = await new Host({
      email: "host1@example.com",
      password: "password123",
      name: "Host 1",
    }).save();

    const host2 = await new Host({
      email: "host2@example.com",
      password: "password123",
      name: "Host 2",
    }).save();

    const room1 = await new Room({
      host: host1._id,
      name: "Room 1",
      price: 100,
    }).save();

    const room2 = await new Room({
      host: host1._id,
      name: "Room 2",
      price: 150,
    }).save();

    const room3 = await new Room({
      host: host2._id,
      name: "Room 3",
      price: 200,
    }).save();

    // Bulk delete rooms associated with Host 1
    const result = await Room.deleteMany({ host: host1._id });
    expect(result.deletedCount).toBe(2);

    // Verify Host 1 no longer has room references
    const updatedHost1 = await Host.findById(host1._id).populate("rooms");
    expect(updatedHost1?.rooms).toHaveLength(0);

    // Verify Host 2 is unaffected
    const updatedHost2 = await Host.findById(host2._id).populate("rooms");
    expect(updatedHost2?.rooms).toHaveLength(1);
    expect(updatedHost2?.rooms[0]._id.toString()).toBe(room3._id.toString());
  });

  it("should unset room and guest references in Day documents when rooms are deleted in bulk", async () => {
    const host = await createMockHost("host@example.com");

    const room1 = await new Room({
      host: host._id,
      name: "Room 1",
      price: 100,
    }).save();

    const room2 = await new Room({
      host: host._id,
      name: "Room 2",
      price: 150,
    }).save();

    await new Day({
      calendar: new mongoose.Types.ObjectId(),
      date: new Date("2025-12-01"),
      room: room1._id,
      guest: new mongoose.Types.ObjectId(),
    }).save();

    await new Day({
      calendar: new mongoose.Types.ObjectId(),
      date: new Date("2025-12-02"),
      room: room2._id,
      guest: new mongoose.Types.ObjectId(),
    }).save();

    // Bulk delete rooms
    const result = await Room.deleteMany({ host: host._id });
    expect(result.deletedCount).toBe(2);

    // Verify Day documents are updated
    const days = await Day.find({});
    days.forEach((day) => {
      expect(day.room).toBeUndefined();
      expect(day.guest).toBeUndefined();
    });
  });
});
