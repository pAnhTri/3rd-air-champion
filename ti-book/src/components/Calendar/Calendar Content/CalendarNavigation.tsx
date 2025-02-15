import { useMainViewContext } from "@/components/Context/MainViewContextProvider";

const CalendarNavigation = () => {
  const { currentMonth, occupancy, rooms, setRoomFilter } =
    useMainViewContext();
  const formattedDate = currentMonth.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="flex flex-col justify-between drop-shadow-sm p-2 w-full h-full max-h-[15%] bg-white">
      {/* Top section: Information */}
      <div className="flex w-full h-full">
        <div className="flex flex-col w-full h-full">
          <div className="w-full flex items-center justify-center font-bold text-xl text-gray-800">
            {formattedDate}
          </div>
          <div className="flex h-full w-full justify-center items-center space-x-2 font-bold text-nowrap">
            <span
              className={`flex ${
                occupancy.totalOccupancy < 33.33
                  ? "text-green-500"
                  : occupancy.totalOccupancy < 66.67
                  ? "text-yellow-500"
                  : "text-red-500"
              }`}
            >
              {Math.round(occupancy.totalOccupancy)}% occupancy
            </span>
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex flex-col w-full h-full max-w-[25%] items-center justify-center space-y-2 text-[0.35rem]">
          <select
            className="p-1 border border-gray-400 rounded text-xs sm:text-sm"
            onChange={(event) => {
              setRoomFilter(
                event.target.value === "" ? null : event.target.value
              );
            }}
          >
            <option value="">Filter by room</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.name}>
                {room.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="p-1 rounded-lg bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-md hover:bg-blue-600 active:scale-95 transition"
          >
            Search Availabilty
          </button>
        </div>
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

export default CalendarNavigation;
