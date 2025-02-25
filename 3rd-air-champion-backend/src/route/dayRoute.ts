import express, { Request, Response } from "express";
import { sendGraphQLRequest } from "./util/sendToGraphQL";

const router = express.Router();

router.get("/get", async (req: Request, res: any) => {
  if (!("user" in req))
    return res.status(401).json({ error: "Invalid or expired token" });

  const query = `
        query Days {
          days {
            id
            calendar
            date
            isAirBnB
            isBlocked
            blockedRooms {
              host
              id
              name
              price
            }
            bookings {
              id
              alias
              price
              notes
              guest {
                id
                name
                alias
                email
                phone
                numberOfGuests
                returning
                notes
                host
                pricing {
                  id
                  price
                  room
                }
              }
              room {
                id
                host
                name
                price
              }
              duration
              description
              numberOfGuests
              startDate
              endDate
            }
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

router.post("/get/one", async (req: Request, res: any) => {
  if (!("user" in req))
    return res.status(401).json({ error: "Invalid or expired token" });

  const { id } = req.body;

  const query = `
        query Day($id: String!) {
          day(_id: $id) {
            date
            guests {
              id
              email
              name
              notes
              numberOfGuests
              phone
              returning
            }
            numberOfGuests
            duration
            isAirBnB
            isBlocked
            rooms {
              id
              name
              price
            }
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

router.post("/get/host", async (req: Request, res: any) => {
  if (!("user" in req))
    return res.status(401).json({ error: "Invalid or expired token" });

  const { calendarId } = req.body;

  const query = `
        query HostDays($calendarId: String!) {
          hostDays(calendarId: $calendarId) {
            id
            calendar
            date
            isAirBnB
            isBlocked
            blockedRooms {
              host
              id
              name
              price
            }
            bookings {
              id
              alias
              price
              notes
              guest {
                id
                name
                alias
                email
                phone
                numberOfGuests
                returning
                notes
                host
                pricing {
                  id
                  price
                  room
                }
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
          }
        }`;

  sendGraphQLRequest(query, { calendarId })
    .then((result: any) => {
      if (result.errors) {
        return res.status(400).json({ errors: result.errors[0].message });
      }
      // Send the successful login response
      res.status(200).json(result.data.hostDays);
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
        mutation BlockDay($calendar: String!, $date: String!) {
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

router.post("/book/range", async (req: Request, res: any) => {
  if (!("user" in req))
    return res.status(401).json({ error: "Invalid or expired token" });

  const { calendar, date, guest, isAirBnB, numberOfGuests, room, duration } =
    req.body;

  const query = `
        mutation BookDays($calendar: String!, $date: String!, $guest: String!, $isAirBnB: Boolean!, $numberOfGuests: Int!, $room: String!, $duration: Int!) {
          bookDays(calendar: $calendar, date: $date, guest: $guest, isAirBnB: $isAirBnB, numberOfGuests: $numberOfGuests, room: $room, duration: $duration) {
            id
            calendar
            date
            isAirBnB
            isBlocked
            blockedRooms {
              host
              id
              name
              price
            }
            bookings {
              id
              alias
              notes
              price
              guest {
                id
                alias
                name
                email
                phone
                numberOfGuests
                returning
                notes
                host
                pricing {
                  id
                  price
                  room
                }
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
          }
        }`;

  sendGraphQLRequest(query, {
    calendar,
    date,
    guest,
    isAirBnB,
    numberOfGuests,
    room,
    duration,
  })
    .then((result: any) => {
      if (result.errors) {
        return res.status(400).json({ errors: result.errors[0].message });
      }
      // Send the successful login response
      res.status(200).json(result.data.bookDays);
    })
    .catch((error: any) => {
      // Handle errors from the helper function
      res.status(500).json({ error: error.message });
    });
});

router.post("/update/booking/guest", async (req: Request, res: any) => {
  if (!("user" in req))
    return res.status(401).json({ error: "Invalid or expired token" });

  const { id, alias, notes, numberOfGuests } = req.body;

  const variables: {
    id: string;
    alias?: string;
    notes?: string;
    numberOfGuests?: number;
  } = { id };
  if (alias) variables.alias = alias;
  if (notes) variables.notes = notes;
  if (numberOfGuests) variables.numberOfGuests = numberOfGuests;

  const query = `
        mutation UpdateBookingGuest($id: String!, $alias: String, $notes: String, $numberOfGuests: Int) {
          updateBookingGuest(_id: $id, alias: $alias, notes: $notes, numberOfGuests: $numberOfGuests) {
            id
            calendar
            date
            isAirBnB
            isBlocked
            blockedRooms {
              host
              id
              name
              price
            }
            bookings {
              id
              alias
              notes
              price
              guest {
                id
                name
                alias
                email
                phone
                numberOfGuests
                returning
                notes
                host
                pricing {
                  id
                  price
                  room
                }
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
          }
        }`;

  sendGraphQLRequest(query, variables)
    .then((result: any) => {
      if (result.errors) {
        return res.status(400).json({ errors: result.errors[0].message });
      }
      // Send the successful login response
      res.status(200).json(result.data.updateBookingGuest);
    })
    .catch((error: any) => {
      // Handle errors from the helper function
      res.status(500).json({ error: error.message });
    });
});

router.post("/update/unbook/guest", async (req: Request, res: any) => {
  if (!("user" in req))
    return res.status(401).json({ error: "Invalid or expired token" });

  const { id } = req.body;

  const query = `
        mutation UnbookGuest($id: String!) {
          unbookGuest(_id: $id) {
            id
            calendar
            date
            isAirBnB
            isBlocked
            blockedRooms {
              host
              id
              name
              price
            }
            bookings {
              id
              alias
              notes
              price
              guest {
                id
                name
                alias
                email
                phone
                numberOfGuests
                returning
                notes
                host
                pricing {
                  id
                  price
                  room
                }
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
          }
        }`;

  sendGraphQLRequest(query, { id })
    .then((result: any) => {
      if (result.errors) {
        return res.status(400).json({ errors: result.errors[0].message });
      }
      // Send the successful login response
      res.status(200).json(result.data.unbookGuest);
    })
    .catch((error: any) => {
      // Handle errors from the helper function
      res.status(500).json({ error: error.message });
    });
});

router.post("/update/booking/price", async (req: Request, res: any) => {
  if (!("user" in req))
    return res.status(401).json({ error: "Invalid or expired token" });

  const { calendar, room, startDate, endDate, price } = req.body;

  const query = `
  mutation UpdatePrice($calendar: String!, $room: String, $startDate: String, $endDate: String, $price: Float) {
    updatePrice(calendar: $calendar, room: $room, startDate: $startDate, endDate: $endDate, price: $price) {
      id
      calendar
      date
      isAirBnB
      isBlocked
      blockedRooms {
        host
        id
        name
        price
      }
      bookings {
        id
        alias
        notes
        price
        guest {
          id
          name
          alias
          email
          phone
          numberOfGuests
          returning
          notes
          host
          pricing {
            id
            price
            room
          }
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
    }
  }`;

  sendGraphQLRequest(query, { calendar, room, startDate, endDate, price })
    .then((result: any) => {
      if (result.errors) {
        return res.status(400).json({ errors: result.errors[0].message });
      }
      // Send the successful login response
      res.status(200).json(result.data.updatePrice);
    })
    .catch((error: any) => {
      // Handle errors from the helper function
      res.status(500).json({ error: error.message });
    });
});

router.put("/update", async (req: Request, res: any) => {
  if (!("user" in req))
    return res.status(401).json({ error: "Invalid or expired token" });

  const { id, isAirBnB, isBlocked, rooms, guests } = req.body;
  const variables: {
    id: string;
    isAirBnB?: boolean;
    isBlocked?: boolean;
    rooms?: string[];
    guests?: string[];
  } = { id };
  if (typeof isAirBnB !== "undefined") variables.isAirBnB = isAirBnB;
  if (typeof isBlocked !== "undefined") variables.isBlocked = isBlocked;
  if (rooms) variables.rooms = rooms;
  if (guests) variables.guests = guests;

  const query = `
        mutation UpdateDay($id: String!, $isAirBnB: Boolean, $isBlocked: Boolean, $room: String, $guest: String) {
          updateDay(_id: $id, isAirBnB: $isAirBnB, isBlocked: $isBlocked, room: $room, guest: $guest) {
            date
            guests
            isAirBnB
            isBlocked
            rooms
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
