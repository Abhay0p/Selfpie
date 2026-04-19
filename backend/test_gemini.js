import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
  try {
    const validJpegB64 = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
    const mappedInventory = [{ id: '1', name: 'Milk', stock: 10, price: 50 }];
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        `You are a brilliant multi-lingual grocery store AI assistant. An imperfect human has uploaded a picture of their handwritten shopping list. 
         The handwriting might be incredibly messy, cursive, scribbled, and written in multiple languages (English, Hindi, Hinglish slangs like "Aata", "Chawal", "Doodh", etc.).
         
         Here is the EXACT JSON live inventory catalog of the Store they are standing in right now:
         ${JSON.stringify(mappedInventory)}
         
         YOUR DIRECTIVES:
         1. Read their messy list carefully. Translate any Hindi/Hinglish terms to English if necessary to find a match (e.g. "Doodh" -> "Milk").
         2. Handle spelling mistakes gracefully (e.g. "Magi" -> "Maggi", "Biskut" -> "Biscuit").
         3. Match what they wrote ONLY to the items available in the catalog JSON provided above.
         4. If they requested an item that exists in the catalog, extract its exact "id", "name", "price".
         5. Determine the requested quantity (Default to 1 if not specified).
         
         OUTPUT FORMAT:
         Return an incredibly strict, pure JSON Array containing ONLY objects with:
         { "matchedId": "id_from_catalog", "name": "name_from_catalog", "requestedQuantity": number, "price": number }
         
         DO NOT include items that don't match or aren't in the provided catalog.
         DO NOT return markdown code blocks (like \`\`\`json). Return JUST the raw literal JSON array.`,
        { inlineData: { data: validJpegB64, mimeType: 'image/jpeg' } }
      ],
      config: {
        responseMimeType: 'application/json',
      }
    });
    console.log('Success:', response.text);
    console.log('Is valid JSON?', Array.isArray(JSON.parse(response.text)));
  } catch(e) {
    if (e.response) {
       console.error('Error Response:', await e.response.text());
    } else {
       console.error(e);
    }
  }
}
test();
