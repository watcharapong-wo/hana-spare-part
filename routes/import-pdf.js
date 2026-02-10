// Import parser from imports_pdf_invoice.js
const { parseInvoiceFromOcrText } = require('./imports_pdf_invoice');
const { execFile } = require('child_process');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Multer config for PDF upload (memory storage)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Only PDF files are allowed!'));
    },
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});


let pdfParse = require('pdf-parse');
if (pdfParse && typeof pdfParse !== 'function') {
    if (pdfParse.default && typeof pdfParse.default === 'function') {
        pdfParse = pdfParse.default;
    } else {
        console.error('pdfParse loaded but is not a function:', typeof pdfParse, pdfParse);
        throw new Error('pdfParse is not a function');
    }
}
const Tesseract = require('tesseract.js');
// Windows: ระบุ path tesseract.exe ชัดเจน ถ้า PATH มีปัญหา
const tesseractPath =
    process.platform === 'win32'
        ? 'C:/Program Files/Tesseract-OCR/tesseract.exe'
        : undefined;

const tesseractOptions = tesseractPath
    ? { langPath: undefined, executablePath: tesseractPath }
    : {};
const { fromPath } = require('pdf2pic');
const os = require('os');
const fs = require('fs');

// POST /api/import-pdf
const db = require('../database/db');

router.post('/', upload.single('pdf'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No PDF file uploaded' });
    try {
        // พยายามอ่าน PDF เป็น text ปกติ
        let text = '';
        let ocrError = null;
        try {
            const data = await pdfParse(req.file.buffer);
            text = data.text;
        } catch (err) {
            text = '';
        }

        // ถ้าอ่าน text ไม่ได้ (PDF scan) ให้ OCR
        if (!text || text.trim().length < 10) {
            try {
                const tmpDir = os.tmpdir();
                const pdfPath = tmpDir + '/import_scan_' + Date.now() + '.pdf';
                console.log('[DEBUG] Write PDF to', pdfPath);
                fs.writeFileSync(pdfPath, req.file.buffer);
                console.log('[DEBUG] PDF written');
                // ใช้ pdf2pic แปลงหน้าแรกเป็น PNG
                const converter = fromPath(pdfPath, {
                    density: 200,
                    saveFilename: 'import_scan_img',
                    savePath: tmpDir,
                    format: 'png',
                    width: 1200,
                    height: 1600
                });
                console.log('[DEBUG] Start PDF to PNG conversion');
                const convertResult = await converter(1); // แปลงหน้าแรก
                console.log('[DEBUG] PDF to PNG result:', convertResult);
                const outputImg = convertResult.path;
                                // ทดสอบเรียก tesseract.exe ด้วย child_process ก่อน
                                if (tesseractPath) {
                                    try {
                                        const testOut = outputImg + '_test';
                                        console.log('[DEBUG] Call tesseract.exe via child_process:', tesseractPath, outputImg, testOut);
                                        await new Promise((resolve, reject) => {
                                            execFile(
                                                tesseractPath,
                                                [outputImg, testOut, '-l', 'tha+eng'],
                                                (error, stdout, stderr) => {
                                                    if (error) {
                                                        console.error('[DEBUG] child_process tesseract error:', error, stderr);
                                                        ocrError = 'child_process: ' + error.message + ' ' + stderr;
                                                        reject(error);
                                                    } else {
                                                        console.log('[DEBUG] child_process tesseract success:', stdout, stderr);
                                                        resolve();
                                                    }
                                                }
                                            );
                                        });
                                        // อ่านไฟล์ .txt ที่ได้
                                        const txtPath = testOut + '.txt';
                                        console.log('[DEBUG] Check TXT output:', txtPath, fs.existsSync(txtPath));
                                        if (fs.existsSync(txtPath)) {
                                            text = fs.readFileSync(txtPath, 'utf8');
                                            fs.unlinkSync(txtPath);
                                            console.log('[DEBUG] Read OCR text:', text);
                                        }
                                    } catch (childErr) {
                                        console.error('[DEBUG] child_process tesseract exception:', childErr);
                                    }
                                }
                                // ถ้ายังไม่ได้ text ให้ fallback tesseract.js
                                if (!text || text.trim().length < 10) {
                                    try {
                                        console.log('[DEBUG] Fallback to tesseract.js');
                                        const ocrResult = await Tesseract.recognize(
                                            outputImg,
                                            'tha+eng',
                                            { logger: m => {}, ...tesseractOptions }
                                        );
                                        text = ocrResult.data.text;
                                        console.log('[DEBUG] tesseract.js result:', text);
                                    } catch (ocrSpawnErr) {
                                        console.error('[DEBUG] Tesseract.js spawn error:', ocrSpawnErr);
                                        ocrError = ocrSpawnErr.message;
                                    }
                                }
                                try {
                                    fs.unlinkSync(pdfPath);
                                    fs.unlinkSync(outputImg);
                                    console.log('[DEBUG] Temp files cleaned');
                                } catch (cleanupErr) {
                                    console.error('[DEBUG] Temp file cleanup error:', cleanupErr);
                                }
                        } catch (ocrErr) {
                                ocrError = ocrErr.message;
                        }
        }

        // 🔴 เพิ่ม parser ใหม่ก่อน return error
        const rawText = text;
        const parsed = parseInvoiceFromOcrText(rawText);
        console.log('[DEBUG] Parsed invoice:', parsed);

        if (!parsed.items || parsed.items.length === 0) {
            return res.json({
                message: 'OCR สำเร็จ แต่ยัง parse รายการไม่สำเร็จ',
                parsed,
                rawText
            });
        }

        // ถ้า parse ได้ ให้ส่ง parsed กลับ
        return res.json({
            message: 'Parsed invoice from PDF',
            parsed
        });



    } catch (err) {
        res.status(500).json({ message: 'Error parsing PDF', error: err.message, stack: err.stack });
    }
});

module.exports = router;
