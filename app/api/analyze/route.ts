import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

export async function GET() {
    const filePath = path.join(process.cwd(), '01-Tender 2025-26.xlsm');
    try {
        console.log('Attempting to read file:', filePath);

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ success: false, error: 'File not found', cwd: process.cwd() });
        }

        const fileBuffer = fs.readFileSync(filePath);
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

        const result: any = {};

        workbook.SheetNames.forEach(sheetName => {
            const sheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(sheet, { header: 1, range: 0, defval: '' }).slice(0, 5);
            result[sheetName] = data;
        });

        return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
        console.error('Error reading file:', error);
        return NextResponse.json({ success: false, error: error.message, stack: error.stack });
    }
}
