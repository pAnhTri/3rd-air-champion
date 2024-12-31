import AirBnBSyncButton from "./AirBnBSyncButton";
import LogoutButton from "./LogoutButton";
import RoomSyncButton from "./RoomSyncButton";

interface LogoutButtonProps {
  handleLogout: () => void;
}

const DropDownMenu = ({ handleLogout }: LogoutButtonProps) => {
  return (
    <div className="absolute right-0 min-w-[160px] w-full bg-white rounded-md grid-rows-3 drop-shadow-md">
      {/* Options */}
      <div className="border-b border-solid w-full hover:bg-[#D9D9D9] text-center">
        <AirBnBSyncButton />
      </div>
      <div className="border-b border-solid w-full hover:bg-[#D9D9D9] text-center">
        <RoomSyncButton />
      </div>
      <div className="border-b border-solid w-full hover:bg-[#D9D9D9] text-center">
        <LogoutButton handleLogout={handleLogout} />
      </div>
    </div>
  );
};

export default DropDownMenu;
