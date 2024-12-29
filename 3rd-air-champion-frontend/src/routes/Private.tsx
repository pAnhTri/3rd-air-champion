import { Navigate } from "react-router";
import { isTokenValid } from "../util/validateJWT";

interface PrivateProps {
  children: JSX.Element;
}

const Private = ({ children }: PrivateProps) => {
  return isTokenValid() ? children : <Navigate to={"/login"} replace />;
};

export default Private;
