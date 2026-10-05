import React from 'react';
import { sound } from '../utils/audio.ts';

interface IOSSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  formatValue?: (val: number) => string;
  labels?: string[];
  ticks?: number[];
  ariaLabel: string;
}

export const IOSSlider: React.FC<IOSSliderProps> = ({
  value,
  min,
  max,
  step = 1,
  onChange,
  formatValue,
  labels,
  ticks,
  ariaLabel,
}) => {
  const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = Number(e.target.value);
    if (nextVal !== value) {
      sound.playClick();
      onChange(nextVal);
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Slider Track Container */}
      <div className="relative flex items-center select-none py-2">
        {/* Visual Track */}
        <div className="relative h-2 w-full rounded-full bg-white/[0.1] overflow-hidden">
          {/* Active Filled Track */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-indigo-500 rounded-full transition-all duration-75"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Custom iOS Thumb - Solid Pure White Circle */}
        <div
          className="pointer-events-none absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-transform duration-75"
          style={{ left: `${percentage}%` }}
        >
          <div className="h-6 w-6 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.45)] border border-black/10" />
        </div>

        {/* Native Transparent Slider for Touch, Drag & Accessibility */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          aria-label={ariaLabel}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer touch-none z-10"
        />
      </div>

      {/* Optional Step Labels underneath */}
      {labels && labels.length > 0 && (
        <div className="flex justify-between items-center text-xs text-neutral-400 font-medium px-1">
          {labels.map((lbl, idx) => {
            const stepVal = min + idx * ((max - min) / (labels.length - 1));
            const isActive = Math.round(value) === Math.round(stepVal);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  sound.playClick();
                  onChange(stepVal);
                }}
                className={`transition-colors focus:outline-none ${
                  isActive ? 'text-white font-bold' : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {lbl}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
