import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
const Navbar = () => {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [dark])

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white dark:bg-darkblue shadow-md">
      <div className="text-xl font-bold text-black dark:text-white">
        SteamPriceTracker
      </div>
      <div className="flex gap-4">
        <Link
          to="/"
          className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-black dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white"
        >
          Home
        </Link>
        <Link
          to="/login"
          className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-black dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-black dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white"
        >
          Register
        </Link>
        <button
          onClick={() => setDark(!dark)}
          className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 text-black dark:text-white"
        >
          {dark ? '☀️' : '🌙'}
        </button>
      </div>
    </nav>
  )
}

export default Navbar