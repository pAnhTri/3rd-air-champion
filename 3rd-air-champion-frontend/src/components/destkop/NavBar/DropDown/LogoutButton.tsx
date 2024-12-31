interface LogoutButtonProps {
  handleLogout: () => void;
}

const LogoutButton = ({ handleLogout }: LogoutButtonProps) => {
  return (
    <button
      onClick={handleLogout}
      className="w-full px-2 py-1 text-white bg-red-500 hover:bg-red-600"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
