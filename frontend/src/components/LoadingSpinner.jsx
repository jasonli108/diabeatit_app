/**
 * Loading Spinner Component
 * Full-screen loading overlay
 */

function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 shadow-xl flex flex-col items-center gap-4">
        {/* Animated spinner */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-green-200 rounded-full" />
          <div className="absolute inset-0 border-4 border-transparent border-t-green-600 rounded-full animate-spin" />
        </div>
        
        {/* Loading message */}
        <p className="text-gray-600 text-sm font-medium">{message}</p>
        
        {/* Animated dots */}
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

export default LoadingSpinner;