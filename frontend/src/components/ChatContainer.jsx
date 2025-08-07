import ChatHeader from "./ChatHeader"
import ChatInputContainer from "./ChatInputContainer"
import ChatLayout from "./ChatLayout"

const ChatContainer = ({ sidebarOpen, setSidebarOpen, slowResponse, formatAIMessage, darkMode, user, setProfileDropdownOpen, profileDropdownOpen, setDarkMode, handleLogout, messages, loading, messagesEndRef, inputMessage, setInputMessage, handleKeyPress, sendMessage }) => {
    return (
        <div className={`flex-1 flex flex-col transition-all z-50 duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
            {/* Chat Header */}
            <ChatHeader
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                setSidebarOpen={setSidebarOpen}
                sidebarOpen={sidebarOpen}
                user={user}
                profileDropdownOpen={profileDropdownOpen}
                setProfileDropdownOpen={setProfileDropdownOpen}
                handleLogout={handleLogout} />

            {/* Main Content Area */}
            <ChatLayout
                darkMode={darkMode}
                messages={messages}
                user={user}
                formatAIMessage={formatAIMessage}
                messagesEndRef={messagesEndRef}
                slowResponse={slowResponse}
                loading={loading} />

            {/* Input Area */}
            <ChatInputContainer
                darkMode={darkMode}
                inputMessage={inputMessage}
                setInputMessage={setInputMessage}
                handleKeyPress={handleKeyPress}
                sendMessage={sendMessage}
                loading={loading} />
        </div>
    )
}

export default ChatContainer
