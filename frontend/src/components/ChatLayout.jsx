import FeatureCards from "./FeatureCards"
import LoadingIndicator from "./LoadingIndicator"

const ChatLayout = ({ darkMode, messages, user, formatAIMessage, messagesEndRef, slowResponse, loading }) => {
    return (
        <div className={`flex flex-col h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-gray-50 via-blue-50 to-purple-50'}`}>
            {/* Welcome Message and Feature Cards - Fixed */}
            {messages.length === 0 && (
                <div className="flex-none px-4 sm:px-6 py-2 sm:py-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className={`text-lg sm:text-2xl font-bold mb-2 sm:mb-4 text-center ${
                            darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                            Hi {user?.username?.charAt(0).toUpperCase() + user?.username?.slice(1)}! I'm your virtual support
                        </h2>
                        <FeatureCards darkMode={darkMode} />
                    </div>
                </div>
            )}

            {/* Messages Container - Scrollable */}
            <div className={`flex-1 min-h-0 overflow-y-auto no-scrollbar ${
                darkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-gray-50 via-blue-50 to-purple-50'
            }`}>
                <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
                    <div className="space-y-3 sm:space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex w-full ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex items-start space-x-2 max-w-[85%] ${
                                    message.type === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                                }`}>
                                    {/* Avatar */}
                                    <div className="flex-shrink-0">
                                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                                            message.type === 'user'
                                                ? 'bg-gradient-to-r from-purple-600 to-blue-600'
                                                : 'bg-gradient-to-r from-green-400 to-blue-500'
                                        }`}>
                                            {message.type === 'user' ? (
                                                <span className="text-white font-medium text-xs sm:text-sm">
                                                    {user?.username?.charAt(0).toUpperCase()}
                                                </span>
                                            ) : (
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>

                                    {/* Message Bubble */}
                                    <div className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl ${
                                        message.type === 'user'
                                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                                            : darkMode 
                                                ? 'bg-gray-700 text-white border border-gray-600' 
                                                : 'bg-white shadow-sm border border-gray-200 text-gray-900'
                                    }`}>
                                        <div className={`text-xs sm:text-sm leading-relaxed break-words ${
                                            message.type === 'ai' ? 'prose dark:prose-invert max-w-none' : 'whitespace-pre-wrap'
                                        }`}>
                                            {message.type === 'ai' ? (
                                                <span dangerouslySetInnerHTML={{
                                                    __html: formatAIMessage(message.content)
                                                }} />
                                            ) : (
                                                message.content
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <LoadingIndicator
                            loading={loading}
                            darkMode={darkMode}
                            slowResponse={slowResponse}
                        />

                        <div ref={messagesEndRef} className="h-4" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatLayout
