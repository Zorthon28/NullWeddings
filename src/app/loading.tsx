export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500"></div>
          <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full border-2 border-blue-500 opacity-20"></div>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Preparing your special day...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We're getting everything ready for you
          </p>
        </div>
      </div>
    </div>
  );
}
