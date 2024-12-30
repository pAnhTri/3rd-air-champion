import { useEffect, useRef, useState } from "react";
import Calendar from "react-calendar";
import "../../../../styles/calendarStyle.css";
import { isSameDay, startOfToday } from "date-fns";
import { dayType } from "../../../../util/types/dayType";
import { bookingType } from "../../../../util/types/bookingType";
import { roomType } from "../../../../util/types/roomType";

interface CustomCalendarProps {
  currentMonth: Date;
  days: dayType[];
  rooms: roomType[];
  setDays: React.Dispatch<React.SetStateAction<dayType[]>>;
  setCurrentBookings: React.Dispatch<
    React.SetStateAction<bookingType[] | null | undefined>
  >;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  setCurrentMonth: React.Dispatch<React.SetStateAction<Date>>;
}

const CustomCalendar = ({
  currentMonth,
  days,
  rooms,
  setCurrentBookings,
  setCurrentPage,
  setCurrentMonth,
}: CustomCalendarProps) => {
  const [months, setMonths] = useState<Date[]>([]);
  const [monthMap, setMonthMap] = useState<Map<string, dayType>>(new Map());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentMonth = new Date();
    const monthsArray = [];
    for (let i = -24; i <= 36; i++) {
      // 2 years back, 3 years ahead
      const month = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + i,
        1
      );
      monthsArray.push(month);
    }

    setMonths(monthsArray);
  }, []);

  useEffect(() => {
    const map = new Map<string, dayType>();
    days.forEach((day) => {
      const formattedDate = new Date(day.date).toISOString().split("T")[0];
      map.set(formattedDate, day);
    });
    setMonthMap(map);
  }, [days]);

  useEffect(() => {
    if (scrollContainerRef.current && months.length > 0) {
      const currentIndex = 24; // Current month in the middle
      const calendarHeight = scrollContainerRef.current.offsetHeight;
      scrollContainerRef.current.scrollTop = currentIndex * calendarHeight;
    }
  }, [months]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const scrollTop = (e.target as HTMLElement).scrollTop;
    const calendarHeight = (e.target as HTMLElement).offsetHeight;
    const snappedIndex = Math.round(scrollTop / calendarHeight);
    const snappedMonth = months[snappedIndex];
    if (snappedMonth) {
      setCurrentMonth(snappedMonth);
    }
  };

  const customTile = ({ date }: { date: Date }) => {
    const className = ["react-calendar__custom_tile"];
    if (isSameDay(date, startOfToday()))
      className.push("react-calendar__custom_tile_today");
    const day = monthMap.get(date.toISOString().split("T")[0]);
    if (day && day.isBlocked)
      className.push("react-calendar__custom_tile_blocked");
    if (day && day.bookings.length === rooms.length)
      className.push("react-calendar__custom_tile_full");

    return className;
  };

  const customTileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      const day = monthMap.get(date.toISOString().split("T")[0]);
      if (day) {
        day.bookings.sort((a, b) => {
          return a.room.name.localeCompare(b.room.name);
        });

        // Initialize placeholders for the three rows
        const gridContent: {
          red: JSX.Element;
          blue: JSX.Element;
          green: JSX.Element;
        } = {
          red: <div className="h-full" />, // Ensure full height
          blue: <div className="h-full" />,
          green: <div className="h-full" />,
        };

        // Fill the placeholders based on room name
        day.bookings.forEach((booking) => {
          if (booking.room.name === "Cozy") {
            gridContent.red = (
              <div
                key="red"
                className="text-white bg-red-500 text-[0.65rem] truncate px-1 h-full flex items-center justify-center"
              >
                {booking.guest.name}
              </div>
            );
          } else if (booking.room.name === "Cute") {
            gridContent.blue = (
              <div
                key="blue"
                className="text-white bg-blue-500 text-[0.65rem] truncate px-1 h-full flex items-center justify-center"
              >
                {booking.guest.name}
              </div>
            );
          } else {
            gridContent.green = (
              <div
                key="green"
                className="text-white bg-green-500 text-[0.65rem] truncate px-1 h-full flex items-center justify-center"
              >
                {booking.guest.name}
              </div>
            );
          }
        });

        // Render the three grid rows
        return (
          <div className="mt-1">
            {gridContent.red === <div className="h-full" /> ? (
              <div className="row-span-1 h-full">{gridContent.red}</div>
            ) : (
              gridContent.red
            )}
            {gridContent.blue === <div className="h-full" /> ? (
              <div className="row-span-1 h-full">{gridContent.blue}</div>
            ) : (
              gridContent.blue
            )}
            {gridContent.green === <div className="h-full" /> ? (
              <div className="row-span-1 h-full">{gridContent.green}</div>
            ) : (
              gridContent.green
            )}
          </div>
        );
      }
    }

    return null;
  };

  const getDayContent = (date: Date) => {
    setCurrentPage(0); // Reset to first page
    const day = monthMap.get(date.toISOString().split("T")[0]);

    if (day && day.bookings) {
      setCurrentBookings(day.bookings);
    } else setCurrentBookings(null);
  };

  return (
    <div
      ref={scrollContainerRef}
      className="h-full overflow-y-scroll snap-y snap-mandatory"
      onScroll={handleScroll}
    >
      {months.map((month, index) => (
        <div key={index} className="snap-start h-full">
          <Calendar
            activeStartDate={month}
            showNavigation={false}
            showNeighboringMonth={false}
            value={currentMonth}
            onClickDay={getDayContent}
            tileClassName={customTile}
            tileContent={customTileContent}
            calendarType="gregory"
          />
        </div>
      ))}
    </div>
  );
};

export default CustomCalendar;
