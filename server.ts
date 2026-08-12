import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON parser for body
app.use(express.json({ limit: '10mb' }));

// Lazy initializer for GoogleGenAI Client
let aiClient: GoogleGenAI | null = null;

function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// API Routes
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, context } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const ai = getAiClient();
    
    // Map client messages to Gemini content format
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : m.role,
      parts: [{ text: m.text }]
    }));

    // Inject the real-time context as part of the system instruction
    const systemInstruction = 
      "คุณคือ AI ผู้ช่วยวิเคราะห์ข้อมูลของหน่วยงานตำรวจตระเวนชายแดน (รร.ตชด. ภาค 2) " +
      "กฎของคุณคือ:\n" +
      "1. ตอบคำถามผู้ใช้โดยใช้ภาษาไทยที่สุภาพ เป็นมิตร และให้ความเคารพ\n" +
      "2. ใช้และอ้างอิงข้อมูลสถิติที่แท้จริงจาก [บริบทของระบบปัจจุบัน] ที่ระบุด้านล่างนี้เพื่อตอบคำถาม ห้ามแต่งข้อมูล ตัวเลขสถิติ หรือรายชื่อโรงเรียนเองโดยเด็ดขาด\n" +
      "3. หากผู้ใช้ถามถึงโรงเรียนที่ค้างส่ง หรือปัญหาย่อยๆ ให้วิเคราะห์จากตัวเลขจริง และตอบให้กระชับ มีโครงสร้างสัญญะ (เช่น หัวข้อ, Bullet, ตัวหนา) เพื่อให้อ่านเข้าใจง่าย\n" +
      "4. หากไม่มีข้อมูลในบริบทสำหรับตอบคำถามนั้นๆ ให้ระบุอย่างตรงไปตรงมาว่ายังไม่มีข้อมูลที่ต้องการบันทึกในแดชบอร์ดขณะนี้\n\n" +
      `[บริบทของระบบปัจจุบัน (Data Context)]:\n${context || 'ขณะนี้ยังไม่มีการโหลดหรือกรองข้อมูลในระบบ'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: error.message || 'เกิดข้อผิดพลาดในการประมวลผลข้อความ' });
  }
});

app.post('/api/summarize-problems', async (req, res) => {
  try {
    const { problems } = req.body;
    if (!problems || !Array.isArray(problems) || problems.length === 0) {
      return res.status(400).json({ error: 'Problems array is required and cannot be empty' });
    }

    const ai = getAiClient();
    const problemsText = problems.map((item, idx) => `${idx + 1}. โรงเรียน: ${item.school} | ปัญหา: ${item.problems.join(', ')}`).join('\n');
    
    const prompt = 
      `นี่คือรายการปัญหาและอุปสรรคในการจัดการเรียนการสอนของโรงเรียนตำรวจตระเวนชายแดน (รร.ตชด. ภาค 2):\n` +
      `${problemsText}\n\n` +
      `กรุณาสรุปปัญหาเหล่านี้เป็นหมวดหมู่หลักๆ สั้นๆ กระชับ เข้าใจง่าย แบบบทสรุปผู้บริหาร (Executive Summary) ` +
      `ความยาวประมาณ 4-5 ข้อ เสนอแนะแนวทางแก้ไขเบื้องต้นสั้นๆ ท้ายแต่ละข้อด้วย โดยใช้ภาษาที่เป็นทางการและเป็นประโยชน์ต่อผู้บริหารระดับสูง`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: "คุณคือผู้เชี่ยวชาญด้านการวิเคราะห์ข้อมูลและพัฒนาการจัดการเรียนรู้ สรุปปัญหาเชิงวิชาการและการจัดการศึกษาระดับพื้นที่ชายแดนอย่างมีวิสัยทัศน์ กระชับ ตรงประเด็น ใช้ Bullet Point สวยงาม",
        temperature: 0.3,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Summarize API Error:', error);
    res.status(500).json({ error: error.message || 'เกิดข้อผิดพลาดในการสรุปรายงานปัญหา' });
  }
});

app.post('/api/summarize-periods', async (req, res) => {
  try {
    const { periods } = req.body;
    if (!periods || !Array.isArray(periods) || periods.length === 0) {
      return res.status(400).json({ error: 'Periods array is required and cannot be empty' });
    }

    const ai = getAiClient();
    
    const prompt = 
      `จงย่อสรุปเนื้อหาและรายละเอียดของแต่ละคาบเรียนต่อไปนี้ให้สั้นและกระชับที่สุด เพื่อที่จะช่วยประหยัดพื้นที่ในการจัดหน้าพิมพ์รายงาน และไม่บังรูปภาพประกอบด้านล่าง\n\n` +
      `ข้อกำหนดเพิ่มเติม:\n` +
      `1. ให้คงหัวข้อไว้สั้นๆ (เช่น สรุปใจความหลักเหลือเพียง 1 ประโยค หรือวลีสั้นๆ ไม่เกิน 15-20 คำต่อหัวข้อ)\n` +
      `2. หากข้อมูลเดิมสั้นกระชับอยู่แล้ว ให้คงเดิมหรือย่อเล็กน้อย\n` +
      `3. ห้ามแปลเป็นภาษาอังกฤษ ให้ตอบกลับเป็นภาษาไทยที่สวยงาม เป็นทางการ และอ่านง่าย\n\n` +
      `นี่คือข้อมูลที่ต้องการย่อสรุป:\n` +
      `${JSON.stringify(periods, null, 2)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: "คุณคือผู้เชี่ยวชาญด้านการย่อสรุปข้อมูลวิชาการและการจัดการเรียนการสอนของโรงเรียนตชด. ภาค 2 หน้าที่ของคุณคือการย่อข้อความในส่วน meta และ mains ของคาบเรียนต่างๆ ให้สั้น กระชับ เป็นทางการ และตรงประเด็นมากที่สุด เพื่อป้องกันไม่ให้ข้อมูลเบียดหรือบังรูปภาพประกอบในรายงานผลการสอน",
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summarizedPeriods: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  key: { type: Type.STRING },
                  meta: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        label: { type: Type.STRING },
                        value: { type: Type.STRING }
                      },
                      required: ['label', 'value']
                    }
                  },
                  mains: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        label: { type: Type.STRING },
                        value: { type: Type.STRING }
                      },
                      required: ['label', 'value']
                    }
                  }
                },
                required: ['key', 'meta', 'mains']
              }
            }
          },
          required: ['summarizedPeriods']
        },
        temperature: 0.2,
      }
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error('Summarize Periods API Error:', error);
    res.status(500).json({ error: error.message || 'เกิดข้อผิดพลาดในการย่อสรุปเนื้อหาคาบเรียน' });
  }
});

// Proxy route for loading cross-origin images safely for html2canvas
app.get('/api/proxy-image', async (req, res) => {
  try {
    const imageUrl = req.query.url as string;
    if (!imageUrl) {
      return res.status(400).send('URL query parameter is required');
    }

    let fetchUrl = imageUrl;
    if (fetchUrl.startsWith('//')) {
      fetchUrl = 'https:' + fetchUrl;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(fetchUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/*,*/*',
          'Cache-Control': 'no-cache'
        }
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return res.send(buffer);
      }
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      console.log('Proxy fetch info (timeout/unreachable):', fetchErr.message || fetchErr);
    }

    // Graceful fallback: return a 1x1 transparent PNG if target is unreachable or times out
    const fallbackBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    const buffer = Buffer.from(fallbackBase64, 'base64');
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(buffer);
  } catch (error: any) {
    console.log('Proxy Image Outer info:', error.message || error);
    try {
      const fallbackBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
      const buffer = Buffer.from(fallbackBase64, 'base64');
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.send(buffer);
    } catch (e) {
      res.status(500).send('Error');
    }
  }
});

import fs from 'fs';

const ADDRESSES_FILE = path.join(process.cwd(), 'custom_addresses.json');

// Get custom addresses from the system
app.get('/api/custom-addresses', (req, res) => {
  try {
    if (fs.existsSync(ADDRESSES_FILE)) {
      const data = fs.readFileSync(ADDRESSES_FILE, 'utf8');
      return res.json(JSON.parse(data));
    }
    return res.json({});
  } catch (error: any) {
    console.error('Error reading custom addresses:', error);
    res.json({});
  }
});

// Save and upload custom address to the system
app.post('/api/custom-addresses', (req, res) => {
  try {
    const { schoolName, schoolId, address } = req.body;
    if (!schoolName || !address) {
      return res.status(400).json({ error: 'School name and address are required' });
    }

    let existing: Record<string, string> = {};
    if (fs.existsSync(ADDRESSES_FILE)) {
      try {
        existing = JSON.parse(fs.readFileSync(ADDRESSES_FILE, 'utf8'));
      } catch (e) {
        existing = {};
      }
    }

    // Save keyed by school name as requested
    existing[schoolName] = address;

    // Also key by schoolId / keyword if provided for compatibility
    if (schoolId) {
      existing[schoolId] = address;
    }

    fs.writeFileSync(ADDRESSES_FILE, JSON.stringify(existing, null, 2), 'utf8');
    res.json({ success: true, customAddresses: existing });
  } catch (error: any) {
    console.error('Error saving custom address:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกที่อยู่ลงระบบ' });
  }
});

const PRINCIPALS_FILE = path.join(process.cwd(), 'custom_principals.json');

// Get custom principals from the system
app.get('/api/custom-principals', (req, res) => {
  try {
    if (fs.existsSync(PRINCIPALS_FILE)) {
      const data = fs.readFileSync(PRINCIPALS_FILE, 'utf8');
      return res.json(JSON.parse(data));
    }
    return res.json({});
  } catch (error: any) {
    console.error('Error reading custom principals:', error);
    res.json({});
  }
});

// Save and upload custom principal to the system
app.post('/api/custom-principals', (req, res) => {
  try {
    const { schoolName, schoolId, principal } = req.body;
    if (!schoolName || !principal) {
      return res.status(400).json({ error: 'School name and principal are required' });
    }

    let existing: Record<string, string> = {};
    if (fs.existsSync(PRINCIPALS_FILE)) {
      try {
        existing = JSON.parse(fs.readFileSync(PRINCIPALS_FILE, 'utf8'));
      } catch (e) {
        existing = {};
      }
    }

    // Save keyed by school name as requested
    existing[schoolName] = principal;

    // Also key by schoolId / keyword if provided for compatibility
    if (schoolId) {
      existing[schoolId] = principal;
    }

    fs.writeFileSync(PRINCIPALS_FILE, JSON.stringify(existing, null, 2), 'utf8');
    res.json({ success: true, customPrincipals: existing });
  } catch (error: any) {
    console.error('Error saving custom principal:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกรายชื่อครูใหญ่ลงระบบ' });
  }
});

// Configure Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
