import { formatDate } from "../../../../util/formatDate";
import { bookingType } from "../../../../util/types/bookingType";
import { roomType } from "../../../../util/types/roomType";
import { FaMinus } from "react-icons/fa";
import { CiCalendar } from "react-icons/ci";
import Pricing from "./Pricing";
import React, { useState } from "react";

interface GuestViewProps {
  children: JSX.Element;
  currentBookings: bookingType[];
  rooms: roomType[];
  onPricingUpdate: (
    data: {
      guest: string;
      room: string;
      price: number;
    }[]
  ) => void;
  setIsMobileModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedBooking: React.Dispatch<React.SetStateAction<bookingType>>;
  setSelectedModifyBooking: React.Dispatch<React.SetStateAction<bookingType>>;
  setSelectedUnbooking: React.Dispatch<React.SetStateAction<bookingType>>;
}

const GuestView = ({
  children,
  currentBookings,
  rooms,
  onPricingUpdate,
  setIsMobileModalOpen,
  setSelectedBooking,
  setSelectedModifyBooking,
  setSelectedUnbooking,
}: GuestViewProps) => {
  const [isEditing, setIsEditing] = useState(false); // State to toggle edit mode

  return (
    <div className={`flex flex-col h-full px-2 overflow-y-scroll`}>
      {currentBookings.map((booking, index) => {
        return (
          <div key={index} className="h-full border-b border-solid flex w-full">
            {/* Guest Info */}
            <div className="basis-4/5">
              <div className="h-full w-full flex flex-col">
                {/* Name */}
                <div className="flex flex-col h-full border-b border-solid mb-1">
                  <div className="flex items-center">
                    <h1 className="basis-2/3 font-bold text-lg">
                      {booking.guest.alias ||
                        booking.alias ||
                        booking.guest.name}{" "}
                      ({booking.room.name})
                    </h1>

                    {/* Quick Change Button */}
                    <div className="flex gap-9">
                      {booking.guest.name !== "AirBnB" && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedModifyBooking(booking);
                            if (typeof setIsMobileModalOpen !== "undefined")
                              setIsMobileModalOpen(false);
                          }}
                          className="flex justify-center w-[24px] h-[24px] items-center rounded-full shadow-md bg-green-500 hover:bg-green-600 text-white font-semibold"
                        >
                          <CiCalendar size={14} />
                        </button>
                      )}
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
                  </div>
                  {/* Notes */}
                  <div
                    className="h-full cursor-pointer underline text-blue-500"
                    onClick={() => setSelectedBooking(booking)}
                  >
                    {booking.guest.notes || booking.notes || "Details..."}
                  </div>
                </div>

                {/* Room information */}
                <div className="flex flex-col h-full justify-center  border-b border-solid mb-2">
                  <p>
                    {booking.duration}{" "}
                    {booking.duration > 1 ? "nights" : "night"}
                  </p>
                  <p>
                    {formatDate(booking.startDate)} -{" "}
                    {formatDate(booking.endDate)}
                  </p>
                </div>

                <div className="flex flex-col h-full justify-center">
                  <p>
                    {booking.numberOfGuests}
                    {`${booking.numberOfGuests > 1 ? " Guests" : " Guest"}`}
                  </p>

                  {/* Room Pricing */}
                  {booking.guest.name !== "AirBnB" && (
                    <Pricing
                      booking={booking}
                      isEditing={isEditing}
                      onPricingUpdate={onPricingUpdate}
                      setIsEditing={setIsEditing}
                      rooms={rooms}
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
            {React.cloneElement(children, { room: room })}
          </div>
        ))}
    </div>
  );
};

export default GuestView;
