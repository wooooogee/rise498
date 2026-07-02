'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Users, Settings, Database, Download, Plus, Trash2, Save } from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  registerEmployeeAction, 
  getFormConfigAction, 
  saveFormConfigAction, 
  getSheetDataAction, 
  getEmployeesAction, 
  updateEmployeeAction, 
  deleteEmployeeAction,
  getDynamicProductsAction,
  saveDynamicProductsAction
} from '@/app/actions';
import CustomAlert from '@/components/CustomAlert';
import CustomPrompt from '@/components/CustomPrompt';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'employees' | 'config' | 'data'>('employees');
  const [alertState, setAlertState] = useState<{ isOpen: boolean; message: string; type?: 'info' | 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'info'
  });

  const showAlert = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setAlertState({ isOpen: true, message, type });
  };

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      router.push('/');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('employeeInfo');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white w-full md:w-72 flex-shrink-0 md:min-h-screen flex flex-col sticky top-0 z-20 shadow-2xl border-r border-indigo-900/50">
        <div className="p-4 md:p-8 flex justify-between items-center md:block">
          <div>
            <h1 className="text-xl md:text-3xl font-black tracking-tighter">
              <span className="text-white">RiseOne</span><span className="text-indigo-400">Admin</span>
            </h1>
          </div>
          <button 
            onClick={handleLogout}
            className="md:hidden p-2 rounded-xl bg-white/5 text-indigo-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
        
        <nav className="px-3 pb-3 md:px-4 md:pb-0 flex md:flex-col gap-1 md:gap-2 overflow-x-auto no-scrollbar items-center md:items-stretch">
          <button 
            onClick={() => setActiveTab('employees')}
            className={`flex items-center gap-1.5 px-3 py-2 md:px-5 md:py-3.5 rounded-xl md:rounded-2xl font-bold transition-all whitespace-nowrap text-[13px] md:text-base ${activeTab === 'employees' ? 'bg-indigo-600/90 text-white shadow-lg border border-indigo-500/30' : 'text-indigo-200 hover:bg-white/5 hover:text-white'}`}
          >
            <Users size={16} /> 영업자
          </button>
          <button 
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-1.5 px-3 py-2 md:px-5 md:py-3.5 rounded-xl md:rounded-2xl font-bold transition-all whitespace-nowrap text-[13px] md:text-base ${activeTab === 'config' ? 'bg-indigo-600/90 text-white shadow-lg border border-indigo-500/30' : 'text-indigo-200 hover:bg-white/5 hover:text-white'}`}
          >
            <Settings size={16} /> 상품 폼 설정
          </button>
          <button 
            onClick={() => setActiveTab('data')}
            className={`flex items-center gap-1.5 px-3 py-2 md:px-5 md:py-3.5 rounded-xl md:rounded-2xl font-bold transition-all whitespace-nowrap text-[13px] md:text-base ${activeTab === 'data' ? 'bg-indigo-600/90 text-white shadow-lg border border-indigo-500/30' : 'text-indigo-200 hover:bg-white/5 hover:text-white'}`}
          >
            <Database size={16} /> DB 조회
          </button>
        </nav>
        
        <div className="hidden md:block p-4 absolute bottom-0 w-full border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/5 text-indigo-300 hover:text-white transition-colors text-sm font-bold hover:bg-white/10"
          >
            <LogOut size={16} /> 로그아웃
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto relative">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-slate-50/50 pointer-events-none" />
        <div className="max-w-6xl mx-auto space-y-8 relative z-10">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl md:rounded-[2rem] p-4 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 min-h-[700px]">
            {activeTab === 'employees' && <EmployeeTab showAlert={showAlert} />}
            {activeTab === 'config' && <ConfigTab showAlert={showAlert} />}
            {activeTab === 'data' && <DataTab showAlert={showAlert} />}
          </div>
        </div>
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

// ---------------------------------------------------------------------------
// Employee Registration & Management Tab
// ---------------------------------------------------------------------------
function EmployeeTab({ showAlert }: { showAlert: (msg: string, type?: 'info' | 'success' | 'error') => void }) {
  const [empData, setEmpData] = useState({ code: '', name: '', phone: '', hq: '', branch: '', agency: '', codeName: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', status: '재직', hq: '', branch: '', agency: '', codeName: '' });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setIsLoading(true);
    const res = await getEmployeesAction();
    if (res.success) {
      setEmployees(res.data || []);
    }
    setIsLoading(false);
  };

  const formatPhone = (val: string) => {
    let clean = val.replace(/[^0-9]/g, '');
    if (clean.length > 3 && clean.length <= 7) return clean.substring(0, 3) + '-' + clean.substring(3);
    else if (clean.length > 7) return clean.substring(0, 3) + '-' + clean.substring(3, 7) + '-' + clean.substring(7, 11);
    return clean;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empData.code || !empData.name || !empData.phone) {
      showAlert('모든 필드를 입력해주세요.', 'info');
      return;
    }
    setIsSubmitting(true);
    const res = await registerEmployeeAction(empData);
    setIsSubmitting(false);
    if (res.success) {
      showAlert('영업자가 성공적으로 등록되었습니다.', 'success');
      setEmpData({ code: '', name: '', phone: '', hq: '', branch: '', agency: '', codeName: '' });
      loadEmployees();
    } else {
      showAlert(res.message || '오류가 발생했습니다.', 'error');
    }
  };

  const handleEditClick = (emp: any) => {
    setEditingCode(emp.code);
    setEditForm({ 
      name: emp.name, 
      phone: emp.phone, 
      status: emp.status || '재직',
      hq: emp.hq || '',
      branch: emp.branch || '',
      agency: emp.agency || '',
      codeName: emp.codeName || ''
    });
  };

  const handleUpdate = async () => {
    if (!editingCode) return;
    const res = await updateEmployeeAction(editingCode, editForm);
    if (res.success) {
      showAlert('성공적으로 수정되었습니다.', 'success');
      setEditingCode(null);
      loadEmployees();
    } else {
      showAlert(res.message || '수정 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleDelete = async (code: string) => {
    if (!confirm('정말로 이 영업자 코드를 삭제하시겠습니까?')) return;
    const res = await deleteEmployeeAction(code);
    if (res.success) {
      showAlert('삭제되었습니다.', 'success');
      loadEmployees();
    } else {
      showAlert(res.message || '삭제 중 오류가 발생했습니다.', 'error');
    }
  };

  const filteredEmployees = employees.filter(emp => 
    (emp.name && emp.name.includes(searchTerm)) || 
    (emp.code && emp.code.includes(searchTerm)) ||
    (emp.codeName && emp.codeName.includes(searchTerm)) ||
    (emp.phone && emp.phone.includes(searchTerm))
  );

  return (
    <div className="space-y-10">
      {/* Registration Section */}
      <div className="space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <h2 className="text-xl font-black text-gray-900">영업자 코드 등록</h2>
        </div>
        <form onSubmit={handleSubmit} className="max-w-md space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 mb-1 block">본부</label>
              <input type="text" value={empData.hq} onChange={e => setEmpData({...empData, hq: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-sm" placeholder="본부명" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 mb-1 block">지사</label>
              <input type="text" value={empData.branch} onChange={e => setEmpData({...empData, branch: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-sm" placeholder="지사명" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 mb-1 block">지점</label>
              <input type="text" value={empData.agency} onChange={e => setEmpData({...empData, agency: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-sm" placeholder="지점명" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 mb-1 block">사원코드</label>
              <input type="text" value={empData.code} onChange={e => setEmpData({...empData, code: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-sm" placeholder="예: 24070101" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 mb-1 block">코드명</label>
              <input type="text" value={empData.codeName} onChange={e => setEmpData({...empData, codeName: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-sm" placeholder="코드명 입력" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 mb-1 block">사원명</label>
              <input type="text" value={empData.name} onChange={e => setEmpData({...empData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-sm" placeholder="이름 입력" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 mb-1 block">휴대폰번호</label>
              <input type="tel" value={empData.phone} onChange={e => setEmpData({...empData, phone: formatPhone(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-sm" placeholder="010-0000-0000" />
            </div>
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all text-sm">
            {isSubmitting ? '등록 중...' : '등록하기'}
          </button>
        </form>
      </div>

      {/* List Section */}
      <div className="space-y-6 pt-6 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-xl font-black text-gray-900">영업자 목록 및 관리</h2>
          </div>
          <input 
            type="text" 
            placeholder="이름, 코드, 번호 검색" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 bg-white border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-indigo-500 text-sm"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-10 text-gray-400 text-sm">불러오는 중...</div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-2xl bg-white">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold">
                  <tr>
                    <th className="px-4 py-3">소속 (본부/지사/지점)</th>
                    <th className="px-4 py-3">사원코드</th>
                    <th className="px-4 py-3">코드명</th>
                    <th className="px-4 py-3">사원명</th>
                    <th className="px-4 py-3">휴대폰번호</th>
                    <th className="px-4 py-3">상태</th>
                    <th className="px-4 py-3 text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-400">등록된 영업자가 없습니다.</td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-500">
                          {[emp.hq, emp.branch, emp.agency].filter(Boolean).join(' / ') || '-'}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">{emp.code}</td>
                        <td className="px-4 py-3">
                          {editingCode === emp.code ? (
                            <input type="text" value={editForm.codeName} onChange={e => setEditForm({...editForm, codeName: e.target.value})} className="border rounded px-2 py-1 w-24" />
                          ) : emp.codeName}
                        </td>
                        <td className="px-4 py-3">
                          {editingCode === emp.code ? (
                            <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="border rounded px-2 py-1 w-24" />
                          ) : emp.name}
                        </td>
                        <td className="px-4 py-3">
                          {editingCode === emp.code ? (
                            <input type="text" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: formatPhone(e.target.value)})} className="border rounded px-2 py-1 w-32" />
                          ) : emp.phone}
                        </td>
                        <td className="px-4 py-3">
                          {editingCode === emp.code ? (
                            <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className="border rounded px-2 py-1">
                              <option value="재직">재직</option>
                              <option value="퇴사">퇴사</option>
                              <option value="휴직">휴직</option>
                            </select>
                          ) : (
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${emp.status === '재직' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {emp.status || '재직'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          {editingCode === emp.code ? (
                            <>
                              <button onClick={handleUpdate} className="text-green-600 hover:text-green-800 font-bold">저장</button>
                              <button onClick={() => setEditingCode(null)} className="text-gray-500 hover:text-gray-700 font-bold">취소</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleEditClick(emp)} className="text-indigo-600 hover:text-indigo-800 font-bold">수정</button>
                              <button onClick={() => handleDelete(emp.code)} className="text-red-500 hover:text-red-700 font-bold">삭제</button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col gap-3">
              {filteredEmployees.length === 0 ? (
                <div className="p-8 text-center text-gray-400 bg-white rounded-xl border border-gray-100 text-sm">등록된 영업자가 없습니다.</div>
              ) : (
                filteredEmployees.map((emp, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
                    {editingCode === emp.code ? (
                      <div className="space-y-3">
                        <input type="text" value={editForm.codeName} onChange={e => setEditForm({...editForm, codeName: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="코드명" />
                        <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="사원명" />
                        <input type="text" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: formatPhone(e.target.value)})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="연락처" />
                        <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
                          <option value="재직">재직</option>
                          <option value="퇴사">퇴사</option>
                          <option value="휴직">휴직</option>
                        </select>
                        <div className="flex justify-end gap-2 pt-2">
                          <button onClick={handleUpdate} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold">저장</button>
                          <button onClick={() => setEditingCode(null)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-bold">취소</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-black text-lg text-gray-900">{emp.codeName || emp.name}</div>
                            <div className="text-xs text-gray-500 mt-1">{emp.code}</div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${emp.status === '재직' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {emp.status || '재직'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1.5 bg-gray-50 p-3 rounded-lg">
                          <div className="flex gap-2"><span className="text-gray-400 font-bold w-12">소속</span> {[emp.hq, emp.branch, emp.agency].filter(Boolean).join(' / ') || '-'}</div>
                          <div className="flex gap-2"><span className="text-gray-400 font-bold w-12">이름</span> {emp.name}</div>
                          <div className="flex gap-2"><span className="text-gray-400 font-bold w-12">연락처</span> {emp.phone}</div>
                        </div>
                        <div className="pt-3 border-t border-gray-50 flex justify-end gap-2">
                          <button onClick={() => handleEditClick(emp)} className="text-xs font-bold text-indigo-600 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">수정</button>
                          <button onClick={() => handleDelete(emp.code)} className="text-xs font-bold text-red-500 px-3 py-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">삭제</button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}


// ---------------------------------------------------------------------------
// Form Configurator Tab
// ---------------------------------------------------------------------------
function ConfigTab({ showAlert }: { showAlert: (msg: string, type?: 'info' | 'success' | 'error') => void }) {
  const [dynamicProducts, setDynamicProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [fields, setFields] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [promptState, setPromptState] = useState<{
    isOpen: boolean;
    message: string;
    placeholder?: string;
    type?: 'password' | 'text';
    resolve?: (value: string | null) => void;
  }>({
    isOpen: false,
    message: '',
  });

  const showPrompt = (message: string, placeholder?: string, type: 'password' | 'text' = 'text'): Promise<string | null> => {
    return new Promise((resolve) => {
      setPromptState({
        isOpen: true,
        message,
        placeholder,
        type,
        resolve,
      });
    });
  };

  const handlePromptConfirm = (value: string) => {
    if (promptState.resolve) promptState.resolve(value);
    setPromptState({ ...promptState, isOpen: false });
  };

  const handlePromptCancel = () => {
    if (promptState.resolve) promptState.resolve(null);
    setPromptState({ ...promptState, isOpen: false });
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    const prods = await getDynamicProductsAction();
    setDynamicProducts(prods);
    if (prods.length > 0) {
      setSelectedProduct(prods[0].id);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (selectedProduct) {
      loadConfig(selectedProduct);
    }
  }, [selectedProduct]);

  const loadConfig = async (product: string) => {
    setIsLoading(true);
    const res = await getFormConfigAction(product);
    if (res.success && res.config && res.config.length > 0) {
      setFields(res.config);
    } else {
      setFields([
        { id: 'address', label: '주소', type: 'text' },
        { id: 'memo', label: '메모', type: 'textarea' }
      ]);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const res = await saveFormConfigAction(selectedProduct, fields);
    setIsSaving(false);
    if (res.success) showAlert('저장되었습니다.', 'success');
    else showAlert(res.message || '저장 중 오류가 발생했습니다.', 'error');
  };

  const addField = () => {
    setFields([...fields, { id: `field_${Date.now()}`, label: '새 필드', type: 'text' }]);
  };

  const updateField = (idx: number, key: string, value: string | boolean) => {
    const newFields = [...fields];
    newFields[idx][key] = value;
    setFields(newFields);
  };

  const removeField = (idx: number) => {
    const newFields = [...fields];
    newFields.splice(idx, 1);
    setFields(newFields);
  };

  const handleAddProduct = async () => {
    const name = await showPrompt('추가할 상품 이름을 입력하세요', '예: 자동차, 코웨이', 'text');
    if (!name || !name.trim()) return;
    
    const id = 'prod_' + Date.now();
    const newProducts = [...dynamicProducts, { id, name: name.trim() }];
    
    setIsLoading(true);
    const res = await saveDynamicProductsAction(newProducts);
    if (res.success) {
      setDynamicProducts(newProducts);
      setSelectedProduct(id);
      showAlert('상품이 추가되었습니다.', 'success');
    } else {
      showAlert('상품 추가에 실패했습니다.', 'error');
    }
    setIsLoading(false);
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (dynamicProducts.length <= 1) {
      showAlert('최소 1개의 상품은 유지해야 합니다.', 'info');
      return;
    }
    
    const pwd = await showPrompt(`'${name}' 상품을 삭제하려면 비밀번호를 입력하세요.`, '비밀번호', 'password');
    if (pwd === null) return;
    if (pwd !== '880805') {
      showAlert('비밀번호가 일치하지 않습니다.', 'error');
      return;
    }

    const newProducts = dynamicProducts.filter(p => p.id !== id);
    setIsLoading(true);
    const res = await saveDynamicProductsAction(newProducts);
    if (res.success) {
      setDynamicProducts(newProducts);
      if (selectedProduct === id) {
        setSelectedProduct(newProducts[0].id);
      }
      showAlert('상품이 삭제되었습니다.', 'success');
    } else {
      showAlert('상품 삭제에 실패했습니다.', 'error');
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">간편 상품 폼 설정</h2>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        {dynamicProducts.map(p => (
          <div key={p.id} className="flex items-stretch shadow-sm rounded-xl overflow-hidden">
            <button 
              onClick={() => setSelectedProduct(p.id)}
              className={`px-3 md:px-4 py-2 font-bold text-[13px] md:text-sm transition-all ${selectedProduct === p.id ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 border-r-0'}`}
            >
              {p.name}
            </button>
            <button
              onClick={() => handleDeleteProduct(p.id, p.name)}
              className={`px-2 py-2 transition-all flex items-center justify-center ${selectedProduct === p.id ? 'bg-indigo-700 text-white hover:bg-red-500' : 'bg-white text-gray-400 hover:bg-red-50 hover:text-red-500 border border-gray-200 border-l-0 border-l-gray-100'}`}
              title="삭제"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button 
          onClick={handleAddProduct}
          className="px-3 md:px-4 py-2 rounded-xl bg-white border border-dashed border-gray-300 text-gray-500 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 font-bold text-[13px] md:text-sm flex items-center gap-1 transition-all"
        >
          <Plus size={16} /> 상품 추가
        </button>
      </div>

      {isLoading ? (
        <div className="text-gray-400 py-10 text-center text-sm">불러오는 중...</div>
      ) : (
        <div className="space-y-4 max-w-2xl bg-gray-50 p-4 md:p-6 rounded-2xl border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
            <h3 className="font-bold text-gray-800 text-lg">추가 필드 구성 ({fields.length}개)</h3>
            <button onClick={addField} className="flex items-center justify-center gap-1 text-sm bg-white border border-gray-200 px-3 py-2 rounded-xl text-gray-600 hover:text-indigo-600 hover:border-indigo-300 transition-colors w-full sm:w-auto font-bold shadow-sm">
              <Plus size={14} /> 필드 추가
            </button>
          </div>

          {fields.map((field, idx) => (
            <div key={idx} className="flex flex-col gap-3 bg-white p-3 md:p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <div className="flex-1 space-y-1.5 w-full">
                  <label className="text-[11px] font-black text-gray-400 uppercase">필드 이름</label>
                  <input type="text" value={field.label} onChange={e => updateField(idx, 'label', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-500 font-medium text-gray-900" />
                </div>
                <div className="w-full sm:w-32 space-y-1.5">
                  <label className="text-[11px] font-black text-gray-400 uppercase">입력 유형</label>
                  <select value={field.type} onChange={e => updateField(idx, 'type', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-500 font-medium text-gray-900">
                    <option value="text">짧은 텍스트</option>
                    <option value="textarea">긴 텍스트(메모)</option>
                    <option value="date">날짜</option>
                    <option value="number">숫자</option>
                    <option value="select">선택 (버튼형)</option>
                  </select>
                </div>
                <button onClick={() => removeField(idx)} className="mt-1 sm:mt-6 p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors self-end sm:self-auto shrink-0 border border-transparent hover:border-red-100">
                  <Trash2 size={18} />
                </button>
              </div>

              {field.type === 'select' && (
                <div className="w-full space-y-2 mt-2 pt-3 border-t border-gray-100">
                  <label className="text-[11px] font-black text-gray-400 uppercase">옵션 항목 (콤마(,)로 구분)</label>
                  <input type="text" value={field.options || ''} onChange={e => updateField(idx, 'options', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-500" placeholder="예: 빨강,파랑,초록" />
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-600 mt-2 select-none cursor-pointer">
                    <input type="checkbox" checked={field.isMulti || false} onChange={e => updateField(idx, 'isMulti', e.target.checked)} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300" />
                    다중 선택 허용
                  </label>
                </div>
              )}
            </div>
          ))}

          <div className="pt-6 border-t border-gray-200 mt-6 flex justify-end">
            <button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md shadow-indigo-500/20">
              <Save size={16} /> {isSaving ? '저장 중...' : '설정 저장'}
            </button>
          </div>
        </div>
      )}

      <CustomPrompt
        isOpen={promptState.isOpen}
        message={promptState.message}
        placeholder={promptState.placeholder}
        type={promptState.type}
        onConfirm={handlePromptConfirm}
        onCancel={handlePromptCancel}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Data Viewer Tab
// ---------------------------------------------------------------------------
function DataTab({ showAlert }: { showAlert: (msg: string, type?: 'info' | 'success' | 'error') => void }) {
  const [dynamicProducts, setDynamicProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    const prods = await getDynamicProductsAction();
    setDynamicProducts(prods);
    if (prods.length > 0) {
      setSelectedProduct(prods[0].id);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (selectedProduct) {
      loadData(selectedProduct);
    }
  }, [selectedProduct]);

  const loadData = async (productId: string) => {
    setIsLoading(true);
    const prod = dynamicProducts.find(p => p.id === productId);
    const sheetTitle = prod?.name || productId;
    const res = await getSheetDataAction(sheetTitle);
    if (res.success && res.data) {
      setData(res.data);
    } else {
      setData([]);
    }
    setIsLoading(false);
  };

  const handleDownloadExcel = () => {
    if (data.length === 0) {
      showAlert('다운로드할 데이터가 없습니다.', 'info');
      return;
    }
    const prod = dynamicProducts.find(p => p.id === selectedProduct);
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, prod?.name || 'Data');
    XLSX.writeFile(wb, `${prod?.name}_데이터_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-100/80 pb-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">DB 조회 및 다운로드</h2>
        <button onClick={handleDownloadExcel} className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-green-600/20 w-full sm:w-auto">
          <Download size={16} /> 엑셀 다운로드
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {dynamicProducts.map(p => (
          <button 
            key={p.id}
            onClick={() => setSelectedProduct(p.id)}
            className={`px-3 md:px-4 py-2 rounded-xl font-bold text-[13px] md:text-sm transition-all ${selectedProduct === p.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'}`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-gray-400 py-10 text-center text-sm">데이터 불러오는 중...</div>
      ) : data.length === 0 ? (
        <div className="text-gray-400 text-sm text-center py-20 border-2 border-dashed border-gray-200 bg-gray-50 rounded-2xl">
          수집된 데이터가 없습니다.
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-2xl bg-white shadow-sm">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
              <tr>
                {Object.keys(data[0] || {}).map((key, i) => (
                  <th key={i} className="px-4 py-3">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  {Object.values(row).map((val: any, j) => (
                    <td key={j} className="px-4 py-3 text-gray-700">{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
