import { useContext, useEffect, useState } from "react";
import CalendarNavigator from "./CalendarView/CalendarNavigatorDesktop";
import CustomCalendar from "./CalendarView/CustomCalendarDesktop";
import { dayType } from "../../../util/types/dayType";
import { fetchDays } from "../../../util/dayOperations";
import BookingModal from "../BookingModal/BookingModal";
import { bookingType } from "../../../util/types/bookingType";
import {
  addDays,
  getDaysInMonth,
  isWithinInterval,
  startOfToday,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { roomType } from "../../../util/types/roomType";
import { fetchRooms } from "../../../util/roomOperations";
import RoomLinkModal from "./CalendarView/RoomLinkModal";
import { guestType } from "../../../util/types/guestType";
import { fetchGuests, updateGuestPricing } from "../../../util/guestOperations";
import { syncCalendars } from "../../../util/syncOperations";
import GuestView from "./GuestView/GuestView";
import BookButton from "../BookButton";
import { isSyncModalOpenContext } from "../../../App";
import DetailsModal from "./GuestView/DetailsModal";
import {
  updateBookingGuest,
  updateUnbookGuest,
} from "../../../util/bookingOperations";
import UnbookingConfirmation from "./GuestView/UnbookingConfirmation";

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
  const [initialSync, setIsInitialSync] = useState(true);

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [currentBookings, setCurrentBookings] = useState<
    bookingType[] | null
  >();
  const [days, setDays] = useState<dayType[]>([]);
  const [guests, setGuests] = useState<guestType[]>([]);
  const [rooms, setRooms] = useState<roomType[]>([]);

  const [isCalendarLoading, setIsCalendarLoading] = useState(true); // Track loading state
  const [calendarErrorMessage, setCalendarErrorMessage] = useState<string>(""); // Track errors

  const [monthMap, setMonthMap] = useState<Map<string, dayType>>(new Map());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  const [blockedAirBnBDates, setIsBlockedAirBnBDates] = useState<{
    room: { duration: number; start: string }[];
  }>();

  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [selectedBooking, setSelectedBooking] = useState<bookingType | null>(
    null
  );
  const [selectedUnbooking, setSelectedUnbooking] =
    useState<bookingType | null>(null);

  const [occupancy, setOccupancy] = useState<{
    totalOccupancy: number;
    roomOccupancy: { name: string; occupancy: number }[];
  }>({ totalOccupancy: 0, roomOccupancy: [] });

  const onSync = () => {
    if (shouldCallOnSync) alert("Synchronizing with Airbnb");
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
        if (shouldCallOnSync) setIsCalendarLoading(true);
      })
      .catch((err) => console.error("Error syncing calendars:", err));
  };

  useEffect(() => {
    if (airbnbsync) {
      localStorage.setItem("syncData", JSON.stringify(airbnbsync));
    }

    fetchGuests(hostId, token as string)
      .then((result) => {
        setGuests(result);
      })
      .catch((err) => {
        console.error("Error fetching guests:", err);
      });
  }, []);

  useEffect(() => {
    if (initialSync && guests.length > 0) {
      onSync();
      setIsInitialSync(false);
    }
  }, [guests, initialSync]);

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
    const map = new Map<string, dayType>();
    days.forEach((day) => {
      const formattedDate = new Date(day.date).toISOString().split("T")[0];
      map.set(formattedDate, day);
    });
    setMonthMap(map);
  }, [days]);

  useEffect(() => {
    if (days && currentMonth) {
      const targetMonth = currentMonth.getMonth(); // Current month (0-based index)
      const targetYear = currentMonth.getFullYear(); // Current year

      // Get unique days in the current month
      const occupiedDays = days.filter((day) => {
        const processedDate = new Date(day.date);
        return (
          processedDate.getFullYear() === targetYear &&
          processedDate.getMonth() === targetMonth
        );
      });

      // Initialize a map to group Sets by room.id
      const roomSets = new Map();

      // Iterate over each room in the state
      rooms.forEach((room) => {
        const roomId = room.id;

        // Filter the dayType objects by the room.id in their bookings
        const roomSpecificSet = new Set(
          occupiedDays.filter((day) =>
            day.bookings.some((booking) => booking.room.id === roomId)
          )
        );

        // Add the Set to the Map
        roomSets.set(room.name, roomSpecificSet);
      });

      // Total number of days in the current month
      const daysInMonth = getDaysInMonth(currentMonth);

      // Initialize total occupancy and room-wise occupancy
      let totalOccupiedDays = 0;
      const roomOccupancy = [];

      for (const [roomName, roomSet] of roomSets.entries()) {
        const occupancyPercentage = (roomSet.size / daysInMonth) * 100;
        roomOccupancy.push({ name: roomName, occupancy: occupancyPercentage });

        // Exclude "Master" room from total occupancy calculation
        if (roomName !== "Master") {
          totalOccupiedDays += roomSet.size;
        }
      }

      // Calculate total occupancy percentage (excluding "Master")
      const totalRooms = rooms.filter((room) => room.name !== "Master").length;
      const totalOccupancy =
        (totalOccupiedDays / (totalRooms * daysInMonth)) * 100;

      // Update state
      setOccupancy({
        totalOccupancy: totalOccupancy,
        roomOccupancy: roomOccupancy,
      });
    }
  }, [days, currentMonth]);

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
        setCurrentBookings(null);
        setIsMobileModalOpen(false);
        setIsCalendarLoading(true);
      })
      .catch((err) => {
        console.error("Error updating booked guest:", err);
      });
  };

  const onUnbook = (id: string) => {
    setSelectedUnbooking(null);
    updateUnbookGuest(id, token as string)
      .then((result) => {
        console.log(result);
        setCurrentBookings(null);
        setIsMobileModalOpen(false);
        setIsCalendarLoading(true);
      })
      .catch((err) => {
        console.error("Error unbooking guest:", err);
      });
  };

  const onPricingUpdate = (
    data: {
      guest: string;
      room: string;
      price: number;
    }[]
  ) => {
    Promise.all(
      data.map((priceUpdate) =>
        updateGuestPricing(priceUpdate, token as string)
      )
    )
      .then((results) => {
        console.log("All updates completed:", results);
        setCurrentBookings(null);
        setIsMobileModalOpen(false);
        setIsCalendarLoading(true);
      })
      .catch((err) => {
        console.error("Error updating guest pricing:", err);
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
            <CalendarNavigator
              occupancy={occupancy}
              currentMonth={currentMonth}
            />
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
              monthMap={monthMap}
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
            onPricingUpdate={onPricingUpdate}
            setSelectedBooking={
              setSelectedBooking as React.Dispatch<
                React.SetStateAction<bookingType>
              >
            }
            setSelectedUnbooking={
              setSelectedUnbooking as React.Dispatch<
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
            onPricingUpdate={onPricingUpdate}
            setSelectedBooking={
              setSelectedBooking as React.Dispatch<
                React.SetStateAction<bookingType>
              >
            }
            setSelectedUnbooking={
              setSelectedUnbooking as React.Dispatch<
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
      {selectedUnbooking && (
        <UnbookingConfirmation
          booking={selectedUnbooking}
          onClose={() => setSelectedUnbooking(null)}
          onUnbook={onUnbook}
        />
      )}
    </>
  );
};

export default MainView;
