import React from 'react';
import { Activity } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="relative">
        {/* Outer pulse ring */}
        <div className="absolute inset-0 w-24 h-24 rounded-full bg-teal-400/20 animate-ping" />
        
        {/* Inner rotating ring */}
        <div className="relative w-24 h-24 rounded-full border-4 border-teal-100 border-t-teal-500 animate-spin" />
        
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Activity className="w-8 h-8 text-teal-600 animate-pulse" />
        </div>
      </div>
      
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold text-teal-800">
          Generating Medical Report...
        </p>
        <p className="text-sm text-gray-500">
          Our AI is analyzing your health data
        </p>
      </div>
      
      {/* Progress dots */}
      <div className="flex space-x-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 bg-teal-500 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
