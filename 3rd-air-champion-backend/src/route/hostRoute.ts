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

export default router;
