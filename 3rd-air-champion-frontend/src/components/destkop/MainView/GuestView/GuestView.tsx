import { format, parseISO } from "date-fns";
import { bookingType } from "../../../../util/types/bookingType";
import { roomType } from "../../../../util/types/roomType";

interface GuestViewProps {
  children: JSX.Element;
  currentBookings: bookingType[];
  rooms: roomType[];
}

const GuestView = ({ children, currentBookings, rooms }: GuestViewProps) => {
  const formatDate = (dateString: string) => {
    // Parse the input string into a Date object
    const date = parseISO(dateString);

    // Format the date as mm/dd/yy
    return format(date, "MM/dd/yy");
  };

  const remainingNumberOfRooms = rooms.length - currentBookings.length;

  return (
    <div className={`grid grid-rows-3 h-full px-2`}>
      {currentBookings.map((booking, index) => {
        return (
          <div
            key={index}
            className="row-span-1 h-full border-b border-solid flex w-full"
          >
            {/* Guest Info */}
            <div className="basis-4/5">
              <div className="h-full w-full grid grid-rows-3">
                {/* Name */}
                <p className="flex h-full items-center font-bold text-lg">
                  {booking.guest.name} ({booking.room.name})
                </p>

                {/* Room information */}
                <div className="flex flex-col h-full justify-center">
                  <p>Duration (Days): {booking.duration}</p>
                  <p>
                    {formatDate(booking.startDate)} -{" "}
                    {formatDate(booking.endDate)}
                  </p>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="basis-1/5">
              <div className="flex h-full items-center">
                {booking.description === "" ? (
                  <button
                    className="rounded-full shadow-md bg-black text-white font-semibold h-[76px] w-[76px] text-[0.8rem]"
                    onClick={() => {
                      const phone = booking.guest.phone;
                      window.location.href = `sms:${phone}`;
                    }}
                  >
                    Message
                  </button>
                ) : (
                  <button
                    className="rounded-full shadow-md bg-black text-white font-semibold h-[76px] w-[76px] text-[0.8rem]"
                    onClick={() => {
                      const url = booking.description.match(
                        /https:\/\/www\.airbnb\.com\/hosting\/reservations\/details\/\S+/
                      )?.[0]; // Safely access the matched URL
                      if (url) {
                        window.open(url, "_blank", "noopener,noreferrer");
                      } else {
                        alert("No valid URL found in the description.");
                      }
                    }}
                  >
                    Booking Details
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Remaining rooms to book */}
      {Array.from({ length: remainingNumberOfRooms }).map((_, index) => {
        return (
          <div
            key={index}
            className="flex items-center justify-center border-b border-solid h-full w-full"
          >
            {children}
          </div>
        );
      })}
    </div>
  );
};

export default GuestView;
