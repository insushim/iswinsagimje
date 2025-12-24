'use client';

export default function MapLegend() {
  return (
    <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4">
      <h4 className="font-semibold mb-3 text-sm text-gray-700">학교 규모</h4>
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow" />
          <span className="text-gray-600">정상 (61명 이상)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-white shadow" />
          <span className="text-gray-600">소규모 (31-60명)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow" />
          <span className="text-gray-600">매우소규모 (11-30명)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow" />
          <span className="text-gray-600">폐교위기 (10명 이하)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gray-500 border-2 border-white shadow" />
          <span className="text-gray-600">폐교</span>
        </div>
      </div>
    </div>
  );
}
