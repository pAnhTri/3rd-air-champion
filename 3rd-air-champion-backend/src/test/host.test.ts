import request from "supertest";
import dotenv from "dotenv";
import { createApp } from "./util/testServer";
import { createMockHost } from "../model/test/util/mockHost";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "";

let app: Express.Application;

beforeEach(async () => {
  app = await createApp(); // Create app for each test
});

describe("GraphQL Queries", () => {
  beforeEach(async () => {
    const mockHost1 = await createMockHost("anhtp5@uci.edu");
    const mockHost2 = await createMockHost("anhtp6@uci.edu");
    const mockHost3 = await createMockHost("anhtp7@uci.edu");
  });
  it("should fetch hosts", async () => {
    const query = `
      query {
        hosts {
          id
          email
          name
        }
      }
    `;

    const response = await request(app as any)
      .post("/graphql")
      .send({ query });

    console.log(response.body.data); // Log response data

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty("hosts");
    expect(Array.isArray(response.body.data.hosts)).toBe(true);
  });

  it("should register", async () => {
    const query = `
      mutation RegisterHost($email: String!, $password: String!, $name: String!) {
        registerHost(email: $email, password: $password, name: $name) {
            cohostId
            hostId
            role
        }
      }
    `;

    const variables = {
      email: "anhtp8@uci.edu",
      password: "#Validpassword2",
      name: "Andy Pham",
    };

    const response = await request(app as any)
      .post("/graphql")
      .send({ query, variables });

    console.log(response.body.data); // Log response data

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty("registerHost");
  });
});
