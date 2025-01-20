import { FaPlus } from "react-icons/fa";
import { roomType } from "../../util/types/roomType";

interface BookButtonProps {
  room?: roomType;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsMobileModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedRoom: React.Dispatch<React.SetStateAction<roomType | undefined>>;
}

const BookButton = ({
  room,
  setIsModalOpen,
  setIsMobileModalOpen,
  setSelectedRoom,
}: BookButtonProps) => {
  return (
    <button
      onClick={() => {
        setSelectedRoom(room);
        setIsModalOpen(true);
        if (typeof setIsMobileModalOpen !== "undefined")
          setIsMobileModalOpen(false);
      }}
      className="flex justify-center items-center rounded-full shadow-md bg-blue-500 hover:bg-blue-600 text-white font-semibold h-[64px] w-[64px] text-2xl"
    >
      <FaPlus />
    </button>
  );
};

export default BookButton;
