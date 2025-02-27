import { useContext, useEffect, useState } from "react";
import CalendarNavigator from "./CalendarView/CalendarNavigatorDesktop";
import CustomCalendar from "./CalendarView/CustomCalendarDesktop";
import { dayType } from "../../../util/types/dayType";
import { fetchDays } from "../../../util/dayOperations";
import BookingModal from "../BookingModal/BookingModal";
import { bookingType } from "../../../util/types/bookingType";
import {
  addDays,
  compareAsc,
  format,
  getDaysInMonth,
  isAfter,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  startOfToday,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { roomType } from "../../../util/types/roomType";
import { createRoom, fetchRooms } from "../../../util/roomOperations";
import RoomLinkModal from "./CalendarView/RoomLinkModal";
import { guestType } from "../../../util/types/guestType";
import {
  createGuest,
  fetchGuests,
  updateGuestPricing,
} from "../../../util/guestOperations";
import { syncCalendars } from "../../../util/syncOperations";
import GuestView from "./GuestView/GuestView";
import BookButton from "../BookButton";
import { AddPaneContext, isSyncModalOpenContext } from "../../../App";
import DetailsModal from "./GuestView/DetailsModal";
import {
  updateBookingGuest,
  updateUnbookGuest,
} from "../../../util/bookingOperations";
import UnbookingConfirmation from "./GuestView/UnbookingConfirmation";
import ToDoList from "./ToDoList";
import ModifyBookingModal from "../ModifyBookingModal";
import GuestAddPane from "../BookingModal/GuestAddPane";
import RoomAddPane from "../BookingModal/RoomAddPane";

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

  const addPaneContext = useContext(AddPaneContext) as {
    showAddPane: "guest" | "room" | null;
    setShowAddPane: React.Dispatch<
      React.SetStateAction<"guest" | "room" | null>
    >;
    guestErrorMessage: string;
    setGuestErrorMessage: React.Dispatch<React.SetStateAction<string>>;
    roomErrorMessage: string;
    setRoomErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  };

  const { isSyncModalOpen, shouldCallOnSync, setShouldCallOnSync } = context;
  const {
    showAddPane,
    setShowAddPane,
    guestErrorMessage,
    setGuestErrorMessage,
    roomErrorMessage,
    setRoomErrorMessage,
  } = addPaneContext;
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
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(true);

  const [blockedAirBnBDates, setIsBlockedAirBnBDates] = useState<{
    room: { duration: number; start: string }[];
  }>();

  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [selectedRoom, setSelectedRoom] = useState<roomType>();
  const [selectedBooking, setSelectedBooking] = useState<bookingType | null>(
    null
  );
  const [selectedUnbooking, setSelectedUnbooking] =
    useState<bookingType | null>(null);
  const [selectedModifyBooking, setSelectedModifyBooking] =
    useState<bookingType | null>(null);

  const [occupancy, setOccupancy] = useState<{
    totalOccupancy: number;
    airbnbOccupancy: number;
    roomOccupancy: { name: string; occupancy: number }[];
  }>({ totalOccupancy: 0, airbnbOccupancy: 0, roomOccupancy: [] });

  const [airBnBPrices, setAirBnBPrices] = useState<Map<string, number>>();
  const [profit, setProfit] = useState<{ total: number; airbnb: number }>({
    total: 0,
    airbnb: 0,
  });
  const [currentGuest, setCurrentGuest] = useState<string | null>(null);

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

    const storedPrices = localStorage.getItem("airBnBPrices");
    if (storedPrices) {
      setAirBnBPrices(new Map<string, number>(JSON.parse(storedPrices)));
    }
  }, []);

  useEffect(() => {
    if (initialSync && guests.length > 0) {
      onSync();
      setIsInitialSync(false);
    }
  }, [guests, initialSync]);

  useEffect(() => {
    if (isCalendarLoading) {
      fetchGuests(hostId, token as string)
        .then((guests) => {
          setGuests(guests);
          return fetchDays(calendarId, token as string); // Chain the next fetch
        })
        .then((days) => {
          setDays(days);
          return fetchRooms(hostId, token as string); // Chain the final fetch
        })
        .then((rooms) => {
          setRooms(rooms);
          setIsCalendarLoading(false); // All data fetched, stop loading
        })
        .catch((err) => {
          console.error("Error fetching data:", err);
          setCalendarErrorMessage(
            "Failed to fetch calendar data. Please try again."
          );
          setIsCalendarLoading(false); // Ensure loading stops even on error
        });
    }
  }, [isCalendarLoading]);

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

  const transformBookings = (
    monthMap: Map<string, dayType>,
    timeZone: string
  ) => {
    const propagateBooking = (
      booking: bookingType,
      currentKey: string,
      sortedKeys: string[],
      index: number,
      tracking: { startDate: string; endDate: string; duration: number },
      processedBookings: Set<string>
    ): void => {
      const finalizeBooking = () => {
        // Update the current booking after recursion unwinds
        booking.duration = tracking.duration;
        booking.endDate = tracking.endDate;
        booking.startDate = tracking.startDate;

        // Mark the next booking as processed
        const bookingIdentifier = `${tracking.startDate}-${tracking.endDate}-${booking.guest.id}`;
        processedBookings.add(bookingIdentifier);
      };

      const nextIndex = index + 1;

      // Base case: If there are no more keys, end recursion
      if (nextIndex >= sortedKeys.length) {
        finalizeBooking();
        return;
      }

      const nextKey = sortedKeys[nextIndex];
      const nextDay = monthMap.get(nextKey);

      // Find a matching booking in the next day's bookings
      const nextBooking = nextDay?.bookings.find((b) => {
        const currentDate = toZonedTime(currentKey, timeZone);
        const nextDate = toZonedTime(nextKey, timeZone);
        return (
          b.guest.id === booking.guest.id &&
          b.room.id === booking.room.id &&
          isSameDay(nextDate, addDays(currentDate, 1))
        );
      });

      if (nextBooking) {
        // Update the tracking object
        tracking.endDate = nextBooking.endDate;
        tracking.duration += 1;

        // Recursively propagate the merged booking
        propagateBooking(
          nextBooking,
          nextKey,
          sortedKeys,
          nextIndex,
          tracking,
          processedBookings
        );
      }

      finalizeBooking();
    };

    const sortedKeys = [...monthMap.keys()].sort(); // Get sorted keys
    const processedBookings = new Set<string>(); // Track processed bookings

    for (let i = 0; i < sortedKeys.length; i++) {
      const currentKey = sortedKeys[i];
      const currentDay = monthMap.get(currentKey);

      if (!currentDay) {
        continue;
      }

      currentDay.bookings.forEach((booking) => {
        // Create a unique identifier for the booking
        const bookingIdentifier = `${booking.startDate}-${booking.endDate}-${booking.guest.id}`;

        // Skip already-processed bookings
        if (
          processedBookings.has(bookingIdentifier) ||
          booking.guest.name === "AirBnB"
        ) {
          return;
        }

        const tracking = {
          startDate: booking.startDate,
          endDate: booking.endDate,
          duration: 1,
        };

        // Mark the booking as processed
        processedBookings.add(bookingIdentifier);

        // Pass the sortedKeys and current index to propagateBooking
        propagateBooking(
          booking,
          currentKey,
          sortedKeys,
          i,
          tracking,
          processedBookings
        );
      });
    }
  };

  useEffect(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const map = new Map<string, dayType>();
    days.forEach((day) => {
      const formattedDate = toZonedTime(day.date, timeZone)
        .toISOString()
        .split("T")[0];
      map.set(formattedDate, day);
    });
    setMonthMap(map);

    const sortedMap = new Map(
      [...map.entries()].sort(([keyA], [keyB]) => {
        return keyA.localeCompare(keyB); // Lexicographical comparison
      })
    );

    transformBookings(sortedMap, timeZone);
  }, [days]);

  useEffect(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (days && currentMonth) {
      const targetMonth = currentMonth.getMonth(); // Current month (0-based index)
      const targetYear = currentMonth.getFullYear(); // Current year

      // Get unique days in the current month
      const occupiedDays = days.filter((day) => {
        const processedDate = toZonedTime(day.date, timeZone);
        return (
          processedDate.getFullYear() === targetYear &&
          processedDate.getMonth() === targetMonth
        );
      });

      // Initialize a map to group Sets by normalized room name
      const roomSets = new Map();

      // Function to normalize room names (remove duplicate patterns)
      const getBaseRoomName = (roomName: string) => {
        return roomName.replace(/(.+?)\1+$/, "$1");
      };

      // Iterate over each room in the state
      rooms.forEach((room) => {
        const baseRoomName = getBaseRoomName(room.name); // Normalize name
        const roomId = room.id;

        // Filter the dayType objects by the room.id in their bookings
        const roomSpecificSet = new Set(
          occupiedDays.filter((day) =>
            day.bookings.some((booking) => booking.room.id === roomId)
          )
        );

        // Add the Set to the Map (using base name as key)
        if (!roomSets.has(baseRoomName)) {
          roomSets.set(baseRoomName, new Set());
        }

        // Merge existing Set with the new room-specific Set
        roomSpecificSet.forEach((day) => roomSets.get(baseRoomName).add(day));
      });

      // Total number of days in the current month
      const daysInMonth = getDaysInMonth(currentMonth);

      // Initialize total occupancy and room-wise occupancy
      let totalOccupiedDays = 0;
      let totalAirbnbGuests = 0;
      const roomOccupancy = [];
      const airbnbGuestCountMap = new Map(); // Map for storing counts of Airbnb guests

      for (const [roomName, roomSet] of roomSets.entries()) {
        const occupancyPercentage = (roomSet.size / daysInMonth) * 100;
        roomOccupancy.push({ name: roomName, occupancy: occupancyPercentage });

        // Exclude "Master" room from total occupancy calculation
        // if (roomName !== "Master") {
        //   totalOccupiedDays += roomSet.size;
        // }
        totalOccupiedDays += roomSet.size;

        // Count "Airbnb" guests for the current room
        let airbnbCount = 0;
        roomSet.forEach((day: dayType) => {
          day.bookings.forEach((booking) => {
            if (
              getBaseRoomName(booking.room.name) === roomName && // Compare using base name
              booking.guest.name.toLowerCase() === "airbnb"
            ) {
              airbnbCount += 1;
            }
          });
        });

        // Store the count in the map
        airbnbGuestCountMap.set(roomName, airbnbCount);

        // Add to total Airbnb guest count
        totalAirbnbGuests += airbnbCount;
      }

      // Calculate total occupancy percentage (excluding "Master")
      const totalRooms = [...roomSets.keys()].filter(
        (name) => name !== "Master"
      ).length;
      const totalOccupancy =
        (totalOccupiedDays / (totalRooms * daysInMonth)) * 100;
      const airbnbOccupancy =
        (totalAirbnbGuests / (totalRooms * daysInMonth)) * 100;

      // Update state
      setOccupancy({
        totalOccupancy: totalOccupancy,
        airbnbOccupancy: airbnbOccupancy,
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

  useEffect(() => {
    let guestProfit = 0;
    let airBnBProfit = 0;
    if (monthMap) {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Filter and sort only the dates that belong to the current month or beyond
      const sortedKeys = [...monthMap.keys()]
        .filter((dateKey) => {
          const localDate = toZonedTime(dateKey, timeZone); // Convert string to Date object
          return (
            isSameMonth(localDate, currentMonth) ||
            isAfter(localDate, currentMonth)
          );
        })
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

      for (const dateKey of sortedKeys) {
        const day = monthMap.get(dateKey);
        if (!day) continue;

        const currentLocalDate = toZonedTime(dateKey, timeZone);
        if (!isSameMonth(currentLocalDate, currentMonth)) break;

        for (const booking of day.bookings) {
          if (booking.guest.name != "AirBnB") {
            const guestPricing = booking.guest.pricing.find(
              (pricing) => pricing.room === booking.room.id
            );

            if (guestPricing) {
              guestProfit += guestPricing.price;
            }
          } else {
            const key = `${booking.room.name}_${booking.startDate}_${booking.endDate}`;
            const profit = airBnBPrices?.get(key);

            if (profit) {
              const singleDayProfit = profit / booking.duration;
              guestProfit += singleDayProfit;
              airBnBProfit += singleDayProfit;
            }
          }
        }
      }
    }

    setProfit({ ...profit, total: guestProfit, airbnb: airBnBProfit });
  }, [airBnBPrices, monthMap, currentMonth]);

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
    setIsCalendarLoading(true);
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

  const onUnbook = (ids: string[]) => {
    setSelectedUnbooking(null);

    const unbookSequentially = (index: number) => {
      if (index >= ids.length) {
        // All unbookings are done
        setCurrentBookings(null);
        setIsMobileModalOpen(false);
        setIsCalendarLoading(true);
        return;
      }

      const id = ids[index];
      updateUnbookGuest(id, token as string)
        .then((result) => {
          console.log(`Successfully unbooked guest with ID: ${id}`, result);
          // Proceed to the next ID
          unbookSequentially(index + 1);
        })
        .catch((err) => {
          console.error(`Error unbooking guest with ID: ${id}`, err);
          // Continue even if an error occurs
          unbookSequentially(index + 1);
        });
    };

    unbookSequentially(0); // Start the recursive process
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

  const getCurrentGuestBill = (guest: string) => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const totalPriceOfMonth = Array.from(monthMap.entries()).reduce(
      (total, [dateStr, dayEntry]) => {
        const date = toZonedTime(dateStr, timeZone);

        if (isSameMonth(date, currentMonth)) {
          const matchingBookings = dayEntry.bookings.filter(
            (booking) =>
              booking.guest.name === guest && booking.startDate === dateStr
          );

          return (
            total +
            matchingBookings.reduce((sum, booking) => {
              const pricePerNight =
                booking.guest.pricing.find((p) => p.room === booking.room.id)
                  ?.price || booking.price;

              return sum + pricePerNight * booking.duration;
            }, 0)
          );
        }

        return total;
      },
      0
    );

    return totalPriceOfMonth;
  };

  const handleBookingConfirmation = (phone: string) => {
    const month = format(currentMonth, "LLLL");
    const body = `Your booking for ${month} is now as follows:\n`;

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Sort monthMap entries using date-fns compareAsc
    const sortedEntries = Array.from(monthMap.entries()).sort(
      ([dateStrA], [dateStrB]) => {
        const dateA = toZonedTime(dateStrA, timeZone);
        const dateB = toZonedTime(dateStrB, timeZone);
        return compareAsc(dateA, dateB);
      }
    );

    let totalPriceOfMonth = 0;

    // Process the sorted entries
    const bookingDetails = sortedEntries.reduce((acc, [dateStr, dayEntry]) => {
      const date = toZonedTime(dateStr, timeZone);

      // Check if the booking is within the current month
      if (isSameMonth(date, currentMonth)) {
        // Filter bookings that match the phone number and start date
        const matchingBookings = dayEntry.bookings.filter(
          (booking) =>
            booking.guest.phone === phone && booking.startDate === dateStr
        );

        // If matching bookings exist, format them and add to accumulator
        if (matchingBookings.length > 0) {
          const bookingText = matchingBookings
            .map((booking: bookingType) => {
              const startDate = toZonedTime(
                booking.startDate.split("T")[0],
                timeZone
              );
              const weekday = format(startDate, "EEE"); // Mon, Tue, etc.
              const dateFormatted = format(startDate, "M/d"); // month/day format
              const duration = booking.duration;

              // Get the room name and price
              const roomName = booking.room.name;
              const pricePerNight =
                booking.guest.pricing.find((p) => p.room === booking.room.id)
                  ?.price || booking.price; // Fallback if pricing not found

              if (duration === 1) {
                // Single-night booking format
                totalPriceOfMonth += pricePerNight;
                return `* ${weekday} ${dateFormatted}, 1 night, ${roomName}, $${pricePerNight}`;
              } else {
                // Multi-night booking format
                const endDate = addDays(startDate, duration - 1);
                const endWeekday = format(endDate, "EEE");
                const endDateFormatted = format(endDate, "M/d");
                const totalPrice = pricePerNight * duration;

                totalPriceOfMonth += totalPrice;
                return `* ${weekday} to ${endWeekday}, ${dateFormatted} - ${endDateFormatted}, ${duration} nights, ${roomName}, $${pricePerNight} * ${duration} = $${totalPrice}`;
              }
            })
            .join("\n");

          // Add the formatted booking details to the accumulator
          return acc + bookingText + "\n";
        }
      }

      return acc; // Return accumulator unchanged if no match
    }, ""); // Initialize with an empty string

    const fullBody = `${body}${bookingDetails}\nTotal amount = $${totalPriceOfMonth}\n\nCould you please confirm whether everything is in order?`;

    window.location.href = `sms:${phone}?&body=${encodeURIComponent(fullBody)}`;
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
              currentGuest={
                currentGuest
                  ? (guests.find((guest) => guest.id === currentGuest)
                      ?.name as string)
                  : null
              }
              occupancy={occupancy}
              currentMonth={currentMonth}
              profit={profit}
              isTodoModalOpen={isTodoModalOpen}
              getCurrentGuestBill={getCurrentGuestBill}
              setIsTodoModalOpen={setIsTodoModalOpen}
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
              currentGuest={currentGuest}
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
                rooms={rooms}
                selectedDate={selectedDate}
                selectedRoom={selectedRoom}
                showAddPane={showAddPane}
                onBooking={onBooking}
                setIsModalOpen={setIsModalOpen}
                setShowAddPane={setShowAddPane}
              />
            )}
            {showAddPane && (
              <>
                {/* GuestAddPane */}
                {showAddPane === "guest" && (
                  <div
                    className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50"
                    onClick={() => {
                      setShowAddPane(null); // Close modal on background click
                    }}
                  >
                    <div
                      className="w-full max-w-md bg-white p-4 rounded-lg shadow-lg"
                      onClick={(e) => e.stopPropagation()} // Prevent background click inside modal
                    >
                      <GuestAddPane
                        guestErrorMessage={guestErrorMessage}
                        onAddGuest={(guestData) => {
                          onAddGuest(guestData); // Handle guest addition
                          setShowAddPane(null); // Close modal after adding guest
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* RoomAddPane */}
                {showAddPane === "room" && (
                  <div
                    className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50"
                    onClick={() => {
                      setShowAddPane(null); // Close modal on background click
                    }}
                  >
                    <div
                      className="w-full max-w-md bg-white p-4 rounded-lg shadow-lg"
                      onClick={(e) => e.stopPropagation()} // Prevent background click inside modal
                    >
                      <RoomAddPane
                        roomErrorMessage={roomErrorMessage}
                        onAddRoom={(roomData) => {
                          onAddRoom(roomData); // Handle room addition
                          setShowAddPane(null); // Close modal after adding room
                        }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {selectedModifyBooking && (
              <ModifyBookingModal
                calendarId={calendarId}
                monthMap={monthMap}
                onBooking={onBooking}
                selectedModifyBooking={selectedModifyBooking}
                setSelectedModifyBooking={setSelectedModifyBooking}
              />
            )}
          </>
        )}
      </div>

      <div className="hidden bg-white border-l sm:block">
        {isTodoModalOpen ? (
          <ToDoList monthMap={monthMap} />
        ) : currentBookings && currentBookings.length > 0 ? (
          <GuestView
            airBnBPrices={airBnBPrices}
            currentBookings={currentBookings}
            currentGuest={currentGuest}
            rooms={rooms}
            handleBookingConfirmation={handleBookingConfirmation}
            onPricingUpdate={onPricingUpdate}
            setAirBnBPrices={setAirBnBPrices}
            setCurrentGuest={setCurrentGuest}
            setSelectedBooking={
              setSelectedBooking as React.Dispatch<
                React.SetStateAction<bookingType>
              >
            }
            setSelectedModifyBooking={
              setSelectedModifyBooking as React.Dispatch<
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
              setSelectedRoom={setSelectedRoom}
            />
          </GuestView>
        ) : (
          <div className="flex flex-col items-center justify-center h-full w-full">
            {rooms.map((room, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center border-b border-solid h-full w-full space-y-2"
              >
                <p>{room.name}</p>
                <BookButton
                  room={room}
                  setIsModalOpen={setIsModalOpen}
                  setSelectedRoom={setSelectedRoom}
                />
              </div>
            ))}
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
            airBnBPrices={airBnBPrices}
            currentBookings={currentBookings}
            currentGuest={currentGuest}
            rooms={rooms}
            handleBookingConfirmation={handleBookingConfirmation}
            onPricingUpdate={onPricingUpdate}
            setAirBnBPrices={setAirBnBPrices}
            setCurrentGuest={setCurrentGuest}
            setIsMobileModalOpen={setIsMobileModalOpen}
            setSelectedBooking={
              setSelectedBooking as React.Dispatch<
                React.SetStateAction<bookingType>
              >
            }
            setSelectedModifyBooking={
              setSelectedModifyBooking as React.Dispatch<
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
              setSelectedRoom={setSelectedRoom}
            />
          </GuestView>
        ) : (
          <div className="flex flex-col w-full h-full justify-center items-center">
            {rooms.map((room, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center border-b border-solid h-full w-full space-y-2"
              >
                <p>{room.name}</p>
                <BookButton
                  room={room}
                  setIsModalOpen={setIsModalOpen}
                  setIsMobileModalOpen={setIsMobileModalOpen}
                  setSelectedRoom={setSelectedRoom}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        className={`fixed bottom-0 left-0 w-full h-auto bg-white p-1 border-t border-gray-300 z-50 overflow-y-scroll sm:hidden transition-transform duration-300 ${
          isTodoModalOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Close Button */}
        <button
          className="text-gray-700 font-bold text-[1.5rem]"
          onClick={() => {
            setIsTodoModalOpen(false);
          }} // Close the modal
        >
          &times;
        </button>

        <ToDoList monthMap={monthMap} />
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
          monthMap={monthMap}
          booking={selectedUnbooking}
          onClose={() => setSelectedUnbooking(null)}
          onUnbook={onUnbook}
        />
      )}
    </>
  );
};

export default MainView;
