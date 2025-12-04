import React, { useEffect } from 'react';
import { AlertCircle, X, ServerCrash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ErrorToast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 8000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="fixed top-6 right-6 z-50 max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-red-100 overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-rose-500 px-4 py-2">
            <div className="flex items-center space-x-2">
              <ServerCrash className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">Connection Error</span>
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-red-50 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1">
                <p className="text-gray-700 text-sm leading-relaxed">{message}</p>
                <p className="text-gray-400 text-xs mt-2">
                  Please check if the server is running and try again.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
