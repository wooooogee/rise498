'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Users, Settings, Database, Download, Plus, Trash2, Save } from 'lucide-react';
import * as XLSX from 'xlsx';
import { registerEmployeeAction, getFormConfigAction, saveFormConfigAction, getSheetDataAction, getEmployeesAction, updateEmployeeAction, deleteEmployeeAction } from '@/app/actions';
import CustomAlert from '@/components/CustomAlert';

const PRODUCTS = [
  { id: 'car', name: '자동차' },
  { id: 'coway', name: '코웨이' },
  { id: 'internet', name: '인터넷TV' },
  { id: 'mobile', name: '휴대폰' },
  { id: 'insurance', name: '보험' },
  { id: 'bio', name: '바이오' }
];

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
      <aside className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white w-full md:w-72 flex-shrink-0 md:min-h-screen flex flex-col sticky top-0 z-20 md:h-screen shadow-2xl border-r border-indigo-900/50">
        <div className="p-6 md:p-8 flex justify-between items-center md:block">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter">
              <span className="text-white">Admin</span><span className="text-indigo-400">Panel</span>
            </h1>
            <p className="text-indigo-300 text-[10px] md:text-xs mt-1 md:mt-2 font-medium tracking-wide">시스템 관리자 대시보드</p>
          </div>
          <button 
            onClick={handleLogout}
            className="md:hidden p-2.5 rounded-xl bg-white/5 text-indigo-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
        
        <nav className="px-4 pb-4 md:pb-0 flex md:flex-col gap-2 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('employees')}
            className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold transition-all whitespace-nowrap ${activeTab === 'employees' ? 'bg-indigo-600/90 text-white shadow-lg border border-indigo-500/30' : 'text-indigo-200 hover:bg-white/5 hover:text-white'}`}
          >
            <Users size={18} /> 영업자 코드 관리
          </button>
          <button 
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold transition-all whitespace-nowrap ${activeTab === 'config' ? 'bg-indigo-600/90 text-white shadow-lg border border-indigo-500/30' : 'text-indigo-200 hover:bg-white/5 hover:text-white'}`}
          >
            <Settings size={18} /> 상품 폼 설정
          </button>
          <button 
            onClick={() => setActiveTab('data')}
            className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold transition-all whitespace-nowrap ${activeTab === 'data' ? 'bg-indigo-600/90 text-white shadow-lg border border-indigo-500/30' : 'text-indigo-200 hover:bg-white/5 hover:text-white'}`}
          >
            <Database size={18} /> DB 조회 및 다운로드
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
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 min-h-[700px]">
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
          <p className="text-sm text-gray-500 mt-1">구글 시트 '회원코드' 탭에 새로운 코드를 등록합니다.</p>
        </div>
        <form onSubmit={handleSubmit} className="max-w-md space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 mb-1 block">본부</label>
              <input type="text" value={empData.hq} onChange={e => setEmpData({...empData, hq: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500" placeholder="본부명" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 mb-1 block">지사</label>
              <input type="text" value={empData.branch} onChange={e => setEmpData({...empData, branch: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500" placeholder="지사명" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 mb-1 block">지점</label>
              <input type="text" value={empData.agency} onChange={e => setEmpData({...empData, agency: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500" placeholder="지점명" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 mb-1 block">사원코드</label>
              <input type="text" value={empData.code} onChange={e => setEmpData({...empData, code: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500" placeholder="예: 24070101" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 mb-1 block">코드명</label>
              <input type="text" value={empData.codeName} onChange={e => setEmpData({...empData, codeName: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500" placeholder="코드명 입력" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 mb-1 block">사원명</label>
              <input type="text" value={empData.name} onChange={e => setEmpData({...empData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500" placeholder="이름 입력" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 mb-1 block">휴대폰번호</label>
              <input type="tel" value={empData.phone} onChange={e => setEmpData({...empData, phone: formatPhone(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500" placeholder="010-0000-0000" />
            </div>
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">
            {isSubmitting ? '등록 중...' : '등록하기'}
          </button>
        </form>
      </div>

      {/* List Section */}
      <div className="space-y-6 pt-6 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-black text-gray-900">영업자 목록 및 관리</h2>
            <p className="text-sm text-gray-500 mt-1">등록된 영업자를 검색, 수정, 삭제할 수 있습니다.</p>
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
          <div className="text-center py-10 text-gray-400">불러오는 중...</div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-2xl bg-white">
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
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">등록된 영업자가 없습니다.</td>
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
        )}
      </div>
    </div>
  );
}


// ---------------------------------------------------------------------------
// Form Configurator Tab
// ---------------------------------------------------------------------------
function ConfigTab({ showAlert }: { showAlert: (msg: string, type?: 'info' | 'success' | 'error') => void }) {
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0].id);
  const [fields, setFields] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadConfig(selectedProduct);
  }, [selectedProduct]);

  const loadConfig = async (product: string) => {
    setIsLoading(true);
    const res = await getFormConfigAction(product);
    if (res.success && res.config && res.config.length > 0) {
      setFields(res.config);
    } else {
      // Default basic fields (max 5 configurable)
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

  const updateField = (idx: number, key: string, value: string) => {
    const newFields = [...fields];
    newFields[idx][key] = value;
    setFields(newFields);
  };

  const removeField = (idx: number) => {
    const newFields = [...fields];
    newFields.splice(idx, 1);
    setFields(newFields);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">간편 상품 폼 설정</h2>
        <p className="text-sm text-gray-500 mt-2">이름, 연락처를 제외한 추가 필드를 각 상품별로 제한 없이 설정할 수 있습니다.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {PRODUCTS.map(p => (
          <button 
            key={p.id}
            onClick={() => setSelectedProduct(p.id)}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${selectedProduct === p.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-gray-400 py-10 text-center">불러오는 중...</div>
      ) : (
        <div className="space-y-4 max-w-2xl bg-gray-50 p-6 rounded-2xl border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 text-lg">추가 필드 구성 ({fields.length}개)</h3>
            <button onClick={addField} className="flex items-center gap-1 text-sm bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600 hover:text-indigo-600 hover:border-indigo-300 transition-colors">
              <Plus size={14} /> 필드 추가
            </button>
          </div>

          {fields.length === 0 && <p className="text-sm text-gray-400 text-center py-4">추가 필드가 없습니다. 이름과 연락처만 수집합니다.</p>}

          {fields.map((field, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row gap-3 sm:items-center bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex-1 space-y-1 w-full">
                <label className="text-[10px] font-bold text-gray-400 uppercase">표시될 이름 (Label)</label>
                <input type="text" value={field.label} onChange={e => updateField(idx, 'label', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" />
              </div>
              <div className="w-full sm:w-32 space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">입력 유형</label>
                <select value={field.type} onChange={e => updateField(idx, 'type', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500">
                  <option value="text">짧은 텍스트</option>
                  <option value="textarea">긴 텍스트(메모)</option>
                  <option value="date">날짜</option>
                  <option value="number">숫자</option>
                </select>
              </div>
              <button onClick={() => removeField(idx)} className="mt-2 sm:mt-5 p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors self-end sm:self-auto">
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          <div className="pt-4 flex justify-end">
            <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all">
              <Save size={16} /> {isSaving ? '저장 중...' : '설정 저장'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Data Viewer Tab
// ---------------------------------------------------------------------------
function DataTab({ showAlert }: { showAlert: (msg: string, type?: 'info' | 'success' | 'error') => void }) {
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0].id);
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData(selectedProduct);
  }, [selectedProduct]);

  const loadData = async (productId: string) => {
    setIsLoading(true);
    const prod = PRODUCTS.find(p => p.id === productId);
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
    const prod = PRODUCTS.find(p => p.id === selectedProduct);
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, prod?.name || 'Data');
    XLSX.writeFile(wb, `${prod?.name}_데이터_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-100/80 pb-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">DB 조회 및 다운로드</h2>
        <button onClick={handleDownloadExcel} className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-green-600/20 w-full sm:w-auto">
          <Download size={18} /> 엑셀 다운로드
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {PRODUCTS.map(p => (
          <button 
            key={p.id}
            onClick={() => setSelectedProduct(p.id)}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${selectedProduct === p.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-gray-400 py-10 text-center">데이터 불러오는 중...</div>
      ) : data.length === 0 ? (
        <div className="text-gray-400 text-sm text-center py-20 border-2 border-dashed border-gray-100 rounded-2xl">
          수집된 데이터가 없습니다.
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-2xl bg-white">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold">
              <tr>
                {Object.keys(data[0] || {}).map((key, i) => (
                  <th key={i} className="px-4 py-3">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
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
