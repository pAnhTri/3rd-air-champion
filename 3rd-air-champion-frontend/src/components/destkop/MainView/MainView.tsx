import { useContext, useEffect, useState } from "react";
import CalendarNavigator from "./CalendarView/CalendarNavigatorDesktop";
import CustomCalendar from "./CalendarView/CustomCalendarDesktop";
import { dayType } from "../../../util/types/dayType";
import { fetchDays } from "../../../util/dayOperations";
import BookingModal from "../BookingModal/BookingModal";
import { bookingType } from "../../../util/types/bookingType";
import { addDays, isWithinInterval, startOfToday } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { roomType } from "../../../util/types/roomType";
import { fetchRooms } from "../../../util/roomOperations";
import RoomLinkModal from "./CalendarView/RoomLinkModal";
import { guestType } from "../../../util/types/guestType";
import { fetchGuests } from "../../../util/guestOperations";
import { syncCalendars } from "../../../util/syncOperations";
import GuestView from "./GuestView/GuestView";
import BookButton from "../BookButton";
import { isSyncModalOpenContext } from "../../../App";
import DetailsModal from "./GuestView/DetailsModal";
import { updateBookingGuest } from "../../../util/bookingOperations";

interface MainViewProps {
  calendarId: string;
  hostId: string;
  airbnbsync: { room: string; link: string }[] | undefined;
}

const MainView = ({ calendarId, hostId, airbnbsync }: MainViewProps) => {
  const token = localStorage.getItem("token");

  const context = useContext(isSyncModalOpenContext) as {
    isSyncModalOpen: boolean;
    setIsSyncModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    shouldCallOnSync: boolean;
    setShouldCallOnSync: React.Dispatch<React.SetStateAction<boolean>>;
  };

  const { isSyncModalOpen, shouldCallOnSync, setShouldCallOnSync } = context;

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [currentBookings, setCurrentBookings] = useState<
    bookingType[] | null
  >();
  const [days, setDays] = useState<dayType[]>([]);
  const [guests, setGuests] = useState<guestType[]>([]);
  const [rooms, setRooms] = useState<roomType[]>([]);

  const [isCalendarLoading, setIsCalendarLoading] = useState(true); // Track loading state
  const [calendarErrorMessage, setCalendarErrorMessage] = useState<string>(""); // Track errors

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  const [blockedAirBnBDates, setIsBlockedAirBnBDates] = useState<{
    room: { duration: number; start: string }[];
  }>();

  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [selectedBooking, setSelectedBooking] = useState<bookingType | null>(
    null
  );

  const onSync = () => {
    alert("Synchronizing with Airbnb");
    const savedData = localStorage.getItem("syncData");
    const requestBody: {
      calendar?: string;
      guest?: string;
      data?: { room: string; link: string }[];
    } = {};
    if (savedData) {
      const airbnbGuest = guests.find((guest) => guest.name === "AirBnB");
      requestBody.calendar = calendarId;
      requestBody.data = JSON.parse(savedData);
      requestBody.guest = airbnbGuest?.id;
    }

    syncCalendars(
      requestBody as {
        calendar: string;
        guest: string;
        data: { room: string; link: string }[];
      },
      token as string
    )
      .then((result) => {
        setIsBlockedAirBnBDates(result.blocked);
        setIsCalendarLoading(true);
      })
      .catch((err) => console.error("Error syncing calendars:", err));
  };

  useEffect(() => {
    if (airbnbsync) {
      localStorage.setItem("syncData", JSON.stringify(airbnbsync));
    }
  }, []);

  useEffect(() => {
    fetchGuests(hostId, token as string)
      .then((result) => {
        setGuests(result);
      })
      .catch((err) => {
        console.error("Error fetching guests:", err);
      });

    fetchDays(calendarId, token as string)
      .then((result) => {
        setDays(result);
      })
      .catch((err) => {
        console.error("Error fetching days:", err);
        setCalendarErrorMessage("Failed to fetch days. Please try again.");
      });

    fetchRooms(hostId, token as string)
      .then((result) => {
        setRooms(result);
        setIsCalendarLoading(false); // Data fetched, stop loading
      })
      .catch((err) => {
        console.error("Error fetching rooms:", err);
        setCalendarErrorMessage("Failed to fetch rooms. Please try again.");
        setIsCalendarLoading(false);
      });
  }, [isCalendarLoading]);

  useEffect(() => {
    if (shouldCallOnSync) {
      onSync();
      setShouldCallOnSync(false);
    }
  }, [shouldCallOnSync]);

  const onBooking = (
    roomName: string,
    date: Date,
    duration: number,
    bookedDays: dayType[]
  ) => {
    // Ensure the roomName exists in blockedAirBnBDates and calculate the date ranges
    if (blockedAirBnBDates && roomName in blockedAirBnBDates) {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Map over the blocked dates and calculate start and end dates
      const dateRanges = blockedAirBnBDates[
        roomName as keyof typeof blockedAirBnBDates
      ].map((dateRange: { start: string; duration: number }) => {
        const start = toZonedTime(dateRange.start, timeZone); // Parse start date
        const end = addDays(start, dateRange.duration - 1); // Calculate end date
        return { start, end };
      });

      // Calculate the end date for the booking
      const bookingStart = toZonedTime(
        date.toISOString().split("T")[0],
        timeZone
      );
      const bookingEnd = addDays(bookingStart, duration - 1);

      // Check if the booking date range overlaps with any blocked date ranges
      const isBlocked = dateRanges.some(({ start, end }) => {
        if (
          isWithinInterval(bookingEnd, { start, end }) ||
          isWithinInterval(bookingStart, { start, end })
        ) {
          console.log(
            `${bookingStart.toISOString().split("T")[0]} to ${
              bookingEnd.toISOString().split("T")[0]
            } is within ${start.toISOString().split("T")[0]} to ${
              end.toISOString().split("T")[0]
            }`
          );
          return true;
        }
      });

      if (isBlocked) console.log("Dates are blocked on AirBnB Calendar");

      const room = rooms.find((room) => room.id === roomName);
      if (!isBlocked) {
        alert(
          `Please block ${date.toISOString().split("T")[0]} to ${
            bookingEnd.toISOString().split("T")[0]
          } for Room: ${room?.name}`
        );
      }
    }

    setDays([...days, ...bookedDays]);
  };

  const onUpdateGuest = (data: {
    id: string;
    alias: string;
    numberOfGuests: number;
    notes?: string;
  }) => {
    updateBookingGuest(data, token as string)
      .then((result) => {
        console.log(result);
        setIsCalendarLoading(true);
      })
      .catch((err) => {
        console.error("Error updating booked guest:", err);
      });
  };

  return (
    <>
      <div className="col-span-5 bg-gray-100 overflow-hidden sm:col-span-4">
        {isCalendarLoading ? (
          <div className="flex items-center justify-center h-full">
            Loading...
          </div>
        ) : calendarErrorMessage ? (
          <div className="flex items-center justify-center h-full text-red-500">
            {calendarErrorMessage}
          </div>
        ) : (
          <>
            <CalendarNavigator currentMonth={currentMonth} />
            {isSyncModalOpen && (
              <RoomLinkModal
                hostId={hostId}
                airbnbsync={airbnbsync}
                token={token as string}
                rooms={rooms}
              />
            )}
            <CustomCalendar
              currentMonth={currentMonth}
              rooms={rooms}
              setCurrentBookings={setCurrentBookings}
              setCurrentMonth={setCurrentMonth}
              setIsMobileModalOpen={setIsMobileModalOpen}
              setSelectedDate={setSelectedDate}
              days={days}
              setDays={setDays}
            />
            {isModalOpen && (
              <BookingModal
                calendarId={calendarId}
                guests={guests}
                setGuests={setGuests}
                rooms={rooms}
                selectedDate={selectedDate}
                setRooms={setRooms}
                onBooking={onBooking}
                setIsModalOpen={setIsModalOpen}
              />
            )}
          </>
        )}
      </div>

      <div className="hidden bg-white border-l sm:block">
        {currentBookings && currentBookings.length > 0 ? (
          <GuestView
            currentBookings={currentBookings}
            rooms={rooms}
            setSelectedBooking={
              setSelectedBooking as React.Dispatch<
                React.SetStateAction<bookingType>
              >
            }
          >
            <BookButton setIsModalOpen={setIsModalOpen} />
          </GuestView>
        ) : (
          <div className="flex items-center justify-center h-full w-full">
            <BookButton setIsModalOpen={setIsModalOpen} />
          </div>
        )}
      </div>

      {/* Guest View for Small Screens */}
      <div
        className={`fixed bottom-0 left-0 w-full bg-white p-1 border-t border-gray-300 z-50 overflow-y-scroll sm:hidden transition-transform duration-300 ${
          isMobileModalOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ height: "calc(100% - 15rem)" }} // Leaves a 4px margin at the top
      >
        {/* Close Button */}
        <button
          className="text-gray-700 font-bold text-[1.5rem]"
          onClick={() => {
            setCurrentBookings(null);
            setIsMobileModalOpen(false);
          }} // Close the modal
        >
          &times;
        </button>

        {currentBookings && currentBookings.length > 0 ? (
          <GuestView
            currentBookings={currentBookings}
            rooms={rooms}
            setSelectedBooking={
              setSelectedBooking as React.Dispatch<
                React.SetStateAction<bookingType>
              >
            }
          >
            <BookButton
              setIsModalOpen={setIsModalOpen}
              setIsMobileModalOpen={setIsMobileModalOpen}
            />
          </GuestView>
        ) : (
          <div className="flex w-full h-full justify-center items-center">
            <BookButton
              setIsModalOpen={setIsModalOpen}
              setIsMobileModalOpen={setIsMobileModalOpen}
            />
          </div>
        )}
      </div>
      {selectedBooking && (
        <DetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdateGuests={onUpdateGuest}
        />
      )}
    </>
  );
};

export default MainView;
