import ExcelJS from 'exceljs';
import { format, parseISO } from 'date-fns';
import { Category, Expense, AccountId } from '../types';
import { accountName } from './accounts';

const WHITE = 'FFFFFFFF';
const MUTED = 'FF94A3B8';
const BORDER_GREY = 'FFE2E8F0';
const BRAND_PURPLE = 'FF7C3AED';
const BRAND_PURPLE_DARK = 'FF6D28D9';
const BAND_TINT = 'FFF8F6FD';

const CATEGORY_COLORS: Record<Category, { solid: string; light: string }> = {
  Food: { solid: 'FF059669', light: 'FFD1FAE5' },
  Transport: { solid: 'FF1D4ED8', light: 'FFDBEAFE' },
  Bills: { solid: 'FFB45309', light: 'FFFEF3C7' },
  Shopping: { solid: 'FF4338CA', light: 'FFE0E7FF' },
  Entertainment: { solid: 'FFBE123C', light: 'FFFFE4E6' },
  Installment: { solid: 'FF6D28D9', light: 'FFEDE9FE' },
  Committee: { solid: 'FF0F766E', light: 'FFCCFBF1' },
  Others: { solid: 'FF475569', light: 'FFF1F5F9' },
};

const ACCOUNT_COLORS: Record<AccountId, { solid: string; light: string }> = {
  bank: { solid: 'FF1D4ED8', light: 'FFDBEAFE' },
  easypaisa: { solid: 'FF047857', light: 'FFD1FAE5' },
  cash: { solid: 'FFB45309', light: 'FFFEF3C7' },
};

const MONEY_FMT = '"Rs" #,##0;[Red]-"Rs" #,##0';

const thinBorder = (): Partial<ExcelJS.Borders> => {
  const side: ExcelJS.Border = { style: 'thin', color: { argb: BORDER_GREY } };
  return { top: side, left: side, bottom: side, right: side };
};

export interface ExportSummary {
  totalIncome: number;
  totalExpenses: number;
  availableBalance: number;
  accountBalances: Record<AccountId, number>;
}

export async function exportExpensesToExcel(expenses: Expense[], summary: ExportSummary) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'PennyWise';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Expense Report', {
    properties: { tabColor: { argb: BRAND_PURPLE } },
  });

  sheet.columns = [
    { key: 'date', width: 15 },
    { key: 'category', width: 17 },
    { key: 'description', width: 34 },
    { key: 'amount', width: 16 },
    { key: 'account', width: 14 },
    { key: 'notes', width: 34 },
  ];

  // --- Title banner ---
  sheet.mergeCells('A1:F1');
  sheet.getRow(1).height = 36;
  const title = sheet.getCell('A1');
  title.value = 'PennyWise — Expense Report';
  title.font = { name: 'Calibri', size: 20, bold: true, color: { argb: WHITE } };
  title.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_PURPLE } };

  sheet.mergeCells('A2:F2');
  sheet.getRow(2).height = 20;
  const subtitle = sheet.getCell('A2');
  subtitle.value = `Generated ${format(new Date(), 'dd MMM yyyy, h:mm a')}  ·  ${expenses.length} transactions`;
  subtitle.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FFEDE9FE' } };
  subtitle.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  subtitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_PURPLE_DARK } };

  // --- Overview section ---
  sheet.mergeCells('A4:F4');
  sheet.getRow(4).height = 20;
  const overviewHeader = sheet.getCell('A4');
  overviewHeader.value = 'OVERVIEW';
  overviewHeader.font = { bold: true, size: 10, color: { argb: BRAND_PURPLE_DARK } };
  overviewHeader.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  overviewHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3E8FF' } };

  const card = (
    labelRange: string,
    valueRange: string,
    label: string,
    value: number,
    labelColor: string,
    valueFill: string,
    valueColor: string,
    big = false
  ) => {
    sheet.mergeCells(labelRange);
    const labelCell = sheet.getCell(labelRange.split(':')[0]);
    labelCell.value = label;
    labelCell.font = { bold: true, size: 9, color: { argb: labelColor } };
    labelCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

    sheet.mergeCells(valueRange);
    const valueCell = sheet.getCell(valueRange.split(':')[0]);
    valueCell.value = value;
    valueCell.numFmt = MONEY_FMT;
    valueCell.font = { bold: true, size: big ? 18 : 13, color: { argb: valueColor } };
    valueCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    valueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: valueFill } };
  };

  sheet.getRow(5).height = 16;
  sheet.getRow(6).height = 30;
  card('A5:B5', 'A6:B6', 'TOTAL INCOME', summary.totalIncome, 'FF059669', 'FFECFDF5', 'FF065F46');
  card('C5:D5', 'C6:D6', 'TOTAL EXPENSES', summary.totalExpenses, 'FFBE123C', 'FFFFF1F2', 'FF9F1239');
  card('E5:F5', 'E6:F6', 'AVAILABLE BALANCE', summary.availableBalance, BRAND_PURPLE_DARK, 'FFF3E8FF', BRAND_PURPLE_DARK, true);

  sheet.getRow(8).height = 16;
  sheet.getRow(9).height = 26;
  card('A8:B8', 'A9:B9', 'BANK', summary.accountBalances.bank, ACCOUNT_COLORS.bank.solid, ACCOUNT_COLORS.bank.light, ACCOUNT_COLORS.bank.solid);
  card('C8:D8', 'C9:D9', 'EASYPAISA', summary.accountBalances.easypaisa, ACCOUNT_COLORS.easypaisa.solid, ACCOUNT_COLORS.easypaisa.light, ACCOUNT_COLORS.easypaisa.solid);
  card('E8:F8', 'E9:F9', 'CASH', summary.accountBalances.cash, ACCOUNT_COLORS.cash.solid, ACCOUNT_COLORS.cash.light, ACCOUNT_COLORS.cash.solid);

  // --- Transaction history ---
  sheet.mergeCells('A11:F11');
  sheet.getRow(11).height = 20;
  const historyHeader = sheet.getCell('A11');
  historyHeader.value = 'TRANSACTION HISTORY';
  historyHeader.font = { bold: true, size: 10, color: { argb: BRAND_PURPLE_DARK } };
  historyHeader.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  historyHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3E8FF' } };

  const headerRowIdx = 12;
  const headers = ['Date', 'Category', 'Description', 'Amount', 'Account', 'Notes'];
  const headerRow = sheet.getRow(headerRowIdx);
  headerRow.height = 22;
  headers.forEach((text, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = text;
    cell.font = { bold: true, size: 11, color: { argb: WHITE } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_PURPLE } };
    cell.alignment = { vertical: 'middle', horizontal: i === 3 ? 'right' : 'left', indent: i === 3 ? 0 : 1 };
    cell.border = thinBorder();
  });

  let r = headerRowIdx + 1;
  expenses.forEach((exp, idx) => {
    const row = sheet.getRow(r);
    row.height = 20;
    const band = idx % 2 === 0 ? WHITE : BAND_TINT;
    const catColors = CATEGORY_COLORS[exp.category] ?? CATEGORY_COLORS.Others;
    const accColors = ACCOUNT_COLORS[exp.accountId] ?? ACCOUNT_COLORS.cash;

    const dateCell = row.getCell(1);
    dateCell.value = parseISO(exp.date);
    dateCell.numFmt = 'dd mmm yyyy';
    dateCell.alignment = { vertical: 'middle', indent: 1 };
    dateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: band } };

    const catCell = row.getCell(2);
    catCell.value = exp.category;
    catCell.font = { bold: true, size: 10, color: { argb: catColors.solid } };
    catCell.alignment = { vertical: 'middle', horizontal: 'center' };
    catCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: catColors.light } };

    const descCell = row.getCell(3);
    descCell.value = exp.description;
    descCell.alignment = { vertical: 'middle', indent: 1 };
    descCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: band } };

    const amountCell = row.getCell(4);
    amountCell.value = exp.amount;
    amountCell.numFmt = MONEY_FMT;
    amountCell.font = { bold: true, size: 10.5 };
    amountCell.alignment = { vertical: 'middle', horizontal: 'right' };
    amountCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: band } };

    const accCell = row.getCell(5);
    accCell.value = accountName(exp.accountId);
    accCell.font = { bold: true, size: 10, color: { argb: accColors.solid } };
    accCell.alignment = { vertical: 'middle', horizontal: 'center' };
    accCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: accColors.light } };

    const notesCell = row.getCell(6);
    notesCell.value = exp.notes || '';
    notesCell.font = { italic: true, size: 10, color: { argb: MUTED } };
    notesCell.alignment = { vertical: 'middle', indent: 1 };
    notesCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: band } };

    for (let c = 1; c <= 6; c++) row.getCell(c).border = thinBorder();
    r++;
  });

  // --- Grand total row ---
  const totalRow = sheet.getRow(r);
  totalRow.height = 24;
  sheet.mergeCells(`A${r}:C${r}`);
  const totalLabel = sheet.getCell(`A${r}`);
  totalLabel.value = 'GRAND TOTAL';
  totalLabel.font = { bold: true, size: 11, color: { argb: WHITE } };
  totalLabel.alignment = { vertical: 'middle', horizontal: 'right', indent: 1 };

  const totalValue = sheet.getCell(`D${r}`);
  totalValue.value = expenses.length ? { formula: `SUM(D${headerRowIdx + 1}:D${r - 1})` } : 0;
  totalValue.numFmt = MONEY_FMT;
  totalValue.font = { bold: true, size: 12, color: { argb: WHITE } };
  totalValue.alignment = { vertical: 'middle', horizontal: 'right' };

  for (let c = 1; c <= 6; c++) {
    const cell = totalRow.getCell(c);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_PURPLE_DARK } };
    cell.border = thinBorder();
    if (!cell.font) cell.font = { color: { argb: WHITE } };
  }

  sheet.views = [{ state: 'frozen', ySplit: headerRowIdx, showGridLines: false }];
  if (expenses.length) {
    sheet.autoFilter = { from: { row: headerRowIdx, column: 1 }, to: { row: r - 1, column: 6 } };
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `PennyWise_Export_${format(new Date(), 'yyyy_MM_dd')}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
