import { useState } from "react";
import Login from "./LoginDesktop";
import Register from "./Register";

const Authorization = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div>
      {isLogin ? (
        <Login setIsLogin={setIsLogin} />
      ) : (
        <Register setIsLogin={setIsLogin} />
      )}
    </div>
  );
};

export default Authorization;
