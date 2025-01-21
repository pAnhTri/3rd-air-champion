import { FaDatabase, FaSync, FaUser } from "react-icons/fa";
import { TiUserAdd } from "react-icons/ti";
import { MdBedroomParent } from "react-icons/md";
import { ImExit } from "react-icons/im";
import AirBnBSyncButton from "./AirBnBSyncButton";
import LogoutButton from "./LogoutButton";
import RoomSyncButton from "./RoomSyncButton";
import AddGuestButton from "./AddGuestButton";
import AddRoomButton from "./AddRoomButton";

interface LogoutButtonProps {
  user: string;
  handleLogout: () => void;
  setIsDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DropDownMenu = ({
  user,
  handleLogout,
  setIsDropdownOpen,
}: LogoutButtonProps) => {
  return (
    <div className="absolute left-0 min-w-[160px] w-full bg-white rounded-md grid grid-rows-4 drop-shadow-md">
      {/* Options */}
      <div className="flex items-center border-b border-solid w-full hover:bg-[#D9D9D9]">
        <div className="basis-1/5 flex w-full items-center justify-center">
          <FaUser />
        </div>
        <div className="basis-4/5 py-1 px-2">{user}</div>
      </div>
      <div
        className="flex items-center border-b border-solid w-full hover:bg-[#D9D9D9]"
        onClick={() => setIsDropdownOpen(false)}
      >
        <div className="basis-1/5 flex w-full items-center justify-center">
          <TiUserAdd />
        </div>
        <div className="basis-4/5">
          <AddGuestButton />
        </div>
      </div>
      <div
        className="flex items-center border-b border-solid w-full hover:bg-[#D9D9D9]"
        onClick={() => setIsDropdownOpen(false)}
      >
        <div className="basis-1/5 flex w-full items-center justify-center">
          <MdBedroomParent />
        </div>
        <div className="basis-4/5">
          <AddRoomButton />
        </div>
      </div>
      <div
        className="flex items-center border-b border-solid w-full hover:bg-[#D9D9D9]"
        onClick={() => setIsDropdownOpen(false)}
      >
        <div className="basis-1/5 flex w-full items-center justify-center">
          <FaSync />
        </div>
        <div className="basis-4/5">
          <AirBnBSyncButton />
        </div>
      </div>
      <div
        className="flex items-center border-b border-solid w-full hover:bg-[#D9D9D9]"
        onClick={() => setIsDropdownOpen(false)}
      >
        <div className="basis-1/5 flex w-full items-center justify-center">
          <FaDatabase />
        </div>
        <div className="basis-4/5">
          <RoomSyncButton />
        </div>
      </div>
      <div
        className="flex items-center border-b border-solid w-full hover:bg-[#D9D9D9]"
        onClick={() => setIsDropdownOpen(false)}
      >
        <div className="basis-1/5 flex w-full items-center justify-center">
          <ImExit />
        </div>
        <div className="basis-4/5">
          <LogoutButton handleLogout={handleLogout} />
        </div>
      </div>
    </div>
  );
};

export default DropDownMenu;
