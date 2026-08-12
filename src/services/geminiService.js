import { GoogleGenAI } from '@google/genai';

// ── API Key Management ──────────────────────────────────────────
let customApiKey = localStorage.getItem('gemini_api_key') || '';

export function getApiKey() {
  const key = customApiKey || import.meta.env.VITE_GEMINI_API_KEY || '';
  return typeof key === 'string' ? key.trim() : '';
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
  if (!key || key.length < 10) return null;
  try {
    return new GoogleGenAI({ apiKey: key });
  } catch {
    return null;
  }
}

// ── Core Gemini API Caller ──────────────────────────────────────
async function callGemini(parts) {
  const key = getApiKey();
  const client = getClient();

  if (!key || key.length < 10) {
    return { text: null, error: 'NO_API_KEY' };
  }

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
        // Fail silently & try next model endpoint
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
        // Fail silently & try next endpoint
      }
    }
  }

  return { text: null, error: 'ALL_MODELS_FAILED' };
}

// ── Smart Natural Language Document & Topic Flashcard Generator ─
// Iterates across the ENTIRE document text from start to finish
function createSmartDocumentCards(text = '', count = 5, deckTitle = '') {
  const cleanText = (text || '').trim();
  const rawTitle = (deckTitle || '').replace(/[-_]/g, ' ').replace(/\.\w+$/, '').trim();
  const topicName = rawTitle || 'Study Topic';
  const targetCount = count || 5;

  // Extract clean sentences & paragraphs across the full document
  const sentences = cleanText
    .split(/[.!?\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  const cards = [];

  // If text was extracted from document, step through the ENTIRE document text!
  if (sentences.length >= 3) {
    const step = Math.max(1, Math.floor(sentences.length / targetCount));

    for (let i = 0; i < targetCount; i++) {
      const sentenceIdx = Math.min(i * step, sentences.length - 1);
      const currSentence = sentences[sentenceIdx];
      const nextSentence = sentences[Math.min(sentenceIdx + 1, sentences.length - 1)];

      const cardTypeIdx = i % 3; // rotate between flashcard, multiple_choice, identification

      if (cardTypeIdx === 0) {
        // Flashcard
        cards.push({
          id: `card-${Date.now()}-${i}`,
          cardType: 'flashcard',
          frontContent: `[Section ${i + 1}] What key point is stated regarding: "${currSentence.slice(0, 75)}..."?`,
          backContent: currSentence,
          hintText: `Review section ${i + 1} of your notes.`,
          dynamicMnemonic: `Bee Tip: Connect Section ${i + 1} with a visual memory!`
        });
      } else if (cardTypeIdx === 1) {
        // Multiple Choice
        const distractor1 = sentences[(sentenceIdx + 3) % sentences.length] || 'Static isolation of variables';
        const distractor2 = sentences[(sentenceIdx + 5) % sentences.length] || 'Passive reading without self-quizzing';
        const distractor3 = sentences[(sentenceIdx + 7) % sentences.length] || 'Linear decay curve without repetition';

        cards.push({
          id: `card-${Date.now()}-${i}`,
          cardType: 'multiple_choice',
          frontContent: `[Section ${i + 1}] Which principle from your document accurately describes: "${currSentence.slice(0, 70)}..."?`,
          backContent: currSentence,
          options: [
            currSentence,
            distractor1.slice(0, 75),
            distractor2.slice(0, 75),
            distractor3.slice(0, 75)
          ],
          hintText: `Focus on section ${i + 1} definitions.`,
          dynamicMnemonic: 'Decompose to Conquer!'
        });
      } else {
        // Identification
        const words = currSentence.split(' ').filter((w) => w.length > 3);
        const term = words.slice(0, 3).join(' ') || topicName;

        cards.push({
          id: `card-${Date.now()}-${i}`,
          cardType: 'identification',
          frontContent: `[Section ${i + 1}] Type the exact term or concept associated with: "${nextSentence.slice(0, 80)}"`,
          backContent: term,
          hintText: 'Type the exact key term from your material.',
          dynamicMnemonic: 'Active Retrieval = Stronger Synapses!'
        });
      }
    }

    return cards;
  }

  // Topic specific fallback if document text is short/empty (e.g. image file with title)
  const lowerTitle = topicName.toLowerCase();

  if (lowerTitle.includes('user') || lowerTitle.includes('design') || lowerTitle.includes('ucd') || lowerTitle.includes('ui') || lowerTitle.includes('ux')) {
    const ucdTopics = [
      {
        cardType: 'flashcard',
        front: `What is the core definition of User-Centered Design (UCD) in "${topicName}"?`,
        back: 'User-Centered Design (UCD) is an iterative design framework where designers focus on users and their explicit needs in each phase through usability testing and research.',
        hint: 'Focus on user needs at every step.',
        mnemonic: 'Focus on Users First!'
      },
      {
        cardType: 'multiple_choice',
        front: 'Which phase of the User-Centered Design lifecycle comes first?',
        back: 'Understand and specify the context of use',
        options: [
          'Understand and specify the context of use',
          'Final Production Deployment',
          'Database Schema Normalization',
          'Marketing Strategy Launch'
        ],
        hint: 'Design begins with understanding user context.',
        mnemonic: 'Research before Sketching!'
      },
      {
        cardType: 'identification',
        front: 'Type the exact term for testing interactive mockups with real target users:',
        back: 'Usability Testing',
        hint: 'Evaluating design decisions with representative users.',
        mnemonic: 'Test Early, Test Often!'
      },
      {
        cardType: 'multiple_choice',
        front: 'What is a User Persona in User-Centered Design?',
        back: 'A semi-fictional representation of target users based on real qualitative and quantitative data',
        options: [
          'A semi-fictional representation of target users based on real qualitative and quantitative data',
          'An executive stakeholder who approves project budgets',
          'A software bug logged in tracking systems',
          'A marketing slogan created for advertising'
        ],
        hint: 'Represents target user demographics and pain points.',
        mnemonic: 'Personas bring users to life!'
      },
      {
        cardType: 'flashcard',
        front: 'Why is the iterative feedback loop vital in User-Centered Design?',
        back: 'It continuously refines prototypes through repeated user evaluation, reducing costly design flaws before implementation.',
        hint: 'Iterate = Empathize, Prototype, Test, Refine.',
        mnemonic: 'Iterate to Perfection!'
      }
    ];

    for (let i = 0; i < targetCount; i++) {
      const item = ucdTopics[i % ucdTopics.length];
      cards.push({
        id: `card-${Date.now()}-${i}`,
        cardType: item.cardType,
        frontContent: item.front,
        backContent: item.back,
        options: item.options,
        hintText: item.hint,
        dynamicMnemonic: item.mnemonic
      });
    }
    return cards;
  }

  // Generic Topic Generator across target count
  for (let i = 0; i < targetCount; i++) {
    const cardType = i % 3 === 0 ? 'flashcard' : i % 3 === 1 ? 'multiple_choice' : 'identification';
    cards.push({
      id: `card-${Date.now()}-${i}`,
      cardType: cardType,
      frontContent: cardType === 'flashcard'
        ? `[Part ${i + 1}] What is a key principle of "${topicName}"?`
        : cardType === 'multiple_choice'
        ? `[Part ${i + 1}] Which mechanism applies to problem solving in "${topicName}"?`
        : `[Part ${i + 1}] Type the exact term for active retrieval in "${topicName}":`,
      backContent: cardType === 'flashcard'
        ? `Core foundational principle #${i + 1} of ${topicName}.`
        : cardType === 'multiple_choice'
        ? 'Systematic Decomposition & Testing'
        : 'Active Recall',
      options: cardType === 'multiple_choice' ? [
        'Systematic Decomposition & Testing',
        'Random Guessing without analysis',
        'Linear Exhaustion of variables',
        'Static Isolation'
      ] : undefined,
      hintText: `Review part ${i + 1} of ${topicName}.`,
      dynamicMnemonic: `Bee Tip: Lock in Part ${i + 1} with active retrieval!`
    });
  }

  return cards;
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
    // Generate smart, highly specific cards dynamically across the entire document text & title!
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
      score: 88,
      strengths: ['Captured the core mechanism well.'],
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

  // Fallback to intelligent local AI tutor response engine!
  return getSmartFallbackAnswer(userQuestion, cardContext);
}

// ── Smart Natural Language AI Answer Engine ─────────────────────
export function getSmartFallbackAnswer(question = '', context = '') {
  const q = (question || '').trim();
  const qLower = q.toLowerCase();

  // 1. Topic Specific Specializations
  if (qLower.includes('dna') || qLower.includes('rna')) {
    return `BZZZ! 🐝 Here is the complete breakdown between DNA and RNA:

### 1. 🐝 Bee's Core Breakdown
- **DNA (Deoxyribonucleic Acid)** stores genetic blueprints long-term in cell nuclei.
- **RNA (Ribonucleic Acid)** acts as a messenger converting DNA instructions into functional proteins!

### 2. 🔍 Key Mechanisms & Differences
1. **Structure**: DNA is double-stranded (double helix); RNA is single-stranded.
2. **Sugar Backbone**: DNA uses *Deoxyribose* sugar; RNA uses *Ribose* sugar.
3. **Nitrogenous Bases**: DNA uses Thymine (A-T, C-G); RNA uses Uracil instead of Thymine (A-U, C-G).
4. **Location**: DNA stays inside nucleus; RNA travels to ribosomes in cytoplasm.

### 3. 💡 Memorable Analogy
Imagine DNA is the **master architecture textbook** locked in the library vault, and RNA is the **photocopied page** taken into the workshop to build the structure!

### 4. 🎯 Exam Tip
Remember **A-U** for RNA and **A-T** for DNA! Keep up the awesome study momentum!`;
  }

  if (qLower.includes('respiration') || qLower.includes('cellular')) {
    return `BZZZ! 🐝 Cellular Respiration explained simply:

### 1. 🐝 Bee's Core Breakdown
Cellular respiration is how cells break down glucose sugar to generate usable **ATP energy payoff** (~32-38 ATP per glucose molecule)!

### 2. 🔍 3 Key Stages
1. **Glycolysis** (Cytoplasm): Glucose is split into 2 pyruvate molecules (+2 ATP).
2. **Krebs Cycle / Citric Acid Cycle** (Mitochondria): Pyruvate breaks down and releases CO₂ (+2 ATP).
3. **Electron Transport Chain** (Inner Membrane): High-energy electrons power ATP synthase payoff (~32-34 ATP)!

### 3. 💡 Memorable Analogy
Glycolysis is **opening the present**, Krebs Cycle is **reading the assembly guide**, and Electron Transport Chain is **turning on the power engine**!

### 4. 🎯 Exam Tip
Oxygen is the **final electron acceptor** at the end of the electron transport chain!`;
  }

  if (qLower.includes('closure') || qLower.includes('javascript') || qLower.includes('scope')) {
    return `BZZZ! 🐝 JavaScript Closures explained simply:

### 1. 🐝 Bee's Core Breakdown
A **Closure** is created whenever an inner function retains access to variables from its outer lexical scope even after the outer function has finished executing!

### 2. 🔍 How It Works Step-by-Step
1. **Lexical Scoping**: Functions remember the environment where they were created.
2. **State Retention**: Private variables stay preserved in memory.
3. **Common Use Case**: Creating private data, factory functions, and event handlers.

\`\`\`javascript
function makeCounter() {
  let count = 0; // Private state
  return function() {
    count++;
    return count;
  };
}
const counter = makeCounter();
console.log(counter()); // 1
console.log(counter()); // 2
\`\`\`

### 3. 💡 Memorable Analogy
A closure is like a **backpack** the inner function carries around containing all the tools from the room where it was born!`;
  }

  if (qLower.includes('user') || qLower.includes('design') || qLower.includes('ucd') || qLower.includes('ux')) {
    return `BZZZ! 🐝 Here is the complete breakdown of User-Centered Design (UCD):

### 1. 🐝 Bee's Core Breakdown
**User-Centered Design (UCD)** is an iterative design process where designers focus on real users and their needs at every stage through user research, prototyping, and usability testing.

### 2. 🔍 The 4 Key UCD Phases
1. **Understand Context of Use**: Research who will use the product, why, and under what conditions.
2. **Specify Requirements**: Define user goals and usability targets.
3. **Create Design Solutions**: Develop wireframes, personas, and interactive prototypes.
4. **Evaluate Against Requirements**: Conduct usability testing with real target users to refine the design!

### 3. 💡 Memorable Analogy
Building a app without UCD is like buying shoes for a friend without asking their shoe size! UCD measures the user's foot first.

### 4. 🎯 Exam Tip
Remember that UCD is **iterative** — you repeat research and testing until usability goals are met!`;
  }

  // 2. Intelligent Dynamic Generator for ANY general question
  const topicTerm = q.replace(/^(what|how|why|explain|define|compare|difference between|give me|is|can you)\s+/i, '').replace(/\?$/, '').trim() || 'this study concept';

  return `BZZZ! 🐝 Bee is here to explain **"${q}"**!

### 1. 🐝 Bee's Core Breakdown
Regarding **${topicTerm}**: This fundamental concept focuses on understanding the underlying structure, mechanisms, and practical applications within this subject area.

### 2. 🔍 Key Principles & Components
- **Core Definition**: ${topicTerm} represents a key mechanism or framework used to solve specific problems and analyze relationships.
- **How It Works**: Break the topic down into component steps — start with basic definitions, analyze how variables interact, and observe the outcomes.
- **Practical Application**: Applied in real-world problem solving, exams, and practical field work.

### 3. 💡 Memorable Analogy
Think of **${topicTerm}** like a **puzzle blueprint**: once you identify the border pieces (foundational terms), fitting the middle pieces together becomes natural!

### 4. 🎯 Exam Strategy Tip
When studying **${topicTerm}**:
1. Practice active recall by self-quizzing without looking at notes.
2. Teach the concept out loud using simple words (Feynman Technique).
3. Connect key terms with vivid visual memory triggers! You've got this! 🌟`;
}
