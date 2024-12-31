import { useContext, useEffect, useState } from "react";
import { isSyncModalOpenContext } from "../../../../App";
import { FaSync } from "react-icons/fa";

const AirBnBSyncButton = () => {
  const context = useContext(isSyncModalOpenContext) as {
    setShouldCallOnSync: React.Dispatch<React.SetStateAction<boolean>>;
  };

  const { setShouldCallOnSync } = context;

  const [isSyncEnabled, setIsSyncEnabled] = useState(false);

  // Check if saved data exists
  useEffect(() => {
    const savedData = localStorage.getItem("syncData");
    setIsSyncEnabled(!!savedData);
  }, []);

  return (
    <button
      className="w-full disabled:bg-gray-200 disabled:hover:bg-gray-300 py-1 px-2"
      disabled={!isSyncEnabled}
      onClick={() => {
        setShouldCallOnSync(true);
      }}
    >
      <div className="flex w-full items-center justify-center space-x-2">
        <FaSync />
        <span>Sync</span>
      </div>
    </button>
  );
};

export default AirBnBSyncButton;
