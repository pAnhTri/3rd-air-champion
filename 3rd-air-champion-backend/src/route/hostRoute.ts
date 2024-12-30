import express, { Request, Response } from "express";
import { sendGraphQLRequest } from "./util/sendToGraphQL";

const router = express.Router();

router.post("/get/one", async (req: Request, res: any) => {
  const { id } = req.body;

  const query = `
            query Host($id: String!) {
                host(_id: $id) {
                    guests
                    email
                    rooms
                    airbnbsync {
                      room
                      link
                    }
                    name
                    cohosts
                    calendar
                }
            }
    `;

  sendGraphQLRequest(query, { id })
    .then((result: any) => {
      if (result.errors) {
        return res.status(400).json({ errors: result.errors[0].message });
      }
      // Send the successful login response
      res.status(200).json(result.data.host);
    })
    .catch((error: any) => {
      // Handle errors from the helper function
      res.status(500).json({ error: error.message });
    });
});

router.post("/update/one", async (req: Request, res: any) => {
  const { id } = req.body;

  const query = `
            query Host($id: String!) {
                host(_id: $id) {
                    guests
                    email
                    rooms
                    airbnbsync {
                      room
                      link
                    }
                    name
                    cohosts
                    calendar
                }
            }
    `;

  sendGraphQLRequest(query, { id })
    .then((result: any) => {
      if (result.errors) {
        return res.status(400).json({ errors: result.errors[0].message });
      }
      // Send the successful login response
      res.status(200).json(result.data.host);
    })
    .catch((error: any) => {
      // Handle errors from the helper function
      res.status(500).json({ error: error.message });
    });
});

router.post("/update/sync", async (req: Request, res: any) => {
  const { id, airbnbsync } = req.body;

  const query = `
            mutation UpdateHost($id: String!, $airbnbsync: String) {
              updateHost(_id: $id, airbnbsync: $airbnbsync) {
                airbnbsync {
                  link
                  room
                }
              }
            }`;

  sendGraphQLRequest(query, { id, airbnbsync })
    .then((result: any) => {
      if (result.errors) {
        return res.status(400).json({ errors: result.errors[0].message });
      }
      // Send the successful login response
      res.status(200).json(result.data.updateHost);
    })
    .catch((error: any) => {
      // Handle errors from the helper function
      res.status(500).json({ error: error.message });
    });
});

export default router;
