import { formatDate } from "../../../../util/formatDate";
import { bookingType } from "../../../../util/types/bookingType";
import { roomType } from "../../../../util/types/roomType";
import { FaMinus } from "react-icons/fa";
import Pricing from "./Pricing";

interface GuestViewProps {
  children: JSX.Element;
  currentBookings: bookingType[];
  editingRoomIndex: number | null;
  rooms: roomType[];
  onPricingUpdate: (data: {
    guest: string;
    room: string;
    price: number;
  }) => void;
  setEditingRoomIndex: React.Dispatch<React.SetStateAction<number | null>>;
  setSelectedBooking: React.Dispatch<React.SetStateAction<bookingType>>;
  setSelectedUnbooking: React.Dispatch<React.SetStateAction<bookingType>>;
}

const GuestView = ({
  children,
  currentBookings,
  editingRoomIndex,
  rooms,
  onPricingUpdate,
  setEditingRoomIndex,
  setSelectedBooking,
  setSelectedUnbooking,
}: GuestViewProps) => {
  return (
    <div className={`flex flex-col h-full px-2 overflow-y-scroll`}>
      {currentBookings.map((booking, index) => {
        return (
          <div key={index} className="h-full border-b border-solid flex w-full">
            {/* Guest Info */}
            <div className="basis-4/5">
              <div className="h-full w-full flex flex-col">
                {/* Name */}
                <div className="flex flex-col h-full">
                  <div className="flex items-center">
                    <h1 className="basis-2/3 font-bold text-lg">
                      {booking.alias || booking.guest.name} ({booking.room.name}
                      )
                    </h1>
                    {booking.guest.name !== "AirBnB" && (
                      <button
                        type="button"
                        onClick={() => setSelectedUnbooking(booking)}
                        className="flex justify-center w-[24px] h-[24px] items-center rounded-full shadow-md bg-red-500 hover:bg-red-600 text-white font-semibold"
                      >
                        <FaMinus size={14} />
                      </button>
                    )}
                  </div>
                  {/* Notes */}
                  <div
                    className="h-full cursor-pointer underline text-blue-500"
                    onClick={() => setSelectedBooking(booking)}
                  >
                    {booking.notes || "Details..."}
                  </div>
                </div>

                {/* Room information */}
                <div className="flex flex-col h-full justify-center">
                  <p>Duration (Days): {booking.duration}</p>
                  <p>
                    {formatDate(booking.startDate)} -{" "}
                    {formatDate(booking.endDate)}
                  </p>
                </div>

                {/* Room information */}
                <div className="flex flex-col h-full justify-center">
                  <p>
                    {booking.numberOfGuests}
                    {`${booking.numberOfGuests > 1 ? " Guests" : " Guest"}`}
                  </p>

                  {/* Room Pricing */}
                  {booking.guest.name !== "AirBnB" && (
                    <Pricing
                      booking={booking}
                      editingRoomIndex={editingRoomIndex}
                      onPricingUpdate={onPricingUpdate}
                      rooms={rooms}
                      setEditingRoomIndex={setEditingRoomIndex}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="basis-1/5">
              <div className="flex flex-col h-full justify-center space-y-2">
                {booking.description === "" ? (
                  <button
                    className="rounded-full shadow-md bg-black text-white font-semibold h-[64px] w-[64px] text-[0.6rem]"
                    onClick={() => {
                      const phone = booking.guest.phone;
                      window.location.href = `sms:${phone}`;
                    }}
                  >
                    Message
                  </button>
                ) : (
                  <button
                    className="rounded-full shadow-md bg-black text-white font-semibold h-[64px] w-[64px] text-[0.6rem]"
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
      {rooms
        .filter((room) =>
          currentBookings.every((booking) => room.name !== booking.room.name)
        )
        .map((room, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center border-b border-solid h-full w-full space-y-2"
          >
            <p>{room.name}</p>
            {children}
          </div>
        ))}
    </div>
  );
};

export default GuestView;
