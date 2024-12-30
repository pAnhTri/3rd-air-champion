import { FaUserCircle } from "react-icons/fa";
import { useState } from "react";

interface ProfileDesktopProps {
  handleLogout: () => void;
  children: string;
}

const ProfileDesktop = ({ children, handleLogout }: ProfileDesktopProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  return (
    <div className="relative">
      <div
        className="hidden sm:flex items-center gap-x-2 cursor-pointer"
        onClick={toggleDropdown}
      >
        <span className="text-[1.25rem] hidden sm:block">{children}</span>
        <FaUserCircle size={76} />
      </div>
      <div
        className="md:hidden items-center cursor-pointer"
        onClick={toggleDropdown}
      >
        <FaUserCircle size={48} />
      </div>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-10">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDesktop;
