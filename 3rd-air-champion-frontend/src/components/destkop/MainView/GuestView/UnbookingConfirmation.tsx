import { formatDate } from "../../../../util/formatDate";
import { bookingType } from "../../../../util/types/bookingType";

interface UnbookingConfirmationProps {
  booking: bookingType;
  onClose: () => void;
  onUnbook: (id: string) => void;
}

const UnbookingConfirmation = ({
  booking,
  onClose,
  onUnbook,
}: UnbookingConfirmationProps) => {
  return (
    <div className="fixed bottom-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-4 max-w-lg w-full shadow-lg">
        <button
          onClick={onClose}
          className="text-gray-700 font-bold text-[1.5rem]"
        >
          &times;
        </button>

        {/* Content */}
        {/* Warning label*/}
        <h1>
          Are you sure you want to unbook:{" "}
          <span className="font-semibold">
            {booking.alias || booking.guest.name}
          </span>{" "}
          on{" "}
          <span className="font-semibold">{formatDate(booking.startDate)}</span>{" "}
          to{" "}
          <span className="font-semibold">{formatDate(booking.endDate)}</span>
        </h1>

        {/* Action buttons */}
        <div className="flex justify-end space-x-4 mt-4">
          <button
            onClick={() => onUnbook(booking.id)}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Confirm
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnbookingConfirmation;
