import axios from "axios";

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "";

export const fetchRooms = async (host: string, token: string) => {
  return axios
    .post(
      `${BACKEND_ENDPOINT}/room/get/host`,
      { host },
      {
        headers: {
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

export const createRoom = async (
  roomObject: { name: string; price: number },
  token: string
) => {
  return axios
    .post(
      `${BACKEND_ENDPOINT}/room/create`,
      { ...roomObject },
      {
        headers: {
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
