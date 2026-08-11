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

// ── Robust Multi-Model API Call Helper ──────────────────────────
async function callGeminiApi(contents) {
  const ai = getAiClient();
  if (!ai) return null;

  const modelsToTry = ['gemini-2.0-flash', 'gemini-2.5-flash-lite', 'gemini-1.5-flash'];

  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: contents,
      });
      if (response && response.text) {
        return response.text;
      }
    } catch (err) {
      console.warn(`Gemini model ${modelName} notice:`, err?.message || err);
    }
  }

  return null;
}

// ── 1. Generate Flashcards from Text or Uploaded Document/Image ──
export async function generateFlashcardsFromText(inputText, cardCount = 5, filePayload = null) {
  const promptText = `You are Bee, an expert AI study tutor. Analyze the provided study material (text, document, or image) and generate a MIXED SET of ${cardCount} high-quality cards for active recall study.

IMPORTANT: Include a mix of card types: "flashcard", "multiple_choice", and "identification".

Return ONLY a raw JSON array of objects without markdown backticks. Each object must fit this schema:
[
  {
    "cardType": "flashcard" | "multiple_choice" | "identification",
    "frontContent": "Question / Prompt",
    "backContent": "Clear concise answer / explanation (for multiple_choice, this MUST match the correct option text exactly)",
    "options": ["Option A", "Option B", "Option C", "Option D"] (REQUIRED if cardType is "multiple_choice", omit for other types),
    "hintText": "Helpful subtle hint",
    "dynamicMnemonic": "Fun memorable acronym or analogy"
  }
]`;

  const contents = [];

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
    const rawText = await callGeminiApi(contents);
    if (!rawText) return createDemoCards(inputText || 'Study Material', cardCount);

    const cleanJson = rawText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleanJson);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return createDemoCards(inputText || 'Study Material', cardCount);
  } catch (err) {
    console.error('Gemini generation error:', err);
    return createDemoCards(inputText || 'Study Material', cardCount);
  }
}

// ── 2. Evaluate Feynman Method Explanation ─────────────────────
export async function evaluateFeynmanExplanation(conceptPrompt, answerText, userExplanation) {
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
    const rawText = await callGeminiApi(prompt);
    if (!rawText) {
      return {
        score: 85,
        strengths: ['Good core grasp of the main mechanism.'],
        missingPoints: ['Could mention specific ATP yield numbers.'],
        feedback: 'Great job! Bee thinks your explanation is clear and easy to understand.'
      };
    }

    const cleanJson = rawText
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
  const prompt = `You are Bee, a super cute, cheerful, smart AI study mascot wearing a graduation cap and glasses (inspired by Jollibee's warmth). Answer the student's question clearly, enthusiastically, and concisely. Use bullet points or analogies if helpful.

Card Context: "${cardContext}"
Student's Question: "${userQuestion}"`;

  try {
    const text = await callGeminiApi(prompt);
    if (text) return text;
  } catch (err) {
    console.error('Bee Tutor error:', err);
  }

  return `BZZZ! 🐝 Bee is here to help! Regarding "${cardContext || 'this topic'}": Remember to break down complex ideas into 3 simple steps. Try connecting it to a real-world example!`;
}

// ── Mixed Card Set Creator (Fallback) ───────────────────────────
function createDemoCards(text, count) {
  const sampleTopics = [
    {
      cardType: 'flashcard',
      front: 'What is the main concept discussed in these study notes?',
      back: (text || 'Core foundational definition').slice(0, 120) + '...',
      hint: 'Review the opening section.',
      dynamicMnemonic: 'Bee Tip: Connect this concept with a vivid visual memory!'
    },
    {
      cardType: 'multiple_choice',
      front: 'Which key principle applies to problem solving in this topic?',
      back: 'Systematic Decomposition',
      options: ['Systematic Decomposition', 'Random Guessing', 'Linear Exhaustion', 'Static Isolation'],
      hint: 'Breaking complex problems into smaller manageable steps.',
      dynamicMnemonic: 'Decompose to Conquer!'
    },
    {
      cardType: 'identification',
      front: 'Type the exact term for testing memory instead of passive reading:',
      back: 'Active Recall',
      hint: 'Retrieving information strengthens memory retention.',
      dynamicMnemonic: 'Active Retrieval = Stronger Synapses!'
    },
    {
      cardType: 'multiple_choice',
      front: 'What is the primary benefit of spaced repetition study schedules?',
      back: 'Flattens the Ebbinghaus memory decay curve',
      options: ['Flattens the Ebbinghaus memory decay curve', 'Increases study fatigue', 'Eliminates exam stress completely', 'Shortens long-term memory'],
      hint: 'Prevents forgetting over time.',
      dynamicMnemonic: 'Space it out to lock it in!'
    },
    {
      cardType: 'flashcard',
      front: 'How can you apply the Feynman technique to master difficult topics?',
      back: 'Explain the concept in simple terms as if teaching a beginner, identify gaps, and refine.',
      hint: 'Simplicity is true mastery.',
      dynamicMnemonic: 'Teach it simply = Know it deeply!'
    }
  ];

  return sampleTopics.slice(0, count).map((t, idx) => ({
    id: 'gen-' + Date.now() + '-' + idx,
    cardType: t.cardType,
    frontContent: t.front,
    backContent: t.back,
    options: t.options,
    hintText: t.hint,
    dynamicMnemonic: t.dynamicMnemonic
  }));
}
