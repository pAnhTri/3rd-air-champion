import { useEffect, useState } from "react";

interface CalendarNavigatorProps {
  currentMonth: Date;
  mode: string;
  onSync: () => void;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSyncModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setMode: React.Dispatch<React.SetStateAction<string>>;
}

const CalendarNavigator = ({
  currentMonth,
  mode,
  onSync,
  setIsModalOpen,
  setIsSyncModalOpen,
  setMode,
}: CalendarNavigatorProps) => {
  const [isSyncEnabled, setIsSyncEnabled] = useState(false);

  // Check if saved data exists
  useEffect(() => {
    const savedData = localStorage.getItem("syncData");
    setIsSyncEnabled(!!savedData);
  }, []);

  const formattedDate = currentMonth.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  const handleModeChange = (newMode: string) => {
    if (mode === newMode) {
      // If clicking the same button, reset to null
      setMode("");
    } else {
      // Switch to the new mode
      setMode(newMode);
    }
  };

  return (
    <div className="flex flex-col justify-between h-full max-h-[80px] bg-white drop-shadow-sm p-2 sm:max-h-[120px]">
      {/* Top Section: Date, Book Button, and Action Buttons */}
      <div className="grid grid-cols-4 items-center p-2 gap-2 sm:gap-4">
        {/* Date */}
        <div className="text-xs font-semibold text-gray-700 sm:text-sm md:text-lg text-center">
          {formattedDate}
        </div>

        {/* Book Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white text-xs py-1 px-2 rounded-lg hover:bg-blue-600 shadow-md transition-all sm:text-sm sm:py-2 sm:px-4 md:text-base"
        >
          Book
        </button>

        {/* Room Sync Button */}
        <button
          onClick={() => setIsSyncModalOpen(true)}
          className="bg-blue-500 text-white text-xs py-1 px-2 rounded-lg hover:bg-blue-600 shadow-md transition-all sm:text-sm sm:py-2 sm:px-4 md:text-base"
        >
          Room Sync
        </button>

        <div className="flex justify-center gap-1 sm:gap-2 md:gap-4">
          <button
            className="bg-gray-200 text-black text-xs py-1 px-2 rounded-lg shadow-md hover:bg-green-100 sm:text-sm md:text-base sm:px-4 sm:py-2"
            disabled={!isSyncEnabled}
            onClick={onSync}
          >
            Sync
          </button>
        </div>

        {/* Block and Unblock Buttons */}
        {/* <div className="flex justify-center gap-1 sm:gap-2 md:gap-4"> */}
        {/* Block Button */}
        {/* <button
            className={`text-xs px-2 py-1 rounded-lg shadow-md font-semibold transition-all sm:text-sm md:text-base sm:px-4 sm:py-2 ${
              mode === "blocked"
                ? "bg-red-500 text-white"
                : "bg-gray-200 text-black hover:bg-red-100"
            }`}
            onClick={() => handleModeChange("blocked")}
          >
            Block
          </button> */}

        {/* Unblock Button */}
        {/* <button
            className={`text-xs px-2 py-1 rounded-lg shadow-md font-semibold transition-all sm:text-sm md:text-base sm:px-4 sm:py-2 ${
              mode === "unblocked"
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-black hover:bg-green-100"
            }`}
            onClick={() => handleModeChange("unblocked")}
          >
            Unblock
          </button> */}
        {/* </div> */}
      </div>

      {/* Bottom Section: Days of the Week */}
      <div className="grid grid-cols-7 gap-1 text-center sm:gap-2">
        {[
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ].map((day, index) => (
          <abbr
            key={index}
            title={day}
            className="text-xs font-medium sm:text-sm md:text-base"
          >
            {day.substring(0, 3)}
          </abbr>
        ))}
      </div>
    </div>
  );
};

export default CalendarNavigator;
