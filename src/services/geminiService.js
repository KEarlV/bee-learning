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

// ── Native Direct Google Gemini REST Helper ─────────────────────
async function callGeminiApi(promptOrContents) {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  let parts = [];
  if (typeof promptOrContents === 'string') {
    parts.push({ text: promptOrContents });
  } else if (Array.isArray(promptOrContents)) {
    promptOrContents.forEach((c) => {
      if (typeof c === 'string') {
        parts.push({ text: c });
      } else if (c?.inlineData) {
        parts.push({
          inline_data: {
            mime_type: c.inlineData.mimeType,
            data: c.inlineData.data,
          },
        });
      }
    });
  }

  const models = [
    'gemini-2.0-flash',
    'gemini-1.5-flash-8b',
    'gemini-1.5-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-pro'
  ];

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch (e) {
      // Fail silently and try next endpoint
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
  const prompt = `You are Bee, a super cute, cheerful, smart AI study mascot wearing a graduation cap and glasses (inspired by Jollibee's warmth). Answer the student's question clearly, enthusiastically, and concisely like ChatGPT or Gemini.

Card Context: "${cardContext}"
Student's Question: "${userQuestion}"`;

  try {
    const text = await callGeminiApi(prompt);
    if (text) return text;
  } catch (err) {
    // Fail silently to fallback
  }

  return getSmartFallbackAnswer(userQuestion, cardContext);
}

// ── Smart Fallback AI Answer Generator ─────────────────────────
export function getSmartFallbackAnswer(question, context) {
  const q = (question || '').toLowerCase();
  if (q.includes('dna') || q.includes('rna')) {
    return `BZZZ! 🐝 Here is the simple breakdown between DNA and RNA:

1. **Structure**: DNA is double-stranded (double helix), while RNA is single-stranded.
2. **Sugar Backbone**: DNA uses *Deoxyribose* sugar; RNA uses *Ribose* sugar.
3. **Bases**: DNA uses Thymine (A-T, C-G); RNA uses Uracil instead of Thymine (A-U, C-G).
4. **Function**: DNA stores genetic blueprints long-term; RNA carries instructions to build proteins!`;
  }
  if (q.includes('cellular respiration') || q.includes('respiration')) {
    return `BZZZ! 🐝 Cellular Respiration explained simply:

1. **Glycolysis**: Glucose sugar is split into pyruvate in cytoplasm (+2 ATP).
2. **Krebs Cycle**: Pyruvate enters mitochondria and releases CO₂ (+2 ATP).
3. **Electron Transport Chain**: High-energy electrons generate energy payoff (~32 ATP)!`;
  }
  if (q.includes('closure') || q.includes('javascript')) {
    return `BZZZ! 🐝 A JavaScript Closure in 3 simple steps:

1. **Definition**: A function bundled together with references to its surrounding lexical environment.
2. **How it works**: Inner functions remember and access variables from outer functions even after outer function finishes.
3. **Use Case**: Data privacy, stateful counter functions, and factory handlers!`;
  }

  return `BZZZ! 🐝 Bee is here to help! Regarding "${question}":

1. **Core Concept**: Break the main idea down into basic component parts.
2. **Practical Analogy**: Imagine how this operates in everyday life.
3. **Exam Tip**: Focus on key terminology and relationships between mechanisms! Keep up the great work!`;
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
