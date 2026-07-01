'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { verifyLogin, searchEmployeesAction } from '@/app/actions';
import { User, Search, ArrowRight, X } from 'lucide-react';
import Image from 'next/image';
import CustomAlert from '@/components/CustomAlert';

export default function LoginPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [alertState, setAlertState] = useState<{ isOpen: boolean; message: string; type?: 'info' | 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'info'
  });
  const router = useRouter();

  const showAlert = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setAlertState({ isOpen: true, message, type });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm) {
      showAlert('검색어를 입력해주세요.', 'info');
      return;
    }

    setIsSearching(true);
    try {
      const res = await searchEmployeesAction(searchTerm);
      if (res.success && 'data' in res && res.data && res.data.length > 0) {
        setSearchResults(res.data);
      } else {
        setSearchResults([]);
        showAlert('일치하는 정보가 없습니다.', 'error');
      }
    } catch (error) {
      showAlert('검색 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectEmployee = (emp: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('role', 'sales');
      // format and save employeeInfo as JSON string
      localStorage.setItem('employeeInfo', JSON.stringify({
        code: emp.code,
        name: emp.name,
        phone: emp.phone,
        branch: emp.branch,
        codeName: emp.codeName
      }));
    }
    router.push('/dashboard');
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminCode) return;
    
    setIsAdminLoading(true);
    try {
      const result = await verifyLogin('admin', adminCode);
      if (result.success) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('role', 'admin');
        }
        router.push('/admin');
      } else {
        showAlert(result.message, 'error');
      }
    } catch (error) {
      showAlert('로그인 오류가 발생했습니다.', 'error');
    } finally {
      setIsAdminLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 relative">
      
      {/* Hidden Admin Trigger (Top Right Corner) */}
      <div 
        className="absolute top-0 right-0 w-16 h-16 cursor-default z-50"
        onClick={() => setShowAdminLogin(true)}
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-xl shadow-indigo-500/5 border border-indigo-50"
      >
        <div className="text-center mb-8 flex justify-center">
          <img 
            src="/logo.png" 
            alt="RISE Logo" 
            className="h-32 object-contain"
            onError={(e) => {
              // Fallback if image doesn't exist yet
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x120?text=RISE+LOGO';
            }}
          />
        </div>

        <form onSubmit={handleSearch} className="space-y-6">
          <div className="space-y-2">
            <div className="relative group">
              <input
                type="text"
                placeholder="사원코드, 코드명 또는 핸드폰 번호"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-6 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-gray-900 pr-14"
              />
              <button 
                type="submit" 
                disabled={isSearching}
                className="absolute right-3 top-3 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
              >
                <Search size={18} />
              </button>
            </div>
          </div>
        </form>

        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 space-y-2 overflow-hidden"
            >
              <p className="text-xs font-bold text-gray-400 mb-3 px-2">검색 결과 ({searchResults.length}건)</p>
              <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
                {searchResults.map((emp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectEmployee(emp)}
                    className="w-full text-left bg-gray-50 hover:bg-indigo-50 border border-gray-100 p-4 rounded-2xl transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-sm font-black text-gray-900 group-hover:text-indigo-700">
                        {emp.codeName || emp.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {emp.code} | {emp.phone || '-'}
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Admin Login Modal (Hidden by default) */}
      <AnimatePresence>
        {showAdminLogin && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative"
            >
              <button 
                onClick={() => setShowAdminLogin(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <h2 className="text-lg font-black text-gray-900 mb-6">관리자 로그인</h2>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <input
                  type="password"
                  placeholder="관리자 비밀번호"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isAdminLoading}
                  className="w-full py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-all disabled:opacity-50"
                >
                  {isAdminLoading ? '확인 중...' : '접속'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CustomAlert 
        isOpen={alertState.isOpen} 
        message={alertState.message} 
        type={alertState.type} 
        onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))} 
      />
    </div>
  );
}
