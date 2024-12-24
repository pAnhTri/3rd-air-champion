import Host from "../model/hostSchema";
import Cohost from "../model/cohostSchema";
import Calendar from "../model/calendarSchema";
import Guest from "../model/guestSchema";
import Room from "../model/roomSchema";
import Day from "../model/daySchema";
import { GraphQLDate } from "graphql-scalars";
import mongoose from "mongoose";
import {
  startOfDay,
  isBefore,
  isAfter,
  isEqual,
  addDays,
  startOfToday,
  parseISO,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";

const generalResolvers = {
  Query: {
    greetings: () => "GraphQL is Awesome",
    hosts: async () => {
      return await Host.find();
    },
  },
};

const hostResolvers = {
  Query: {
    hosts: async () => {
      return await Host.find();
    },
    host: async (_: unknown, { _id }: any) => {
      return await Host.findById(_id);
    },
  },
  Mutation: {
    createHost: async (_: unknown, { email, name, password }: any) => {
      const host = new Host({ email, name, password });
      return await host.save();
    },
    updateHost: async (_: unknown, { _id, email, name, password }: any) => {
      const updateData: { email?: string; name?: string; password?: string } =
        {};
      if (email) updateData.email = email;
      if (name) updateData.name = name;
      if (password) {
        updateData.password = password;
      }

      // Perform the update
      const updatedHost = await Host.findByIdAndUpdate(_id, updateData, {
        new: true,
        runValidators: true,
      });

      return updatedHost;
    },
    deleteCohosts: async (_: unknown, { _id, cohostIds }: any) => {
      await Cohost.deleteMany({ _id: { $in: cohostIds } });
      return await Host.findByIdAndUpdate(
        _id,
        { $pull: { cohosts: { $in: cohostIds } } },
        { runValidators: true, new: true }
      );
    },
    deleteGuests: async (_: unknown, { _id, guestIds }: any) => {
      await Guest.deleteMany({ _id: { $in: guestIds } });
      return await Host.findByIdAndUpdate(
        _id,
        { $pull: { guests: { $in: guestIds } } },
        { runValidators: true, new: true }
      );
    },
    deleteRooms: async (_: unknown, { _id, roomIds }: any) => {
      await Room.deleteMany({ _id: { $in: roomIds } });
      return await Host.findByIdAndUpdate(
        _id,
        { $pull: { rooms: { $in: roomIds } } },
        { runValidators: true, new: true }
      );
    },
  },
};

const cohostResolvers = {
  Query: {
    cohosts: async () => {
      return await Cohost.find();
    },
    cohost: async (_: unknown, { _id }: any) => {
      return await Cohost.findById(_id);
    },
  },
  Mutation: {
    createCohost: async (_: unknown, { email, name, password, host }: any) => {
      const cohost = new Cohost({
        email: email,
        name: name,
        password: password,
        host: host,
      });
      return await cohost.save();
    },
    updateCohost: async (_: unknown, { _id, email, name, password }: any) => {
      const updateData: { email?: string; name?: string; password?: string } =
        {};
      if (email) updateData.email = email;
      if (name) updateData.name = name;
      if (password) {
        updateData.password = password;
      }

      // Perform the update
      const updatedCohost = await Cohost.findByIdAndUpdate(_id, updateData, {
        new: true,
        runValidators: true,
      });

      return updatedCohost;
    },
  },
};

const calendarResolver = {
  Query: {
    calendars: async () => {
      return await Calendar.find();
    },
    calendar: async (_: unknown, { _id }: any) => {
      return await Calendar.findById(_id);
    },
  },
  Mutation: {
    createCalendar: async (_: unknown, { host }: any) => {
      return await new Calendar({ host }).save();
    },
  },
};

const guestResolver = {
  Query: {
    guests: async () => {
      return await Guest.find();
    },
    guest: async (_: unknown, { _id }: any) => {
      return await Guest.findById(_id);
    },
  },
  Mutation: {
    createGuest: async (
      _: unknown,
      { name, email, phone, numberOfGuests, returning, notes, host }: any
    ) => {
      const guestData: {
        name: string;
        email?: string;
        phone: string;
        numberOfGuests?: number;
        returning?: boolean;
        notes?: string;
        host: string;
      } = { name, phone, host };
      if (email) guestData.email = email;
      if (numberOfGuests) guestData.numberOfGuests = numberOfGuests;
      if (returning) guestData.returning = returning;
      if (notes) guestData.notes = notes;

      return await new Guest(guestData).save();
    },
    updateGuest: async (
      _: unknown,
      { _id, name, email, phone, numberOfGuests, returning, notes }: any
    ) => {
      const updateData: {
        name?: string;
        email?: string;
        phone?: string;
        numberOfGuests?: number;
        returning?: boolean;
        notes?: string;
      } = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (phone) updateData.phone = phone;
      if (numberOfGuests) updateData.numberOfGuests = numberOfGuests;
      if (returning) updateData.returning = returning;
      if (notes) updateData.notes = notes;

      // Perform the update
      const updatedGuest = await Guest.findByIdAndUpdate(_id, updateData, {
        new: true,
        runValidators: true,
      });

      return updatedGuest;
    },
  },
};

const roomResolver = {
  Query: {
    rooms: async () => {
      return await Room.find();
    },
    room: async (_: unknown, { _id }: any) => {
      return await Room.findById(_id);
    },
  },
  Mutation: {
    createRoom: async (_: unknown, { host, name, price }: any) => {
      return await new Room({ host, name, price }).save();
    },
    updateRoom: async (_: unknown, { _id, name, price }: any) => {
      const updatedData: {
        name?: string;
        price?: number;
      } = {};
      if (name) updatedData.name = name;
      if (price) updatedData.price = price;

      return await Room.findByIdAndUpdate(_id, updatedData, {
        runValidators: true,
        new: true,
      });
    },
  },
};

const dayResolver = {
  Date: GraphQLDate,
  Query: {
    days: async () => {
      return await Day.find();
    },
    day: async (_: unknown, { _id }: any) => {
      return await Day.findById(_id);
    },
  },
  Mutation: {
    blockDay: async (_: unknown, { calendar, date }: any) => {
      // Check if day already exists
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const localDate = toZonedTime(date, timeZone);

      const day = await Day.findOne({ date: localDate });

      if (day) {
        return await Day.findByIdAndUpdate(
          { _id: day._id },
          { isBlocked: true },
          { runValidators: true, new: true }
        );
      } else {
        return await new Day({
          calendar,
          date: localDate,
          isBlocked: true,
        }).save();
      }
    },
    blockManyDays: async (_: unknown, { calendar, dates }: any) => {
      const validDates = dates.filter((date: Date) => {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const currentDate = startOfToday();
        const localDate = toZonedTime(date, timeZone);

        return isAfter(localDate, currentDate);
      });

      const bulkOps = validDates.map((date: Date) => {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const localDate = toZonedTime(date, timeZone);

        return {
          updateOne: {
            filter: {
              calendar: calendar,
              date: localDate,
              $or: [
                { guest: { $exists: false } },
                { guest: null },
                { room: { $exists: false } },
                { room: null },
              ],
            },
            update: {
              $set: { isBlocked: true },
            },
            upsert: true,
          },
        };
      });

      await Day.bulkWrite(bulkOps, { ordered: false });
      return await Day.find();
    },
    blockRange: async (_: unknown, { calendar, startDate, endDate }: any) => {
      const datesInRange = [];

      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const localStartDate = toZonedTime(startDate, timeZone);
      const localEndDate = toZonedTime(endDate, timeZone);

      const today = startOfToday();
      let currentDate = localStartDate;

      if (isBefore(currentDate, today) || isEqual(currentDate, today))
        currentDate = addDays(today, 1);

      // Loop through dates
      while (isBefore(currentDate, addDays(localEndDate, 1))) {
        datesInRange.push(currentDate);
        currentDate = addDays(currentDate, 1);
      }

      const bulkOps = datesInRange.map((date: Date) => ({
        updateOne: {
          filter: {
            calendar: calendar,
            date: date,
            $or: [
              { guest: { $exists: false } },
              { guest: null },
              { room: { $exists: false } },
              { room: null },
            ],
          },
          update: {
            $set: { isBlocked: true },
          },
          upsert: true,
        },
      }));

      await Day.bulkWrite(bulkOps, { ordered: false });
      return await Day.find();
    },
    unblockDay: async (_: unknown, { calendar, date }: any) => {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const localDate = toZonedTime(date, timeZone);

      return await Day.findOneAndUpdate(
        { calendar, date: localDate },
        { isBlocked: false },
        { runValidators: true, new: true }
      );
    },
    unblockManyDays: async (_: unknown, { calendar, dates }: any) => {
      let localDates: Date[] = [];
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const bulkOperation = dates.map((date: Date) => {
        const localDate = toZonedTime(date, timeZone);
        localDates.push(localDate);

        return {
          updateOne: {
            filter: { calendar, date: localDate },
            update: { $set: { isBlocked: false } },
          },
        };
      });

      await Day.bulkWrite(bulkOperation, { ordered: false });

      return await Day.find({ calendar, date: { $in: localDates } });
    },
    unblockRange: async (_: unknown, { calendar, startDate, endDate }: any) => {
      let datesInRange: Date[] = [];
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const localStartDate = toZonedTime(startDate, timeZone);
      const localEndDate = toZonedTime(endDate, timeZone);

      const today = startOfToday();
      let currentDate = localStartDate;

      if (isBefore(currentDate, today) || isEqual(currentDate, today))
        currentDate = addDays(today, 1);

      // Loop through dates
      while (isBefore(currentDate, addDays(localEndDate, 1))) {
        datesInRange.push(currentDate);
        currentDate = addDays(currentDate, 1);
      }

      const bulkOps = datesInRange.map((date: Date) => ({
        updateOne: {
          filter: {
            calendar: calendar,
            date: date,
          },
          update: {
            $set: { isBlocked: false },
          },
        },
      }));

      await Day.bulkWrite(bulkOps, { ordered: false });
      return await Day.find({ calendar, date: { $in: datesInRange } });
    },
    updateDay: async (
      _: unknown,
      { _id, isAirBnB, isBlocked, room, guest }: any
    ) => {
      const updatedData: {
        isAirBnB?: boolean;
        isBlocked?: boolean;
        room?: string;
        guest?: string;
      } = {};
      if (typeof isAirBnB !== "undefined" || isAirBnB !== null)
        updatedData.isAirBnB = isAirBnB;
      if (typeof isBlocked !== "undefined" || isBlocked !== null)
        updatedData.isBlocked = isBlocked;
      if (room) updatedData.room = room;
      if (guest) updatedData.guest = guest;

      return await Day.findByIdAndUpdate(_id, updatedData, {
        runValidators: true,
        new: true,
      });
    },
  },
};

const authenticationResolver = {
  Query: {
    login: async (_: unknown, { email, password }: any) => {
      // Check if account exsists
      const host = await Host.findOne({ email: email.toLowerCase() });
      const cohost = await Cohost.findOne({ email: email.toLowerCase() });

      if (!(host || cohost)) throw new Error("Account not found");

      if (
        (host && !(await (host as any).comparePassword(password))) ||
        (cohost && !(await (cohost as any).comparePassword(password)))
      )
        throw new Error("Invalid password");

      // Successful authentication
      const account: {
        hostId: mongoose.Types.ObjectId;
        cohostId?: mongoose.Types.ObjectId;
        role: string;
      } = {
        hostId: (host ? host._id : cohost?.host) as mongoose.Types.ObjectId,
        role: host ? "Host" : "Cohost",
      };
      if (cohost) account.cohostId = cohost._id;

      return account;
    },
  },
  Mutation: {
    registerHost: async (_: unknown, { email, password, name }: any) => {
      // Check if account already exists
      if (await Host.findOne({ email }))
        throw new Error("Account already exists");
      const newHost = await new Host({ email, password, name }).save();

      // Assign a calendar to the host
      await new Calendar({ host: newHost._id }).save();

      return {
        hostId: newHost._id,
        cohostId: null,
        role: "Host",
      };
    },
    registerCohost: async (
      _: unknown,
      { host, email, password, name }: any
    ) => {
      // Check if account already exists
      if (await Cohost.findOne({ email }))
        throw new Error("Account already exists");
      const newCohost = await new Cohost({
        host,
        email,
        password,
        name,
      }).save();

      return {
        hostId: newCohost.host,
        cohostId: newCohost._id,
        role: "Cohost",
      };
    },
  },
};

export const resolvers = [
  generalResolvers,
  hostResolvers,
  cohostResolvers,
  calendarResolver,
  guestResolver,
  roomResolver,
  dayResolver,
  authenticationResolver,
];
