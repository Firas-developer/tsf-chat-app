const ChatInputContainer = ({ darkMode, inputMessage, setInputMessage, handleKeyPress, sendMessage, loading }) => {
    return (
        <div className={`shadow-sm px-6 py-4 transition-colors ${darkMode
            ? 'bg-gray-800'
            : 'bg-gradient-to-r from-gray-50 via-blue-50 to-purple-50'}`}>
            <div className="max-w-4xl mx-auto">
                <div className={`flex items-center border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-500 transition-all duration-200 shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                    }`}>
                    <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Message TSF Chat..."
                        rows="1"
                        className={`flex-1 bg-transparent border-none outline-none resize-none py-1 min-h-[24px] max-h-[120px] ${darkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
                            }`}
                        style={{
                            lineHeight: '1.5',
                            overflowY: 'auto'
                        }}
                    />
                    <div className="flex items-center space-x-2 ml-3">
                        <button
                            type="button"
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Attach file"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                        </button>
                        <button
                            onClick={sendMessage}
                            disabled={!inputMessage.trim() || loading}
                            className={`p-2 rounded-lg transition-all duration-200 flex items-center justify-center ${!inputMessage.trim() || loading
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-purple-600 text-white hover:bg-purple-700 transform hover:scale-105'
                                }`}
                        >
                            {loading ? (
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-4">
                    <p className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        © TSF Chat | All rights reserved
                    </p>
                </div>
            </div>
        </div>
    )
}

export default ChatInputContainer
