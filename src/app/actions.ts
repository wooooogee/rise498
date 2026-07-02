'use server';

import { createEformsignDocument } from '@/lib/eformsign';
import { addRegistrationToSheet } from '@/lib/googleSheets';

function formatBirth8(birth: string) {
  if (!birth || birth.length !== 6) return birth;
  const year = parseInt(birth.substring(0, 2));
  // 26년 이전이면 2000년대, 그 이후면 1900년대로 판단
  const prefix = year <= 26 ? '20' : '19';
  return prefix + birth;
}

export async function registerAction(data: any) {
  try {
    console.log('--- Register Action Started ---');

    const eformResult = await createEformsignDocument(data);

    if (!eformResult.success) {
      return {
        success: false,
        message: '이폼사인 전송 중 오류가 발생했습니다: ' + eformResult.message,
      };
    }

    // Google Sheets에 데이터 기록
    try {
      const sheetData: any = {
        '신청일시': new Date().toLocaleString('ko-KR'),
        '상품명': data.product || '하이브리드698',
        '계약자': data.name,
        '연락처': data.phone,
        '주소': `${data.address} ${data.addressDetail}`,
        '제품명': data.hasMultipleProducts ? `${data.productName}, ${data.productName2}` : data.productName,
        '구좌수': data.productCount,
        '결제정보(카드/cms)': data.paymentMethod === 'card' ? '카드' : 'CMS',
        '카드사/은행명': data.paymentMethod === 'card' ? data.paymentInfo.cardCompany : data.paymentInfo.bankName,
        '카드번호/계좌번호': data.paymentMethod === 'card' ? data.paymentInfo.cardNumber : data.paymentInfo.accountNumber,
        '유효기간': data.paymentMethod === 'card' ? data.paymentInfo.cardExpiry : '',
        '결제일': data.paymentDate,
        '영업자소속': data.salesAffiliation,
        '영업자': data.salesName,
        '영업자연락처': data.salesPhone,
        'document_id': eformResult.document_id,
        '상태': '신청완료'
      };

      // 헬스케어 대상자 정보 추가
      if (data.healthcareTargets && Array.isArray(data.healthcareTargets)) {
        data.healthcareTargets.forEach((target: any, index: number) => {
          if (target.name && target.birth) {
            const birth8 = formatBirth8(target.birth);
            const genderDigit = target.gender === '남' ? '1' : '2';
            sheetData[`대상자${index + 1}`] = `${target.name} ${birth8}-${genderDigit} ${target.phone}`;
          }
        });
      }
      
      await addRegistrationToSheet(sheetData, '라이즈498');
      console.log('Google Sheets 기록 완료 (라이즈498 시트)');
    } catch (sheetError) {
      console.error('Google Sheets 기록 중 실패 (프로세스는 계속됨):', sheetError);
    }

    console.log('문서 생성 완료, document_id:', eformResult.document_id);
    console.log('--- Register Action Completed ---');

    return {
      success: true,
      documentId: eformResult.document_id,
      message: '가입 신청 및 전자 서명이 완료되었습니다.',
    };
  } catch (error: any) {
    console.error('--- Register Action Fatal Error ---', error);
  }
}

export async function verifyLogin(type: 'admin' | 'sales', code: string) {
  try {
    if (type === 'admin') {
      // Basic hardcoded admin password for now, can be changed via env
      const adminCode = process.env.ADMIN_PASSWORD || '880805';
      if (code === adminCode) {
        return { success: true, message: '관리자 로그인 성공', role: 'admin' };
      }
      return { success: false, message: '관리자 비밀번호가 일치하지 않습니다.' };
    } else {
      // Sales verification using Google Sheets (verifyEmployee)
      const { verifyEmployee } = await import('@/lib/googleSheets');
      const result = await verifyEmployee(code);
      if (result.success) {
        return { success: true, message: '영업자 로그인 성공', role: 'sales', employeeInfo: result.employeeInfo };
      }
      return { success: false, message: '등록되지 않은 영업자 코드입니다.' };
    }
  } catch (error: any) {
    console.error('Login Error:', error);
    return { success: false, message: '로그인 처리 중 오류가 발생했습니다.' };
  }
}

export async function searchEmployeesAction(term: string) {
  try {
    const { searchEmployees } = await import('@/lib/googleSheets');
    return await searchEmployees(term);
  } catch (error: any) {
    console.error('Error searching employees:', error);
    return { success: false, message: '검색 중 오류가 발생했습니다.' };
  }
}

export async function getFormConfigAction(product: string) {
  try {
    const { getFormConfig } = await import('@/lib/googleSheets');
    const config = await getFormConfig(product);
    return { success: true, config: config || [] };
  } catch (error: any) {
    console.error('Error fetching config:', error);
    return { success: false, config: [] };
  }
}

export async function saveFormConfigAction(product: string, config: any[]) {
  try {
    const { saveFormConfig } = await import('@/lib/googleSheets');
    return await saveFormConfig(product, config);
  } catch (error: any) {
    console.error('Error saving config:', error);
    return { success: false, message: error.message };
  }
}

export async function getDynamicProductsAction() {
  try {
    const { getDynamicProducts } = await import('@/lib/googleSheets');
    return await getDynamicProducts();
  } catch (error: any) {
    console.error('Error fetching dynamic products:', error);
    return [];
  }
}

export async function saveDynamicProductsAction(products: {id: string, name: string}[]) {
  try {
    const { saveDynamicProducts } = await import('@/lib/googleSheets');
    return await saveDynamicProducts(products);
  } catch (error: any) {
    console.error('Error saving dynamic products:', error);
    return { success: false, message: error.message };
  }
}

export async function submitDynamicFormAction(product: string, data: any) {
  try {
    const { getSheetData, getAdminDoc, getDynamicProducts } = await import('@/lib/googleSheets');
    const doc = await getAdminDoc();
    
    // Fetch dynamic products to map ID to actual product name
    const dynamicProducts = await getDynamicProducts();
    const prod = dynamicProducts.find((p: any) => p.id === product);
    const sheetTitle = prod ? prod.name : product;
    
    let sheet = doc.sheetsByTitle[sheetTitle];
    if (!sheet) {
      sheet = await doc.addSheet({ title: sheetTitle, headerValues: Object.keys(data) });
    }

    try {
      await sheet.loadHeaderRow();
      const existingHeaders = sheet.headerValues;
      const dataKeys = Object.keys(data);
      const missingHeaders = dataKeys.filter(key => !existingHeaders.includes(key));
      
      if (missingHeaders.length > 0) {
        await sheet.setHeaderRow([...existingHeaders, ...missingHeaders]);
      }
    } catch (e) {
      await sheet.setHeaderRow(Object.keys(data));
    }

    await sheet.addRow({ '신청일시': new Date().toLocaleString('ko-KR'), ...data });

    return { success: true, message: '성공적으로 등록되었습니다.' };
  } catch (error: any) {
    console.error('Submit Error:', error);
    return { success: false, message: '등록 중 오류가 발생했습니다.' };
  }
}

export async function getSheetDataAction(sheetTitle: string) {
  try {
    const { getSheetData } = await import('@/lib/googleSheets');
    return await getSheetData(sheetTitle);
  } catch (error: any) {
    return { success: false, data: [] };
  }
}

export async function registerEmployeeAction(data: any) {
  try {
    const { registerEmployeeCode } = await import('@/lib/googleSheets');
    return await registerEmployeeCode(data);
  } catch (error: any) {
    console.error('Error registering employee:', error);
    return { success: false, message: error.message };
  }
}

export async function getEmployeesAction() {
  try {
    const { getEmployees } = await import('@/lib/googleSheets');
    return await getEmployees();
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function updateEmployeeAction(code: string, data: any) {
  try {
    const { updateEmployee } = await import('@/lib/googleSheets');
    return await updateEmployee(code, data);
  } catch (error: any) {
    console.error('Error updating employee:', error);
    return { success: false, message: error.message };
  }
}

export async function deleteEmployeeAction(code: string) {
  try {
    const { deleteEmployee } = await import('@/lib/googleSheets');
    return await deleteEmployee(code);
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}



