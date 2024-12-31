import { useState } from "react";
import { guestType } from "../../../util/types/guestType";
import { roomType } from "../../../util/types/roomType";
import { createGuest } from "../../../util/guestOperations";
import { createRoom } from "../../../util/roomOperations";
import GuestAddPane from "./GuestAddPane";
import GuestInput from "./GuestInput";
import RoomAddPane from "./RoomAddPane";
import { SubmitHandler, useForm } from "react-hook-form";
import { bookDaySchema, bookDaysZodObject } from "../../../util/zodBookDays";
import { zodResolver } from "@hookform/resolvers/zod";
import { postBooking } from "../../../util/bookingOperations";
import { dayType } from "../../../util/types/dayType";
import { format } from "date-fns";

interface BookingModalProps {
  calendarId: string;
  guests: guestType[];
  rooms: roomType[];
  selectedDate: Date;
  onBooking: (
    roomName: string,
    date: Date,
    duration: number,
    bookedDays: dayType[]
  ) => void;
  setGuests: React.Dispatch<React.SetStateAction<guestType[]>>;
  setRooms: React.Dispatch<React.SetStateAction<roomType[]>>;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const BookingModal = ({
  calendarId,
  guests,
  rooms,
  selectedDate,
  setGuests,
  setRooms,
  onBooking,
  setIsModalOpen,
}: BookingModalProps) => {
  const token = localStorage.getItem("token");
  const [showAddPane, setShowAddPane] = useState<"guest" | "room" | null>(null);

  const [bookingErrorMessage, setBookingErrorMessage] = useState("");
  const [guestErrorMessage, setGuestErrorMessage] = useState("");
  const [roomErrorMessage, setRoomErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<bookDaySchema>({
    resolver: zodResolver(bookDaysZodObject),
    defaultValues: { numberOfGuests: 1 },
  });

  const onAddGuest = (guestObject: { name: string; phone: string }) => {
    createGuest(guestObject, token as string)
      .then((result) => {
        setGuests([...guests, result]);
        setShowAddPane(null);
      })
      .catch((err) => {
        setGuestErrorMessage(err);
        console.error("Error creating guest:", err);
      });
  };

  const onAddRoom = (roomObject: { name: string; price: number }) => {
    createRoom(roomObject, token as string)
      .then((result) => {
        setRooms([...rooms, result]);
        setShowAddPane(null);
      })
      .catch((err) => {
        setRoomErrorMessage(err);
        console.error("Error creating room:", err);
      });
  };

  const onSubmit: SubmitHandler<bookDaySchema> = (data) => {
    const request = {
      ...data,
      date: data.date.toISOString(),
      calendar: calendarId,
    };

    postBooking(request, token as string)
      .then((result) => {
        onBooking(data.room, data.date, data.duration, result);
        setIsModalOpen(false); // On success close
      })
      .catch((err) => {
        setBookingErrorMessage(err);
        console.error("Error booking days:", err);
      });
  };

  return (
    <div
      className="fixed inset-0 bg-gray-800 bg-opacity-50 flex sm:items-center justify-center z-50"
      onClick={() => setIsModalOpen(false)} // Close modal on background click
    >
      <div
        className="bg-white rounded-lg shadow-lg p-4 sm:w-1/3"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <h2 className="text-lg font-bold mb-4">Book a Room</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Guest Selection */}

          <GuestInput
            guests={guests}
            showAddPane={showAddPane}
            setShowAddPane={setShowAddPane}
            setValue={setValue}
          />
          {errors.guest && (
            <span className="text-red-500">{errors.guest.message}</span>
          )}

          {/* Is AirBnB*/}
          <div className="flex gap-2">
            <label htmlFor="isAirBnB" className="block text-sm font-medium">
              Is AirBnB
            </label>
            <input
              id="isAirBnB"
              type="checkbox"
              className="border border-gray-300 rounded px-2 py-1"
              {...register("isAirBnB")}
            />
          </div>
          {errors.isAirBnB && (
            <p className="text-red-500">{errors.isAirBnB.message}</p>
          )}

          {/* Number of Guests */}
          <div>
            <label
              htmlFor="numberOfGuests"
              className="block text-sm font-medium"
            >
              Number of Guests
            </label>
            <input
              id="numberOfGuests"
              type="number"
              step={1}
              min={1}
              className="border border-gray-300 rounded px-2 py-1 w-full"
              {...register("numberOfGuests", { valueAsNumber: true })}
            />
            {errors.numberOfGuests && (
              <span className="text-red-500 text-sm">
                {errors.numberOfGuests.message}
              </span>
            )}
          </div>

          {/* Room Selection */}
          <div>
            <label htmlFor="room" className="block text-sm font-medium">
              Room
            </label>
            <div className="flex gap-2 items-center">
              <select
                id="room"
                className="border border-gray-300 rounded px-2 py-1 w-full"
                {...register("room")}
              >
                <option value="">Select a room</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                onClick={() => setShowAddPane("room")}
              >
                Add Room
              </button>
            </div>
            {errors.room && (
              <span className="text-red-500 text-sm">
                {errors.room.message}
              </span>
            )}
          </div>

          {/* Start Date */}
          <div>
            <label htmlFor="bookingDate" className="block text-sm font-medium">
              Booking Date
            </label>
            <input
              id="bookingDate"
              type="date"
              className="border border-gray-300 rounded px-2 py-1 w-full"
              defaultValue={selectedDate && format(selectedDate, "yyyy-MM-dd")}
              {...register("date", { valueAsDate: true })}
            />
            {errors.date && (
              <span className="text-red-500 text-sm">
                {errors.date.message}
              </span>
            )}
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="duration" className="block text-sm font-medium">
              Duration (Days)
            </label>
            <input
              id="duration"
              type="number"
              step={1}
              min={1}
              className="border border-gray-300 rounded px-2 py-1 w-full"
              {...register("duration", { valueAsNumber: true })}
            />
            {errors.duration && (
              <span className="text-red-500 text-sm">
                {errors.duration.message}
              </span>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </button>
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Book
            </button>
          </div>
          {bookingErrorMessage && (
            <span className="text-red-500">{bookingErrorMessage}</span>
          )}
        </form>
      </div>

      {showAddPane && (
        <>
          {/* GuestAddPane for Small Screens */}
          {showAddPane === "guest" && (
            <div
              className="fixed bottom-0 left-0 w-full bg-gray-100 p-4 border-t border-gray-300 z-[60] sm:hidden"
              onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
            >
              <GuestAddPane
                guestErrorMessage={guestErrorMessage}
                onAddGuest={onAddGuest}
              />
            </div>
          )}

          {/* GuestAddPane for Larger Screens */}
          {showAddPane === "guest" && (
            <div
              className="hidden sm:block w-1/3 bg-gray-100 p-4 border-l border-gray-300"
              onClick={(e) => e.stopPropagation()}
            >
              <GuestAddPane
                guestErrorMessage={guestErrorMessage}
                onAddGuest={onAddGuest}
              />
            </div>
          )}

          {/* RoomAddPane for Small Screens */}
          {showAddPane === "room" && (
            <div
              className="fixed bottom-0 left-0 w-full bg-gray-100 p-4 border-t border-gray-300 z-[60] sm:hidden"
              onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
            >
              <RoomAddPane
                roomErrorMessage={roomErrorMessage}
                onAddRoom={onAddRoom}
              />
            </div>
          )}

          {/* RoomAddPane for Larger Screens */}
          {showAddPane === "room" && (
            <div
              className="hidden sm:block w-1/3 bg-gray-100 p-4 border-l border-gray-300"
              onClick={(e) => e.stopPropagation()}
            >
              <RoomAddPane
                roomErrorMessage={roomErrorMessage}
                onAddRoom={onAddRoom}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BookingModal;
