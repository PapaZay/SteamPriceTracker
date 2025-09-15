import { FaLinkedin } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";


const Footer = () => {
    return (
        <footer className="bg-white dark:bg-darkblue border-t border-gray-200 dark:border-gray-700 mt-auto">
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex justify-center items-center text-3xl mb-2 space-x-4 text-gray-600 dark:text-gray-400">
                    <a href="https://www.linkedin.com/in/isaiahflagerhearan/" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500 transition-colors">
                    <FaLinkedin />
                    </a>
                    <a href="https://github.com/PapaZay" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500 transition-colors">
                    <FaGithub/>
                    </a>
                </div>
                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                    © 2025 SteamPriceTracker. Built by Isaiah Flager-Hearan
                </div>
            </div>

        </footer>
    )
}

export default Footer;