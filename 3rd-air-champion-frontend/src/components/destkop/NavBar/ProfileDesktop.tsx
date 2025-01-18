import { useState } from "react";
import DropDownMenu from "./DropDown/DropDownMenu";

interface ProfileDesktopProps {
  handleLogout: () => void;
  children: string;
}

const ProfileDesktop = ({ children, handleLogout }: ProfileDesktopProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const getInitials = () => {
    const splitName = children.trim().split(" "); // Split the name into parts
    if (splitName.length === 1) {
      // If there's only one word, return the first letter capitalized
      return splitName[0].charAt(0).toUpperCase();
    }
    const firstInitial = splitName[0].charAt(0).toUpperCase(); // First name initial
    const lastInitial = splitName[splitName.length - 1].charAt(0).toUpperCase(); // Last name initial
    return firstInitial + lastInitial; // Combine initials
  };

  return (
    <div className="relative">
      <div
        className="flex items-center cursor-pointer space-x-2"
        onClick={toggleDropdown}
      >
        <div
          className={`${
            window.screen.availWidth > 640
              ? "h-[76px] w-[76px]"
              : "h-[44px] w-[44px]"
          } rounded-full border border-solid border-black flex items-center justify-center`}
        >
          {getInitials()}
        </div>
        <span
          className={`${
            window.screen.availWidth > 640 ? "text-[1.25rem]" : "hidden"
          }`}
        >
          {children}
        </span>
      </div>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <DropDownMenu user={children} handleLogout={handleLogout} />
      )}
    </div>
  );
};

export default ProfileDesktop;
