import dotenv from "dotenv";
import mongoose from "mongoose";
import express, { Request, Response } from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import http from "http";
import { resolvers } from "./graphql/resolvers";
import { typeDefs } from "./graphql/typeDefs";
import authorizationRoute from "./route/authenticationRoute";
import guestRoute from "./route/guestRoute";
import roomRoute from "./route/roomRoute";
import dayRoute from "./route/dayRoute";
import { authenticateToken } from "./middleware/authenticateJWT";

dotenv.config();

const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI || "";

const startServer = async () => {
  try {
    // Database Connection
    await mongoose
      .connect(MONGO_URI)
      .then(() => {
        console.log("MongoDB connected");
      })
      .catch((error) => {
        console.log(`Error: ${error}`);
      });

    // Initialize Express
    const app = express();
    const httpServer = http.createServer(app);

    // Initialize Apollo Server
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    });

    await server.start();

    app.use(express.json()), // Middleware for parsing JSON requests
      // Use Apollo Server Middleware
      app.use("/graphql", expressMiddleware(server) as any);

    // Landing route
    app.get("/", (req: Request, res: Response) => {
      res.status(200).json({ message: "Hello World!" });
    });

    // Authorization route
    app.use("/auth", authorizationRoute);

    // Authenticate all paths from now on
    app.use(authenticateToken as any);

    // Guest route
    app.use("/guest", guestRoute);
    app.use("/room", roomRoute);
    app.use("/day", dayRoute);

    console.log(`Express server ready at http://localhost:${PORT}/`);

    // Start the HTTP Server
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.error("Server startup error:", error);
  }
};

// Call the async function to start the server
startServer();
