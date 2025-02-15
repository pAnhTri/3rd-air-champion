import { useEffect, useState } from "react";
import { getToken } from "./getToken";
import { dayType } from "./types/dayType";
import { roomType } from "./types/roomType";
import { transformBookings } from "./calendarHelpers";
import { fetchDays } from "./dayOperations";
import { fetchRooms } from "./roomOperations";
import { fetchHost } from "./hostOperations";
import { toZonedTime } from "date-fns-tz";
import { getDaysInMonth, startOfToday } from "date-fns";

export const useMainViewStates = () => {
  const [login, setLogin] = useState<{
    hostId: string;
    token: string;
  } | null>(null);
  const [host, setHost] = useState<{
    hostId: string;
    token: string;
    calendarId: string;
  } | null>(null);
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);
  const [days, setDays] = useState<dayType[]>([]);
  const [rooms, setRooms] = useState<roomType[]>([]);
  const [monthMap, setMonthMap] = useState<Map<string, dayType>>(new Map());
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfToday());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [occupancy, setOccupancy] = useState<{
    totalOccupancy: number;
    airbnbOccupancy: number;
    roomOccupancy: { name: string; occupancy: number }[];
  }>({ totalOccupancy: 0, airbnbOccupancy: 0, roomOccupancy: [] });

  // Calendar filters
  const [roomFilter, setRoomFilter] = useState<string | null>(null);

  useEffect(() => {
    getToken().then((result) => {
      setLogin({ hostId: result.hostId, token: result.token });
    });
  }, []);

  useEffect(() => {
    if (login) {
      fetchHost(login?.hostId as string, login?.token as string).then(
        (result) => {
          setHost({
            hostId: login?.hostId as string,
            token: login?.token as string,
            calendarId: result.calendar,
          });
        }
      );
    }
  }, [login]);

  useEffect(() => {
    if (host) {
      fetchDays(host.calendarId, host.token)
        .then((days) => {
          setDays(days);
          return fetchRooms(host.hostId, host.token);
        })
        .then((rooms) => {
          setRooms(rooms);
        })
        .catch((err) => {
          console.error("Error fetching data:", err);
          setIsCalendarLoading(false); // Ensure loading stops even on error
        });
    }
  }, [host, isCalendarLoading]);

  useEffect(() => {
    const map = new Map<string, dayType>();
    days.forEach((day) => {
      const formattedDate = new Date(day.date).toISOString().split("T")[0];
      map.set(formattedDate, day);
    });
    setMonthMap(map);

    const sortedMap = new Map(
      [...map.entries()].sort(([keyA], [keyB]) => {
        return keyA.localeCompare(keyB); // Lexicographical comparison
      })
    );

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

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
              booking.room.name === roomName &&
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
      const totalRooms = rooms.filter((room) => room.name !== "Master").length;
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

  return {
    currentMonth,
    host,
    isCalendarLoading,
    monthMap,
    occupancy,
    rooms,
    roomFilter,
    selectedDate,
    setCurrentMonth,
    setRoomFilter,
    setSelectedDate,
  };
};
