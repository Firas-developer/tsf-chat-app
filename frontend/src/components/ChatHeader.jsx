const ChatHeader = ({ darkMode, setDarkMode, setSidebarOpen, sidebarOpen, user, profileDropdownOpen, setProfileDropdownOpen, handleLogout }) => {
    return (
        <div className={`shadow-sm border-b px-6 py-4 transition-colors ${darkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-gradient-to-r from-gray-50 via-blue-50 to-purple-50 border-gray-200/50'
            }`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className={`p-2 rounded-lg transition-colors ${darkMode
                            ? 'hover:bg-gray-700 text-gray-400'
                            : 'hover:bg-white/80 text-gray-600'
                            }`}
                        title="Toggle Sidebar"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
                <div className="flex items-center space-x-4">
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Hello {user?.username?.charAt(0).toUpperCase() + user?.username?.slice(1)}!
                    </span>
                    <div className="relative profile-dropdown">
                        <button
                            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                            className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center hover:shadow-lg transition-all duration-200"
                        >
                            <span className="text-white font-medium text-sm">
                                {user?.username?.charAt(0).toUpperCase()}
                            </span>
                        </button>

                        {/* Profile Dropdown */}
                        {profileDropdownOpen && (
                            <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border py-2 z-50 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                                }`}>
                                <div className={`px-4 py-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                                    <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {user?.username?.charAt(0).toUpperCase() + user?.username?.slice(1)}
                                    </p>
                                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email}</p>
                                </div>

                                <button
                                    onClick={() => {
                                        setDarkMode(!darkMode);
                                        setProfileDropdownOpen(false);
                                    }}
                                    className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {darkMode ? (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                        ) : (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                        )}
                                    </svg>
                                    {darkMode ? 'Light Mode' : 'Dark Mode'}
                                </button>

                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setProfileDropdownOpen(false);
                                    }}
                                    className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${darkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-red-50'
                                        }`}
                                >
                                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatHeader
