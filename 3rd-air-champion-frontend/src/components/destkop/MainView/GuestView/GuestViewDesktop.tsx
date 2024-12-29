import { bookingType } from "../../../../util/types/bookingType";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

interface GuestViewDesktopProps {
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  currentBookings: bookingType[];
}

const GuestViewDesktop = ({
  currentBookings,
  currentPage,
  setCurrentPage,
}: GuestViewDesktopProps) => {
  const onLeftClick = () => {
    if (currentPage !== 0) setCurrentPage(currentPage - 1);
  };

  const onRightClick = () => {
    if (currentPage !== currentBookings.length - 1)
      setCurrentPage(currentPage + 1);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 border-b">
        {/* Navigation */}
        <div className="flex justify-between p-2">
          <FaArrowLeft
            className="text-slate-600 hover:text-slate-700"
            cursor="pointer"
            onClick={onLeftClick}
          />
          <span>{currentBookings[currentPage].guest.name}</span>
          <FaArrowRight
            className="text-slate-600 hover:text-slate-700"
            cursor="pointer"
            onClick={onRightClick}
          />
        </div>
        <p>
          Notes:{" "}
          {currentBookings[currentPage].guest.notes !== ""
            ? currentBookings[currentPage].guest.notes
            : "N/A"}
        </p>
        <p>Number of Guests: {currentBookings[currentPage].numberOfGuests}</p>
      </div>
      <div className="flex-1 border-b">
        <p>Room: {currentBookings[currentPage].room.name}</p>
        <p>Duration (Days): {currentBookings[currentPage].duration}</p>
        <p>Start Date: {currentBookings[currentPage].startDate}</p>
        <p>End Date: {currentBookings[currentPage].endDate}</p>
        <p>Price: ${currentBookings[currentPage].room.price}</p>
      </div>
      <div className="flex-1 flex items-center justify-center h-full">
        {currentBookings[currentPage].description === "" ? (
          <button
            className="h-[40px] w-[76px] flex items-center justify-center bg-blue-500 rounded-lg shadow-md hover:bg-blue-600 transition-colors text-white font-semibold"
            onClick={() => {
              const phone = currentBookings[currentPage].guest.phone;
              window.location.href = `sms:${phone}`;
            }}
          >
            Message
          </button>
        ) : (
          <button
            className="h-[40px] w-auto flex items-center justify-center bg-green-500 rounded-lg shadow-md hover:bg-green-600 transition-colors text-white font-semibold p-2"
            onClick={() => {
              const url = currentBookings[currentPage].description.match(
                /https:\/\/www\.airbnb\.com\/hosting\/reservations\/details\/\S+/
              )?.[0]; // Safely access the matched URL
              if (url) {
                window.open(url, "_blank", "noopener,noreferrer");
              } else {
                alert("No valid URL found in the description.");
              }
            }}
          >
            Open Reservation
          </button>
        )}
      </div>
    </div>
  );
};

export default GuestViewDesktop;
