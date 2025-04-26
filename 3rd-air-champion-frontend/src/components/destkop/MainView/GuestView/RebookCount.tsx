import { useMemo } from "react";
import { bookingType } from "../../../../util/types/bookingType";

interface RebookCountProps {
  booking: bookingType;
  airBnBBookingCount: {
    Alias: string;
    Room: string;
    DistinctStartDateCount: number;
  }[];
}
const RebookCount = ({ booking, airBnBBookingCount }: RebookCountProps) => {
  const airBnbGuest = useMemo(() => {
    if (airBnBBookingCount.length === 0) return null;
    return airBnBBookingCount.filter((guest) => {
      return guest.Alias === booking.alias;
    });
  }, [airBnBBookingCount, booking]);

  const totalRebookings = airBnbGuest?.reduce(
    (acc, b) => acc + b.DistinctStartDateCount,
    0
  );

  return (
    <div className="">
      <span>Total Rebookings: {totalRebookings}</span>
    </div>
  );
};

export default RebookCount;
