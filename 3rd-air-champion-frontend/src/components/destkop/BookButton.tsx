import { FaPlus } from "react-icons/fa";

interface BookButtonProps {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsMobileModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const BookButton = ({
  setIsModalOpen,
  setIsMobileModalOpen,
}: BookButtonProps) => {
  return (
    <button
      onClick={() => {
        setIsModalOpen(true);
        if (typeof setIsMobileModalOpen !== "undefined")
          setIsMobileModalOpen(false);
      }}
      className="flex justify-center items-center rounded-full shadow-md bg-blue-500 hover:bg-blue-600 text-white font-semibold h-[76px] w-[76px] text-2xl"
    >
      <FaPlus />
    </button>
  );
};

export default BookButton;
