import { useEffect, useState } from "react";
import CalendarNavigator from "./CalendarView/CalendarNavigatorDesktop";
import CustomCalendar from "./CalendarView/CustomCalendarDesktop";
import { dayType } from "../../../util/types/dayType";
import { blockDay, fetchDays, unblockDay } from "../../../util/dayOperations";
import BookingModal from "../BookingModal/BookingModal";
import { bookingType } from "../../../util/types/bookingType";
import GuestViewDesktop from "./GuestView/GuestViewDesktop";
import { isSameDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { roomType } from "../../../util/types/roomType";
import { fetchRooms } from "../../../util/roomOperations";
import RoomLinkModal from "./CalendarView/RoomLinkModal";
import { guestType } from "../../../util/types/guestType";
import { fetchGuests } from "../../../util/guestOperations";
import { syncCalendars } from "../../../util/syncOperations";

interface MainViewProps {
  calendarId: string;
  hostId: string;
  airbnbsync: { room: string; link: string }[] | undefined;
}

const MainView = ({ calendarId, hostId, airbnbsync }: MainViewProps) => {
  const token = localStorage.getItem("token");
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [currentBookings, setCurrentBookings] = useState<
    bookingType[] | null
  >();
  const [days, setDays] = useState<dayType[]>([]);
  const [guests, setGuests] = useState<guestType[]>([]);
  const [rooms, setRooms] = useState<roomType[]>([]);

  const [currentPage, setCurrentPage] = useState(0);
  const [mode, setMode] = useState<string>(""); // 'blocked' or 'unblocked'

  const [isCalendarLoading, setIsCalendarLoading] = useState(true); // Track loading state
  const [calendarErrorMessage, setCalendarErrorMessage] = useState<string>(""); // Track errors

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  useEffect(() => {
    if (airbnbsync) {
      localStorage.setItem("syncData", JSON.stringify(airbnbsync));
    }
    fetchGuests(token as string)
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

    fetchRooms(token as string)
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

  const onBooking = (bookedDays: dayType[]) => {
    setDays([...days, ...bookedDays]);
  };

  const onBlock = (date: string) => {
    blockDay(calendarId, date, token as string)
      .then((result) => {
        setDays(
          days.map((day) => {
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const localDate = toZonedTime(day.date, timeZone);
            const resultDate = toZonedTime(result.date, timeZone);

            return isSameDay(resultDate, localDate)
              ? { ...day, isBlocked: true }
              : day;
          })
        );
      })
      .catch((err) => {
        console.error("Error blocking days:", err);
      });
  };

  const onUnblock = (date: string) => {
    unblockDay(calendarId, date, token as string)
      .then((result) => {
        setDays(
          days.map((day) => {
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const localDate = toZonedTime(day.date, timeZone);
            const resultDate = toZonedTime(result.date, timeZone);

            return isSameDay(resultDate, localDate)
              ? { ...day, isBlocked: false }
              : day;
          })
        );
      })
      .catch((err) => {
        console.error("Error unblocking days:", err);
      });
  };

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
        console.log(result);
        setIsCalendarLoading(true);
      })
      .catch((err) => console.error("Error syncing calendars:", err));
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
            <CalendarNavigator
              currentMonth={currentMonth}
              mode={mode}
              onSync={onSync}
              setIsModalOpen={setIsModalOpen}
              setIsSyncModalOpen={setIsSyncModalOpen}
              setMode={setMode}
            />
            {isSyncModalOpen && (
              <RoomLinkModal
                hostId={hostId}
                airbnbsync={airbnbsync}
                token={token as string}
                setIsSyncModalOpen={setIsSyncModalOpen}
                rooms={rooms}
              />
            )}
            <CustomCalendar
              currentMonth={currentMonth}
              mode={mode}
              onBlock={onBlock}
              onUnblock={onUnblock}
              rooms={rooms}
              setCurrentBookings={setCurrentBookings}
              setCurrentPage={setCurrentPage}
              setCurrentMonth={setCurrentMonth}
              days={days}
              setDays={setDays}
            />
            {isModalOpen && (
              <BookingModal
                calendarId={calendarId}
                guests={guests}
                setGuests={setGuests}
                onBooking={onBooking}
                setIsModalOpen={setIsModalOpen}
              />
            )}
          </>
        )}
      </div>
      <div className="hidden bg-white border-l sm:block">
        {currentBookings && currentBookings.length > 0 ? (
          <GuestViewDesktop
            currentBookings={currentBookings}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        ) : (
          <h1>Guest View</h1>
        )}
      </div>

      {/* Guest View for Small Screens */}
      {currentBookings && currentBookings.length > 0 && (
        <div
          className={`fixed bottom-0 left-0 w-full bg-white p-4 border-t border-gray-300 z-50 sm:hidden transition-transform duration-300 ${
            currentBookings ? "translate-y-0" : "translate-y-full"
          }`}
          style={{ height: "calc(100% - 15rem)" }} // Leaves a 4px margin at the top
        >
          {/* Close Button */}
          <button
            className=" text-gray-700 font-bold text-[1.5rem]"
            onClick={() => setCurrentBookings(null)} // Close the modal
          >
            &times;
          </button>

          <GuestViewDesktop
            currentBookings={currentBookings}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>
      )}
    </>
  );
};

export default MainView;
