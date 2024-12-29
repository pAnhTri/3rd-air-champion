import { jwtDecode, JwtPayload } from "jwt-decode";

export const isTokenValid = (): boolean => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  const decoded = jwtDecode<JwtPayload>(token);
  const currentTime = Date.now() / 1000;
  return decoded.exp ? decoded.exp > currentTime : false;
};
