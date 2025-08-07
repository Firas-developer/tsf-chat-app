const FeatureCards = ({ darkMode }) => {
    return (
        <div className="mt-12 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                {/* Enhanced Accuracy */}
                <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-green-100 to-blue-100'}`}>
                        <svg className={`w-6 h-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Enhanced Accuracy
                    </h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Our advanced AI delivers answers with unparalleled accuracy
                    </p>
                </div>

                {/* Smart Assistance */}
                <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-purple-100 to-pink-100'}`}>
                        <svg className={`w-6 h-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Smart Assistance
                    </h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Get intelligent help with coding, writing, and problem-solving
                    </p>
                </div>

                {/* Seamless Experience */}
                <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-blue-100 to-cyan-100'}`}>
                        <svg className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Seamless Experience
                    </h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Offering a smooth and intuitive experience from start to finish
                    </p>
                </div>
            </div>
        </div>
    )
}

export default FeatureCards
