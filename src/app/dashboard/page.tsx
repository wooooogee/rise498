'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogOut, FileText, Anchor, Car, Home, Tv, Smartphone, Shield, Beaker, User } from 'lucide-react';

const TOP_PRODUCTS = [
  { id: 'rise498', name: '가전결합(상조+헬스케어)', icon: FileText, color: 'bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-xl shadow-indigo-200/60 border border-indigo-400/30', route: '/hub/rise498' },
  { id: 'goodhealth', name: '좋은건강크루즈', icon: Anchor, color: 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-xl shadow-blue-200/60 border border-blue-400/30', route: 'https://totalsign.netlify.app/apply/H?product=%EC%A2%8B%EC%9D%80%EA%B1%B4%EA%B0%95%ED%81%AC%EB%A3%A8%EC%A6%88' },
];

const BOTTOM_PRODUCTS = [
  { id: 'car', name: '자동차', icon: Car },
  { id: 'coway', name: '코웨이', icon: Home },
  { id: 'internet', name: '인터넷TV', icon: Tv },
  { id: 'mobile', name: '휴대폰', icon: Smartphone },
  { id: 'insurance', name: '보험', icon: Shield },
  { id: 'bio', name: '바이오', icon: Beaker },
];

export default function DashboardPage() {
  const router = useRouter();
  const [employeeInfo, setEmployeeInfo] = useState('');

  useEffect(() => {
    const role = sessionStorage.getItem('role');
    const info = sessionStorage.getItem('employeeInfo');
    if (role !== 'sales') {
      router.push('/');
    } else if (info) {
      try {
        const parsed = JSON.parse(info);
        // format: 코드, 코드명(사원명), 핸드폰번호
        const displayName = `${parsed.code}, ${parsed.codeName ? `${parsed.codeName}(${parsed.name})` : parsed.name}, ${parsed.phone}`;
        setEmployeeInfo(displayName);
      } catch(e) {
        setEmployeeInfo(info); // fallback if not json
      }
    }
  }, [router]);

  const handleLogout = () => {
    sessionStorage.clear();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9ff] to-[#f1f5f9] pb-12">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl px-6 py-4 shadow-sm border-b border-white/50 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-[14px] sm:text-[15px] font-black text-gray-800 tracking-tight">{employeeInfo || '영업자 대시보드'}</h1>
        </div>
        <button 
          onClick={handleLogout}
          className="p-2.5 rounded-xl bg-white text-gray-400 hover:text-indigo-600 shadow-sm border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/50 transition-all"
        >
          <LogOut size={20} />
        </button>
      </header>

      <main className="px-4 pt-6 pb-8 max-w-md mx-auto flex flex-col gap-6">
        {/* Top Products */}
        <section className="space-y-4">
          <div className="flex flex-col gap-3">
            {TOP_PRODUCTS.map((prod, idx) => (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={prod.id}
                onClick={() => {
                  if (prod.route.startsWith('http')) {
                    window.open(prod.route, '_blank');
                  } else {
                    router.push(prod.route);
                  }
                }}
                className={`w-full p-6 rounded-3xl ${prod.color} text-white flex items-center justify-start group hover:brightness-110 hover:-translate-y-0.5 active:scale-95 transition-all`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <prod.icon size={24} className="text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-[1.1rem] sm:text-xl font-black whitespace-nowrap tracking-tight">{prod.name}</h3>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Bottom Products */}
        <section className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {BOTTOM_PRODUCTS.map((prod, idx) => (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + idx * 0.05 }}
                key={prod.id}
                onClick={() => router.push(`/form/${prod.id}`)}
                className="bg-white p-4 rounded-3xl shadow-sm border border-white flex flex-col items-center justify-center gap-3 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-100/50 hover:text-indigo-600 hover:-translate-y-1 transition-all active:scale-95 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-gray-100 flex items-center justify-center text-gray-500 group-hover:from-indigo-50 group-hover:to-indigo-100 group-hover:border-indigo-200 group-hover:text-indigo-600 transition-all shadow-sm">
                  <prod.icon size={28} />
                </div>
                <span className="text-sm font-black text-gray-700">{prod.name}</span>
              </motion.button>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
