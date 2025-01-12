import { useEffect, useState } from "react";
import { dayType } from "../../../util/types/dayType";
import { addDays, startOfToday, format } from "date-fns";

interface ToDoListProps {
  monthMap: Map<string, dayType>;
}

const ToDoList = ({ monthMap }: ToDoListProps) => {
  const [nextDay, setNextDay] = useState<dayType | undefined>(
    monthMap.get(addDays(startOfToday(), 1).toISOString().split("T")[0])
  );

  const [completedTasks, setCompletedTasks] = useState<
    Record<string, { completed: boolean; date: string | null }>
  >(() => JSON.parse(localStorage.getItem("completedTasks") || "{}"));

  useEffect(() => {
    const tomorrow = addDays(startOfToday(), 1).toISOString().split("T")[0];
    setNextDay(monthMap.get(tomorrow));
  }, [monthMap]);

  useEffect(() => {
    localStorage.setItem("completedTasks", JSON.stringify(completedTasks));
  }, [completedTasks]);

  const toggleTaskCompletion = (taskId: string) => {
    const currentDate = format(startOfToday(), "MM/dd/yyyy");
    setCompletedTasks((prev) => ({
      ...prev,
      [taskId]: {
        completed: !prev[taskId]?.completed,
        date: !prev[taskId]?.completed ? currentDate : null,
      },
    }));
  };

  const generateTaskId = (
    startDate: string,
    endDate: string,
    guestId: string,
    roomId: string
  ) => `${startDate}-${endDate}-${guestId}-${roomId}`;

  const nextDayDate = addDays(startOfToday(), 1).toISOString().split("T")[0];

  return nextDay ? (
    <div className="flex flex-col h-full px-2 overflow-y-scroll">
      <h1 className="font-bold self-center text-lg">To Do</h1>
      {nextDay.bookings
        .filter((booking) => booking.startDate === nextDayDate)
        .map((booking, index) => {
          const taskId = generateTaskId(
            booking.startDate,
            booking.endDate,
            booking.guest.id,
            booking.room.id
          );

          const task = completedTasks[taskId] || {
            completed: false,
            date: null,
          };
          const isCompleted = task.completed;

          return (
            <div
              key={index}
              className={`h-full w-full border-b border-solid flex justify-center items-center ${
                isCompleted ? "bg-gray-200" : ""
              }`}
            >
              <div
                className={`basis-4/5 font-bold text-lg flex ${
                  isCompleted ? "line-through text-gray-500" : ""
                }`}
              >
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={isCompleted}
                  onChange={() => toggleTaskCompletion(taskId)}
                />
                <div className="flex flex-col">
                  {booking.guest.alias || booking.alias || booking.guest.name} (
                  {booking.room.name})
                  {isCompleted && (
                    <p className="text-sm">Sent on {task.date}</p>
                  )}
                </div>
              </div>
              <div className="basis-1/5">
                {booking.description === "" ? (
                  <button
                    className="rounded-full shadow-md bg-black text-white font-semibold h-[64px] w-[64px] text-[0.6rem]"
                    onClick={() => {
                      const roomCodes = new Map([
                        ["cute", "2005#"],
                        ["cozy", "3006#"],
                        ["master", "No Code"],
                      ]);
                      const phone = booking.guest.phone;
                      const messageBody = encodeURIComponent(
                        `Hello ${
                          booking.guest.name
                        }, I would like to remind you that you will stay at TT house AirBnB for ${
                          booking.duration > 1
                            ? `${booking.duration} nights`
                            : "1 night"
                        }, starting from tomorrow. Your room is ${
                          booking.room.name
                        } (${
                          roomCodes.get(booking.room.name.toLowerCase()) ||
                          "Code"
                        }). The main entrance door code is 1268=. I wish you a pleasant day. Thanks!`
                      );
                      window.location.href = `sms:${phone}?&body=${messageBody}`;
                      toggleTaskCompletion(taskId);
                    }}
                    disabled={isCompleted}
                  >
                    Send Reminder
                  </button>
                ) : (
                  <button
                    className="rounded-full shadow-md bg-black text-white font-semibold h-[64px] w-[64px] text-[0.6rem]"
                    onClick={() => {
                      const url = booking.description.match(
                        /https:\/\/www\.airbnb\.com\/hosting\/reservations\/details\/\S+/
                      )?.[0];
                      if (url) {
                        window.open(url, "_blank", "noopener,noreferrer");
                      } else {
                        alert("No valid URL found in the description.");
                      }
                    }}
                    disabled={isCompleted}
                  >
                    Booking Details
                  </button>
                )}
              </div>
            </div>
          );
        })}
    </div>
  ) : (
    <div className="flex items-center justify-center h-full w-full">
      Nothing to Do
    </div>
  );
};

export default ToDoList;
