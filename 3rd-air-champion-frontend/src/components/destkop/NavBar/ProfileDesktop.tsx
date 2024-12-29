import { FaUserCircle } from "react-icons/fa";

interface ProfileDesktopProps {
  children: string;
}

const ProfileDesktop = ({ children }: ProfileDesktopProps) => {
  return (
    <div>
      <div className="hidden sm:flex items-center gap-x-2">
        <span className="text-[1.25rem] hidden sm:block">{children}</span>
        <FaUserCircle size={76} />
      </div>
      <div className="md:hidden items-center">
        <FaUserCircle size={48} />
      </div>
    </div>
  );
};

export default ProfileDesktop;
