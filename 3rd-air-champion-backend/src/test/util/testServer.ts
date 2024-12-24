import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { resolvers } from "../../graphql/resolvers";
import { typeDefs } from "../../graphql/typeDefs";

const createApp = async () => {
  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use("/graphql", express.json(), expressMiddleware(server) as any);

  return app;
};

export { createApp };
