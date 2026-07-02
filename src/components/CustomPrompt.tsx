import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

interface CustomPromptProps {
  isOpen: boolean;
  message: string;
  placeholder?: string;
  type?: 'password' | 'text';
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export default function CustomPrompt({ isOpen, message, placeholder = '', type = 'text', onConfirm, onCancel }: CustomPromptProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setInputValue('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    onConfirm(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

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
            
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-indigo-50 text-indigo-500">
              <HelpCircle size={26} />
            </div>
            
            <div className="space-y-3 w-full">
              <p className="text-[15px] font-black text-gray-800 leading-relaxed whitespace-pre-wrap">{message}</p>
              <input
                ref={inputRef}
                type={type}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 text-sm font-medium transition-colors"
              />
            </div>
            
            <div className="flex gap-2 w-full mt-2">
              <button
                onClick={onCancel}
                className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-black text-sm transition-all active:scale-95"
              >
                취소
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
              >
                확인
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
