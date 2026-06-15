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
    hairstyleOverview: {
      type: Type.OBJECT,
      properties: {
        styleName: { type: Type.STRING },
        keyCharacteristics: { type: Type.STRING },
        suitableHairType: { type: Type.STRING }
      },
      required: ['styleName', 'keyCharacteristics', 'suitableHairType']
    },
    faceShapeAnalysis: {
      type: Type.OBJECT,
      properties: {
        idealFaceShapes: { type: Type.ARRAY, items: { type: Type.STRING } },
        reasoning: { type: Type.STRING },
        adjustments: { type: Type.STRING }
      },
      required: ['idealFaceShapes', 'reasoning', 'adjustments']
    },
    cuttingDetails: {
      type: Type.OBJECT,
      properties: {
        lengths: {
          type: Type.OBJECT,
          properties: {
            top: { type: Type.STRING },
            sides: { type: Type.STRING },
            back: { type: Type.STRING },
            fringe: { type: Type.STRING }
          },
          required: ['top', 'sides', 'back', 'fringe']
        },
        sectioning: { type: Type.STRING },
        elevation: { type: Type.STRING },
        techniques: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ['lengths', 'sectioning', 'elevation', 'techniques']
    },
    executionMap: {
      type: Type.OBJECT,
      properties: {
        step1: { type: Type.STRING },
        step2: { type: Type.STRING },
        step3: { type: Type.STRING }
      },
      required: ['step1', 'step2', 'step3']
    },
    chemicalProcessing: {
      type: Type.OBJECT,
      properties: {
        permType: { type: Type.STRING },
        rodSizes: { type: Type.STRING },
        wrappingTechnique: { type: Type.STRING },
        processingTime: { type: Type.STRING }
      },
      required: ['permType', 'rodSizes', 'wrappingTechnique', 'processingTime']
    },
    stylingAndMaintenance: {
      type: Type.OBJECT,
      properties: {
        styledAppearance: { type: Type.STRING },
        dailySteps: { type: Type.ARRAY, items: { type: Type.STRING } },
        recommendedProducts: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ['styledAppearance', 'dailySteps', 'recommendedProducts']
    }
  },
  required: [
    'hairstyleOverview',
    'faceShapeAnalysis',
    'cuttingDetails',
    'executionMap',
    'chemicalProcessing',
    'stylingAndMaintenance'
  ]
};

export const maxDuration = 60; // Increase Vercel timeout for slow LLM responses

export async function POST(req: Request) {
  try {
    const { imageBase64, isLeftHanded } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Optional: Upload to Supabase if configured
    // Note: In a production app, we would decode the base64, convert to Blob/File,
    // and upload it using supabase.storage.from('hairstyles').upload(...)
    // For this demonstration, we'll proceed with sending base64 directly to Gemini.

    const systemInstruction = `Role: คุณคือ "Master Stylist Educator" ผู้เชี่ยวชาญระดับสูงด้านการออกแบบทรงผม (Salon & Barber) หน้าที่ของคุณคือการ "ถอดรหัส" ทรงผมจากรูปภาพที่ผู้ใช้อัปโหลด เพื่อสร้างเป็นคู่มือการปฏิบัติงาน (Step-by-Step Guide) ที่มีความละเอียดสูงสุด

Task: วิเคราะห์รูปภาพและส่งคืนข้อมูลในรูปแบบ JSON เพื่อให้ Frontend นำไปแสดงผลตามโครงสร้างที่กำหนด

*Important constraint:* If the user indicates they are a left-handed stylist via the frontend toggle, automatically adjust all cutting angles, scissor techniques, and positioning instructions in the JSON output to reflect left-handed execution.
${isLeftHanded ? 'THE USER IS A LEFT-HANDED STYLIST. ADJUST ALL INSTRUCTIONS FOR LEFT-HANDED EXECUTION.' : 'THE USER IS A RIGHT-HANDED STYLIST.'}`;

    // Clean up base64 string (remove data URI prefix if present)
    const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: [
        {
          role: 'user',
          parts: [
            { text: 'Please analyze this hairstyle and provide the cheat sheet.' },
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
        temperature: 0.2, // Low temperature for more deterministic, factual output
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
