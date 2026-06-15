import { NextResponse } from 'next/server';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import { supabase } from '@/lib/supabase';

// Initialize the Google Gen AI SDK
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not defined in the environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'missing-key' });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    generatedPrompt: { type: Type.STRING }
  },
  required: ['generatedPrompt']
};

export const maxDuration = 60; // Increase Vercel timeout for slow LLM responses

export async function POST(req: Request) {
  try {
    const { imageBase64, isLeftHanded } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const systemInstruction = `Role: คุณคือผู้เชี่ยวชาญด้าน Prompt Engineering หน้าที่ของคุณคือการวิเคราะห์ทรงผมในรูปภาพอย่างรวดเร็ว และสร้าง "Prompt ภาษาไทยที่สมบูรณ์แบบ" เพื่อให้ผู้ใช้นำไปก๊อปปี้วางให้ AI ตัวอื่นวิเคราะห์ทรงผมต่อ

Task: สร้าง Prompt หนึ่งชุดที่ยาวและละเอียด โดยสั่งให้ AI ปลายทางทำหน้าที่เป็น Master Stylist วิเคราะห์ทรงผมนี้อย่างละเอียด (วิเคราะห์รูปหน้า, ขั้นตอนการตัด, เคมี, และการเซ็ต) และให้ AI ปลายทางสร้าง Prompt ภาษาอังกฤษสำหรับ Image Generation (เพื่อใช้วาดรูปทรงผมคล้ายๆ กัน) แนบมาด้วยตอนท้าย
${isLeftHanded ? '\n*สำคัญมาก: ต้องมีคำสั่งกำชับใน Prompt ด้วยว่าช่างตัดผมเป็นคนถนัดซ้าย (Left-Handed Stylist) ดังนั้นขั้นตอนการตัดและมุมกรรไกรต้องอ้างอิงคนถนัดซ้าย*' : ''}

Output Format: คืนค่ามาใน JSON ที่มี field "generatedPrompt" ซึ่งเป็นข้อความ Prompt ยาวๆ ที่พร้อมก๊อปปี้ไปใช้งานต่อได้ทันที (ใช้ markdown formatting ใน prompt ได้)`;

    // Clean up base64 string (remove data URI prefix if present)
    const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: 'โปรดวิเคราะห์รูปนี้แล้วสร้าง Prompt ให้ฉันนำไปใช้ต่อ' },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Data
              }
            }
          ]
        }
      ],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema,
        temperature: 0.5,
      }
    });

    const resultText = response.text;
    
    if (!resultText) {
      throw new Error('No text generated from Gemini');
    }

    const data = JSON.parse(resultText);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in analyze-hair API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze image' },
      { status: 500 }
    );
  }
}
