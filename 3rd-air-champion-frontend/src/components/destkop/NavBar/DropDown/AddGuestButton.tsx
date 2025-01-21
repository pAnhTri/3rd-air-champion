import { useContext } from "react";
import { AddPaneContext } from "../../../../App";

const AddGuestButton = () => {
  const context = useContext(AddPaneContext) as {
    setShowAddPane: React.Dispatch<
      React.SetStateAction<"guest" | "room" | null>
    >;
  };

  const { setShowAddPane } = context;

  return (
    <button
      className="py-1 px-2"
      onClick={() => {
        setShowAddPane("guest");
      }}
    >
      Add Guest
    </button>
  );
};

export default AddGuestButton;
