import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Stethoscope, ClipboardList } from 'lucide-react';

export default function AIAdviceCard({ advice }) {
  // Theme colors matching the user's request (Teal & Emerald)
  const theme = {
    primaryText: "#115e59",   // Deep Teal
    secondaryText: "#334155", // Slate Gray
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-8 py-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Stethoscope className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-bold text-white">AI Medical Advisor</h3>
              <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
            </div>
            <p className="text-teal-100 text-sm">Personalized nutrition recommendations</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="flex items-start space-x-4 mb-6">
          <div className="p-2 bg-teal-50 rounded-lg">
            <ClipboardList className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-1">Your Personalized Report</h4>
            <p className="text-sm text-gray-500">Based on your BMI analysis</p>
          </div>
        </div>

        {/* The AI advice with ReactMarkdown */}
        <div className="bg-gradient-to-br from-gray-50 to-teal-50/30 rounded-xl p-6 border border-gray-100">
          <div className="font-sans text-gray-700 leading-relaxed text-[15px]">
            <ReactMarkdown 
              components={{
                strong: ({node, ...props}) => <span style={{ color: theme.primaryText, fontWeight: '800', backgroundColor: '#f0fdfa', padding: '0 4px', borderRadius: '4px' }} {...props} />,
                ul: ({node, ...props}) => <ul style={{ paddingLeft: '20px', marginBottom: '25px', listStyleType: 'circle' }} {...props} />,
                li: ({node, ...props}) => <li style={{ marginBottom: '12px' }} {...props} />,
                p: ({node, ...props}) => <p style={{ marginBottom: '20px' }} {...props} />,
              }}
            >
              {advice}
            </ReactMarkdown>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
          <p className="text-xs text-amber-700 leading-relaxed">
            <strong>Disclaimer:</strong> This AI-generated advice is for informational purposes only 
            and should not replace professional medical consultation. Always consult with a 
            qualified healthcare provider for personalized medical advice.
          </p>
        </div>
      </div>
    </div>
  );
}
