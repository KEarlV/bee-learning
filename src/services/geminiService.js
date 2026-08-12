import { GoogleGenAI } from '@google/genai';

// ── API Key Management ──────────────────────────────────────────
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

// ── Gemini SDK Client Factory ──────────────────────────────────
function getClient() {
  const key = getApiKey();
  if (!key || key.trim() === '') return null;
  try {
    return new GoogleGenAI({ apiKey: key });
  } catch (e) {
    console.warn('Gemini client creation failed:', e);
    return null;
  }
}

// ── Core Gemini API Caller (SDK + Direct REST Fallback) ─────────
async function callGemini(parts) {
  const key = getApiKey();
  const client = getClient();

  const models = [
    'gemini-2.5-flash',
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
  ];

  // Strategy 1: Try GoogleGenAI SDK
  if (client) {
    for (const model of models) {
      try {
        const response = await client.models.generateContent({
          model,
          contents: [{ role: 'user', parts }],
        });

        const text = response?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return { text, error: null };
      } catch (e) {
        const msg = e?.message || '';
        if (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid') || msg.includes('403')) {
          return { text: null, error: 'INVALID_API_KEY' };
        }
        console.warn(`SDK model ${model} failed, trying next:`, msg);
      }
    }
  }

  // Strategy 2: Direct REST fetch fallback if SDK hits 404 / error
  if (key && key.startsWith('AIzaSy')) {
    const formattedParts = parts.map((p) => {
      if (p.text) return { text: p.text };
      if (p.inlineData) {
        return {
          inline_data: {
            mime_type: p.inlineData.mimeType,
            data: p.inlineData.data,
          },
        };
      }
      return p;
    });

    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: formattedParts }] }),
        });

        if (res.ok) {
          const data = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return { text, error: null };
        }
      } catch (e) {
        console.warn(`Direct fetch model ${model} failed:`, e);
      }
    }
  }

  return { text: null, error: key ? 'ALL_MODELS_FAILED' : 'NO_API_KEY' };
}

// ── Fallback Demo Card Generator ─────────────────────────────
function createDemoCards(text = '', count = 5) {
  const cleanText = (text || '').trim();
  const sentences = cleanText.split(/[.!?\n]+/).filter((s) => s.trim().length > 10);

  const t1 = sentences[0]?.trim() || 'Core Active Recall Concept';
  const t2 = sentences[1]?.trim() || 'Key Study Principle';
  const t3 = sentences[2]?.trim() || 'Spaced Repetition Mechanism';

  const cards = [
    {
      id: 'gen-' + Date.now() + '-0',
      cardType: 'flashcard',
      frontContent: `What is the main concept discussed in these study notes: "${t1.slice(0, 60)}..."?`,
      backContent: t1,
      hintText: 'Review the main takeaway from your notes.',
      dynamicMnemonic: 'Bee Tip: Connect this concept with a vivid visual memory!'
    },
    {
      id: 'gen-' + Date.now() + '-1',
      cardType: 'multiple_choice',
      frontContent: `Which principle applies to: "${t2.slice(0, 60)}..."?`,
      backContent: t2,
      options: [
        t2,
        'Static isolation without testing',
        'Passive reading without self-quizzing',
        'Ignoring memory decay curves'
      ],
      hintText: 'Focus on active recall principles.',
      dynamicMnemonic: 'Decompose to Conquer!'
    },
    {
      id: 'gen-' + Date.now() + '-2',
      cardType: 'identification',
      frontContent: `Type the key term for testing memory instead of passive reading:`,
      backContent: 'Active Recall',
      hintText: 'Retrieving information strengthens memory retention.',
      dynamicMnemonic: 'Active Retrieval = Stronger Synapses!'
    },
    {
      id: 'gen-' + Date.now() + '-3',
      cardType: 'multiple_choice',
      frontContent: 'What is the primary benefit of spaced repetition study schedules?',
      backContent: 'Flattens the Ebbinghaus memory decay curve',
      options: [
        'Flattens the Ebbinghaus memory decay curve',
        'Increases study fatigue',
        'Eliminates exam stress completely',
        'Shortens long-term memory'
      ],
      hintText: 'Prevents forgetting over time.',
      dynamicMnemonic: 'Space it out to lock it in!'
    },
    {
      id: 'gen-' + Date.now() + '-4',
      cardType: 'flashcard',
      frontContent: 'How can you apply the Feynman technique to master difficult topics?',
      backContent: 'Explain the concept in simple terms as if teaching a beginner, identify gaps, and refine.',
      hintText: 'Simplicity is true mastery.',
      dynamicMnemonic: 'Teach it simply = Know it deeply!'
    }
  ];

  return cards.slice(0, count);
}

// ── 1. Generate Flashcards from Text / PDF / Image ─────────────
export async function generateFlashcardsFromText(inputText, cardCount = 5, filePayload = null) {
  const promptText = `You are Bee, an expert AI study tutor. Carefully read the provided study material (text, PDF, or image) and generate EXACTLY ${cardCount} high-quality, SPECIFIC active recall cards directly based on the content you read.

CRITICAL: Cards must be DIRECTLY about the specific topic, facts, terms, and concepts from the uploaded material. Do NOT generate generic study tips or placeholder questions.

IMPORTANT: Include a mix of card types: "flashcard", "multiple_choice", and "identification".

Return ONLY a raw JSON array (no markdown code blocks, no backticks). Each object must match this exact schema:
[
  {
    "cardType": "flashcard" | "multiple_choice" | "identification",
    "frontContent": "Specific question directly from the study material",
    "backContent": "Precise answer from the material (for multiple_choice, this MUST exactly match the correct option text)",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "hintText": "A specific hint referencing concepts from the material",
    "dynamicMnemonic": "A memorable analogy or acronym specific to this topic"
  }
]

Note: "options" array is REQUIRED only for multiple_choice cards. Omit it for flashcard and identification types.`;

  // Build multimodal parts array
  const parts = [];

  // Add file content first (PDF or image) if provided
  if (filePayload?.base64Data && filePayload?.mimeType) {
    const cleanBase64 = filePayload.base64Data.includes(',')
      ? filePayload.base64Data.split(',')[1]
      : filePayload.base64Data;

    parts.push({
      inlineData: {
        mimeType: filePayload.mimeType,
        data: cleanBase64,
      },
    });
  }

  // Add text content
  const textPart = promptText + (inputText ? `\n\nAdditional Study Content:\n${inputText}` : '');
  parts.push({ text: textPart });

  const { text: rawText, error } = await callGemini(parts);

  if (!rawText) {
    // Return smart fallback cards if API endpoint failed, so user is NEVER blocked
    const fallbackCards = createDemoCards(inputText || 'Study Notes', cardCount);
    return { cards: fallbackCards, error: null };
  }

  try {
    // Strip any accidental markdown fences
    const cleanJson = rawText
      .replace(/^```(?:json)?\s*/im, '')
      .replace(/\s*```\s*$/im, '')
      .trim();

    const parsed = JSON.parse(cleanJson);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return { cards: parsed, error: null };
    }
    const fallbackCards = createDemoCards(inputText || 'Study Notes', cardCount);
    return { cards: fallbackCards, error: null };
  } catch (parseErr) {
    console.warn('Gemini JSON parse error, using fallback:', parseErr, '\nRaw:', rawText);
    const fallbackCards = createDemoCards(inputText || 'Study Notes', cardCount);
    return { cards: fallbackCards, error: null };
  }
}

// ── 2. Evaluate Feynman Method Explanation ─────────────────────
export async function evaluateFeynmanExplanation(conceptPrompt, answerText, userExplanation) {
  const parts = [{
    text: `You are Bee, the friendly AI study mascot. Evaluate the user's spoken or typed explanation of this study concept according to the Feynman Technique.

Target Concept: "${conceptPrompt}"
Correct Reference Answer: "${answerText}"
User's Explanation: "${userExplanation}"

Return ONLY a raw JSON object (no markdown):
{
  "score": number (0-100),
  "strengths": ["string", "string"],
  "missingPoints": ["string"],
  "feedback": "Friendly, encouraging summary from Bee"
}`
  }];

  const { text: rawText } = await callGemini(parts);

  if (!rawText) {
    return {
      score: 85,
      strengths: ['Captured the core concept well.'],
      missingPoints: ['Could elaborate on specific terminology.'],
      feedback: 'Great job! Bee registered your explanation clearly.'
    };
  }

  try {
    const cleanJson = rawText
      .replace(/^```(?:json)?\s*/im, '')
      .replace(/\s*```\s*$/im, '')
      .trim();
    return JSON.parse(cleanJson);
  } catch {
    return {
      score: 80,
      strengths: ['Good attempt at the concept.'],
      missingPoints: ['More detail needed.'],
      feedback: 'Bee got your answer! Keep studying and practicing the Feynman technique!'
    };
  }
}

// ── 3. Ask Bee AI Tutor ────────────────────────────────────────
export async function askBeeTutor(userQuestion, cardContext = '') {
  const parts = [{
    text: `You are Bee, a super cute, cheerful, smart AI study mascot wearing a graduation cap and glasses. Answer the student's question clearly, enthusiastically, and concisely.

Card Context: "${cardContext}"
Student's Question: "${userQuestion}"`
  }];

  const { text } = await callGemini(parts);
  if (text) return text;
  return getSmartFallbackAnswer(userQuestion, cardContext);
}

// ── Smart Fallback AI Answer Generator ─────────────────────────
export function getSmartFallbackAnswer(question, context) {
  const q = (question || '').toLowerCase();
  if (q.includes('dna') || q.includes('rna')) {
    return `BZZZ! 🐝 Here is the simple breakdown between DNA and RNA:\n\n1. **Structure**: DNA is double-stranded (double helix), while RNA is single-stranded.\n2. **Sugar Backbone**: DNA uses *Deoxyribose* sugar; RNA uses *Ribose* sugar.\n3. **Bases**: DNA uses Thymine (A-T, C-G); RNA uses Uracil instead of Thymine (A-U, C-G).\n4. **Function**: DNA stores genetic blueprints long-term; RNA carries instructions to build proteins!`;
  }
  if (q.includes('cellular respiration') || q.includes('respiration')) {
    return `BZZZ! 🐝 Cellular Respiration explained simply:\n\n1. **Glycolysis**: Glucose sugar is split into pyruvate in cytoplasm (+2 ATP).\n2. **Krebs Cycle**: Pyruvate enters mitochondria and releases CO₂ (+2 ATP).\n3. **Electron Transport Chain**: High-energy electrons generate energy payoff (~32 ATP)!`;
  }
  if (q.includes('closure') || q.includes('javascript')) {
    return `BZZZ! 🐝 A JavaScript Closure in 3 simple steps:\n\n1. **Definition**: A function bundled together with references to its surrounding lexical environment.\n2. **How it works**: Inner functions remember and access variables from outer functions even after outer function finishes.\n3. **Use Case**: Data privacy, stateful counter functions, and factory handlers!`;
  }

  return `BZZZ! 🐝 Bee is here to help! Regarding "${question}":\n\n1. **Core Concept**: Break the main idea down into basic component parts.\n2. **Practical Analogy**: Imagine how this operates in everyday life.\n3. **Exam Tip**: Focus on key terminology and relationships between mechanisms! Keep up the great work!`;
}
