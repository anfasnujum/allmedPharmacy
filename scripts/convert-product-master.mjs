import XLSX from 'xlsx';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const inputPath = join(root, 'data/PRODUCT MASTER.xlsx');
const outputPath = join(root, 'public/data/products.json');
const dataCopyPath = join(root, 'data/products.json');

const RX_SCHEDULES = new Set(['H', 'H1', 'X', 'Rx', 'NRx']);

function toStr(v) {
  if (v == null) return '';
  return String(v).trim();
}

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function mapRow(row) {
  const code = toStr(row.Code);
  if (!code) return null;

  const scheduleType = toStr(row['Schedule Type']);
  const genericName = toStr(row['Genric Name']);

  const product = {
    id: code,
    sku: code,
    code,
    fullName: toStr(row['Full Name']),
    name: toStr(row['Full Name']) || toStr(row.Form) || toStr(row.Name),
    form: toStr(row.Form),
    strength: toStr(row.Strength) || toStr(row.Packing) || '',
    mrp: toNum(row.MRP),
    unitPrice: toNum(row.MRP),
    genericName,
    brand: toStr(row['Manf Name']) || toStr(row.Name) || '',
    category: toStr(row.Category) || toStr(row['Product Tree1']) || 'General',
    prescriptionRequired: RX_SCHEDULES.has(scheduleType),
    stockStatus: 'In Stock',
    slNo: toNum(row.SLNo) || undefined,
    type: toStr(row.Type) || undefined,
    manfPrCode: toStr(row['Manf Pr Code']) || undefined,
    brandName: toStr(row.Name) || undefined,
    packing: toStr(row.Packing) || undefined,
    ean: toStr(row.EAN) || undefined,
    unitName: toStr(row['Unit Name']) || undefined,
    unitsPerPack: toNum(row['Units/Pack']) || undefined,
    packName: toStr(row['Pack Name']) || undefined,
    shortName: toStr(row['Short Name']) || undefined,
    indiaTax: toStr(row['India Tax']) || undefined,
    manfCode: toStr(row['Manf Code']) || undefined,
    manfName: toStr(row['Manf Name']) || undefined,
    genericCode: toStr(row['Generic Code']) || undefined,
    productTree1: toStr(row['Product Tree1']) || undefined,
    productTree2: toStr(row['Product Tree2']) || undefined,
    productTree3: toStr(row['Product Tree3']) || undefined,
    productTree4: toStr(row['Product Tree4']) || undefined,
    productTree5: toStr(row['Product Tree5']) || undefined,
    category2: toStr(row.Category2) || undefined,
    hsnCode: toStr(row['HSN Code']) || undefined,
    activationStatus: toStr(row['Activation Status']) || undefined,
    scheduleType: scheduleType || undefined,
    dateOfIntroduction: toStr(row['Date of Introduction']) || undefined,
    addlCode1: toStr(row['Addl Code1']) || undefined,
    addlCode2: toStr(row['Addl Code2']) || undefined,
    addlCode3: toStr(row['Addl Code3']) || undefined,
    storageType: toStr(row['Storage Type']) || undefined,
    lpCategory: toStr(row['LP Category']) || undefined,
    productRange: toStr(row['Product Range']) || undefined,
    centralizedReorderDivisions: toStr(row['Centralized Reorder Divisions']) || undefined,
    therapeuticClass: toStr(row['Theurapatic Class']) || undefined,
    storeClass: toStr(row['Store Class']) || undefined,
    addlDesc: toStr(row['Addl Desc']) || undefined,
    createdUser: toStr(row['Created User']) || undefined,
    lastModifiedUser: toStr(row['Last Modified User']) || undefined,
    lastModifiedTime: toStr(row['Last Modified Time']) || undefined,
    productType: toStr(row['Product Type']) || undefined,
    riskValue: toStr(row['Risk Value']) || undefined,
    nonReturnableItem: toStr(row['Non Returnable Item']) || undefined,
    isNppaItem: toStr(row['Is NPPA Item']) || undefined,
    centralisedLocation: toStr(row['Centralised Location']) || undefined,
  };

  return Object.fromEntries(Object.entries(product).filter(([, v]) => v !== '' && v !== undefined));
}

const wb = XLSX.readFile(inputPath);
const rows = XLSX.utils.sheet_to_json(wb.Sheets['Report'], { range: 6, defval: null });
const products = rows.map(mapRow).filter(Boolean);

mkdirSync(dirname(outputPath), { recursive: true });
const json = JSON.stringify(products);
writeFileSync(outputPath, json);
writeFileSync(dataCopyPath, json);

console.log(`Wrote ${products.length} products to ${outputPath}`);
const { statSync } = await import('fs');
console.log(`File size: ${(statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
