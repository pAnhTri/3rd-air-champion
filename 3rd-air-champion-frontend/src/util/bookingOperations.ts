import axios from "axios";
const BACKEND_ENDPOINT = import.meta.env.VITE_BACKEND_ENDPOINT || "";
const BACKEND_ENDPOINT_MOBILE =
  import.meta.env.VITE_BACKEND_ENDPOINT_MOBILE || "";
const isMobile = window.location.hostname !== "localhost";
const endpoint = isMobile ? BACKEND_ENDPOINT_MOBILE : BACKEND_ENDPOINT;

export const postBooking = async (
  request: {
    calendar: string;
    date: string;
    guest: string;
    isAirBnB: boolean;
    numberOfGuests: number;
    room: string;
    duration: number;
  },
  token: string
) => {
  return axios
    .post(`${endpoint}/day/book/range`, request, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((result) => result.data)
    .catch((err) => {
      if (err.response && err.response.data && err.response.data.errors) {
        throw err.response.data.errors;
      }
      // Default error message if no backend message is available
      throw "An unexpected error occurred. Please try again.";
    });
};
