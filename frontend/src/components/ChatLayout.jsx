import FeatureCards from "./FeatureCards"
import LoadingIndicator from "./LoadingIndicator"

const ChatLayout = ({ darkMode, messages, user, formatAIMessage, messagesEndRef, slowResponse, loading }) => {
    return (
        <div className={`flex-1 overflow-y-auto shadow-sm px-6 py-4 transition-colors ${
            darkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-gray-50 via-blue-50 to-purple-50'
        }`}>
            <div className="max-w-4xl mx-auto">
                {/* Welcome Message */}
                {messages.length === 0 && (
                    <div className="flex flex-col justify-between items-center py-16">
                        <h2 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Hi {user?.username?.charAt(0).toUpperCase() + user?.username?.slice(1)}! I'm your virtual support
                        </h2>
                        <FeatureCards darkMode={darkMode} />
                    </div>
                )}

                {/* Messages Container */}
                <div className="space-y-6 pb-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex w-full ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex items-start space-x-2 max-w-[80%] ${
                                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                            }`}>
                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        message.type === 'user'
                                            ? 'bg-gradient-to-r from-purple-600 to-blue-600'
                                            : 'bg-gradient-to-r from-green-400 to-blue-500'
                                    }`}>
                                        {message.type === 'user' ? (
                                            <span className="text-white font-medium text-sm">
                                                {user?.username?.charAt(0).toUpperCase()}
                                            </span>
                                        ) : (
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                        )}
                                    </div>
                                </div>

                                {/* Message Bubble */}
                                <div className={`flex-1 px-4 py-3 rounded-2xl ${
                                    message.type === 'user'
                                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                                        : darkMode 
                                            ? 'bg-gray-700 text-white border border-gray-600' 
                                            : 'bg-white shadow-sm border border-gray-200 text-gray-900'
                                }`}>
                                    <div className={`text-sm leading-relaxed break-words ${
                                        message.type === 'ai' ? '' : 'whitespace-pre-wrap'
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

                    {/* Loading indicator */}
                    <LoadingIndicator
                        loading={loading}
                        darkMode={darkMode}
                        slowResponse={slowResponse}
                    />

                    <div ref={messagesEndRef} />
                </div>
            </div>
        </div>
    )
}

export default ChatLayout
