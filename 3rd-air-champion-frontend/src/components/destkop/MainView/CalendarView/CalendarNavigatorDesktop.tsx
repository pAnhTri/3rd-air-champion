import { useState } from "react";

interface CalendarNavigatorProps {
  currentMonth: Date;
  occupancy: {
    totalOccupancy: number;
    roomOccupancy: {
      name: string;
      occupancy: number;
    }[];
  };
}

const CalendarNavigator = ({
  currentMonth,
  occupancy,
}: CalendarNavigatorProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const formattedDate = currentMonth.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="flex flex-col justify-between h-full max-h-[80px] bg-white drop-shadow-sm p-2 sm:max-h-[120px]">
      {/* Date */}
      <div className="flex h-full w-full justify-center items-center space-x-2">
        <span className="font-bold text-xl text-gray-800">{formattedDate}</span>
        {showDetails ? (
          <div
            onClick={() => setShowDetails(false)}
            className="flex cursor-pointer space-x-2"
          >
            {occupancy.roomOccupancy
              .filter((room) => room.name !== "Master") // Exclude "Master"
              .map((object, index) => {
                // Determine the color class based on occupancy
                const occupancyColor =
                  object.occupancy < 33.33
                    ? "text-green-500"
                    : object.occupancy < 66.67
                    ? "text-yellow-500"
                    : "text-red-500";

                return (
                  <div key={index} className="flex space-x-1 w-full">
                    <span className="font-medium">{object.name}: </span>
                    <span className={occupancyColor}>
                      {object.occupancy.toFixed(2)}%
                    </span>
                  </div>
                );
              })}
          </div>
        ) : (
          <span
            onClick={() => setShowDetails(true)}
            className="cursor-pointer underline"
          >
            <span
              className={
                occupancy.totalOccupancy < 33.33
                  ? "text-green-500"
                  : occupancy.totalOccupancy < 66.67
                  ? "text-yellow-500"
                  : "text-red-500"
              }
            >
              {occupancy.totalOccupancy.toFixed(2)}%
            </span>{" "}
            Full
          </span>
        )}
      </div>

      {/* Bottom Section: Days of the Week */}
      <div className="grid grid-cols-7 text-center">
        {[
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
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
