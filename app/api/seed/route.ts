import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import dbConnect from '@/lib/db';
import Tender from '@/models/Tender';

export async function GET() {
    const filePath = path.join(process.cwd(), '01-Tender 2025-26.xlsm');
    try {
        await dbConnect();

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ success: false, error: 'File not found' });
        }

        const fileBuffer = fs.readFileSync(filePath);
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

        const sheetName = 'Tender';
        if (!workbook.Sheets[sheetName]) {
            return NextResponse.json({ success: false, error: 'Tender sheet not found' });
        }

        const sheet = workbook.Sheets[sheetName];
        // Read with header: 1 to get raw array structure or header row mapping
        // But better to use sheet_to_json with defaults
        const rawData: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        // Map data to model
        let count = 0;
        const tenders = [];

        // Clear existing data? Let's not clear for safety, or clear just for this dev session.
        // For now, I will clear all to ensure clean slate.
        await Tender.deleteMany({});

        for (const row of rawData) {
            if (!row['Name of Work']) continue; // Skip empty rows

            tenders.push({
                serialNo: String(row['Sr. No.'] || ''),
                tenderId: String(row['Tender ID'] || ''),
                workName: row['Name of Work'],
                location: row['Taluka'] || row['Sub Division'],
                taluka: row['Taluka'],
                subDivision: row['Sub Division'],
                estimatedAmount: Number(row['Estimated Amount'] || 0),
                contractPrice: Number(row['Contract Price'] || 0),
                agencyName: row['Contract Awarded to'],
                status: row['Contract Awarded to'] ? 'Awarded' : 'Pending',
                year: String(row['Tender Notice Year'] || ''),
            });
            count++;
        }

        if (tenders.length > 0) {
            await Tender.insertMany(tenders);
        }

        return NextResponse.json({ success: true, count, message: `Imported ${count} tenders` });
    } catch (error: any) {
        console.error('Error seeding data:', error);
        return NextResponse.json({ success: false, error: error.message, stack: error.stack });
    }
}
