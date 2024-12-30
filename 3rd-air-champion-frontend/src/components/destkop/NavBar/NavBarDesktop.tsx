import ProfileDesktop from "./ProfileDesktop";

interface NavBarDesktopProps {
  handleLogout: () => void;
  name: string;
}

const NavBarDesktop = ({ handleLogout, name }: NavBarDesktopProps) => {
  return (
    <div className="relative flex items-center w-full h-[80px] bg-white drop-shadow-md z-50 lg:h-[120px]">
      {/* Centered Navigation Buttons */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex space-x-4 sm:space-x-8 sm:flex-row sm:left-1/2 sm:transform sm:-translate-x-1/2">
        <button
          type="button"
          className="text-[1rem] p-1 hover:bg-[#D9D9D9] hover:rounded-md sm:text-[1.5rem] sm:p-2 lg:text-[2.25rem]"
        >
          Calendar
        </button>
        <button
          type="button"
          className="text-[1rem] p-1 hover:bg-[#D9D9D9] hover:rounded-md sm:text-[1.5rem] sm:p-2 lg:text-[2.25rem]"
        >
          AirBnB
        </button>
        <button
          type="button"
          className="text-[1rem] p-1 hover:bg-[#D9D9D9] hover:rounded-md sm:text-[1.5rem] sm:p-2 lg:text-[2.25rem]"
        >
          TT
        </button>
      </div>

      {/* Profile Section */}
      <div className="ml-auto pr-2">
        <ProfileDesktop handleLogout={handleLogout}>{name}</ProfileDesktop>
      </div>
    </div>
  );
};

export default NavBarDesktop;
