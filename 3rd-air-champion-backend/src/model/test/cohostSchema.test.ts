import mongoose from "mongoose";
import { createMockHost } from "./util/mockHost";
import Host from "../hostSchema";
import Cohost from "../cohostSchema";
import bcrypt from "bcrypt";

describe("Cohost Schema - Test Suite", () => {
  describe("Cohost Schema - Schema Validation", () => {
    let mockHost: any;

    // Create a mock host before running the tests
    beforeEach(async () => {
      mockHost = await createMockHost("anhtp5@uci.edu");
    });

    it("should validate a valid cohost", async () => {
      const cohost = new Cohost({
        email: "valid.email@example.com",
        password: "securepassword",
        name: "ValidName",
        host: mockHost._id,
      });

      const result = await cohost.validate();
      expect(result).toBeUndefined(); // Validation passes without errors
    });

    it("should fail validation for invalid email format", async () => {
      const cohost = new Cohost({
        email: "invalid-email",
        password: "securepassword",
        name: "ValidName",
        host: mockHost._id,
      });

      await expect(cohost.validate()).rejects.toThrow(
        /validation failed.*email/
      );
    });

    it("should fail validation for missing required fields", async () => {
      const cohost = new Cohost({
        email: "valid.email@example.com",
      });

      await expect(cohost.validate()).rejects.toThrow(/validation failed/);
    });

    it("should fail validation if name contains special characters", async () => {
      const cohost = new Cohost({
        email: "valid.email@example.com",
        password: "securepassword",
        name: "Invalid@Name!",
        host: mockHost._id,
      });

      await expect(cohost.validate()).rejects.toThrow(
        "Name cannot contain special characters"
      );
    });

    it("should convert email to lowercase before saving", async () => {
      const cohost = new Cohost({
        email: "UPPERCASE.EMAIL@EXAMPLE.COM",
        password: "securepassword",
        name: "ValidName",
        host: mockHost._id,
      });

      await cohost.save();
      const savedCohost = await Cohost.findById(cohost._id);
      expect(savedCohost?.email).toBe("uppercase.email@example.com");
    });

    it("should throw an error if host does not exist", async () => {
      const invalidHostId = new mongoose.Types.ObjectId();
      const cohost = new Cohost({
        email: "valid.email@example.com",
        password: "securepassword",
        name: "ValidName",
        host: invalidHostId,
      });

      await expect(cohost.save()).rejects.toThrow("Host does not exist");
    });
  });
  describe("Cohost Schema - CREATE", () => {
    let mockHost: any;

    beforeEach(async () => {
      // Create a mock host before running the tests
      mockHost = await createMockHost("host@example.com");
    });

    it("should successfully create a valid cohost", async () => {
      const cohostData = {
        email: "valid.email@example.com",
        password: "securepassword",
        name: "ValidName",
        host: mockHost._id,
      };

      const cohost = new Cohost(cohostData);
      const savedCohost = await cohost.save();

      expect(savedCohost._id).toBeDefined();
      expect(savedCohost.email).toBe(cohostData.email.toLowerCase());
      expect(savedCohost.name).toBe(cohostData.name);
      expect(savedCohost.host.toString()).toBe(mockHost._id.toString());
    });

    it("should not create a cohost with an invalid email", async () => {
      const cohostData = {
        email: "invalid-email",
        password: "securepassword",
        name: "ValidName",
        host: mockHost._id,
      };

      const cohost = new Cohost(cohostData);
      await expect(cohost.save()).rejects.toThrow(/validation failed.*email/);
    });

    it("should not create a cohost without required fields", async () => {
      const cohostData = {
        email: "valid.email@example.com",
      };

      const cohost = new Cohost(cohostData);
      await expect(cohost.save()).rejects.toThrow(/validation failed/);
    });

    it("should not create a cohost with special characters in the name", async () => {
      const cohostData = {
        email: "valid.email@example.com",
        password: "securepassword",
        name: "Invalid@Name!",
        host: mockHost._id,
      };

      const cohost = new Cohost(cohostData);
      await expect(cohost.save()).rejects.toThrow(
        "Name cannot contain special characters"
      );
    });

    it("should not create a cohost if host does not exist", async () => {
      const invalidHostId = new mongoose.Types.ObjectId();
      const cohostData = {
        email: "valid.email@example.com",
        password: "securepassword",
        name: "ValidName",
        host: invalidHostId,
      };

      const cohost = new Cohost(cohostData);
      await expect(cohost.save()).rejects.toThrow("Host does not exist");
    });

    it("should hash the password before saving", async () => {
      const cohostData = {
        email: "valid.email@example.com",
        password: "securepassword",
        name: "ValidName",
        host: mockHost._id,
      };

      const cohost = new Cohost(cohostData);
      const savedCohost = await cohost.save();

      expect(savedCohost.password).not.toBe(cohostData.password); // Password should be hashed

      const isMatch = await bcrypt.compare(
        cohostData.password,
        savedCohost.password
      );
      expect(isMatch).toBe(true);
    });

    it("should not hash the password if it is not modified", async () => {
      const cohostData = {
        email: "valid.email@example.com",
        password: "securepassword",
        name: "ValidName",
        host: mockHost._id,
      };

      const cohost = new Cohost(cohostData);
      const savedCohost = await cohost.save();

      // Update the host's name without modifying the password
      savedCohost.name = "Updated Cohost Name";
      const updatedCohost = await savedCohost.save();

      // Verify that the password has not been re-hashed
      expect(updatedCohost.password).toBe(savedCohost.password);
    });

    it("should process the password if it is modified", async () => {
      const cohostData = {
        email: "valid.email@example.com",
        password: "securepassword",
        name: "ValidName",
        host: mockHost._id,
      };

      const cohost = new Cohost(cohostData);
      const savedCohost = await cohost.save();

      // Modify the password
      savedCohost.password = "newplainpassword456";
      const updatedCohost = await savedCohost.save();

      // Verify that the password has been reprocessed (e.g., hashed)
      expect(updatedCohost.password).not.toBe("newplainpassword456");

      const isMatch = await bcrypt.compare(
        "newplainpassword456",
        (updatedCohost as any).password
      );
      expect(isMatch).toBe(true);
    });
  });

  describe("Cohost Schema - READ", () => {
    let mockHost: any;
    let cohost1: any, cohost2: any;

    beforeEach(async () => {
      // Create a mock host and cohosts before running the tests
      mockHost = await createMockHost("host@example.com");

      cohost1 = await Cohost.create({
        email: "cohost1@example.com",
        password: "password1",
        name: "CohostOne",
        host: mockHost._id,
      });

      cohost2 = await Cohost.create({
        email: "cohost2@example.com",
        password: "password2",
        name: "CohostTwo",
        host: mockHost._id,
      });
    });

    it("should retrieve a single cohost by ID", async () => {
      const foundCohost = await Cohost.findById(cohost1._id);
      expect(foundCohost).toBeDefined();
      expect(foundCohost?.email).toBe(cohost1.email);
      expect(foundCohost?.name).toBe(cohost1.name);
    });

    it("should retrieve all cohosts", async () => {
      const cohosts = await Cohost.find();
      expect(cohosts.length).toBe(2);
      const emails = cohosts.map((c) => c.email);
      expect(emails).toContain(cohost1.email);
      expect(emails).toContain(cohost2.email);
    });

    it("should retrieve cohosts by host reference", async () => {
      const cohosts = await Cohost.find({ host: mockHost._id });
      expect(cohosts.length).toBe(2);
      const names = cohosts.map((c) => c.name);
      expect(names).toContain(cohost1.name);
      expect(names).toContain(cohost2.name);
    });

    it("should handle no matching documents gracefully", async () => {
      const nonExistentHostId = new mongoose.Types.ObjectId();
      const cohosts = await Cohost.find({ host: nonExistentHostId });
      expect(cohosts.length).toBe(0);
    });

    it("should populate the host field when reading a cohost", async () => {
      const foundCohost = await Cohost.findById(cohost1._id).populate("host");
      expect(foundCohost).toBeDefined();
      expect(foundCohost?.host).toBeDefined();
      expect((foundCohost?.host as any).email).toBe(mockHost.email);
    });
  });

  describe("Cohost Schema - UPDATE Operations", () => {
    let mockHost: any;
    let cohost: any;

    beforeEach(async () => {
      // Create a mock host and cohost before running the tests
      mockHost = await createMockHost("host@example.com");

      cohost = await Cohost.create({
        email: "cohost@example.com",
        password: "password",
        name: "InitialName",
        host: mockHost._id,
      });
    });

    it("should update a cohost's name successfully", async () => {
      const updatedName = "UpdatedName";

      const updatedCohost = await Cohost.findByIdAndUpdate(
        cohost._id,
        { name: updatedName },
        { new: true } // Return the updated document
      );

      expect(updatedCohost).toBeDefined();
      expect(updatedCohost?.name).toBe(updatedName);
    });

    it("should fail to update name with special characters", async () => {
      const invalidName = "Invalid@Name!";

      await expect(
        Cohost.findByIdAndUpdate(cohost._id, { name: invalidName })
      ).rejects.toThrow("Name cannot contain special characters");
    });

    it("should update the email and convert it to lowercase", async () => {
      const updatedEmail = "UPPERCASE.EMAIL@EXAMPLE.COM";

      const updatedCohost = await Cohost.findByIdAndUpdate(
        cohost._id,
        { email: updatedEmail },
        { new: true, runValidators: true }
      );

      expect(updatedCohost).toBeDefined();
      expect(updatedCohost?.email).toBe(updatedEmail.toLowerCase());
    });

    it("should fail to update with an invalid email format", async () => {
      const invalidEmail = "invalid-email";

      await expect(
        Cohost.findByIdAndUpdate(
          cohost._id,
          { email: invalidEmail },
          { new: true, runValidators: true }
        )
      ).rejects.toThrow();
    });

    it("should update the password and hash it", async () => {
      const updatedPassword = "newpassword";

      const updatedCohost = await Cohost.findByIdAndUpdate(
        cohost._id,
        { password: updatedPassword },
        { new: true, runValidators: true }
      );

      const isMatch = await bcrypt.compare(
        updatedPassword,
        (updatedCohost as any).password
      );
      expect(isMatch).toBe(true);
    });

    it("should fail to update the host with a non-existent ID", async () => {
      const nonExistentHostId = new mongoose.Types.ObjectId();

      await expect(
        Cohost.findByIdAndUpdate(
          cohost._id,
          { host: nonExistentHostId },
          { new: true, runValidators: true }
        )
      ).rejects.toThrow("Host does not exist");
    });

    it("should update multiple fields at once", async () => {
      const updatedData = {
        name: "MultiUpdateName",
        email: "multiupdate@example.com",
        password: "multiupdatepassword",
      };

      const updatedCohost = await Cohost.findByIdAndUpdate(
        cohost._id,
        updatedData,
        { new: true, runValidators: true }
      );

      expect(updatedCohost?.name).toBe(updatedData.name);
      expect(updatedCohost?.email).toBe(updatedData.email.toLowerCase());

      const isMatch = await bcrypt.compare(
        updatedData.password,
        (updatedCohost as any).password
      );
      expect(isMatch).toBe(true);
    });
  });

  describe("Cohost Schema - UPDATE Operations with Host", () => {
    let mockHost1: any, mockHost2: any;
    let cohost: any;

    beforeEach(async () => {
      // Create mock hosts and a cohost
      mockHost1 = await createMockHost("host1@example.com");
      mockHost2 = await createMockHost("host2@example.com");

      cohost = await Cohost.create({
        email: "cohost@example.com",
        password: "password",
        name: "InitialName",
        host: mockHost1._id,
      });
    });

    it("should successfully update the host reference to a valid host", async () => {
      const updatedCohost = await Cohost.findByIdAndUpdate(
        cohost._id,
        { host: mockHost2._id },
        { new: true }
      );

      expect(updatedCohost).toBeDefined();
      expect(updatedCohost?.host.toString()).toBe(mockHost2._id.toString());

      // Ensure the old host no longer references the cohost
      const oldHost = await Host.findById(mockHost1._id);
      expect(oldHost?.cohosts).not.toContain(cohost._id);

      // Ensure the new host now references the cohost
      const newHost = await Host.findById(mockHost2._id);
      expect(newHost?.cohosts).toContainEqual(cohost._id);
    });

    it("should fail to update the host to a non-existent ID", async () => {
      const nonExistentHostId = new mongoose.Types.ObjectId();

      await expect(
        Cohost.findByIdAndUpdate(cohost._id, { host: nonExistentHostId })
      ).rejects.toThrow("Host does not exist");

      // Ensure the original host remains unchanged
      const originalHost = await Host.findById(mockHost1._id);
      expect(originalHost?.cohosts).toContainEqual(cohost._id);
    });

    it("should detach the cohost from the old host and attach to the new host when updating the host", async () => {
      const updatedCohost = await Cohost.findByIdAndUpdate(
        cohost._id,
        { host: mockHost2._id },
        { new: true }
      );

      expect(updatedCohost).toBeDefined();
      expect(updatedCohost?.host.toString()).toBe(mockHost2._id.toString());

      // Verify old host
      const oldHost = await Host.findById(mockHost1._id);
      expect(oldHost?.cohosts).not.toContain(cohost._id);

      // Verify new host
      const newHost = await Host.findById(mockHost2._id);
      expect(newHost?.cohosts).toContainEqual(cohost._id);
    });

    it("should throw an error when updating the host reference to an invalid value", async () => {
      await expect(
        Cohost.findByIdAndUpdate(cohost._id, { host: "invalidHostValue" })
      ).rejects.toThrow();

      // Ensure the original host remains unchanged
      const originalHost = await Host.findById(mockHost1._id);
      expect(originalHost?.cohosts).toContainEqual(cohost._id);
    });

    it("should handle updates with no matching cohosts gracefully", async () => {
      const nonExistentHostId = new mongoose.Types.ObjectId();

      const result = await Cohost.updateMany(
        { host: nonExistentHostId },
        { $set: { name: "NonExistentUpdate" } }
      );

      expect(result.matchedCount).toBe(0);
      expect(result.modifiedCount).toBe(0);
    });

    it("should update hosts correctly when `$set.host` is provided", async () => {
      const cohost1 = await Cohost.create({
        email: "cohost1@example.com",
        password: "password1",
        name: "CohostOne",
        host: mockHost1._id,
      });

      const cohost2 = await Cohost.create({
        email: "cohost2@example.com",
        password: "password2",
        name: "CohostTwo",
        host: mockHost1._id,
      });

      // Update the host field for both cohosts
      const result = await Cohost.updateMany(
        { host: mockHost1._id },
        { $set: { host: mockHost2._id } }
      );

      expect(result.modifiedCount).toBe(3);

      // Verify the old host's cohosts list is updated
      const updatedHost1 = await Host.findById(mockHost1._id);
      expect(updatedHost1?.cohosts).not.toContain(cohost1._id);
      expect(updatedHost1?.cohosts).not.toContain(cohost2._id);

      // Verify the new host's cohosts list is updated
      const updatedHost2 = await Host.findById(mockHost2._id);
      expect(updatedHost2?.cohosts).toContainEqual(cohost1._id);
      expect(updatedHost2?.cohosts).toContainEqual(cohost2._id);
    });

    it("should update hosts correctly when `$set.host` is provided", async () => {
      const cohost1 = await Cohost.create({
        email: "cohost1@example.com",
        password: "password1",
        name: "CohostOne",
        host: mockHost1._id,
      });

      const cohost2 = await Cohost.create({
        email: "cohost2@example.com",
        password: "password2",
        name: "CohostTwo",
        host: mockHost1._id,
      });

      // Update the host field for both cohosts
      const result = await Cohost.updateMany(
        { host: mockHost1._id },
        { $set: { host: mockHost2._id } }
      );

      expect(result.modifiedCount).toBe(3);

      // Verify the old host's cohosts list is updated
      const updatedHost1 = await Host.findById(mockHost1._id);
      expect(updatedHost1?.cohosts).not.toContain(cohost1._id);
      expect(updatedHost1?.cohosts).not.toContain(cohost2._id);

      // Verify the new host's cohosts list is updated
      const updatedHost2 = await Host.findById(mockHost2._id);
      expect(updatedHost2?.cohosts).toContainEqual(cohost1._id);
      expect(updatedHost2?.cohosts).toContainEqual(cohost2._id);
    });

    it("should update hosts only for matching cohosts", async () => {
      const cohost1 = await Cohost.create({
        email: "cohost1@example.com",
        password: "password1",
        name: "CohostOne",
        host: mockHost1._id,
      });

      const cohost2 = await Cohost.create({
        email: "cohost2@example.com",
        password: "password2",
        name: "CohostTwo",
        host: mockHost1._id,
      });

      const cohost3 = await Cohost.create({
        email: "cohost3@example.com",
        password: "password3",
        name: "CohostThree",
        host: mockHost2._id,
      });

      // Update the host field for cohosts matching host1
      const result = await Cohost.updateMany(
        { host: mockHost1._id },
        { $set: { host: mockHost2._id } }
      );

      expect(result.modifiedCount).toBe(3);

      // Verify the old host's cohosts list is updated
      const updatedHost1 = await Host.findById(mockHost1._id);
      expect(updatedHost1?.cohosts).not.toContain(cohost1._id);
      expect(updatedHost1?.cohosts).not.toContain(cohost2._id);

      // Verify the new host's cohosts list is updated
      const updatedHost2 = await Host.findById(mockHost2._id);
      expect(updatedHost2?.cohosts).toContainEqual(cohost1._id);
      expect(updatedHost2?.cohosts).toContainEqual(cohost2._id);
      expect(updatedHost2?.cohosts).toContainEqual(cohost3._id); // Unchanged
    });
  });

  describe("Cohost Schema - DELETE", () => {
    it("should delete a single cohost by ID and remove it from the host's cohosts list", async () => {
      const host = await createMockHost("host@example.com");

      const cohost = await Cohost.create({
        email: "cohost1@example.com",
        password: "password123",
        name: "CohostOne",
        host: host._id,
      });

      // Delete the cohost
      await Cohost.findByIdAndDelete(cohost._id);

      // Verify the cohost is removed from the database
      const deletedCohost = await Cohost.findById(cohost._id);
      expect(deletedCohost).toBeNull();

      // Verify the cohost is removed from the host's cohosts list
      const updatedHost = await Host.findById(host._id).populate("cohosts");
      expect(updatedHost?.cohosts).toHaveLength(0);
    });

    it("should delete multiple cohosts and update the host's cohosts list", async () => {
      const host = await createMockHost("host@example.com");

      const cohost1 = await Cohost.create({
        email: "cohost1@example.com",
        password: "password123",
        name: "CohostOne",
        host: host._id,
      });

      const cohost2 = await Cohost.create({
        email: "cohost2@example.com",
        password: "password123",
        name: "CohostTwo",
        host: host._id,
      });

      // Bulk delete cohosts
      const result = await Cohost.deleteMany({ host: host._id });
      expect(result.deletedCount).toBe(2);

      // Verify the cohosts are removed from the database
      const remainingCohosts = await Cohost.find({ host: host._id });
      expect(remainingCohosts).toHaveLength(0);

      // Verify the host's cohosts list is empty
      const updatedHost = await Host.findById(host._id).populate("cohosts");
      expect(updatedHost?.cohosts).toHaveLength(0);
    });

    it("should adjust the host's cohosts list correctly after deleting a cohost", async () => {
      const host = await createMockHost("host@example.com");

      const cohost1 = await Cohost.create({
        email: "cohost1@example.com",
        password: "password123",
        name: "CohostOne",
        host: host._id,
      });

      const cohost2 = await Cohost.create({
        email: "cohost2@example.com",
        password: "password123",
        name: "CohostTwo",
        host: host._id,
      });

      // Delete one cohost
      await Cohost.findByIdAndDelete(cohost1._id);

      // Verify the remaining cohosts in the host's cohosts list
      const updatedHost = await Host.findById(host._id).populate("cohosts");
      expect(updatedHost?.cohosts).toHaveLength(1);
      expect(updatedHost?.cohosts[0]._id.toString()).toBe(
        cohost2._id.toString()
      );
    });

    it("should delete cohosts across multiple hosts and update all affected hosts", async () => {
      const host1 = await createMockHost("host1@example.com");
      const host2 = await createMockHost("host2@example.com");

      const cohost1 = await Cohost.create({
        email: "cohost1@example.com",
        password: "password123",
        name: "CohostOne",
        host: host1._id,
      });

      const cohost2 = await Cohost.create({
        email: "cohost2@example.com",
        password: "password123",
        name: "CohostTwo",
        host: host1._id,
      });

      const cohost3 = await Cohost.create({
        email: "cohost3@example.com",
        password: "password123",
        name: "CohostThree",
        host: host2._id,
      });

      // Bulk delete cohosts by email pattern
      const result = await Cohost.deleteMany({ email: /cohost/i });
      expect(result.deletedCount).toBe(3);

      // Verify all cohosts are removed from their respective hosts
      const updatedHost1 = await Host.findById(host1._id).populate("cohosts");
      const updatedHost2 = await Host.findById(host2._id).populate("cohosts");

      expect(updatedHost1?.cohosts).toHaveLength(0);
      expect(updatedHost2?.cohosts).toHaveLength(0);
    });

    it("should fail gracefully if a host reference no longer exists", async () => {
      const host = await createMockHost("host@example.com");

      const cohost = await Cohost.create({
        email: "cohost@example.com",
        password: "password123",
        name: "CohostOne",
        host: host._id,
      });

      // Remove the host directly
      await Host.findByIdAndDelete(host._id);

      // Attempt to delete the cohost
      const result = await Cohost.findByIdAndDelete(cohost._id);

      // Verify the cohost is deleted without errors
      expect(result).toBeDefined();
      const deletedCohost = await Cohost.findById(cohost._id);
      expect(deletedCohost).toBeNull();
    });
  });
});
