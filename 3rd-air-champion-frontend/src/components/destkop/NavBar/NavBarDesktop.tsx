import ProfileDesktop from "./ProfileDesktop";

interface NavBarDesktopProps {
  name: string;
  handleLogout: () => void;
  setIsAboutModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const NavBarDesktop = ({
  name,
  handleLogout,
  setIsAboutModalOpen,
}: NavBarDesktopProps) => {
  return (
    <div className="px-1 flex items-center justify-between w-full h-[80px] bg-white drop-shadow-md z-50 lg:h-[120px]">
      {/* Profile Section */}
      <div className="">
        <ProfileDesktop handleLogout={handleLogout}>{name}</ProfileDesktop>
      </div>

      {/* Centered Navigation Buttons */}
      <h1 className="p-1 hover:rounded-md sm:p-2 text-lg">
        TT House Booking Manager
      </h1>

      {/* About */}
      <button type="button" onClick={() => setIsAboutModalOpen(true)}>
        <img
          className={`${
            window.screen.availWidth > 640
              ? "h-[76px] w-[76px]"
              : "h-[44px] w-[44px]"
          }`}
          alt="About"
          title="About"
          src="./TiMagLogo.svg"
        ></img>
      </button>
    </div>
  );
};

export default NavBarDesktop;
