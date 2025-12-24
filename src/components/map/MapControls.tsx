'use client';

import { Button } from '@/components/ui/button';

interface MapControlsProps {
  onReset: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export default function MapControls({
  onReset,
  onZoomIn,
  onZoomOut,
}: MapControlsProps) {
  return (
    <div className="absolute bottom-24 right-4 flex flex-col gap-2">
      <Button
        variant="secondary"
        size="icon"
        onClick={onReset}
        className="bg-white hover:bg-gray-100 shadow-lg w-10 h-10"
        title="김제시 전체보기"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
          />
        </svg>
      </Button>
      <Button
        variant="secondary"
        size="icon"
        onClick={onZoomIn}
        className="bg-white hover:bg-gray-100 shadow-lg w-10 h-10"
        title="확대"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </Button>
      <Button
        variant="secondary"
        size="icon"
        onClick={onZoomOut}
        className="bg-white hover:bg-gray-100 shadow-lg w-10 h-10"
        title="축소"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
        </svg>
      </Button>
    </div>
  );
}
