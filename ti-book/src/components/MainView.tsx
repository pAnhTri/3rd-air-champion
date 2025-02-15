import { useMediaQuery } from "@mui/material";
import SideBar from "./Calendar/SideBar";
import CalendarCanvas from "./Calendar/CalendarCanvas";
import { useEffect, useState } from "react";
import MainViewContextProvider from "./Context/MainViewContextProvider";

const MainView = () => {
  const [isClient, setIsClient] = useState<boolean>(false);
  const isDesktop = useMediaQuery("(min-width:600px)", { noSsr: true });

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <MainViewContextProvider>
      <div className="bg-white w-full h-[90%] flex">
        <CalendarCanvas />
        {isDesktop && isClient && <SideBar />}
      </div>
    </MainViewContextProvider>
  );
};

export default MainView;
