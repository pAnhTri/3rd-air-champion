import express, { Request, Response } from "express";
import axios from "axios";
import ical from "ical";
import dotenv from "dotenv";
import { differenceInCalendarDays, isBefore, startOfToday } from "date-fns";
import { sendGraphQLRequest } from "./util/sendToGraphQL";

dotenv.config();

const router = express.Router();

router.post("/sync", async (req: Request, res: any) => {
  // curl -X POST http://localhost:8080/airbnb/sync \
  // -H "Content-Type: application/json" \
  // -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb2hvc3RJZCI6bnVsbCwiaG9zdElkIjoiNjc2OGY3MGExZDcyMzY4MzUzNGEwZTk3Iiwicm9sZSI6Ikhvc3QiLCJpYXQiOjE3MzU1MTM2NTYsImV4cCI6MTczNTUxNzI1Nn0.gAl3_X8fTSpRUcHZ3CLepa3sDqNxooaUwPESDh5q-CM" \
  // -d '{"data": [{"room": "6770ccf567b89518e7760b92", "link": "https://www.airbnb.com/calendar/ical/1177648203505001777.ics?s=aa6cf3fa517af7329c98b8aa99bb2a91"}, {"room": "6770cdc267b89518e7760bbe", "link": "https://www.airbnb.com/calendar/ical/1144526275550691711.ics?s=50a66e22348fe3b6ea9e78a59e2da65e"}], "calendar": "6768f70a1d723683534a0e99", "guest": "6770dd1490009b0857d7fcbd"}'

  if (!("user" in req))
    return res.status(401).json({ error: "Invalid or expired token" });

  const { data, calendar, guest } = req.body;
  const AirBnBObjects: { room: string; link: string }[] = data;

  const ICSObjects = [];

  for await (const { room, link } of AirBnBObjects) {
    const events = await axios
      .get(link)
      .then((res) => res.data)
      .catch((error) => {
        throw new Error(
          `Error processing ICS link for ${link}: ${error.message}`
        );
      });
    ICSObjects.push({ room, events });
  }

  const parsedICS = ICSObjects.map(({ room, events }) => ({
    room,
    events: ical.parseICS(events),
  }));

  const finalResult = parsedICS.map(({ room, events }) => {
    const reserved: any[] = [];
    const blocked: any[] = [];

    Object.values(events).forEach((event: any) => {
      if (event.type === "VEVENT" && event.start && event.end) {
        // Skip days in the past

        if (isBefore(event.start, startOfToday())) return;

        const duration = differenceInCalendarDays(
          event.end as Date,
          event.start as Date
        );

        if (event.summary?.includes("Reserved")) {
          reserved.push({
            start: event.start.toISOString().split("T")[0],
            duration,
            description: event.description,
          });
        } else if (event.summary?.includes("Not available")) {
          blocked.push({
            start: event.start.toISOString().split("T")[0],
            duration,
          });
        }
      }
    });

    return { room, reserved, blocked };
  });

  const variables = { calendar, guest };

  const bookQuery = `mutation BookAirBnB($calendar: String!, $date: String!, $guest: String!, $description: String!, $room: String!, $duration: Int!) {
        bookAirBnB(calendar: $calendar, date: $date, guest: $guest, description: $description, room: $room, duration: $duration) {
            id
            calendar
            date
            isAirBnB
            isBlocked
            bookings {
            id
            alias
            price
            notes
            guest {
                id
                name
                email
                phone
                numberOfGuests
                returning
                notes
                host
            }
            room {
                id
                host
                name
                price
            }
            description
            duration
            numberOfGuests
            startDate
            endDate
            }
            numberOfGuests
            blockedRooms {
            id
            host
            name
            price
            }
            createdAt
            updatedAt
        }
    }`;

  // Transform blocked data into the desired structure
  const blockedData = finalResult.reduce(
    (acc: Record<string, any[]>, roomData) => {
      acc[roomData.room] = roomData.blocked; // Group blocked data by room
      return acc;
    },
    {}
  );

  // Process booking requests
  const bookingRequests = finalResult.flatMap((roomData) =>
    roomData.reserved.map((booking) => {
      const bookQueryBody = {
        ...variables,
        room: roomData.room,
        description: booking.description,
        date: booking.start,
        duration: booking.duration,
      };

      return sendGraphQLRequest(bookQuery, bookQueryBody).then(
        (result: any) => {
          if (result.errors) {
            throw new Error(result.errors[0].message); // Propagate the error
          }
          return { type: "reserved", data: result.data.bookAirBnB }; // Mark result as reserved
        }
      );
    })
  );

  // Combine both booking and blocking requests
  const allRequests = [...bookingRequests];

  // Execute all requests and handle results
  Promise.all(allRequests)
    .then((results) => {
      const reservedResults = results.filter((r) => r.type === "reserved");

      // Send response
      res.status(200).json({
        success: true,
        reserved: reservedResults.map((r) => r.data),
        blocked: blockedData,
      });
    })
    .catch((error) => {
      // Handle errors collectively
      console.error("Error during processing:", error.message);
      res.status(500).json({ error: error.message });
    });
});

export default router;
