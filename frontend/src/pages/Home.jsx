import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      title: "AI-Powered Conversations",
      description: "Experience intelligent conversations powered by Google Gemini AI",
      icon: "🤖"
    },
    {
      title: "Secure Authentication",
      description: "Your data is protected with JWT-based secure authentication",
      icon: "🔐"
    },
    {
      title: "Real-time Responses",
      description: "Get instant, intelligent responses to all your questions",
      icon: "⚡"
    },
    {
      title: "Beautiful Interface",
      description: "Enjoy a clean, modern, and responsive design experience",
      icon: "✨"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky bg-white top-0 z-20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">TSF</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Chat
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TSF Chat
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              Experience the future of AI conversations with our ChatGPT-like interface
              powered by Google Gemini AI
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Start Chatting Now
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl text-lg font-semibold hover:border-blue-600 hover:text-blue-600 transition-all duration-300"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-50 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-50 animate-bounce"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-pink-200 rounded-full opacity-50 animate-ping"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose TSF Chat?
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the powerful features that make TSF Chat your perfect AI companion
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-8 rounded-2xl border-2 transition-all duration-500 transform hover:scale-105 ${
                  index === currentFeature
                    ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-purple-50 shadow-xl'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg'
                }`}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-4xl font-bold text-gray-900 mb-8">
              See TSF Chat in Action
            </h3>
            <div className="bg-gray-900 rounded-2xl p-8 text-left shadow-2xl">
              <div className="flex items-center mb-6">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="ml-4 text-gray-400 text-sm">TSF Chat Demo</span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-lg max-w-xs">
                    Hello! Can you help me with a coding problem?
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-gray-700 text-white px-4 py-2 rounded-lg max-w-xs">
                    Of course! I'd be happy to help you with your coding problem. 
                    What specific issue are you working on?
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-lg max-w-xs">
                    Thanks! You're amazing! 🚀
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-6 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-300"></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-72 h-72 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
        </div>
        
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Ready to Experience the{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Future?
              </span>
            </h3>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of users who are already enjoying intelligent conversations with TSF Chat
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-lg font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative z-10 flex items-center">
                  Get Started for Free
                  <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl text-lg font-semibold hover:border-blue-600 hover:text-blue-600 hover:bg-white hover:shadow-lg transition-all duration-300"
              >
                Already have an account?
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 px-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full filter blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="flex justify-between gap-8 mb-8">
            {/* Brand Section */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
                <div className="w-14 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">TSF</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Chat
                </span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Experience the future of AI conversations with intelligent responses.
              </p>
            </div>

            {/* Quick Links */}
            <div className="text-start">
              <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
              <div className="space-y-2">
                <Link to="/" className="block text-gray-300 hover:text-blue-400 transition-colors duration-200">
                  Home
                </Link>
                <Link to="/login" className="block text-gray-300 hover:text-blue-400 transition-colors duration-200">
                  Login
                </Link>
                <Link to="/signup" className="block text-gray-300 hover:text-blue-400 transition-colors duration-200">
                  Sign Up
                </Link>
              </div>
            </div>

          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-400 text-sm">
                © 2025 TSF Chat. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
