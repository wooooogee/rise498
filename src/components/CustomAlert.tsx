import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface CustomAlertProps {
  isOpen: boolean;
  message: string;
  type?: 'info' | 'success' | 'error';
  onClose: () => void;
}

export default function CustomAlert({ isOpen, message, type = 'info', onClose }: CustomAlertProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="bg-white rounded-[2rem] p-6 max-w-sm w-full shadow-2xl border border-gray-100/80 text-center flex flex-col items-center gap-4 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
            
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              type === 'success' 
                ? 'bg-emerald-50 text-emerald-500' 
                : type === 'error'
                  ? 'bg-rose-50 text-rose-500'
                  : 'bg-indigo-50 text-indigo-500'
            }`}>
              {type === 'success' ? (
                <CheckCircle2 size={26} />
              ) : (
                <AlertCircle size={26} />
              )}
            </div>
            
            <div className="space-y-2">
              <p className="text-[15px] font-black text-gray-800 leading-relaxed whitespace-pre-wrap">{message}</p>
            </div>
            
            <button
              onClick={onClose}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-95 mt-2"
            >
              확인
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
