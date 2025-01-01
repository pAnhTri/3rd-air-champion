interface LogoutButtonProps {
  handleLogout: () => void;
}

const LogoutButton = ({ handleLogout }: LogoutButtonProps) => {
  return (
    <button onClick={handleLogout} className="px-2 py-1">
      Logout
    </button>
  );
};

export default LogoutButton;
