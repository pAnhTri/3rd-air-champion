import express, { Request, Response } from "express";
import { sendGraphQLRequest } from "./util/sendToGraphQL";

const router = express.Router();

router.get("/get", async (req: Request, res: any) => {
  if (!("user" in req))
    return res.status(401).json({ error: "Invalid or expired token" });

  const query = `
        query Days {
          days {
            room
            isBlocked
            isAirBnB
            guest
            date
          }
        }`;

  sendGraphQLRequest(query)
    .then((result: any) => {
      if (result.errors) {
        return res.status(400).json({ errors: result.errors[0].message });
      }
      // Send the successful login response
      res.status(200).json(result.data.days);
    })
    .catch((error: any) => {
      // Handle errors from the helper function
      res.status(500).json({ error: error.message });
    });
});

router.get("/get/one", async (req: Request, res: any) => {
  if (!("user" in req))
    return res.status(401).json({ error: "Invalid or expired token" });

  const { id } = req.body;

  const query = `
        query Day($id: String!) {
          day(_id: $id) {
            date
            guest
            isAirBnB
            isBlocked
            room
          }
        }`;

  sendGraphQLRequest(query, { id })
    .then((result: any) => {
      if (result.errors) {
        return res.status(400).json({ errors: result.errors[0].message });
      }
      // Send the successful login response
      res.status(200).json(result.data.day);
    })
    .catch((error: any) => {
      // Handle errors from the helper function
      res.status(500).json({ error: error.message });
    });
});

router.post(["/block", "/block/one"], async (req: Request, res: any) => {
  if (!("user" in req))
    return res.status(401).json({ error: "Invalid or expired token" });

  const { calendar, date } = req.body;

  const query = `
        mutation BlockDay($calendar: String!, $date: Date!) {
            blockDay(calendar: $calendar, date: $date) {
                date
            }
        }`;

  sendGraphQLRequest(query, { calendar, date })
    .then((result: any) => {
      if (result.errors) {
        return res.status(400).json({ errors: result.errors[0].message });
      }
      // Send the successful login response
      res.status(200).json(result.data.blockDay);
    })
    .catch((error: any) => {
      // Handle errors from the helper function
      res.status(500).json({ error: error.message });
    });
});

router.post(["/unblock", "/unblock/one"], async (req: Request, res: any) => {
  if (!("user" in req))
    return res.status(401).json({ error: "Invalid or expired token" });

  const { calendar, date } = req.body;

  const query = `
        mutation UnblockDay($calendar: String!, $date: String!) {
          unblockDay(calendar: $calendar, date: $date) {
            date
          }
        }`;

  sendGraphQLRequest(query, { calendar, date })
    .then((result: any) => {
      if (result.errors) {
        return res.status(400).json({ errors: result.errors[0].message });
      }
      // Send the successful login response
      res.status(200).json(result.data.unblockDay);
    })
    .catch((error: any) => {
      // Handle errors from the helper function
      res.status(500).json({ error: error.message });
    });
});

router.post("/block/many", async (req: Request, res: any) => {
  if (!("user" in req))
    return res.status(401).json({ error: "Invalid or expired token" });

  const { calendar, dates } = req.body;

  const query = `
        mutation BlockManyDays($calendar: String!, $dates: [Date!]!) {
            blockManyDays(calendar: $calendar, dates: $dates) {
                date
            }
        }`;

  sendGraphQLRequest(query, { calendar, dates })
    .then((result: any) => {
      if (result.errors) {
        return res.status(400).json({ errors: result.errors[0].message });
      }
      // Send the successful login response
      res.status(200).json(result.data.blockManyDays);
    })
    .catch((error: any) => {
      // Handle errors from the helper function
      res.status(500).json({ error: error.message });
    });
});

router.post("/unblock/many", async (req: Request, res: any) => {
  if (!("user" in req))
    return res.status(401).json({ error: "Invalid or expired token" });

  const { calendar, dates } = req.body;

  const query = `
        mutation UnblockManyDays($calendar: String!, $dates: [String!]!) {
          unblockManyDays(calendar: $calendar, dates: $dates) {
            date
            isBlocked
          }
        }`;

  sendGraphQLRequest(query, { calendar, dates })
    .then((result: any) => {
      if (result.errors) {
        return res.status(400).json({ errors: result.errors[0].message });
      }
      // Send the successful login response
      res.status(200).json(result.data.unblockManyDays);
    })
    .catch((error: any) => {
      // Handle errors from the helper function
      res.status(500).json({ error: error.message });
    });
});

router.post("/block/range", async (req: Request, res: any) => {
  if (!("user" in req))
    return res.status(401).json({ error: "Invalid or expired token" });

  const { calendar, startDate, endDate } = req.body;

  const query = `
        mutation BlockRange($calendar: String!, $startDate: Date!, $endDate: Date!) {
          blockRange(calendar: $calendar, startDate: $startDate, endDate: $endDate) {
            date
          }
        }`;

  sendGraphQLRequest(query, { calendar, startDate, endDate })
    .then((result: any) => {
      if (result.errors) {
        return res.status(400).json({ errors: result.errors[0].message });
      }
      // Send the successful login response
      res.status(200).json(result.data.blockRange);
    })
    .catch((error: any) => {
      // Handle errors from the helper function
      res.status(500).json({ error: error.message });
    });
});

router.post("/unblock/range", async (req: Request, res: any) => {
  if (!("user" in req))
    return res.status(401).json({ error: "Invalid or expired token" });

  const { calendar, startDate, endDate } = req.body;

  const query = `
        mutation UnblockRange($calendar: String!, $startDate: String!, $endDate: String!) {
          unblockRange(calendar: $calendar, startDate: $startDate, endDate: $endDate) {
            date
            isBlocked
          }
        }`;

  sendGraphQLRequest(query, { calendar, startDate, endDate })
    .then((result: any) => {
      if (result.errors) {
        return res.status(400).json({ errors: result.errors[0].message });
      }
      // Send the successful login response
      res.status(200).json(result.data.unblockRange);
    })
    .catch((error: any) => {
      // Handle errors from the helper function
      res.status(500).json({ error: error.message });
    });
});

router.put("/update", async (req: Request, res: any) => {
  if (!("user" in req))
    return res.status(401).json({ error: "Invalid or expired token" });

  const { id, isAirBnB, isBlocked, room, guest } = req.body;
  const variables: {
    id: string;
    isAirBnB?: boolean;
    isBlocked?: boolean;
    room?: string;
    guest?: string;
  } = { id };
  if (typeof isAirBnB !== "undefined") variables.isAirBnB = isAirBnB;
  if (typeof isBlocked !== "undefined") variables.isBlocked = isBlocked;
  if (room) variables.room = room;
  if (guest) variables.guest = guest;

  const query = `
        mutation UpdateDay($id: String!, $isAirBnB: Boolean, $isBlocked: Boolean, $room: String, $guest: String) {
          updateDay(_id: $id, isAirBnB: $isAirBnB, isBlocked: $isBlocked, room: $room, guest: $guest) {
            date
            guest
            isAirBnB
            isBlocked
            room
          }
        }`;

  sendGraphQLRequest(query, variables)
    .then((result: any) => {
      if (result.errors) {
        return res.status(400).json({ errors: result.errors[0].message });
      }
      // Send the successful login response
      res.status(200).json(result.data.updateDay);
    })
    .catch((error: any) => {
      // Handle errors from the helper function
      res.status(500).json({ error: error.message });
    });
});

export default router;
