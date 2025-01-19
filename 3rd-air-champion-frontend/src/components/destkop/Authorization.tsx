import { useState } from "react";
import Login from "./LoginDesktop";
import Register from "./Register";

const Authorization = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Video */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        autoPlay
        loop
        muted
        controls={false} // Disable controls
        onContextMenu={(e) => e.preventDefault()} // Disable context menu
      >
        <source src="./BackgroundVid.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Mask Div */}
      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 z-10"></div>

      {/* Content */}
      <div className="relative z-20">
        {isLogin ? (
          <Login setIsLogin={setIsLogin} />
        ) : (
          <Register setIsLogin={setIsLogin} />
        )}
      </div>
    </div>
  );
};

export default Authorization;
