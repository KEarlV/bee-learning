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

// 1. Generate Structured Flashcards & Quizzes from Text/Notes
export async function generateFlashcardsFromText(inputText, cardCount = 5) {
  const ai = getAiClient();
  if (!ai) {
    // Demo fallback generator when API key is missing
    return createDemoCards(inputText, cardCount);
  }

  const prompt = `You are Bee, an expert AI study tutor. Analyze the following study notes/content and generate ${cardCount} high-quality flashcards & quizzes for active recall study.

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
]

Content:
${inputText}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    const rawText = response.text || '';
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error('Gemini generation error:', err);
    return createDemoCards(inputText, cardCount);
  }
}

// 2. Evaluate Feynman Method Explanation
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
    const cleanJson = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
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

// 3. Ask Bee AI Tutor Drawer
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

// Demo fallback creator
function createDemoCards(text, count) {
  const sampleTopics = [
    { front: 'What is the main concept discussed in these notes?', back: text.slice(0, 150) + '...', hint: 'Review the opening sentence.' },
    { front: 'Why is this topic important for exams?', back: 'It establishes core foundational principles and key definitions.', hint: 'Think fundamental mechanics.' },
    { front: 'How does this connect to real-world applications?', back: 'It provides practical frameworks used in problem-solving.', hint: 'Consider real-world scenarios.' }
  ];
  return sampleTopics.slice(0, count).map((t, idx) => ({
    id: 'gen-' + Date.now() + '-' + idx,
    cardType: idx % 2 === 0 ? 'flashcard' : 'multiple_choice',
    frontContent: t.front,
    backContent: t.back,
    options: idx % 2 !== 0 ? [t.back, 'Incorrect Option A', 'Incorrect Option B', 'Incorrect Option C'] : undefined,
    hintText: t.hint,
    dynamicMnemonic: 'Bee Tip: Link this term with a colorful image in your mind!'
  }));
}
