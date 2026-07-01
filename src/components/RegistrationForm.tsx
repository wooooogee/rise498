'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, CheckCircle2, ArrowRight, ArrowLeft, Loader2, CreditCard, Landmark, ShieldCheck, MapPin, Search, Eraser, PenLine, Package, Calculator, Briefcase, Calendar, Tag, FileText, Sun, Moon } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import TermsAgreement from './TermsAgreement';
import { registerAction } from '@/app/actions';
import Script from 'next/script';

const DEFAULT_TERMS = [
  {
    id: 'product_notice',
    title: '1. 상품내용 고지에 대한 동의 (필수)',
    content: `본 신청과 관련하여 계약자 본인은 상기 금융거래정보(카드 정보, 은행, 계좌번호 등)를 만기·해지 신청 때까지 청구 기관에 제공하고, 자동이체를 신청하며, 61회차부터는 라이프서비스 부금이 동일한 정보로 자동이체됨에 동의합니다.
본 상품은 60회 약정 의무 납입 상품으로, 청약 철회 기간(14일) 이후 해지 시 잔여금을 완납하여야 하며 이에 동의합니다.
본 상품은 더좋은라이프 라이프서비스와 에넥스텔레콤 결합 상품으로, 라이프서비스와 렌탈 계약은 각각 별개로 진행됩니다. 60회까지의 렌탈 계약으로 제공되는 제품 및 건강 안심 케어 서비스는 사은품이 아님을 알려드립니다.
본 결합 상품의 총 납입 금액은 498만원(실 라이프납입금 300만 원, 제품 1구좌 198만 원 기준), 260회 만기 상품입니다. 고객님께서 만기 회차 도래 시점까지 상품 금액을 완납하고 익월까지 라이프서비스를 이용하지 않고 해약하실 경우, 실 라이프납입금 전액과 만기 축하금을 지급해 드립니다. 단, 고객님께서 만기 회차 이전에 해지할 경우, 해지 시점을 기준으로 납입된 실 라이프납입금에 대해 공정거래위원회 해약 환급금 산정 기준 고시에 따라 환급합니다.`,
    required: true
  },
  { 
    id: 'privacy', 
    title: '2. 개인(신용)정보의 수집·이용에 관한 사항(필수)', 
    content: `이용목적
· 라이프서비스에 관한 계약이행 및 서비스 제공
· 라이프서비스 가입 고객 관리 및 라이프서비스계약의 체결·유지·관리, 상담(민원처리 등)
· 요금청구를 위한 본인 확인, 요금결제(카드결제, CMS출금 등) 및 추심 업무를 위한 신용정보조회
· 공공기관의 정책자료로 제공

수집·이용할 개인(신용)정보의 항목
성명, 주소, 주민번호 앞 7자리, 전화번호, 계좌번호, 카드정보, 휴대폰번호

이용기간
본 계약체결일로부터 계약종료 후 3년까지
(단, 전자상거래 등에서의 소비자보호에 관한 법률 등 관련 법령의 규정에 의하여 보존할 필요가 있는 경우에는 그에 따름)`, 
    required: true 
  },
  { 
    id: 'third_party', 
    title: '3. 제3자 제공 동의에 관한 사항(필수)', 
    content: `본 계약과 관련하여 귀사가 본인으로부터 취득한 개인정보는 「개인정보보호법」 제17조와 제22조에 따라 제3자에게 제공할 경우에는 본인의 사전 동의를 얻어야 합니다. 이에 본인은 귀사가 본인의 개인정보를 아래와 같이 제3자에게 제공하는 것에 동의합니다.

· 개인정보를 제공받는 자: 신한은행, 금융결제원, KICC, 에넥스텔레콤, KB헬스케어, (주)여의도자산관리본부, 신안소프트, 라이즈주식회사, 위더스앤씨
· 개인정보를 제공받는 자의 개인정보 이용 목적: 할부거래에 관한 법률 제27조에 따른 공제 계약 및 소비자피해보상보험계약업무, 출금이체 서비스 제공 및 출금 동의 확인, 할부거래, 건강안심케어서비스 이용, 상품/서비스 홍보 및 판매, SMS 서비스 제공, 개인정보조회/신용정보조회 등
· 제공하는 개인정보의 항목: 
  - 개인식별정보: 성명, 생년월일, 주소(자택/직장), 연락처(휴대폰/자택)
  - 계약정보: 회원번호, 납입내역, 상담내역, 행사/해약사항
  - 결제정보: 예금주, 생년월일, 연락처, 계약자와의 관계, 계좌·카드 정보
· 개인정보를 제공받는 자의 개인정보 보유 및 이용기간: 라이프서비스계약 종료 시 삭제`,
    required: true
  },
  {
    id: 'marketing',
    title: '4. 마케팅 정보 제공 동의(선택)',
    content: `이용목적
· 신규 상품 및 서비스 안내
· 이벤트, 프로모션, 혜택 정보 제공
· 고객 맞춤 정보 제공
수집·이용할 개인(신용)정보의 항목
성명, 주소, 휴대폰번호
이용기간
동의일로부터 동의 철회 시까지`,
    required: false
  },
];

const STEPS = [
  { id: 'info', title: '계약자 정보' },
  { id: 'healthcare', title: '헬스케어대상자 정보' },
  { id: 'plan', title: '상품 정보' },
  { id: 'payment', title: '결제 정보' },
  { id: 'terms', title: '약관 동의' },
  { id: 'signature', title: '전자 서명' },
  { id: 'sales', title: '영업 정보' },
  { id: 'complete', title: '가입 완료' },
];

const RegistrationForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingMessage, setSubmittingMessage] = useState('');
  const [createdDocumentId, setCreatedDocumentId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const sigCanvas = useRef<SignatureCanvas>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    addressDetail: '',
    residentId: '',
    product: '더좋은라이즈498',
    productName: '',
    productName2: '',
    hasMultipleProducts: false,
    productCount: 'A', // A, B, C, D
    paymentPlan: 'normal',
    paymentMethod: 'card',
    paymentDate: '5',
    paymentInfo: {
      cardCompany: '',
      cardNumber: '',
      cardExpiry: '', // MM/YY
      bankName: '',
      accountNumber: '',
      accountHolder: '',
    },
    agreement: {},
    signature: '', // Base64 signature
    gender: '남', // New: '남' or '여'
    healthcareTargets: [
      { relation: '', name: '', birth: '', gender: '남', phone: '', isSameAsContractor: false },
      { relation: '', name: '', birth: '', gender: '남', phone: '', isSameAsContractor: false },
      { relation: '', name: '', birth: '', gender: '남', phone: '', isSameAsContractor: false },
      { relation: '', name: '', birth: '', gender: '남', phone: '', isSameAsContractor: false }
    ],
    salesAffiliation: '',
    salesName: '',
    salesPhone: '',
  });

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updatePaymentInfo = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      paymentInfo: { ...prev.paymentInfo, [field]: value }
    }));
  };

  const updateHealthcareTarget = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const newTargets = [...prev.healthcareTargets];
      newTargets[index] = { ...newTargets[index], [field]: value };
      return { ...prev, healthcareTargets: newTargets };
    });
  };

  // 구좌 수 변경 시 대상자 배열 크기 조정
  useEffect(() => {
    const countMap: { [key: string]: number } = { 'A': 1, 'B': 2, 'C': 3, 'D': 4 };
    const count = countMap[formData.productCount] || 1;
    if (formData.healthcareTargets.length !== count) {
      setFormData(prev => {
        const currentTargets = [...prev.healthcareTargets];
        if (currentTargets.length < count) {
          // 늘려야 하는 경우
          const diff = count - currentTargets.length;
          const newTargets = Array.from({ length: diff }).map(() => ({
            relation: '', name: '', birth: '', gender: '남', phone: '', isSameAsContractor: false
          }));
          return { ...prev, healthcareTargets: [...currentTargets, ...newTargets] };
        } else {
          // 줄여야 하는 경우
          return { ...prev, healthcareTargets: currentTargets.slice(0, count) };
        }
      });
    }
  }, [formData.productCount, formData.healthcareTargets.length]);

  // Load sales info from session storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const infoStr = localStorage.getItem('employeeInfo');
      if (infoStr) {
        try {
          const info = JSON.parse(infoStr);
          setFormData(prev => ({
            ...prev,
            salesAffiliation: info.branch || '',
            salesName: info.name || '',
            salesPhone: info.phone || ''
          }));
        } catch (e) {
          console.error('Error parsing employeeInfo', e);
        }
      }
    }
  }, []);

  const copyContractorToHealthcare = (index: number) => {
    const isSame = !formData.healthcareTargets[index].isSameAsContractor;
    updateHealthcareTarget(index, 'isSameAsContractor', isSame);

    if (isSame) {
      updateHealthcareTarget(index, 'relation', '본인');
      updateHealthcareTarget(index, 'name', formData.name);
      updateHealthcareTarget(index, 'birth', formData.residentId);
      updateHealthcareTarget(index, 'gender', formData.gender === '남' ? '남' : '여');
      updateHealthcareTarget(index, 'phone', formData.phone);
    } else {
      updateHealthcareTarget(index, 'relation', '');
      updateHealthcareTarget(index, 'name', '');
      updateHealthcareTarget(index, 'birth', '');
      updateHealthcareTarget(index, 'phone', '');
    }
  };

  const handleAddressSearch = () => {
    if (typeof window !== 'undefined' && (window as any).daum) {
      new (window as any).daum.Postcode({
        oncomplete: function (data: any) {
          let fullAddr = data.address;
          let extraAddr = '';

          if (data.addressType === 'R') {
            if (data.bname !== '') extraAddr += data.bname;
            if (data.buildingName !== '') extraAddr += (extraAddr !== '' ? `, ${data.buildingName}` : data.buildingName);
            fullAddr += (extraAddr !== '' ? ` (${extraAddr})` : '');
          }

          updateFormData('address', fullAddr);
        }
      }).open();
    }
  };

  const copyPreviousHealthcareTarget = (index: number) => {
    if (index === 0) return;
    const prev = formData.healthcareTargets[index - 1];
    updateHealthcareTarget(index, 'relation', prev.relation);
    updateHealthcareTarget(index, 'name', prev.name);
    updateHealthcareTarget(index, 'birth', prev.birth);
    updateHealthcareTarget(index, 'gender', prev.gender);
    updateHealthcareTarget(index, 'phone', prev.phone);
  };

  const clearSignature = () => {
    sigCanvas.current?.clear();
    updateFormData('signature', '');
  };

  const saveSignature = () => {
    if (sigCanvas.current?.isEmpty()) {
      alert('서명을 먼저 진행해 주세요.');
      return false;
    }
    const dataURL = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png');
    updateFormData('signature', dataURL);
    return true;
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (!formData.name || !formData.phone || !formData.address || !formData.residentId || !formData.gender || !formData.productName) {
        alert('계약자 데이터 및 제품명을 모두 정확히 입력해 주세요.');
        return;
      }
      if (formData.hasMultipleProducts && !formData.productName2) {
        alert('두 번째 제품명을 입력해 주세요.');
        return;
      }
    }
    if (currentStep === 1) { // Healthcare Targets step
      const countMap: { [key: string]: number } = { 'A': 1, 'B': 2, 'C': 3, 'D': 4 };
      const count = countMap[formData.productCount] || 1;
      const isTargetValid = formData.healthcareTargets.slice(0, count).every(t => t.relation && t.name && t.birth && t.phone);
      if (!isTargetValid) {
        alert('대상자 정보를 모두 누락 없이 입력해 주세요.');
        return;
      }
    }
    if (currentStep === 3) { // Payment Details step
      if (formData.paymentMethod === 'card') {
        const pureCard = formData.paymentInfo.cardNumber.replace(/[^0-9]/g, '');
        if (pureCard.length < 11 || !formData.paymentInfo.cardCompany || !formData.paymentInfo.cardExpiry) {
          alert('카드 정보를 모두 정확히 입력해 주세요 (번호는 11~16자리 가능).');
          return;
        }
      } else {
        if (!formData.paymentInfo.accountNumber || !formData.paymentInfo.bankName) {
          alert('계좌 정보를 모두 입력해 주세요.');
          return;
        }
      }
    }
    if (currentStep === 4) { // Terms Agreement step
      const requiredTerms = DEFAULT_TERMS.filter(t => t.required).map(t => t.id);
      const isAllRequiredAgreed = requiredTerms.every(id => (formData.agreement as any)[id]);
      if (!isAllRequiredAgreed) {
        alert('필수 약관에 모두 동의해 주세요.');
        return;
      }
    }
    if (currentStep === 5) { // Signature step
      if (!saveSignature()) return;
    }
    if (currentStep === 6) { // Sales Info step
      if (!formData.salesName || !formData.salesAffiliation) {
        alert('영업사원 정보(소속 포함)를 모두 정확히 입력해 주세요.');
        return;
      }
      handleSubmit();
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmittingMessage('가입 신청서를 전송하고 있습니다...');
    try {
      const result = await registerAction(formData);
      if (result && result.success) {
        setSubmittingMessage('계약서 PDF를 생성하고 있습니다. 잠시만 기다려 주세요...');
        if (result.documentId) {
          setCreatedDocumentId(result.documentId);
          // PDF 생성을 위한 최소한의 시간 확보 (2초 뒤 오픈)
          setTimeout(() => {
            window.open(`/api/download?id=${result.documentId}`, '_blank');
          }, 2000);
        }
        setCurrentStep(7); // Final step
      } else {
        alert(result.message || '등록 중 오류가 발생했습니다.');
      }
    } catch (error: any) {
      console.error('Registration Error:', error);
      alert(error.message || '신청 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme text-theme transition-colors duration-300 flex flex-col items-center py-12 px-4 selection:bg-indigo-500/30">


      <div className="w-full max-w-xl space-y-10">
        <div className="flex justify-between items-center px-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-1">Registration System</span>
            <div className="h-1 w-12 bg-indigo-500 rounded-full" />
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="p-3 rounded-2xl bg-card transition-all hover:scale-110 active:scale-95 border border-theme shadow-sm"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={20} className="text-zinc-600" /> : <Sun size={20} className="text-yellow-400" />}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div
              key="step-info"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 card-theme p-8 rounded-[3rem]"
            >
              <div className="space-y-1 pb-2 border-b border-theme/10">
                <h2 className="text-xl font-black italic tracking-tight">{STEPS[currentStep].title}</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-sub ml-1 flex items-center gap-2"><Package size={14} /> 상품명</label>
                    <div className="w-full bg-theme border border-theme rounded-2xl py-4.5 px-6 font-black text-indigo-500 flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      더좋은라이즈498
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-xs font-bold text-sub flex items-center gap-2"><Tag size={14} /> 제품명</label>
                      <button
                        type="button"
                        onClick={() => updateFormData('hasMultipleProducts', !formData.hasMultipleProducts)}
                        className={`text-[10px] font-black px-3 py-1 rounded-full transition-all border ${formData.hasMultipleProducts
                          ? 'bg-indigo-500 text-white border-indigo-500'
                          : 'bg-theme text-sub border-theme'
                          }`}
                      >
                        {formData.hasMultipleProducts ? '제품 1개만 입력' : '+ 제품 추가'}
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="relative group">
                        <Package className="absolute left-5 top-1/2 -translate-y-1/2 text-sub group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input
                          type="text"
                          placeholder={formData.hasMultipleProducts ? "첫 번째 제품명" : "제품명을 별도로 입력하세요 (예: LG 올레드 TV)"}
                          value={formData.productName}
                          onChange={(e) => updateFormData('productName', e.target.value)}
                          className="w-full bg-theme border border-theme rounded-2xl py-4.5 pl-12 sm:pl-14 pr-6 focus:border-indigo-500 outline-none font-bold text-base transition-all"
                        />
                      </div>

                      {formData.hasMultipleProducts && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="relative group"
                        >
                          <Package className="absolute left-5 top-1/2 -translate-y-1/2 text-sub group-focus-within:text-indigo-500 transition-colors" size={18} />
                          <input
                            type="text"
                            placeholder="두 번째 제품명"
                            value={formData.productName2}
                            onChange={(e) => updateFormData('productName2', e.target.value)}
                            className="w-full bg-theme border border-theme rounded-2xl py-4.5 pl-12 sm:pl-14 pr-6 focus:border-indigo-500 outline-none font-bold text-base transition-all"
                          />
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-sub ml-1 flex items-center gap-2"><Calculator size={14} /> 수량 선택 (A~D)</label>
                  <div className="flex bg-theme p-1.5 rounded-2xl border border-theme">
                    {['A', 'B', 'C', 'D'].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => updateFormData('productCount', n)}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all ${formData.productCount === n
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-sub'
                          }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-sub ml-1 flex items-center gap-2"><User size={14} /> 성명</label>
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-sub group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input type="text" placeholder="실명을 입력하세요" value={formData.name} onChange={(e) => updateFormData('name', e.target.value)} className="w-full bg-theme border border-theme rounded-2xl py-4.5 pl-12 sm:pl-14 pr-6 focus:border-indigo-500 outline-none text-base font-bold transition-all" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-sub ml-1 flex items-center gap-2"><Phone size={14} /> 연락처</label>
                  <div className="relative group">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-sub group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input type="tel" placeholder="010-0000-0000" value={formData.phone} onChange={(e) => {
                      let val = e.target.value.replace(/[^0-9]/g, '');
                      if (val.length > 3 && val.length <= 7) val = val.substring(0, 3) + '-' + val.substring(3);
                      else if (val.length > 7) val = val.substring(0, 3) + '-' + val.substring(3, 7) + '-' + val.substring(7, 11);
                      updateFormData('phone', val);
                    }} className="w-full bg-theme border border-theme rounded-2xl py-4.5 pl-12 sm:pl-14 pr-6 focus:border-indigo-500 outline-none text-base font-bold transition-all" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-sub ml-1 flex items-center gap-2"><MapPin size={14} /> 주소</label>
                  <div className="flex flex-col gap-3">
                    <div className="relative group">
                      <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                      <input
                        type="text"
                        placeholder="터치하여 주소를 검색하세요"
                        value={formData.address}
                        onClick={handleAddressSearch}
                        readOnly
                        className="w-full bg-theme border border-theme rounded-2xl py-4.5 pl-12 sm:pl-14 pr-6 focus:border-indigo-500 outline-none text-base cursor-pointer transition-all"
                      />
                    </div>
                    <input type="text" placeholder="상세 주소를 입력하세요" value={formData.addressDetail} onChange={(e) => updateFormData('addressDetail', e.target.value)} className="w-full bg-theme border border-theme rounded-2xl py-4.5 px-6 focus:border-indigo-500 outline-none text-base transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-sub ml-1 flex items-center gap-2"><ShieldCheck size={14} /> 주민번호 앞6자리</label>
                    <div className="relative group">
                      <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-sub group-focus-within:text-indigo-500 transition-colors" size={18} />
                      <input type="text" placeholder="900101" maxLength={6} value={formData.residentId} onChange={(e) => updateFormData('residentId', e.target.value.replace(/[^0-9]/g, ''))} className="w-full bg-theme border border-theme rounded-2xl py-4.5 pl-12 sm:pl-14 pr-6 focus:border-indigo-500 outline-none text-base font-mono tracking-[0.1em] sm:tracking-[0.2em] transition-all" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-sub ml-1 flex items-center gap-2"><User size={14} /> 성별</label>
                    <div className="flex bg-theme p-1 rounded-2xl border border-theme">
                      <button type="button" onClick={() => updateFormData('gender', '남')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${formData.gender === '남' ? 'bg-indigo-600 text-white shadow-sm' : 'text-sub hover:text-indigo-400'}`}>남성</button>
                      <button type="button" onClick={() => updateFormData('gender', '여')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${formData.gender === '여' ? 'bg-indigo-600 text-white shadow-sm' : 'text-sub hover:text-indigo-400'}`}>여성</button>
                    </div>
                  </div>
                </div>
              </div>

              <button onClick={handleNext} className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black flex items-center justify-center gap-2 group shadow-xl shadow-indigo-500/20">다음 단계 <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></button>
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div
              key="step-healthcare"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 card-theme p-8 rounded-[3rem]"
            >
              <div className="space-y-1 pb-2 border-b border-theme/10">
                <h2 className="text-xl font-black italic tracking-tight">{STEPS[currentStep].title}</h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <label className="text-[11px] font-black text-indigo-500 flex items-center gap-2 uppercase tracking-widest"><User size={14} /> 헬스케어대상자 ({formData.productCount}구좌)</label>
                </div>

                <div className="space-y-8">
                  {formData.healthcareTargets.map((target, idx) => (
                    <div key={idx} className={`space-y-6 p-7 rounded-[2.5rem] border transition-all duration-300 relative overflow-hidden ${target.isSameAsContractor
                      ? 'bg-indigo-600/5 border-indigo-500/30'
                      : 'bg-theme border-theme'
                      }`}>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-black text-zinc-900 tracking-tighter">대상 {idx + 1}</span>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => copyContractorToHealthcare(idx)}
                              className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${target.isSameAsContractor
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100'
                                }`}
                            >
                              <User size={12} className={target.isSameAsContractor ? 'text-white' : 'text-indigo-500'} />
                              본인
                            </button>

                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => copyPreviousHealthcareTarget(idx)}
                                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-all"
                              >
                                <Sun size={12} className="text-emerald-500 rotate-45" />
                                위 대상자와 동일
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-sub ml-1 uppercase tracking-widest flex items-center gap-2"><User size={12} /> 관계</label>
                          <div className="relative group">
                            <input type="text" placeholder="예: 본인, 배우자" value={target.relation} onChange={(e) => updateHealthcareTarget(idx, 'relation', e.target.value)} className="w-full bg-theme border border-theme rounded-2xl py-4 px-6 outline-none focus:border-indigo-500 transition-all font-bold text-base" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-sub ml-1 uppercase tracking-widest flex items-center gap-2"><User size={12} /> 성명</label>
                          <div className="relative group">
                            <input type="text" placeholder="성함" value={target.name} onChange={(e) => updateHealthcareTarget(idx, 'name', e.target.value)} className="w-full bg-theme border border-theme rounded-2xl py-4 px-6 outline-none focus:border-indigo-500 transition-all font-bold text-base" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-sub ml-1 uppercase tracking-widest flex items-center gap-2"><Calendar size={12} /> 생년월일</label>
                          <div className="relative group">
                            <input type="text" placeholder="19900101" maxLength={8} value={target.birth} onChange={(e) => updateHealthcareTarget(idx, 'birth', e.target.value.replace(/[^0-9]/g, ''))} className="w-full bg-theme border border-theme rounded-2xl py-4 px-6 outline-none focus:border-indigo-500 transition-all font-mono font-bold text-base tracking-tight sm:tracking-widest" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-sub ml-1 uppercase tracking-widest">성별</label>
                          <div className="flex bg-theme p-1 rounded-2xl border border-theme h-14">
                            <button type="button" onClick={() => updateHealthcareTarget(idx, 'gender', '남')} className={`flex-1 rounded-xl text-[11px] font-black transition-all ${target.gender === '남' ? 'bg-indigo-600 text-white shadow-md' : 'text-sub hover:text-indigo-500'}`}>남</button>
                            <button type="button" onClick={() => updateHealthcareTarget(idx, 'gender', '여')} className={`flex-1 rounded-xl text-[11px] font-black transition-all ${target.gender === '여' ? 'bg-indigo-600 text-white shadow-md' : 'text-sub hover:text-indigo-500'}`}>여</button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-sub ml-1 uppercase tracking-widest flex items-center gap-2"><Phone size={12} /> 연락처</label>
                        <div className="relative group">
                          <input type="tel" placeholder="010-0000-0000" value={target.phone} onChange={(e) => {
                            let val = e.target.value.replace(/[^0-9]/g, '');
                            if (val.length > 3 && val.length <= 7) val = val.substring(0, 3) + '-' + val.substring(3);
                            else if (val.length > 7) val = val.substring(0, 3) + '-' + val.substring(3, 7) + '-' + val.substring(7, 11);
                            updateHealthcareTarget(idx, 'phone', val);
                          }} className="w-full bg-theme border border-theme rounded-2xl py-4 px-6 outline-none focus:border-indigo-500 transition-all font-bold text-base" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={handleBack} className="flex-1 py-5 bg-card text-sub rounded-2xl font-bold border border-theme">이전</button>
                <button onClick={handleNext} className="flex-[2] py-5 bg-indigo-600 text-white rounded-2xl font-black">다음 단계</button>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step-plan"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 card-theme p-8 rounded-[3rem]"
            >
              <div className="space-y-1 pb-2 border-b border-theme/10">
                <h2 className="text-xl font-black italic tracking-tight">{STEPS[currentStep].title}</h2>
              </div>

              <div className="bg-theme border border-theme p-8 rounded-[2rem] space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">Selected Product</p>
                    <h3 className="text-xl font-black italic">{formData.productName} ({formData.productCount}구좌)</h3>
                  </div>
                  <div className="bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-500/20 font-bold text-indigo-500">
                    비정기납입형
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-card rounded-2xl border border-theme">
                    <span className="text-sub text-xs font-bold">1~60회차 (제품)</span>
                    <span className="font-black">
                      {(33000 * ({ 'A': 1, 'B': 2, 'C': 3, 'D': 4 }[formData.productCount] || 1)).toLocaleString()}원
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-card rounded-2xl border border-theme">
                    <span className="text-sub text-xs font-bold">61~260회차 (라이프)</span>
                    <span className="font-black text-indigo-500">
                      {(15000 * ({ 'A': 1, 'B': 2, 'C': 3, 'D': 4 }[formData.productCount] || 1)).toLocaleString()}원
                    </span>
                  </div>
                  <div className="flex justify-center items-center py-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/10">
                    <span className="text-indigo-500 font-black text-sm italic">만기 시 100% 환급 보장</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={handleBack} className="flex-1 py-5 bg-card text-sub rounded-2xl font-bold border border-theme">이전</button>
                <button onClick={handleNext} className="flex-[2] py-5 bg-indigo-600 text-white rounded-2xl font-black">다음 단계</button>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step-pay-detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 card-theme p-8 rounded-[3rem]"
            >
              <div className="space-y-1 pb-2 border-b border-theme/10">
                <h2 className="text-xl font-black italic tracking-tight">{STEPS[currentStep].title}</h2>
              </div>

              <div className="flex bg-theme p-1 rounded-2xl border border-theme">
                <button type="button" onClick={() => updateFormData('paymentMethod', 'card')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${formData.paymentMethod === 'card' ? 'bg-indigo-600 text-white shadow-sm' : 'text-sub'}`}>카드 결제</button>
                <button type="button" onClick={() => updateFormData('paymentMethod', 'bank')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${formData.paymentMethod === 'bank' ? 'bg-indigo-600 text-white shadow-sm' : 'text-sub'}`}>계좌 이체</button>
              </div>

              <div className="space-y-4">
                {formData.paymentMethod === 'card' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-sub ml-1 flex items-center gap-2"><CreditCard size={14} /> 카드사</label>
                        <input type="text" placeholder="예: 현대카드" value={formData.paymentInfo.cardCompany} onChange={(e) => updatePaymentInfo('cardCompany', e.target.value)} className="w-full bg-theme border border-theme rounded-2xl py-4.5 px-6 focus:border-indigo-500 outline-none text-base" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-sub ml-1 flex items-center gap-2"><Calendar size={14} /> 유효기간</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          maxLength={5}
                          value={formData.paymentInfo.cardExpiry}
                          onChange={(e) => {
                            let val = e.target.value.replace(/[^0-9]/g, '');
                            if (val.length > 2) val = val.substring(0, 2) + '/' + val.substring(2, 4);
                            updatePaymentInfo('cardExpiry', val);
                          }}
                          className="w-full bg-theme border border-theme rounded-2xl py-4.5 px-6 focus:border-indigo-500 outline-none text-base"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-sub ml-1">카드번호</label>
                      <input
                        type="text"
                        placeholder="0000-0000-0000-0000"
                        value={formData.paymentInfo.cardNumber}
                        onChange={(e) => {
                          let val = e.target.value.replace(/[^0-9]/g, '');
                          if (val.length > 16) val = val.substring(0, 16);
                          let formatted = '';
                          for (let i = 0; i < val.length; i++) {
                            if (i > 0 && i % 4 === 0) formatted += '-';
                            formatted += val[i];
                          }
                          updatePaymentInfo('cardNumber', formatted);
                        }}
                        className="w-full bg-theme border border-theme rounded-2xl py-4.5 px-6 focus:border-indigo-500 outline-none font-mono text-base tracking-tighter sm:tracking-normal"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-sub ml-1 flex items-center gap-2"><Landmark size={14} /> 은행명</label>
                      <input type="text" placeholder="예: 국민은행" value={formData.paymentInfo.bankName} onChange={(e) => updatePaymentInfo('bankName', e.target.value)} className="w-full bg-theme border border-theme rounded-2xl py-4.5 px-6 focus:border-indigo-500 outline-none text-base" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-sub ml-1">계좌번호</label>
                      <input type="text" placeholder="'-' 없이 숫자만" value={formData.paymentInfo.accountNumber} onChange={(e) => updatePaymentInfo('accountNumber', e.target.value)} className="w-full bg-theme border border-theme rounded-2xl py-4.5 px-6 focus:border-indigo-500 outline-none text-base" />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-sub ml-1">매월 결제일</label>
                  <select value={formData.paymentDate} onChange={(e) => updateFormData('paymentDate', e.target.value)} className="w-full bg-theme border border-theme rounded-2xl py-4.5 px-6 focus:border-indigo-500 outline-none appearance-none">
                    <option value="5">매월 5일</option>
                    <option value="10">매월 10일</option>
                    <option value="15">매월 15일</option>
                    <option value="20">매월 20일</option>
                    <option value="25">매월 25일</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={handleBack} className="flex-1 py-5 bg-card text-sub rounded-2xl font-bold border border-theme">이전</button>
                <button onClick={handleNext} className="flex-[2] py-5 bg-indigo-600 text-white rounded-2xl font-black">다음 단계</button>
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="step-terms"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 card-theme p-8 rounded-[3rem]"
            >
              <div className="space-y-1 pb-2 border-b border-theme/10">
                <h2 className="text-xl font-black italic tracking-tight">{STEPS[currentStep].title}</h2>
              </div>

              <div className="bg-theme border border-theme rounded-[2.5rem] overflow-hidden max-h-[350px] overflow-y-auto px-4 shadow-inner">
                <TermsAgreement terms={DEFAULT_TERMS} onAgreementChange={(agreement) => updateFormData('agreement', agreement)} />
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={handleBack} className="flex-1 py-5 bg-card text-sub rounded-2xl font-bold border border-theme">이전</button>
                <button onClick={handleNext} className="flex-[2] py-5 bg-indigo-600 text-white rounded-2xl font-black">다음 단계</button>
              </div>
            </motion.div>
          )}

          {currentStep === 5 && (
            <motion.div
              key="step-signature"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 card-theme p-8 rounded-[3rem]"
            >
              <div className="space-y-1 pb-2 border-b border-theme/10">
                <h2 className="text-xl font-black italic tracking-tight">{STEPS[currentStep].title}</h2>
              </div>

              <div className="bg-white rounded-3xl overflow-hidden border-4 border-theme shadow-2xl">
                <SignatureCanvas ref={sigCanvas} penColor="black" canvasProps={{ className: "signature-canvas w-full h-64" }} />
              </div>
              <div className="flex justify-between items-center px-2">
                <button onClick={clearSignature} className="flex items-center gap-2 text-xs font-bold text-sub hover:text-indigo-500 transition-colors"><Eraser size={14} /> 서명 초기화</button>
                <div className="text-[10px] text-zinc-400 font-black uppercase tracking-widest flex items-center gap-2"><PenLine size={12} className="text-indigo-500" /> Secure Input Active</div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={handleBack} className="flex-1 py-5 bg-card text-sub rounded-2xl font-bold border border-theme">이전</button>
                <button onClick={handleNext} className="flex-[2] py-5 bg-indigo-600 text-white rounded-2xl font-black">서명 완료</button>
              </div>
            </motion.div>
          )}

          {currentStep === 6 && (
            <motion.div
              key="step-sales"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 card-theme p-8 rounded-[3rem]"
            >
              <div className="space-y-1 pb-2 border-b border-theme/10">
                <h2 className="text-xl font-black italic tracking-tight">{STEPS[currentStep].title}</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-sub ml-1 flex items-center gap-2"><Briefcase size={14} /> 소속</label>
                  <input type="text" placeholder="영업사원의 소속을 입력하세요" value={formData.salesAffiliation} onChange={(e) => updateFormData('salesAffiliation', e.target.value)} className="w-full bg-theme border border-theme rounded-2xl py-4.5 px-8 outline-none focus:border-indigo-500 text-base" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-sub ml-1 flex items-center gap-2"><User size={14} /> 영업사원 성함</label>
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-sub group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input type="text" placeholder="성명을 입력하세요" value={formData.salesName} onChange={(e) => updateFormData('salesName', e.target.value)} className="w-full bg-theme border border-theme rounded-2xl py-4.5 pl-12 sm:pl-14 pr-8 outline-none focus:border-indigo-500 text-base" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-sub ml-1 flex items-center gap-2"><Phone size={14} /> 영업사원 연락처 (선택)</label>
                  <div className="relative group">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-sub group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input type="tel" placeholder="010-0000-0000" value={formData.salesPhone} onChange={(e) => {
                      let val = e.target.value.replace(/[^0-9]/g, '');
                      if (val.length > 3 && val.length <= 7) val = val.substring(0, 3) + '-' + val.substring(3);
                      else if (val.length > 7) val = val.substring(0, 3) + '-' + val.substring(3, 7) + '-' + val.substring(7, 11);
                      updateFormData('salesPhone', val);
                    }} className="w-full bg-theme border border-theme rounded-2xl py-4.5 pl-12 sm:pl-14 pr-8 outline-none focus:border-indigo-500 text-base" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={handleBack} className="flex-1 py-5 bg-card text-sub rounded-2xl font-bold border border-theme">이전</button>
                <button onClick={handleNext} disabled={isSubmitting} className="flex-[2] py-5 bg-indigo-600 text-white disabled:bg-zinc-300 rounded-2xl font-black flex flex-col items-center justify-center">
                  {isSubmitting ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="animate-spin" size={24} />
                      <span className="text-[10px] font-bold text-white/60">{submittingMessage}</span>
                    </div>
                  ) : '최종 신청하기'}
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 7 && (
            <motion.div
              key="step-complete"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-indigo-600 p-16 rounded-[4rem] text-center space-y-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full translate-x-10 -translate-y-10" />
              <div className="inline-flex w-24 h-24 bg-white/20 rounded-[2.5rem] items-center justify-center mb-2 animate-bounce"><CheckCircle2 className="text-white" size={48} /></div>
              <div className="space-y-4">
                <h2 className="text-3xl font-black text-white italic tracking-tighter leading-tight">회원가입 신청완료</h2>
                <p className="text-indigo-100 text-sm font-bold opacity-80">계약서 PDF가 자동으로 열립니다.<br />열리지 않으면 아래 버튼을 눌러주세요.</p>
              </div>

              {createdDocumentId && (
                <a
                  href={`/api/download?id=${createdDocumentId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-5 bg-white/10 text-white rounded-[2rem] font-black hover:bg-white/20 transition-all border border-white/20"
                >
                  <FileText size={20} />
                  계약서 PDF 다운로드
                </a>
              )}

              <button onClick={() => window.location.reload()} className="w-full py-5 bg-white text-indigo-600 rounded-[2rem] font-black hover:shadow-xl transition-all">신규 신청서 작성</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="mt-20 text-[10px] text-sub font-bold uppercase tracking-[0.5em] italic">Premium Membership Platform // Advanced Digital Signing</footer>
    </div>
  );
};

export default RegistrationForm;
