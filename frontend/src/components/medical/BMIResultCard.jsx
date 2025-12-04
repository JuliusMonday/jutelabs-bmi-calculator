import React from 'react';
import { Scale, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function BMIResultCard({ bmiScore }) {
  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: TrendingDown };
    if (bmi < 25) return { label: 'Normal', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: Minus };
    if (bmi < 30) return { label: 'Overweight', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: TrendingUp };
    return { label: 'Obese', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: TrendingUp };
  };

  const category = getBMICategory(bmiScore);
  const CategoryIcon = category.icon;

  // Calculate position on the scale (0-40 BMI range)
  const scalePosition = Math.min(Math.max((bmiScore / 40) * 100, 2), 98);

  return (
    <div className={`relative overflow-hidden rounded-2xl ${category.bg} ${category.border} border-2 p-8 transition-all duration-500`}>
      {/* Decorative background pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <Scale className="w-full h-full" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl ${category.color} bg-white shadow-sm`}>
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Your BMI Score</p>
              <div className="flex items-center space-x-2">
                <CategoryIcon className={`w-5 h-5 ${category.color}`} />
                <span className={`text-sm font-semibold ${category.color}`}>{category.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Large BMI number */}
        <div className="text-center mb-8">
          <span className={`text-7xl font-bold ${category.color} tracking-tight`}>
            {bmiScore.toFixed(1)}
          </span>
          <span className="text-2xl text-gray-400 ml-2">kg/m²</span>
        </div>

        {/* BMI Scale visualization */}
        <div className="relative">
          <div className="h-3 rounded-full bg-gradient-to-r from-blue-400 via-emerald-400 via-amber-400 to-red-400 overflow-hidden">
            <div className="h-full w-full opacity-30 bg-white" />
          </div>
          
          {/* Indicator */}
          <div 
            className="absolute -top-1 w-5 h-5 bg-white border-4 border-gray-800 rounded-full shadow-lg transform -translate-x-1/2 transition-all duration-700"
            style={{ left: `${scalePosition}%` }}
          />
          
          {/* Scale labels */}
          <div className="flex justify-between mt-3 text-xs text-gray-500">
            <span>Underweight</span>
            <span>Normal</span>
            <span>Overweight</span>
            <span>Obese</span>
          </div>
        </div>
      </div>
    </div>
  );
}
