import CalendarNavigation from "./Calendar Content/CalendarNavigation";
import MainCalendar from "./Calendar Content/MainCalendar";

const CalendarCanvas = () => {
  return (
    <div className="w-full h-full flex-col">
      <CalendarNavigation />
      <MainCalendar />
    </div>
  );
};

export default CalendarCanvas;
