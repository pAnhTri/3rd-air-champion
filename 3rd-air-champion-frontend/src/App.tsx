import { useEffect, useState } from "react";
import { fetchHost, getHost } from "./util/hostOperations";
import { hostType } from "./util/types/hostType";
import { useNavigate } from "react-router";
import NavBarDesktop from "./components/destkop/NavBar/NavBarDesktop";
import MainView from "./components/destkop/MainView/MainView";

function App() {
  const [host, setHost] = useState<hostType | null>(null); // Track host data
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(true); // Track loading state
  const [errorMessage, setErrorMessage] = useState<string>(""); // Track errors

  const navigate = useNavigate();

  // Initial data fetching to populate host
  useEffect(() => {
    if (!token) {
      navigate("/login"); // Redirect to login if no token
      return;
    }

    const hostId = getHost() as string;

    setIsLoading(true); // Start loading
    fetchHost(hostId, token as string)
      .then((result) => {
        setHost({ ...result, id: hostId });
        setIsLoading(false); // Data fetched, stop loading
      })
      .catch((err) => {
        console.error("Error fetching host:", err);
        setErrorMessage("Failed to fetch host data. Please try again.");
        setIsLoading(false); // Stop loading even on error
      });
  }, [token]);

  if (isLoading) {
    // Render loading screen
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (errorMessage) {
    // Render error message
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        {errorMessage}
      </div>
    );
  }

  // Render the host data once it's fetched
  return (
    host && (
      <div className="grid grid-rows-[80px_1fr] h-screen lg:grid-rows-[120px_1fr]">
        {/* Navbar */}
        <NavBarDesktop name={host?.name} />

        {/* Main Content Area */}
        <div className="grid grid-cols-5 overflow-hidden">
          <MainView calendarId={host.calendar}></MainView>
        </div>
      </div>
    )
  );
}

export default App;
