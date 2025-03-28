import { addDays, compareAsc, isSameDay, isSameMonth } from "date-fns";
import { useEffect, useState } from "react";
import { dayType } from "../../../../util/types/dayType";
import { toZonedTime } from "date-fns-tz/toZonedTime";

interface CalendarNavigatorProps {
  currentMonth: Date;
  currentGuest: string | null;
  isTodoModalOpen: boolean;
  monthMap: Map<string, dayType>;
  occupancy: {
    totalOccupancy: number;
    airbnbOccupancy: number;
    roomOccupancy: {
      name: string;
      occupancy: number;
    }[];
  };
  paidDates: Date[];
  profit: {
    total: number;
    airbnb: number;
  };
  getCurrentGuestBill: (guest: string) => number;
  setIsTodoModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setPaidDates: React.Dispatch<React.SetStateAction<Date[]>>;
}

const CalendarNavigator = ({
  currentMonth,
  currentGuest,
  monthMap,
  occupancy,
  isTodoModalOpen,
  profit,
  paidDates,
  getCurrentGuestBill,
  setIsTodoModalOpen,
  setPaidDates,
}: CalendarNavigatorProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [guestBill, setGuestBill] = useState<number | null>(null);

  const formattedDate = currentMonth.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  useEffect(() => {
    if (currentGuest) {
      const totalBill = getCurrentGuestBill(currentGuest);
      setGuestBill(totalBill);
    } else {
      setGuestBill(null);
    }
  }, [currentGuest, currentMonth]);

  return (
    <div className="flex flex-col justify-between h-full max-h-[80px] bg-white drop-shadow-sm p-2 sm:max-h-[120px]">
      {/* Date */}
      {!currentGuest ? (
        <>
          <div className="flex h-full w-full items-center text-nowrap">
            <div className="basis-2/3 flex justify-end w-full space-x-2">
              <span className="font-bold text-xl text-gray-800">
                {formattedDate}
              </span>
              {isSameMonth(new Date(), currentMonth) && !currentGuest && (
                <button
                  type="button"
                  className={`text-white bg-black p-1 text-xs rounded-md ${
                    isTodoModalOpen &&
                    "drop-shadow-[0_4px_6px_rgba(59,130,246,0.5)]"
                  }`}
                  onClick={() => setIsTodoModalOpen(!isTodoModalOpen)}
                >
                  To Do
                </button>
              )}
            </div>
            {/* PROFIT */}
            <div className="basis-1/3 flex justify-end w-full text-xl font-bold">
              ${profit.total.toFixed(2)}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex h-full w-full justify-between items-center">
            {/* Guest */}
            <span className="text-xl text-gray-800">{currentGuest}</span>
            <div
              className="font-bold text-xl text-gray-800"
              onDoubleClick={() => {
                const timeZone =
                  Intl.DateTimeFormat().resolvedOptions().timeZone;

                const paidDatesSet = new Set<string>(
                  paidDates.map(
                    (paidDate) => paidDate.toISOString().split("T")[0]
                  )
                );

                monthMap.forEach((day, dateKey) => {
                  const booking = day.bookings.find(
                    (booking) => booking.guest.name === currentGuest
                  );

                  if (booking) {
                    const localDate = toZonedTime(dateKey, timeZone);
                    const localStartDate = toZonedTime(
                      booking.startDate,
                      timeZone
                    );
                    if (
                      isSameDay(localDate, localStartDate) &&
                      isSameMonth(localStartDate, currentMonth)
                    ) {
                      for (let i = 0; i < booking.duration; i += 1) {
                        paidDatesSet.add(
                          toZonedTime(addDays(localStartDate, i), timeZone)
                            .toISOString()
                            .split("T")[0]
                        );
                      }
                    }
                  }
                });

                const updatedPaidDates = Array.from(paidDatesSet, (date) =>
                  toZonedTime(date, timeZone)
                ).sort((a, b) => {
                  return compareAsc(a, b);
                });

                setPaidDates(updatedPaidDates);
              }}
            >
              {formattedDate}
            </div>
            {/* PROFIT */}
            <div className="text-xl font-bold">${guestBill?.toFixed(2)}</div>
          </div>
        </>
      )}

      <div className="flex h-full w-full">
        {!currentGuest &&
          (showDetails ? (
            <div
              onClick={() => setShowDetails(false)}
              className="basis-2/3 flex h-full w-full justify-end items-center cursor-pointer space-x-2 text-[0.85rem] text-nowrap"
            >
              {occupancy.roomOccupancy
                .filter((room) => room.name !== "Master") // Exclude "Master"
                .map((object, index) => {
                  // Determine the color class based on occupancy
                  const occupancyColor =
                    object.occupancy < 33.33
                      ? "text-red-500"
                      : object.occupancy < 66.67
                      ? "text-yellow-500"
                      : "text-green-500";
                  return (
                    <div key={index} className="space-x-1">
                      <span className="font-medium">{object.name}: </span>
                      <span className={occupancyColor}>
                        {Math.round(object.occupancy)}%
                      </span>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div
              className="basis-2/3 flex h-full w-full justify-end items-center cursor-pointer space-x-2 text-[0.85rem] text-nowrap"
              onClick={() => setShowDetails(true)}
            >
              <span
                className={`cursor-pointer flex underline ${
                  occupancy.totalOccupancy < 33.33
                    ? "text-red-500"
                    : occupancy.totalOccupancy < 66.67
                    ? "text-yellow-500"
                    : "text-green-500"
                }`}
              >
                {Math.round(occupancy.totalOccupancy)}% occupancy
              </span>
              <span
                className={`underline ${
                  occupancy.airbnbOccupancy < 33.33
                    ? "text-red-500"
                    : occupancy.airbnbOccupancy < 66.67
                    ? "text-yellow-500"
                    : "text-green-500"
                }`}
              >
                {Math.round(occupancy.airbnbOccupancy)}% (A)booking
              </span>
            </div>
          ))}
        {/* PROFIT */}
        {!currentGuest && (
          <div className="basis-1/3 flex justify-end w-full font-bold text-nowrap">
            (A) ${profit.airbnb.toFixed(2)}
          </div>
        )}
      </div>

      {/* Bottom Section: Days of the Week */}
      <div className="grid grid-cols-7 text-center">
        {[
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ].map((day, index) => (
          <abbr
            key={index}
            title={day}
            className="text-xs font-medium sm:text-sm md:text-base"
          >
            {day.substring(0, 3)}
          </abbr>
        ))}
      </div>
    </div>
  );
};

export default CalendarNavigator;
