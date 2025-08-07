import { useState, useMemo } from 'react';

const Sidebar = ({
    sidebarOpen,
    darkMode,
    createNewConversation,
    setSidebarOpen,
    loadingConversations,
    categorizedConversations,
    loadConversation,
    currentConversationId,
    conversations,
    deleteConversation
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Filter conversations based on search term
    const filteredCategories = useMemo(() => {
        if (!searchTerm) return categorizedConversations;

        const filterConversations = (convs) => {
            return convs.filter(conv =>
                conv.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                conv.last_message?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        };

        return {
            today: filterConversations(categorizedConversations.today),
            yesterday: filterConversations(categorizedConversations.yesterday),
            thisWeek: filterConversations(categorizedConversations.thisWeek),
            lastWeek: filterConversations(categorizedConversations.lastWeek),
            thisMonth: filterConversations(categorizedConversations.thisMonth),
            lastMonth: filterConversations(categorizedConversations.lastMonth),
            older: filterConversations(categorizedConversations.older)
        };
    }, [categorizedConversations, searchTerm]);

    // Check if any conversations match the search
    const hasResults = Object.values(filteredCategories).some(category => category.length > 0);

    return (
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-60 w-64 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg transform transition-transform duration-300 ease-in-out`}>
            <div className="flex flex-col h-full">
                {/* Sidebar Header */}
                <div className={`flex items-center justify-between p-4`}>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className={`p-2 rounded-lg cursor-pointer block lg:hidden transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                            title="Close Sidebar"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="w-10 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">TSF</span>
                        </div>
                        <div>
                            <h1 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>Chat</h1>
                        </div>
                    </div>
                    <button
                        onClick={createNewConversation}
                        className={`p-2 rounded-lg cursor-pointer transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                        title="New Chat"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>

                {/* Search */}
                <div className="px-4 mb-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search Chat"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm transition-colors ${darkMode
                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                                } focus:ring-2 focus:ring-purple-500/20 focus:outline-none`}
                        />
                        <svg className={`w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'
                                    }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Chat History */}
                <div className="flex-1 overflow-y-auto px-4">
                    {loadingConversations ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="p-3 rounded-lg bg-gray-100 animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {!hasResults && searchTerm && (
                                <p className={`text-sm text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    No conversations found matching
                                </p>
                            )}

                            {/* Today */}
                            {filteredCategories.today.length > 0 && (
                                <div>
                                    <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Today</h4>
                                    <div className="space-y-2">
                                        {filteredCategories.today.map((conversation) => (
                                            <div
                                                key={conversation.id}
                                                onClick={() => loadConversation(conversation.id)}
                                                className={`p-3 rounded-lg cursor-pointer border transition-all duration-200 relative group ${currentConversationId === conversation.id
                                                        ? darkMode ? 'bg-purple-900/50 border-purple-500' : 'bg-purple-50 border-purple-200'
                                                        : darkMode ? 'hover:bg-gray-700 border-transparent hover:border-gray-600' : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                            {conversation.title}
                                                        </h4>
                                                        {conversation.last_message && (
                                                            <p className={`text-xs mt-1 truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                {conversation.last_message}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={(e) => deleteConversation(conversation.id, e)}
                                                        className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${darkMode
                                                                ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300'
                                                                : 'hover:bg-red-50 text-red-500 hover:text-red-600'
                                                            }`}
                                                        title="Delete conversation"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Yesterday */}
                            {filteredCategories.yesterday.length > 0 && (
                                <div>
                                    <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Yesterday</h4>
                                    <div className="space-y-2">
                                        {filteredCategories.yesterday.map((conversation) => (
                                            <div
                                                key={conversation.id}
                                                onClick={() => loadConversation(conversation.id)}
                                                className={`p-3 rounded-lg cursor-pointer border transition-all duration-200 relative group ${currentConversationId === conversation.id
                                                        ? darkMode ? 'bg-purple-900/50 border-purple-500' : 'bg-purple-50 border-purple-200'
                                                        : darkMode ? 'hover:bg-gray-700 border-transparent hover:border-gray-600' : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                            {conversation.title}
                                                        </h4>
                                                        {conversation.last_message && (
                                                            <p className={`text-xs mt-1 truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                {conversation.last_message}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={(e) => deleteConversation(conversation.id, e)}
                                                        className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${darkMode
                                                                ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300'
                                                                : 'hover:bg-red-50 text-red-500 hover:text-red-600'
                                                            }`}
                                                        title="Delete conversation"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* This Week */}
                            {filteredCategories.thisWeek.length > 0 && (
                                <div>
                                    <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>This Week</h4>
                                    <div className="space-y-2">
                                        {filteredCategories.thisWeek.map((conversation) => (
                                            <div
                                                key={conversation.id}
                                                onClick={() => loadConversation(conversation.id)}
                                                className={`p-3 rounded-lg cursor-pointer border transition-all duration-200 relative group ${currentConversationId === conversation.id
                                                        ? darkMode ? 'bg-purple-900/50 border-purple-500' : 'bg-purple-50 border-purple-200'
                                                        : darkMode ? 'hover:bg-gray-700 border-transparent hover:border-gray-600' : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                            {conversation.title}
                                                        </h4>
                                                        {conversation.last_message && (
                                                            <p className={`text-xs mt-1 truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                {conversation.last_message}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={(e) => deleteConversation(conversation.id, e)}
                                                        className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${darkMode
                                                                ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300'
                                                                : 'hover:bg-red-50 text-red-500 hover:text-red-600'
                                                            }`}
                                                        title="Delete conversation"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Last Week */}
                            {filteredCategories.lastWeek.length > 0 && (
                                <div>
                                    <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Last Week</h4>
                                    <div className="space-y-2">
                                        {filteredCategories.lastWeek.map((conversation) => (
                                            <div
                                                key={conversation.id}
                                                onClick={() => loadConversation(conversation.id)}
                                                className={`p-3 rounded-lg cursor-pointer border transition-all duration-200 relative group ${currentConversationId === conversation.id
                                                        ? darkMode ? 'bg-purple-900/50 border-purple-500' : 'bg-purple-50 border-purple-200'
                                                        : darkMode ? 'hover:bg-gray-700 border-transparent hover:border-gray-600' : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                            {conversation.title}
                                                        </h4>
                                                        {conversation.last_message && (
                                                            <p className={`text-xs mt-1 truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                {conversation.last_message}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={(e) => deleteConversation(conversation.id, e)}
                                                        className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${darkMode
                                                                ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300'
                                                                : 'hover:bg-red-50 text-red-500 hover:text-red-600'
                                                            }`}
                                                        title="Delete conversation"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* This Month */}
                            {filteredCategories.thisMonth.length > 0 && (
                                <div>
                                    <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>This Month</h4>
                                    <div className="space-y-2">
                                        {filteredCategories.thisMonth.map((conversation) => (
                                            <div
                                                key={conversation.id}
                                                onClick={() => loadConversation(conversation.id)}
                                                className={`p-3 rounded-lg cursor-pointer border transition-all duration-200 relative group ${currentConversationId === conversation.id
                                                        ? darkMode ? 'bg-purple-900/50 border-purple-500' : 'bg-purple-50 border-purple-200'
                                                        : darkMode ? 'hover:bg-gray-700 border-transparent hover:border-gray-600' : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                            {conversation.title}
                                                        </h4>
                                                        {conversation.last_message && (
                                                            <p className={`text-xs mt-1 truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                {conversation.last_message}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={(e) => deleteConversation(conversation.id, e)}
                                                        className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${darkMode
                                                                ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300'
                                                                : 'hover:bg-red-50 text-red-500 hover:text-red-600'
                                                            }`}
                                                        title="Delete conversation"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Last Month */}
                            {filteredCategories.lastMonth.length > 0 && (
                                <div>
                                    <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Last Month</h4>
                                    <div className="space-y-2">
                                        {filteredCategories.lastMonth.map((conversation) => (
                                            <div
                                                key={conversation.id}
                                                onClick={() => loadConversation(conversation.id)}
                                                className={`p-3 rounded-lg cursor-pointer border transition-all duration-200 relative group ${currentConversationId === conversation.id
                                                        ? darkMode ? 'bg-purple-900/50 border-purple-500' : 'bg-purple-50 border-purple-200'
                                                        : darkMode ? 'hover:bg-gray-700 border-transparent hover:border-gray-600' : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                            {conversation.title}
                                                        </h4>
                                                        {conversation.last_message && (
                                                            <p className={`text-xs mt-1 truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                {conversation.last_message}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={(e) => deleteConversation(conversation.id, e)}
                                                        className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${darkMode
                                                                ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300'
                                                                : 'hover:bg-red-50 text-red-500 hover:text-red-600'
                                                            }`}
                                                        title="Delete conversation"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Older */}
                            {filteredCategories.older.length > 0 && (
                                <div>
                                    <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Older</h4>
                                    <div className="space-y-2">
                                        {filteredCategories.older.map((conversation) => (
                                            <div
                                                key={conversation.id}
                                                onClick={() => loadConversation(conversation.id)}
                                                className={`p-3 rounded-lg cursor-pointer border transition-all duration-200 relative group ${currentConversationId === conversation.id
                                                        ? darkMode ? 'bg-purple-900/50 border-purple-500' : 'bg-purple-50 border-purple-200'
                                                        : darkMode ? 'hover:bg-gray-700 border-transparent hover:border-gray-600' : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                            {conversation.title}
                                                        </h4>
                                                        {conversation.last_message && (
                                                            <p className={`text-xs mt-1 truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                {conversation.last_message}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={(e) => deleteConversation(conversation.id, e)}
                                                        className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${darkMode
                                                                ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300'
                                                                : 'hover:bg-red-50 text-red-500 hover:text-red-600'
                                                            }`}
                                                        title="Delete conversation"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {conversations.length === 0 && !searchTerm && (
                                <p className={`text-sm font-semibold text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    No conversations yet. <br /> Start a new chat!
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
