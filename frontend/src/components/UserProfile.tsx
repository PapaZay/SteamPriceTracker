import {useAuth} from "../contexts/AuthContext.tsx";
import {LogOut, User, ChevronDown} from "lucide-react";
import {useState, useRef, useEffect} from "react";

const UserProfile = () => {
    const {user, signOut} = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const AvatarUrl = () => {
        return user?.user_metadata?.avatar_url;
    };

    const getUserName = () => {
        return user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
            user?.email?.split('@')[0] ||
            'User';
    };
    const handleSignOut = async () => {
        await signOut();
        setIsOpen(false);
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button className="flex items-center gap-2 p-2 rounded-lg bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setIsOpen(!isOpen)}
            >
                {AvatarUrl() ? (
                    <img src={AvatarUrl()}
                         alt="Avatar"
                         className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:border-gray-600 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-700 dark:text-gray-300"/>
                    </div>
                )}
                <ChevronDown className={`w-4 h-4 text-gray-600 dark:text-gray-300 transition-transform ${isOpen ? 'rotate-180' : ''}`}/>
            </button>

            {isOpen && (
                <div className="absolute right-0 w-56 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            {AvatarUrl() ? (
                                <img src={AvatarUrl()}
                                alt="Avatar"
                                className="w-10 h-10 rounded-full object-cover"
                                />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                        <User className="w-6 h-6 text-gray-600 dark:text-gray-300"/>
                                    </div>
                                )}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                    {getUserName()}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                </div>
                    <div className="p-2">
                        <button className="w-full flex items-center gap-3 px-3 py-2 text-left bg-transparent text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                onClick={handleSignOut}
                        >
                            <LogOut className="w-4 h-4"/>
                            Sign Out
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default UserProfile;