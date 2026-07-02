import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID || '19HQigorXz8j2K2PyQx4k4rGGUMVKk43aNSAI9sEgRyc';
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY
  ?.replace(/^"|"$/g, '')
  ?.replace(/\\n/g, '\n');

export async function verifyEmployee(searchTerm: string) {
  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    console.warn('Google Sheets credentials are not set.');
    return { success: false, error: 'credentials_missing' };
  }

  try {
    const doc = await getAdminDoc();
    const sheet = doc.sheetsByTitle['회원코드'];
    if (!sheet) {
      throw new Error("'회원코드' 시트를 찾을 수 없습니다.");
    }

    let rows: any[] = [];
    try {
      rows = await sheet.getRows();
    } catch (e: any) {
      if (e.message && e.message.includes('No values in the header row')) {
        await sheet.setHeaderRow(['본부', '지사', '지점', '사원코드', '코드명', '사원명', '휴대폰번호', '재직구분']);
        rows = await sheet.getRows();
      } else {
        throw e;
      }
    }
    const headers = sheet.headerValues;

    const clean = (str: any) => 
      str ? String(str).normalize('NFC').replace(/[\s\-_]/g, '').toLowerCase() : '';

    const findIndex = (name: string, defaultIdx: number) => {
      const idx = headers.findIndex(h => clean(h).includes(clean(name)));
      return idx !== -1 ? idx : defaultIdx;
    };

    const idx = {
      code: findIndex('사원코드', 3),
      codeName: findIndex('코드명', 4),
      name: findIndex('사원명', 5),
      phone: findIndex('휴대폰번호', 6),
      status: findIndex('재직구분', 7),
      hq: findIndex('본부', 0),
      branch: findIndex('지사', 1),
      agency: findIndex('지점', 2)
    };

    const target = clean(searchTerm);
    
    const foundRow = rows.find((row) => {
      const status = clean(row.get(headers[idx.status]));
      const code = clean(row.get(headers[idx.code]));
      const codeName = clean(row.get(headers[idx.codeName]));
      const phone = clean(row.get(headers[idx.phone]));
      
      if (!codeName && !code && !phone) return false;

      const codeMatch = code && (code === target);
      const codeNameMatch = codeName && (codeName === target || codeName.includes(target));
      const phoneMatch = phone && (phone === target || phone.includes(target));
      
      if (codeMatch || codeNameMatch || phoneMatch) {
         const isEmployed = status.includes('재직') || status === ''; // Allow if empty just in case
         if (isEmployed) return true;
      }
      return false;
    });

    if (foundRow) {
      const display = (str: any) => str ? String(str).normalize('NFC').trim() : '';

      const code = display(foundRow.get(headers[idx.code]));
      const name = display(foundRow.get(headers[idx.name]));
      const phone = display(foundRow.get(headers[idx.phone]));
      const branch = display(foundRow.get(headers[idx.branch]));
      
      console.log(`[verifyEmployee] Match found: ${code}(${name})`);
      return { 
        success: true, 
        employeeInfo: JSON.stringify({ code, name, phone, branch })
      };
    }

    return { success: false, error: 'not_found' };
  } catch (error) {
    console.error('Error verifying employee:', error);
    throw error;
  }
}

export async function searchEmployees(searchTerm: string) {
  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    console.warn('Google Sheets credentials are not set.');
    return { success: false, error: 'credentials_missing' };
  }

  try {
    const doc = await getAdminDoc();
    const sheet = doc.sheetsByTitle['회원코드'];
    if (!sheet) {
      throw new Error("'회원코드' 시트를 찾을 수 없습니다.");
    }

    let rows: any[] = [];
    try {
      rows = await sheet.getRows();
    } catch (e: any) {
      if (e.message && e.message.includes('No values in the header row')) {
        await sheet.setHeaderRow(['본부', '지사', '지점', '사원코드', '코드명', '사원명', '휴대폰번호', '재직구분']);
        rows = await sheet.getRows();
      } else {
        throw e;
      }
    }
    const headers = sheet.headerValues;

    const clean = (str: any) => 
      str ? String(str).normalize('NFC').replace(/[\s\-_]/g, '').toLowerCase() : '';

    const findIndex = (name: string, defaultIdx: number) => {
      const idx = headers.findIndex(h => clean(h).includes(clean(name)));
      return idx !== -1 ? idx : defaultIdx;
    };

    const idx = {
      code: findIndex('사원코드', 3),
      codeName: findIndex('코드명', 4),
      name: findIndex('사원명', 5),
      phone: findIndex('휴대폰번호', 6),
      status: findIndex('재직구분', 7),
      hq: findIndex('본부', 0),
      branch: findIndex('지사', 1),
      agency: findIndex('지점', 2)
    };

    const target = clean(searchTerm);
    
    const matchedEmployees: any[] = [];

    for (const row of rows) {
      const status = clean(row.get(headers[idx.status]));
      const code = clean(row.get(headers[idx.code]));
      const codeName = clean(row.get(headers[idx.codeName]));
      const name = clean(row.get(headers[idx.name]));
      const phone = clean(row.get(headers[idx.phone]));
      
      if (!codeName && !code && !name && !phone) continue;

      const codeMatch = code && (code === target || code.includes(target));
      const codeNameMatch = codeName && (codeName === target || codeName.includes(target));
      const nameMatch = name && (name === target || name.includes(target));
      const phoneMatch = phone && (phone === target || phone.includes(target));
      
      if (codeMatch || codeNameMatch || nameMatch || phoneMatch) {
         const isEmployed = status.includes('재직') || status === '';
         if (isEmployed) {
           const display = (str: any) => str ? String(str).normalize('NFC').trim() : '';
           matchedEmployees.push({
             code: display(row.get(headers[idx.code])),
             codeName: display(row.get(headers[idx.codeName])),
             name: display(row.get(headers[idx.name])),
             phone: display(row.get(headers[idx.phone])),
             branch: display(row.get(headers[idx.branch]))
           });
         }
      }
    }

    return { 
      success: true, 
      data: matchedEmployees
    };
  } catch (error) {
    console.error('Error searching employees:', error);
    throw error;
  }
}

export async function addRegistrationToSheet(data: any, sheetTitle: string = '신청현황') {
  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    console.warn('Google Sheets credentials are not set.');
    return { success: false, error: 'credentials_missing' };
  }

  try {
    const doc = await getAdminDoc();

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

    const result = await sheet.addRow(data);
    return { success: true, rowNumber: result.rowNumber };
  } catch (error: any) {
    console.error('Google Sheets AddRow Error:', error);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// ADMIN & DYNAMIC FORM FUNCTIONS
// ---------------------------------------------------------------------------

const ADMIN_SPREADSHEET_ID = process.env.ADMIN_GOOGLE_SHEET_ID || SPREADSHEET_ID;

// --- Caching Logic ---
let cachedAdminDoc: GoogleSpreadsheet | null = null;
let adminDocCacheTime = 0;

export const dataCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 1000 * 15; // 15 seconds default

export function getCachedData(key: string, ttl: number = CACHE_TTL) {
  const cached = dataCache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  return null;
}

export function setCachedData(key: string, data: any) {
  dataCache.set(key, { data, timestamp: Date.now() });
}
// -----------------------

export async function getAdminDoc() {
  if (cachedAdminDoc && Date.now() - adminDocCacheTime < 1000 * 60 * 5) {
    return cachedAdminDoc;
  }
  const serviceAccountAuth = new JWT({
    email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: GOOGLE_PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const doc = new GoogleSpreadsheet(ADMIN_SPREADSHEET_ID, serviceAccountAuth);
  await doc.loadInfo();
  cachedAdminDoc = doc;
  adminDocCacheTime = Date.now();
  return doc;
}

export const DEFAULT_PRODUCTS = [
  { id: 'car', name: '자동차' },
  { id: 'coway', name: '코웨이' },
  { id: 'internet', name: '인터넷TV' },
  { id: 'mobile', name: '휴대폰' },
  { id: 'insurance', name: '보험' },
  { id: 'bio', name: '바이오' }
];

export async function getDynamicProducts() {
  try {
    const cacheKey = `dynamicProducts`;
    const cached = getCachedData(cacheKey, 1000 * 2); // 2 seconds cache
    if (cached) return cached;

    const doc = await getAdminDoc();
    const sheet = doc.sheetsByTitle['form_configs'];
    if (!sheet) {
      setCachedData(cacheKey, DEFAULT_PRODUCTS);
      return DEFAULT_PRODUCTS;
    }

    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('product') === '__PRODUCTS__');
    if (row) {
      const config = JSON.parse(row.get('config') || '[]');
      if (config && config.length > 0) {
        setCachedData(cacheKey, config);
        return config;
      }
    }
    
    setCachedData(cacheKey, DEFAULT_PRODUCTS);
    return DEFAULT_PRODUCTS;
  } catch (e) {
    console.error('Error fetching dynamic products:', e);
    return DEFAULT_PRODUCTS;
  }
}

export async function saveDynamicProducts(products: {id: string, name: string}[]) {
  try {
    const doc = await getAdminDoc();
    let sheet = doc.sheetsByTitle['form_configs'];
    if (!sheet) {
      sheet = await doc.addSheet({ title: 'form_configs', headerValues: ['product', 'config'] });
    }

    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('product') === '__PRODUCTS__');
    if (row) {
      row.assign({ config: JSON.stringify(products) });
      await row.save();
    } else {
      await sheet.addRow({ product: '__PRODUCTS__', config: JSON.stringify(products) });
    }
    
    dataCache.delete(`dynamicProducts`);
    return { success: true };
  } catch (e: any) {
    console.error('Error saving dynamic products:', e);
    return { success: false, message: e.message };
  }
}

export async function getFormConfig(product: string) {
  try {
    const cacheKey = `formConfig_${product}`;
    const cached = getCachedData(cacheKey, 1000 * 60 * 5); // 5 mins cache
    if (cached) return cached;

    const doc = await getAdminDoc();
    const sheet = doc.sheetsByTitle['form_configs'];
    if (!sheet) return null;

    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('product') === product);
    if (row) {
      const config = JSON.parse(row.get('config') || '[]');
      setCachedData(cacheKey, config);
      return config;
    }
    return null;
  } catch (e) {
    console.error('Error fetching form config:', e);
    return null;
  }
}

export async function saveFormConfig(product: string, config: any[]) {
  try {
    const doc = await getAdminDoc();
    let sheet = doc.sheetsByTitle['form_configs'];
    if (!sheet) {
      sheet = await doc.addSheet({ title: 'form_configs', headerValues: ['product', 'config'] });
    }

    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('product') === product);
    if (row) {
      row.assign({ config: JSON.stringify(config) });
      await row.save();
    } else {
      await sheet.addRow({ product, config: JSON.stringify(config) });
    }
    
    // Invalidate cache
    dataCache.delete(`formConfig_${product}`);
    
    return { success: true };
  } catch (e: any) {
    console.error('Error saving form config:', e);
    return { success: false, message: e.message };
  }
}

export async function getSheetData(sheetTitle: string) {
  try {
    const cacheKey = `sheetData_${sheetTitle}`;
    const cached = getCachedData(cacheKey);
    if (cached) return { success: true, data: cached };

    const doc = await getAdminDoc();
    const sheet = doc.sheetsByTitle[sheetTitle];
    if (!sheet) return { success: true, data: [] }; // No data yet

    const rows = await sheet.getRows();
    const headers = sheet.headerValues;
    const data = rows.map(row => {
      const obj: any = {};
      headers.forEach(h => {
        obj[h] = row.get(h);
      });
      return obj;
    });
    
    setCachedData(cacheKey, data);
    return { success: true, data };
  } catch (e: any) {
    console.error('Error fetching sheet data:', e);
    return { success: false, message: e.message };
  }
}

export async function registerEmployeeCode(data: any) {
  try {
    const doc = await getAdminDoc();
    let sheet = doc.sheetsByTitle['회원코드'];
    if (!sheet) {
      sheet = await doc.addSheet({ 
        title: '회원코드', 
        headerValues: ['본부', '지사', '지점', '사원코드', '코드명', '사원명', '휴대폰번호', '재직구분'] 
      });
    } else {
      try {
        await sheet.loadHeaderRow();
      } catch (e: any) {
        if (e.message && e.message.includes('No values in the header row')) {
          await sheet.setHeaderRow(['본부', '지사', '지점', '사원코드', '코드명', '사원명', '휴대폰번호', '재직구분']);
        }
      }
    }

    await sheet.addRow({
      '본부': data.hq || '',
      '지사': data.branch || '',
      '지점': data.agency || '',
      '사원코드': data.code,
      '코드명': data.codeName || '',
      '사원명': data.name,
      '휴대폰번호': data.phone,
      '재직구분': data.status || '재직'
    });
    return { success: true };
  } catch (e: any) {
    console.error('Error registering employee:', e);
    return { success: false, message: e.message };
  }
}

export async function getEmployees() {
  try {
    const cacheKey = 'employees';
    const cached = getCachedData(cacheKey);
    if (cached) return { success: true, data: cached };

    const doc = await getAdminDoc();
    const sheet = doc.sheetsByTitle['회원코드'];
    if (!sheet) return { success: true, data: [] };

    let rows: any[] = [];
    try {
      rows = await sheet.getRows();
    } catch (e: any) {
      if (e.message && e.message.includes('No values in the header row')) {
        await sheet.setHeaderRow(['본부', '지사', '지점', '사원코드', '코드명', '사원명', '휴대폰번호', '재직구분']);
        rows = await sheet.getRows();
      } else {
        throw e;
      }
    }
    const data = rows.map(row => ({
      hq: row.get('본부'),
      branch: row.get('지사'),
      agency: row.get('지점'),
      code: row.get('사원코드'),
      codeName: row.get('코드명'),
      name: row.get('사원명'),
      phone: row.get('휴대폰번호'),
      status: row.get('재직구분')
    }));
    
    setCachedData(cacheKey, data);
    return { success: true, data };
  } catch (e: any) {
    console.error('Error fetching employees:', e);
    return { success: false, message: e.message };
  }
}

export async function updateEmployee(code: string, data: any) {
  try {
    const doc = await getAdminDoc();
    const sheet = doc.sheetsByTitle['회원코드'];
    if (!sheet) return { success: false, message: "'회원코드' 시트가 없습니다." };

    let rows: any[] = [];
    try {
      rows = await sheet.getRows();
    } catch (e: any) {
      if (e.message && e.message.includes('No values in the header row')) {
        await sheet.setHeaderRow(['본부', '지사', '지점', '사원코드', '코드명', '사원명', '휴대폰번호', '재직구분']);
        rows = await sheet.getRows();
      } else {
        throw e;
      }
    }
    const row = rows.find(r => r.get('사원코드') === code);
    
    if (row) {
      row.assign({
        '본부': data.hq,
        '지사': data.branch,
        '지점': data.agency,
        '코드명': data.codeName,
        '사원명': data.name,
        '휴대폰번호': data.phone,
        '재직구분': data.status
      });
      await row.save();
      return { success: true };
    }
    return { success: false, message: '해당 코드를 찾을 수 없습니다.' };
  } catch (e: any) {
    console.error('Error updating employee:', e);
    return { success: false, message: e.message };
  }
}

export async function deleteEmployee(code: string) {
  try {
    const doc = await getAdminDoc();
    const sheet = doc.sheetsByTitle['회원코드'];
    if (!sheet) return { success: false, message: "'회원코드' 시트가 없습니다." };

    let rows: any[] = [];
    try {
      rows = await sheet.getRows();
    } catch (e: any) {
      if (e.message && e.message.includes('No values in the header row')) {
        await sheet.setHeaderRow(['본부', '지사', '지점', '사원코드', '코드명', '사원명', '휴대폰번호', '재직구분']);
        rows = await sheet.getRows();
      } else {
        throw e;
      }
    }
    const row = rows.find(r => r.get('사원코드') === code);
    
    if (row) {
      await row.delete();
      return { success: true };
    }
    return { success: false, message: '해당 코드를 찾을 수 없습니다.' };
  } catch (e: any) {
    console.error('Error deleting employee:', e);
    return { success: false, message: e.message };
  }
}


