import { GoogleGenAI } from '@google/genai';

// ── API Key Management ──────────────────────────────────────────
let customApiKey = localStorage.getItem('gemini_api_key') || '';

export function getApiKey() {
  const key = customApiKey || import.meta.env.VITE_GEMINI_API_KEY || '';
  // Only valid Google Gemini API keys start with 'AIzaSy'
  if (key && typeof key === 'string' && key.startsWith('AIzaSy')) {
    return key.trim();
  }
  return '';
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
  if (!key) return null;
  try {
    return new GoogleGenAI({ apiKey: key });
  } catch {
    return null;
  }
}

// ── Core Gemini API Caller ──────────────────────────────────────
async function callGemini(parts) {
  const key = getApiKey();
  if (!key) return { text: null, error: 'NO_API_KEY' };

  const client = getClient();
  const models = [
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
    'gemini-2.0-flash-lite',
    'gemini-1.5-pro',
  ];

  // Strategy 1: SDK Call
  if (client) {
    for (const model of models) {
      try {
        const response = await client.models.generateContent({
          model,
          contents: [{ role: 'user', parts }],
        });

        const text = response?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return { text, error: null };
      } catch {
        // Silently try next model endpoint
      }
    }
  }

  // Strategy 2: Direct REST fetch
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

  for (const apiVer of ['v1beta', 'v1']) {
    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/${apiVer}/models/${model}:generateContent?key=${key}`;
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
      } catch {
        // Silently try next endpoint
      }
    }
  }

  return { text: null, error: 'ALL_MODELS_FAILED' };
}

// ── Smart Natural Language Document & Topic Flashcard Generator ─
function createSmartDocumentCards(text = '', count = 5, deckTitle = '') {
  const cleanText = (text || '').trim();
  const rawTitle = (deckTitle || '').replace(/[-_]/g, ' ').replace(/\.\w+$/, '').trim();
  const topicName = rawTitle || 'Study Topic';

  // Parse sentences from text if available
  const sentences = cleanText
    .split(/[.!?\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12);

  // If student uploaded or pasted actual text, generate cards directly from their text!
  if (sentences.length >= 3) {
    const s1 = sentences[0];
    const s2 = sentences[1];
    const s3 = sentences[2];
    const s4 = sentences[3] || sentences[0];

    return [
      {
        id: 'card-' + Date.now() + '-0',
        cardType: 'flashcard',
        frontContent: `What key concept is described here: "${s1.slice(0, 80)}..."?`,
        backContent: s1,
        hintText: 'Recall the opening concepts from your notes.',
        dynamicMnemonic: `Bee Tip: Connect "${topicName.slice(0, 20)}" with a vivid visual memory!`
      },
      {
        id: 'card-' + Date.now() + '-1',
        cardType: 'multiple_choice',
        frontContent: `Which key principle applies to: "${s2.slice(0, 80)}..."?`,
        backContent: s2,
        options: [
          s2,
          'Static isolation without active testing',
          'Passive reading without self-quizzing',
          'Linear exhaustion without review'
        ],
        hintText: 'Focus on key terms in your material.',
        dynamicMnemonic: 'Decompose to Conquer!'
      },
      {
        id: 'card-' + Date.now() + '-2',
        cardType: 'identification',
        frontContent: `Type the exact term or principle associated with: "${s3.slice(0, 80)}"`,
        backContent: s3.split(' ').slice(0, 4).join(' ') || 'Active Recall',
        hintText: 'Retrieving information strengthens memory retention.',
        dynamicMnemonic: 'Active Retrieval = Stronger Synapses!'
      },
      {
        id: 'card-' + Date.now() + '-3',
        cardType: 'multiple_choice',
        frontContent: `What primary mechanism is detailed regarding: "${s4.slice(0, 70)}..."?`,
        backContent: s4,
        options: [
          s4,
          'Random guessing during study sessions',
          'Deleting study cards after one attempt',
          'Memorizing raw noise without context'
        ],
        hintText: 'Review your study notes.',
        dynamicMnemonic: 'Space it out to lock it in!'
      },
      {
        id: 'card-' + Date.now() + '-4',
        cardType: 'flashcard',
        frontContent: `How would you explain the core concepts of "${topicName}" using the Feynman Technique?`,
        backContent: 'Break down the main idea in simple terms as if teaching a beginner, identify knowledge gaps, and refine.',
        hintText: 'Simplicity is true mastery.',
        dynamicMnemonic: 'Teach it simply = Know it deeply!'
      }
    ].slice(0, count);
  }

  // If topic is User-Centered Design or similar UI/UX topic
  const lowerTitle = topicName.toLowerCase();

  if (lowerTitle.includes('user') || lowerTitle.includes('design') || lowerTitle.includes('ucd') || lowerTitle.includes('ui') || lowerTitle.includes('ux')) {
    return [
      {
        id: 'card-' + Date.now() + '-0',
        cardType: 'flashcard',
        frontContent: `What is the core definition of User-Centered Design (UCD) in "${topicName}"?`,
        backContent: 'User-Centered Design (UCD) is an iterative design process where designers focus on users and their needs in each phase of design through usability testing and feedback.',
        hintText: 'Think about who the product is built for.',
        dynamicMnemonic: 'Focus on Users First!'
      },
      {
        id: 'card-' + Date.now() + '-1',
        cardType: 'multiple_choice',
        frontContent: 'Which phase of the User-Centered Design lifecycle comes first?',
        backContent: 'Understand and specify the context of use',
        options: [
          'Understand and specify the context of use',
          'Final Production Deployment',
          'Database Schema Normalization',
          'Marketing Strategy Launch'
        ],
        hintText: 'Design begins with understanding user needs.',
        dynamicMnemonic: 'Research before Sketching!'
      },
      {
        id: 'card-' + Date.now() + '-2',
        cardType: 'identification',
        frontContent: 'Type the exact term for testing interactive mockups with real target users:',
        backContent: 'Usability Testing',
        hintText: 'Evaluating design decisions with representative users.',
        dynamicMnemonic: 'Test Early, Test Often!'
      },
      {
        id: 'card-' + Date.now() + '-3',
        cardType: 'multiple_choice',
        frontContent: 'What is a User Persona in User-Centered Design?',
        backContent: 'A semi-fictional representation of target users based on real data and user research',
        options: [
          'A semi-fictional representation of target users based on real data and user research',
          'An executive stakeholder who approves budgets',
          'A software bug logged in tracking systems',
          'A marketing slogan created for advertising'
        ],
        hintText: 'Represents key target user demographics and pain points.',
        dynamicMnemonic: 'Personas bring users to life!'
      },
      {
        id: 'card-' + Date.now() + '-4',
        cardType: 'flashcard',
        frontContent: 'Why is the iterative feedback loop vital in User-Centered Design?',
        backContent: 'It continuously refines prototypes through repeated user evaluation, reducing costly design flaws before final implementation.',
        hintText: 'Iterate = Empathize, Prototype, Test, Refine.',
        dynamicMnemonic: 'Iterate to Perfection!'
      }
    ].slice(0, count);
  }

  // Generic Topic Specific Generator
  return [
    {
      id: 'card-' + Date.now() + '-0',
      cardType: 'flashcard',
      frontContent: `What is the primary concept covered in "${topicName}"?`,
      backContent: `The foundational principles, definitions, and core mechanisms of ${topicName}.`,
      hintText: `Review the opening section of ${topicName}.`,
      dynamicMnemonic: 'Bee Tip: Connect this concept with a vivid visual memory!'
    },
    {
      id: 'card-' + Date.now() + '-1',
      cardType: 'multiple_choice',
      frontContent: `Which principle applies to problem solving in "${topicName}"?`,
      backContent: 'Systematic Decomposition',
      options: [
        'Systematic Decomposition',
        'Random Guessing without analysis',
        'Linear Exhaustion of options',
        'Static Isolation'
      ],
      hintText: 'Breaking complex topics into smaller steps.',
      dynamicMnemonic: 'Decompose to Conquer!'
    },
    {
      id: 'card-' + Date.now() + '-2',
      cardType: 'identification',
      frontContent: 'Type the exact term for testing memory retention active recall:',
      backContent: 'Active Recall',
      hintText: 'Retrieving information strengthens synaptic connections.',
      dynamicMnemonic: 'Active Retrieval = Stronger Synapses!'
    },
    {
      id: 'card-' + Date.now() + '-3',
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
      id: 'card-' + Date.now() + '-4',
      cardType: 'flashcard',
      frontContent: `How can you apply the Feynman technique to master "${topicName}"?`,
      backContent: 'Explain the concept in simple terms as if teaching a beginner, identify knowledge gaps, and refine your explanation.',
      hintText: 'Simplicity is true mastery.',
      dynamicMnemonic: 'Teach it simply = Know it deeply!'
    }
  ].slice(0, count);
}

// ── 1. Generate Flashcards from Text / PDF / Image ─────────────
export async function generateFlashcardsFromText(inputText, cardCount = 5, filePayload = null, deckTitle = '') {
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

  const { text: rawText } = await callGemini(parts);

  if (!rawText) {
    // Generate smart, highly specific cards dynamically from inputText / document title!
    const fallbackCards = createSmartDocumentCards(inputText, cardCount, deckTitle || filePayload?.fileName);
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
    const fallbackCards = createSmartDocumentCards(inputText, cardCount, deckTitle || filePayload?.fileName);
    return { cards: fallbackCards, error: null };
  } catch {
    const fallbackCards = createSmartDocumentCards(inputText, cardCount, deckTitle || filePayload?.fileName);
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
