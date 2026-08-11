import { GoogleGenAI } from '@google/genai';

let customApiKey = localStorage.getItem('gemini_api_key') || '';

export function getApiKey() {
  return customApiKey || import.meta.env.VITE_GEMINI_API_KEY || '';
}

export function setApiKey(key) {
  customApiKey = key;
  if (key) {
    localStorage.setItem('gemini_api_key', key);
  } else {
    localStorage.removeItem('gemini_api_key');
  }
}

function getAiClient() {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  try {
    return new GoogleGenAI({ apiKey });
  } catch (e) {
    console.error('Failed to init GoogleGenAI:', e);
    return null;
  }
}

// ── 1. Generate Flashcards from Text or Uploaded Document/Image ──
export async function generateFlashcardsFromText(inputText, cardCount = 5, filePayload = null) {
  const ai = getAiClient();
  if (!ai) {
    return createDemoCards(inputText || 'Study Notes', cardCount);
  }

  const promptText = `You are Bee, an expert AI study tutor. Analyze the provided study material (text, document, or image) and generate ${cardCount} high-quality flashcards & quizzes for active recall study.

Return ONLY a raw JSON array of objects without markdown backticks. Each object must fit this schema:
[
  {
    "cardType": "flashcard" | "multiple_choice" | "feynman",
    "frontContent": "Question / Prompt",
    "backContent": "Clear concise answer / explanation",
    "options": ["Option A", "Option B", "Option C", "Option D"] (only if cardType is multiple_choice),
    "hintText": "Helpful subtle hint",
    "dynamicMnemonic": "Fun memorable acronym or analogy"
  }
]`;

  const contents = [];

  // Add image/pdf binary data if present
  if (filePayload?.base64Data && filePayload?.mimeType) {
    const cleanBase64 = filePayload.base64Data.includes(',')
      ? filePayload.base64Data.split(',')[1]
      : filePayload.base64Data;
    contents.push({
      inlineData: {
        data: cleanBase64,
        mimeType: filePayload.mimeType,
      },
    });
  }

  contents.push(promptText + (inputText ? `\n\nStudy Content:\n${inputText}` : ''));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: contents,
    });

    const rawText = response.text || '';
    const cleanJson = rawText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    return JSON.parse(cleanJson);
  } catch (err) {
    console.error('Gemini 2.5 Flash generation error:', err);
    return createDemoCards(inputText || 'Study Material', cardCount);
  }
}

// ── 2. Evaluate Feynman Method Explanation ─────────────────────
export async function evaluateFeynmanExplanation(conceptPrompt, answerText, userExplanation) {
  const ai = getAiClient();
  if (!ai) {
    return {
      score: 85,
      strengths: ['Good core grasp of the main mechanism.'],
      missingPoints: ['Could mention specific ATP yield numbers.'],
      feedback: 'Great job! Bee thinks your explanation is clear and easy to understand.'
    };
  }

  const prompt = `You are Bee, the friendly AI study mascot. Evaluate the user's spoken or typed explanation of this study concept according to the Feynman Technique.

Target Concept: "${conceptPrompt}"
Correct Reference Answer: "${answerText}"
User's Explanation: "${userExplanation}"

Return ONLY a raw JSON object with this schema:
{
  "score": number (0-100),
  "strengths": ["string", "string"],
  "missingPoints": ["string"],
  "feedback": "Friendly, encouraging summary from Bee"
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });
    const cleanJson = (response.text || '')
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error('Feynman eval error:', err);
    return {
      score: 80,
      strengths: ['Captured the basic concept.'],
      missingPoints: ['Add details on transport channels.'],
      feedback: 'Nice try! Bee registered your response.'
    };
  }
}

// ── 3. Ask Bee AI Tutor ───────────────────────────────────────
export async function askBeeTutor(userQuestion, cardContext = '') {
  const ai = getAiClient();
  if (!ai) {
    return `BZZZ! 🐝 Bee is here to help! Regarding "${cardContext || 'this topic'}": Remember to break down complex ideas into 3 simple steps. Try connecting it to a real-world example!`;
  }

  const prompt = `You are Bee, a super cute, cheerful, smart AI study mascot wearing a graduation cap and glasses (inspired by Jollibee's warmth). Answer the student's question clearly, enthusiastically, and concisely. Use bullet points or analogies if helpful.

Card Context: "${cardContext}"
Student's Question: "${userQuestion}"`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (err) {
    console.error('Bee Tutor error:', err);
    return 'Bzzz! Bee had a small connection hiccup, but keep going—you are doing amazing!';
  }
}

// ── Fallback generator ─────────────────────────────────────────
function createDemoCards(text, count) {
  const sampleTopics = [
    { front: 'What is the main concept discussed in these study notes?', back: (text || 'Core concept definition').slice(0, 150) + '...', hint: 'Review the opening section.' },
    { front: 'Why is this topic essential for exam mastery?', back: 'It establishes fundamental principles required for higher-level applications.', hint: 'Think core frameworks.' },
    { front: 'How does this principle apply in practical scenarios?', back: 'It provides systematic guidelines for analyzing complex problems.', hint: 'Consider practical use cases.' }
  ];
  return sampleTopics.slice(0, count).map((t, idx) => ({
    id: 'gen-' + Date.now() + '-' + idx,
    cardType: idx % 2 === 0 ? 'flashcard' : 'multiple_choice',
    frontContent: t.front,
    backContent: t.back,
    options: idx % 2 !== 0 ? [t.back, 'Incorrect Option A', 'Incorrect Option B', 'Incorrect Option C'] : undefined,
    hintText: t.hint,
    dynamicMnemonic: 'Bee Tip: Connect this concept with a vivid visual memory!'
  }));
}
