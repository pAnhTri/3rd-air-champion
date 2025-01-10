import { useState } from "react";

interface CalendarNavigatorProps {
  currentMonth: Date;
  occupancy: {
    totalOccupancy: number;
    airbnbOccupancy: number;
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
      </div>
      {showDetails ? (
        <div
          onClick={() => setShowDetails(false)}
          className="flex h-full w-full justify-center items-center cursor-pointer space-x-2"
        >
          {occupancy.roomOccupancy
            .filter((room) => room.name !== "Master") // Exclude "Master"
            .map((object, index) => {
              // Determine the color class based on occupancy
              const occupancyColor =
                object.occupancy < 33.33
                  ? "text-red-500"
                  : object.occupancy < 66.67
                  ? "text-yellow-500"
                  : "text-green-500";

              return (
                <div key={index} className="space-x-1">
                  <span className="font-medium">{object.name}: </span>
                  <span className={occupancyColor}>
                    {Math.round(object.occupancy)}%
                  </span>
                </div>
              );
            })}
        </div>
      ) : (
        <div
          className="flex h-full w-full justify-center items-center cursor-pointer space-x-2"
          onClick={() => setShowDetails(true)}
        >
          <span
            className={`cursor-pointer flex underline ${
              occupancy.totalOccupancy < 33.33
                ? "text-red-500"
                : occupancy.totalOccupancy < 66.67
                ? "text-yellow-500"
                : "text-green-500"
            }`}
          >
            {Math.round(occupancy.totalOccupancy)}% occupancy
          </span>
          <span
            className={`underline ${
              occupancy.airbnbOccupancy < 33.33
                ? "text-red-500"
                : occupancy.airbnbOccupancy < 66.67
                ? "text-yellow-500"
                : "text-green-500"
            }`}
          >
            {Math.round(occupancy.airbnbOccupancy)}% (A)booking
          </span>
        </div>
      )}

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
