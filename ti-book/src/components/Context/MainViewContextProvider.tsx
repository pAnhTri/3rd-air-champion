import { useMainViewStates } from "@/utils/mainViewStates";
import React, { createContext, useContext } from "react";

interface MainViewContextProviderProps {
  children: React.ReactNode;
}

type MainViewContextStates = ReturnType<typeof useMainViewStates>;

const MainViewContext = createContext<MainViewContextStates | null>(null);

export const useMainViewContext = () => {
  const context = useContext(MainViewContext);
  if (!context) {
    throw new Error(
      "useMainViewContext must be used within a MainViewContextProvider"
    );
  }
  return context;
};

const MainViewContextProvider = ({
  children,
}: MainViewContextProviderProps) => {
  const states = useMainViewStates();

  return (
    <MainViewContext.Provider value={states}>
      {children}
    </MainViewContext.Provider>
  );
};

export default MainViewContextProvider;
