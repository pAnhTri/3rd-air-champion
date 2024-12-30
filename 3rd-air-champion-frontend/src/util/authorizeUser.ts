import axios from "axios";
const BACKEND_ENDPOINT = import.meta.env.VITE_BACKEND_ENDPOINT || "";
const BACKEND_ENDPOINT_MOBILE =
  import.meta.env.VITE_BACKEND_ENDPOINT_MOBILE || "";
const isMobile = window.location.hostname !== "localhost";
const endpoint = isMobile ? BACKEND_ENDPOINT_MOBILE : BACKEND_ENDPOINT;

export const authorizeUser = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  return axios
    .post(`${endpoint}/auth/login`, {
      email: email,
      password: password,
    })
    .then((result) => {
      const { account, token } = result.data;
      return { account, token };
    })
    .catch((err) => {
      if (err.response && err.response.data && err.response.data.errors) {
        throw err.response.data.errors;
      }
      // Default error message if no backend message is available
      throw `An unexpected error occurred. Please try again.`;
    });
};

export const registerUser = async ({
  email,
  name,
  password,
}: {
  email: string;
  name: string;
  password: string;
}) => {
  return axios
    .post(`${endpoint}/auth/register`, {
      email: email,
      name: name,
      password: password,
    })
    .then((result) => {
      const { account, token } = result.data;
      return { account, token };
    })
    .catch((err) => {
      if (err.response && err.response.data && err.response.data.errors) {
        throw err.response.data.errors;
      }
      // Default error message if no backend message is available
      throw `An unexpected error occurred. Please try again.`;
    });
};
