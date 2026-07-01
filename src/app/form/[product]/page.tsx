'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import RegistrationForm from '@/components/RegistrationForm';
import { getFormConfigAction, submitDynamicFormAction } from '@/app/actions';
import { ArrowLeft, Send } from 'lucide-react';
import CustomAlert from '@/components/CustomAlert';

const PRODUCT_NAMES: any = {
  car: '자동차',
  coway: '코웨이',
  internet: '인터넷TV',
  mobile: '휴대폰',
  insurance: '보험',
  bio: '바이오',
};

export default function FormPage() {
  const params = useParams();
  const router = useRouter();
  const product = params.product as string;
  
  const [alertState, setAlertState] = useState<{ isOpen: boolean; message: string; type?: 'info' | 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'info'
  });

  const showAlert = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setAlertState({ isOpen: true, message, type });
  };
  
  const [config, setConfig] = useState<any[]>([
    { id: 'address', label: '주소', type: 'text' },
    { id: 'memo', label: '메모 (선택)', type: 'textarea' }
  ]);
  const [formData, setFormData] = useState<any>({ name: '', phone: '', address: '', memo: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [salesInfo, setSalesInfo] = useState({ affiliation: '', name: '', phone: '' });

  useEffect(() => {
    const role = localStorage.getItem('role');
    const info = localStorage.getItem('employeeInfo');
    if (role !== 'sales') {
      router.push('/');
      return;
    }
    
    const searchParams = new URLSearchParams(window.location.search);
    const salesName = searchParams.get('salesName') || searchParams.get('salesCodeName');
    const salesPhone = searchParams.get('salesPhone');
    const salesAffiliation = searchParams.get('salesBranch') || searchParams.get('salesAffiliation');
    
    if (salesName || salesPhone || salesAffiliation) {
      setSalesInfo({
        affiliation: salesAffiliation || '',
        name: salesName || '',
        phone: salesPhone ? salesPhone.replace(/[^0-9]/g, '').replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, '$1-$2-$3') : '',
      });
    } else if (info) {
      try {
        const parsed = JSON.parse(info);
        setSalesInfo({
          affiliation: parsed.branch || '',
          name: parsed.name || '',
          phone: parsed.phone || ''
        });
      } catch (e) {
        console.error('Error parsing employeeInfo', e);
      }
    }

    if (product !== 'rise498' && product !== 'goodhealth') {
      getFormConfigAction(product).then((res) => {
        if (res.success && res.config.length > 0) {
          setConfig(res.config);
          // merge existing data
          setFormData((prev: any) => {
            const newData = { ...prev };
            res.config.forEach((c: any) => {
              if (newData[c.id] === undefined) newData[c.id] = '';
            });
            return newData;
          });
        }
      });
    }
  }, [product, router]);

  if (product === 'rise498' || product === 'goodhealth') {
    // Inject product info if needed, for now just render RegistrationForm
    return <RegistrationForm />;
  }

  const handleChange = (id: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      showAlert('성명과 연락처는 필수입니다.', 'info');
      return;
    }
    setIsSubmitting(true);
    const dataToSubmit = {
      '영업자소속': salesInfo.affiliation,
      '영업자': salesInfo.name,
      '영업자연락처': salesInfo.phone,
      '고객명': formData.name,
      '연락처': formData.phone,
      ...formData
    };
    
    // remove duplicate keys if needed
    delete dataToSubmit.name;
    delete dataToSubmit.phone;

    const res = await submitDynamicFormAction(product, dataToSubmit);
    setIsSubmitting(false);
    if (res.success) {
      showAlert('성공적으로 접수되었습니다.', 'success');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } else {
      showAlert(res.message || '오류가 발생했습니다.', 'error');
    }
  };

  if (isLoading) return <div className="p-10 text-center">Loading...</div>;

  const productName = PRODUCT_NAMES[product] || product;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      <header className="bg-white px-6 py-4 shadow-sm flex items-center sticky top-0 z-10">
        <button onClick={() => router.push('/dashboard')} className="p-2 -ml-2 rounded-xl text-gray-500 hover:bg-gray-50">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-black text-gray-900 tracking-tight ml-2">{productName} 간편 접수</h1>
      </header>

      <main className="max-w-md mx-auto p-4 mt-4">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 ml-1">성명 (필수)</label>
            <input 
              type="text" 
              placeholder="고객 성명"
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-6 focus:border-indigo-500 focus:bg-white outline-none font-bold transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 ml-1">연락처 (필수)</label>
            <input 
              type="tel" 
              placeholder="010-0000-0000"
              value={formData.phone || ''}
              onChange={(e) => {
                let val = e.target.value.replace(/[^0-9]/g, '');
                if (val.length > 3 && val.length <= 7) val = val.substring(0, 3) + '-' + val.substring(3);
                else if (val.length > 7) val = val.substring(0, 3) + '-' + val.substring(3, 7) + '-' + val.substring(7, 11);
                handleChange('phone', val);
              }}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-6 focus:border-indigo-500 focus:bg-white outline-none font-bold transition-all"
            />
          </div>

          {config.map((field) => (
            <div key={field.id} className="space-y-2">
              <label className="text-xs font-bold text-gray-400 ml-1">{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  placeholder={`${field.label} 입력`}
                  value={formData[field.id] || ''}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-6 focus:border-indigo-500 focus:bg-white outline-none font-bold transition-all min-h-[100px]"
                />
              ) : (
                <input
                  type={field.type || 'text'}
                  placeholder={`${field.label} 입력`}
                  value={formData[field.id] || ''}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-6 focus:border-indigo-500 focus:bg-white outline-none font-bold transition-all"
                />
              )}
            </div>
          ))}

          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-sm font-black text-gray-900 mb-4">영업자 정보</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 ml-1">영업자 소속 (지사)</label>
                <input 
                  type="text" 
                  value={salesInfo.affiliation}
                  onChange={(e) => setSalesInfo({...salesInfo, affiliation: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 focus:border-indigo-500 focus:bg-white outline-none font-bold transition-all text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 ml-1">영업자명 (사원명)</label>
                <input 
                  type="text" 
                  value={salesInfo.name}
                  onChange={(e) => setSalesInfo({...salesInfo, name: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 focus:border-indigo-500 focus:bg-white outline-none font-bold transition-all text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 ml-1">영업자 연락처</label>
                <input 
                  type="tel" 
                  value={salesInfo.phone}
                  onChange={(e) => {
                    let val = e.target.value.replace(/[^0-9]/g, '');
                    if (val.length > 3 && val.length <= 7) val = val.substring(0, 3) + '-' + val.substring(3);
                    else if (val.length > 7) val = val.substring(0, 3) + '-' + val.substring(3, 7) + '-' + val.substring(7, 11);
                    setSalesInfo({...salesInfo, phone: val});
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 focus:border-indigo-500 focus:bg-white outline-none font-bold transition-all text-sm"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black flex items-center justify-center gap-2 group transition-all disabled:opacity-50"
          >
            {isSubmitting ? '전송 중...' : '접수하기'}
            {!isSubmitting && <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
          </button>
        </form>
      </main>

      <CustomAlert 
        isOpen={alertState.isOpen} 
        message={alertState.message} 
        type={alertState.type} 
        onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))} 
      />
    </div>
  );
}
