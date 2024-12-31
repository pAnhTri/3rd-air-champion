import ProfileDesktop from "./ProfileDesktop";

interface NavBarDesktopProps {
  handleLogout: () => void;
  name: string;
}

const NavBarDesktop = ({ handleLogout, name }: NavBarDesktopProps) => {
  return (
    <div className="relative flex items-center justify-center w-full h-[80px] bg-white drop-shadow-md z-50 lg:h-[120px]">
      {/* Centered Navigation Buttons */}
      <h1 className="p-1 hover:rounded-md sm:p-2 text-4xl">Calendar</h1>

      {/* Profile Section */}
      <div className="absolute left-0 pl-2">
        <ProfileDesktop handleLogout={handleLogout}>{name}</ProfileDesktop>
      </div>
    </div>
  );
};

export default NavBarDesktop;
