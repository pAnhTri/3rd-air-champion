import axios from "axios";
const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "";

export const fetchHost = async (id: string, token: string) => {
  return axios
    .post(
      `${BACKEND_ENDPOINT}/host/get/one`,
      { id }, // Payload
      {
        headers: {
          // Correctly place headers here
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((result) => result.data)
    .catch((err) => {
      if (err.response && err.response.data && err.response.data.errors) {
        throw err.response.data.errors;
      }
      // Default error message if no backend message is available
      throw "An unexpected error occurred. Please try again.";
    });
};

export const updateSync = async (
  id: string,
  airbnbsync: string,
  token: string
) => {
  return axios
    .post(
      `${BACKEND_ENDPOINT}/host/update/sync`,
      { id, airbnbsync }, // Payload
      {
        headers: {
          // Correctly place headers here
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((result) => result.data)
    .catch((err) => {
      if (err.response && err.response.data && err.response.data.errors) {
        throw err.response.data.errors;
      }
      // Default error message if no backend message is available
      throw "An unexpected error occurred. Please try again.";
    });
};
