'use client';

import { Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecordingButtonProps {
  isRecording: boolean;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export function RecordingButton({
  isRecording,
  onClick,
  disabled = false,
  className,
}: RecordingButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 shadow-lg',
        isRecording ? 'bg-orange-500' : 'bg-teal-500 hover:bg-teal-600',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <Mic className="w-8 h-8 text-white" />
      {isRecording && (
        <>
          <span className="absolute inset-0 rounded-full animate-ping bg-orange-500/75" />
          <span className="absolute inset-0 rounded-full animate-pulse bg-orange-500/50" />
        </>
      )}
    </button>
  );
} 