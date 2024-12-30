import axios from "axios";
import { jwtDecode, JwtPayload } from "jwt-decode";

const BACKEND_ENDPOINT = import.meta.env.VITE_PRODUCTION_BACKEND_ENDPOINT || "";

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

export const getHost = () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Invalid or expired token");

  const payload = jwtDecode<JwtPayload>(token);
  if ("hostId" in payload) return payload.hostId;
  else throw new Error("Invalid account");
};
