import { useContext, useEffect, useState } from "react";
import { isSyncModalOpenContext } from "../../../../App";

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
      className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-200 disabled:hover:bg-gray-300 text-white py-1 px-2"
      disabled={!isSyncEnabled}
      onClick={() => {
        setShouldCallOnSync(true);
      }}
    >
      Sync
    </button>
  );
};

export default AirBnBSyncButton;
