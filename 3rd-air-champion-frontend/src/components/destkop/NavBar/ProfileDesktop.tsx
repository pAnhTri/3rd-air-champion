import { FaUserCircle } from "react-icons/fa";
import { useState } from "react";
import DropDownMenu from "./DropDown/DropDownMenu";

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
        className="flex items-center cursor-pointer space-x-2"
        onClick={toggleDropdown}
      >
        <FaUserCircle size={window.screen.availWidth > 640 ? 76 : 44} />
        <span
          className={`${
            window.screen.availWidth > 640 ? "text-[1.25rem]" : "hidden"
          }`}
        >
          {children}
        </span>
      </div>

      {/* Dropdown Menu */}
      {isDropdownOpen && <DropDownMenu handleLogout={handleLogout} />}
    </div>
  );
};

export default ProfileDesktop;
