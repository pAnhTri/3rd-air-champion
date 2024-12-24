import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const GRAPHQL_ENDPOINT =
  process.env.GRAPHQL_ENDPOINT || "http://localhost:8080/graphql";

export const sendGraphQLRequest = async (
  query: string,
  variables: Record<string, any> = {},
  token?: string
) => {
  return axios
    .post(
      GRAPHQL_ENDPOINT,
      { query, variables },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    .then((result) => {
      return result.data;
    })
    .catch((error) => {
      throw new Error(
        error.response?.data?.errors?.[0]?.message || "GraphQL query failed"
      );
    });
};
