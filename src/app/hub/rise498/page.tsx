'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckSquare, FileText } from 'lucide-react';

export default function HubRise498Page() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12 flex flex-col items-center">
      {/* Header with back button */}
      <header className="w-full max-w-md bg-transparent px-4 py-6 flex items-center z-10">
        <button 
          onClick={() => router.push('/dashboard')} 
          className="p-2 -ml-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
      </header>

      <main className="w-full max-w-md px-6 flex flex-col items-center">
        {/* Title */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 w-full flex justify-center relative"
        >
          <h1 className="text-3xl font-black text-gray-900 tracking-tight drop-shadow-sm">더좋은라이즈498</h1>
          {/* Decorative line under title */}
          <div className="absolute -bottom-4 w-48 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
        </motion.div>

        <div className="w-full mb-8">
          <div className="text-center mb-3">
            <span className="text-sm font-black text-red-600 tracking-wider">(필수)</span>
          </div>

        {/* Step 1 */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full mb-4"
        >
          <button 
            onClick={() => window.open('https://t.amobile.co.kr/or/default2.aspx?aid=13445', '_blank')}
            className="w-full relative overflow-hidden bg-gradient-to-r from-[#7f7bb2] to-[#605a8d] text-white p-5 rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 group"
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
            <div className="flex items-center justify-center gap-3">
              <FileText size={22} className="opacity-90" />
              <span className="text-[17px] font-black tracking-tight drop-shadow-sm">가전제품(스마트렌탈) 전자청약</span>
            </div>
          </button>
        </motion.section>

        {/* Step 2 */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full mb-4"
        >
          <button 
            onClick={() => {
              let url = 'https://totalsign.netlify.app/apply/Z?product=%EB%8D%94%EC%A2%8B%EC%9D%80%EB%9D%BC%EC%9D%B4%EC%A6%88498';
              const empStr = localStorage.getItem('employeeInfo');
              if (empStr) {
                try {
                  const emp = JSON.parse(empStr);
                  const params = new URLSearchParams();
                  if (emp.code) params.append('salesCode', emp.code);
                  if (emp.name) params.append('salesName', emp.name);
                  if (emp.codeName) params.append('salesCodeName', emp.codeName);
                  if (emp.phone) params.append('salesPhone', emp.phone);
                  if (emp.branch) params.append('salesBranch', emp.branch);
                  if (emp.agency) params.append('salesAgency', emp.agency);
                  if (emp.hq) params.append('salesHq', emp.hq);
                  
                  const paramStr = params.toString();
                  if (paramStr) {
                    url += '&' + paramStr;
                  }
                } catch (e) {}
              }
              window.open(url, '_blank');
            }}
            className="w-full relative overflow-hidden bg-gradient-to-r from-[#7a7cc7] to-[#6b6da3] text-white p-5 rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 group"
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
            <div className="flex items-center justify-center gap-3">
              <CheckSquare size={22} className="opacity-90" />
              <span className="text-[17px] font-black tracking-tight drop-shadow-sm">라이프서비스 회원가입신청서</span>
            </div>
          </button>
        </motion.section>
        </div>

        {/* Step 3 */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full mt-4"
        >
          <div className="text-center mb-3">
            <span className="text-sm font-black text-gray-900 tracking-wider">제휴카드(선택)</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => window.open('https://m.lottecard.co.kr/spa/card/booth?bId=96521&vtCdKndC=P13791-A13791', '_blank')}
              className="relative overflow-hidden bg-gradient-to-br from-[#8e9092] to-[#7f8183] text-white p-4 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-95 flex flex-col items-center justify-center min-h-[90px] group"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
              <span className="text-[13px] font-black leading-tight text-center drop-shadow-sm">LOCA X Special SE<br/>(롯데카드)</span>
            </button>
            <button 
              onClick={() => window.open('https://card.kbcard.com/CRD/DVIEW/HCAMCXPRICAC0076?cooperationcode=04487&mainCC=a&solicitorcode=7039000039', '_blank')}
              className="relative overflow-hidden bg-gradient-to-br from-[#f8ce9a] to-[#eec18c] text-[#937149] p-4 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-95 flex flex-col items-center justify-center min-h-[90px] group"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
              <span className="text-[13px] font-black leading-tight text-center drop-shadow-sm">KB스마트렌탈카드<br/>(국민카드)</span>
            </button>
          </div>
        </motion.section>

      </main>
    </div>
  );
}
