import express, { Request, Response } from "express";
import { sendGraphQLRequest } from "./util/sendToGraphQL";

const router = express.Router();

router.post("/create", async (req: Request, res: any) => {
  if (!("user" in req))
    return res.status(401).json({ error: "Invalid or expired token" });

  const { name, price } = req.body;
  const { hostId } = req.user as any;

  const query = `
        mutation CreateRoom($host: String!, $name: String!, $price: Float!) {
            createRoom(host: $host, name: $name, price: $price) {
                id
                name
                price
            }
        }`;

  sendGraphQLRequest(query, { name, price, host: hostId })
    .then((result: any) => {
      if (result.errors) {
        return res.status(400).json({ errors: result.errors[0].message });
      }
      // Send the successful login response
      res.status(200).json(result.data.createRoom);
    })
    .catch((error: any) => {
      // Handle errors from the helper function
      res.status(500).json({ error: error.message });
    });
});

router.get("/get", async (req: Request, res: any) => {
  if (!("user" in req))
    return res.status(401).json({ error: "Invalid or expired token" });

  const query = `
        query Rooms {
            rooms {
                id
                name
                price
            }
        }`;

  sendGraphQLRequest(query)
    .then((result: any) => {
      if (result.errors) {
        return res.status(400).json({ errors: result.errors[0].message });
      }
      // Send the successful login response
      res.status(200).json(result.data.rooms);
    })
    .catch((error: any) => {
      // Handle errors from the helper function
      res.status(500).json({ error: error.message });
    });
});

router.post("/get/host", async (req: Request, res: any) => {
  if (!("user" in req))
    return res.status(401).json({ error: "Invalid or expired token" });

  const { host } = req.body;

  const query = `
        query RoomsHost($host: String!) {
          roomsHost(host: $host) {
            id
            name
            price
          }
        }`;

  sendGraphQLRequest(query, { host })
    .then((result: any) => {
      if (result.errors) {
        return res.status(400).json({ errors: result.errors[0].message });
      }
      // Send the successful login response
      res.status(200).json(result.data.roomsHost);
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
          query Room ($id: String!) {
              room (_id: $id) {
                  id
                  name
                  price
              }
          }`;

  sendGraphQLRequest(query, { id })
    .then((result: any) => {
      if (result.errors) {
        return res.status(400).json({ errors: result.errors[0].message });
      }
      // Send the successful login response
      res.status(200).json(result.data.room);
    })
    .catch((error: any) => {
      // Handle errors from the helper function
      res.status(500).json({ error: error.message });
    });
});

router.put("/update", async (req: Request, res: any) => {
  if (!("user" in req))
    return res.status(401).json({ error: "Invalid or expired token" });

  const { id, name, price } = req.body;

  const variables: {
    id: string;
    name?: string;
    price?: number;
  } = { id };
  if (name) variables.name = name;
  if (price) variables.price = price;

  const query = `
          mutation UpdateRoom($id: String!, $name: String, $price: Float) {
                updateRoom(_id: $id, name: $name, price: $price) {
                    name
                    price
                }
            }`;

  sendGraphQLRequest(query, variables)
    .then((result: any) => {
      if (result.errors) {
        return res.status(400).json({ errors: result.errors[0].message });
      }
      // Send the successful login response
      res.status(200).json(result.data.updateRoom);
    })
    .catch((error: any) => {
      // Handle errors from the helper function
      res.status(500).json({ error: error.message });
    });
});

router.post("/delete", async (req: Request, res: any) => {
  if (!("user" in req))
    return res.status(401).json({ error: "Invalid or expired token" });

  const { roomIds } = req.body;
  const { hostId } = req.user as any;

  const query = `
            mutation DeleteRooms($id: String!, $roomIds: [String!]!) {
                deleteRooms(_id: $id, roomIds: $roomIds) {
                    rooms
                }
            }`;

  sendGraphQLRequest(query, { id: hostId, roomIds })
    .then((result: any) => {
      if (result.errors) {
        return res.status(400).json({ errors: result.errors[0].message });
      }
      // Send the successful login response
      res.status(200).json(result.data.deleteRooms);
    })
    .catch((error: any) => {
      // Handle errors from the helper function
      res.status(500).json({ error: error.message });
    });
});

export default router;
