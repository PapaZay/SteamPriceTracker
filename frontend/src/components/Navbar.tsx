import {Sun, Moon, Menu, X} from "lucide-react";
import {useTheme} from "../contexts/ThemeContext.tsx";
import {useState} from "react";
import { Link } from 'react-router-dom';
import {useAuth} from "../contexts/AuthContext.tsx";
import UserProfile from "./UserProfile.tsx";

const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {darkMode, setDarkMode} = useTheme();
  const {user, loading} = useAuth();

  return (
    <nav className="flex items-center justify-between px-2 sm:px-6 py-4 bg-white dark:bg-darkblue shadow-md">
        <div className="flex items-center justify-between w-full px-4 py-4">
        <Link to="/">
      <button className="flex items-center gap-2 sm:text-xl font-bold text-black bg-transparent dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700">
          <img src="/icons8-tags-windows-11-color-96.png" alt="SteamPriceTracker Logo" className="w-4 h-4 sm:w-5 sm:h-5" />
        SteamPriceTracker
         <span className="px-1 py-0.5 sm:px-2 sm:py-1 text-xs ml-1 sm:ml-2 text-white bg-blue-500 rounded align-super">Alpha</span>
      </button>
        </Link>

      <div className="hidden md:flex gap-1 sm:gap-4 items-center">
        <Link
          to="/"
          className="px-4 py-2 rounded hover:bg-gray-200 text-black dark:hover:bg-gray-700 dark:text-white"
        >
          Home
        </Link>
        {!loading && (
            user ? (
                <>
                    <Link to="/search"
                          className="px-4 py-2 rounded hover:bg-gray-200 text-black dark:hover:bg-gray-700 dark:text-white">
                        Search
                    </Link>
                    <Link to="/dashboard"
                          className="px-4 py-2 rounded hover:bg-gray-200 text-black dark:hover:bg-gray-700 dark:text-white">
                        Dashboard
                    </Link>
                    <Link to="/alerts"
                          className="px-4 py-2 rounded hover:bg-gray-200 text-black dark:hover:bg-gray-700 dark:text-white">
                        Alerts
                    </Link>
                <UserProfile />
                </>
            ) : (
                <>
        <Link
          to="/login"
          className="px-4 py-2 rounded bg-transparent text-black dark:hover:bg-gray-700 dark:text-white"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="px-4 py-2 rounded text-black bg-transparent dark:hover:bg-gray-700 dark:text-white"
        >
          Register
        </Link>
            </>
          )
          )}

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="px-4 py-2 rounded hover:bg-gray-200 bg-transparent text-black dark:hover:bg-gray-700 dark:text-white"
        >
          {darkMode ? <Sun className="h-5 w-5"/> : <Moon className="h-5 w-5"/>}
        </button>

      </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="sm:hidden p-2 rounded-md bg-transparent hover:bg-gray-200 text-black dark:hover:bg-gray-700 dark:text-white"
                    >
                {mobileMenuOpen ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6"/>}
            </button>
        </div>

        {mobileMenuOpen && (
            <div className="md:hidden bg-white dark:bg-darkblue border-t border-gray-200 dark:border-gray-700">
                <div className="px-4 py-2 space-y-2">
                    <Link to="/"
                          className="block px-4 py-2 rounded hover:bg-gray-200 text-black dark:hover:bg-gray-700 dark:text-white">
                        Home
                    </Link>
                    {!loading && (
                        user ? (
                            <>
                                <Link to="/search"
                                className="block px-4 py-2 rounded hover:bg-gray-200 text-black dark:hover:bg-gray-700 dark:text-white">
                                    Search
                                </Link>
                                <Link to="/dashboard"
                                className="block px-4 py-2 rounded hover:bg-gray-200 text-black dark:hover:bg-gray-700 dark:text-white">
                                    Dashboard
                                </Link>
                                <Link to="/alerts"
                                      className="block px-4 py-2 rounded hover:bg-gray-200 text-black dark:hover:bg-gray-700 dark:text-white">
                                    Alerts
                                </Link>
                                <UserProfile />
                            </>
                        ) : (
                            <>
                        <Link to="/login"
                        className="block px-4 py-2 rounded hover:bg-gray-200 text-black dark:hover:bg-gray-700 dark:text-white">
                        Login
                        </Link>
                        <Link to="/register"
                        className="block px-4 py-2 rounded hover:bg-gray-200 text-black dark:hover:bg-gray-700 dark:text-white">
                        Register
                        </Link>
                        </>
                        )
                    )}
                    <button onClick={() => setDarkMode(!darkMode)}
                            className="flex items-center gap-2 w-full px-4 py-2 rounded bg-transparent hover:bg-gray-200 text-black dark:hover:bg-gray-700 dark:text-white">
                        {darkMode ? <Sun className="h-5 w-5"/> : <Moon className="h-5 w-5"/>}
                        {darkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>
                </div>
            </div>
        )}
    </nav>
  )
}

export default Navbar