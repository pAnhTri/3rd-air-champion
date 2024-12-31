import { useContext } from "react";
import { isSyncModalOpenContext } from "../../../../App";

const RoomSyncButton = () => {
  const context = useContext(isSyncModalOpenContext) as {
    isSyncModalOpen: boolean;
    setIsSyncModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  };

  const { setIsSyncModalOpen } = context;

  return (
    <button
      onClick={() => setIsSyncModalOpen(true)}
      className="w-full px-2 py-1 text-white bg-blue-500 hover:bg-blue-600"
    >
      Link AirBnB
    </button>
  );
};

export default RoomSyncButton;
