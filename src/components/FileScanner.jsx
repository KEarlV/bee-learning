import React, { useState } from 'react';
import { UploadCloud, Sparkles, CheckCircle2, Loader2, FileText, Image as ImageIcon, AlertCircle, Key, X } from 'lucide-react';
import BeeAnimatedMascot from './BeeAnimatedMascot';
import { generateFlashcardsFromText, getApiKey, setApiKey } from '../services/geminiService';
import { db } from '../services/storageService';
import { logActivity } from '../services/activityLogService';

const ERROR_MESSAGES = {
  NO_API_KEY: {
    title: 'No Gemini API Key Found',
    desc: 'Please enter your Google Gemini API key below. Get a free key at aistudio.google.com.',
    color: 'border-amber-500/40 bg-amber-500/10',
    textColor: 'text-amber-300',
    icon: Key,
  },
  INVALID_API_KEY: {
    title: 'Invalid Gemini API Key',
    desc: 'Your API key was rejected. Please check it at aistudio.google.com and enter the correct key.',
    color: 'border-rose-500/40 bg-rose-500/10',
    textColor: 'text-rose-300',
    icon: AlertCircle,
  },
  ALL_MODELS_FAILED: {
    title: 'Gemini API Unavailable',
    desc: 'Could not reach the Gemini API. Check your internet connection or try again in a moment.',
    color: 'border-rose-500/40 bg-rose-500/10',
    textColor: 'text-rose-300',
    icon: AlertCircle,
  },
  PARSE_ERROR: {
    title: 'Response Parsing Error',
    desc: 'Gemini returned an unexpected format. Please try again or use different content.',
    color: 'border-amber-500/40 bg-amber-500/10',
    textColor: 'text-amber-300',
    icon: AlertCircle,
  },
  EMPTY_RESPONSE: {
    title: 'No Cards Generated',
    desc: 'Gemini could not extract study content from your file. Try uploading a different document or adding some text.',
    color: 'border-amber-500/40 bg-amber-500/10',
    textColor: 'text-amber-300',
    icon: AlertCircle,
  },
};

export default function FileScanner({ onDeckCreated }) {
  const [inputText, setInputText] = useState('');
  const [deckTitle, setDeckTitle] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [generatedCards, setGeneratedCards] = useState([]);
  const [extractedFileMeta, setExtractedFileMeta] = useState(null);
  const [filePayload, setFilePayload] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiKeySaved, setApiKeySaved] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExtractedFileMeta({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      type: file.type || 'document'
    });
    setDeckTitle(file.name.replace(/\.[^/.]+$/, ''));

    // Read base64 data for image or PDF multimodal input
    const readerBase64 = new FileReader();
    readerBase64.onload = (evt) => {
      setFilePayload({
        base64Data: evt.target?.result || '',
        mimeType: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
        fileName: file.name
      });
    };
    readerBase64.readAsDataURL(file);

    // Read text content for text/code/markdown files
    if (file.type.includes('text') || file.name.match(/\.(txt|md|json|csv|js|jsx|ts|tsx|html|css)$/i)) {
      const readerText = new FileReader();
      readerText.onload = (evt) => {
        setInputText(evt.target?.result || '');
      };
      readerText.readAsText(file);
    } else {
      // Extract printable text from binary files (PDF/DOC)
      const readerBinary = new FileReader();
      readerBinary.onload = (evt) => {
        const buffer = evt.target?.result;
        if (buffer) {
          const bytes = new Uint8Array(buffer);
          let str = '';
          for (let i = 0; i < bytes.length; i++) {
            const code = bytes[i];
            if ((code >= 32 && code <= 126) || code === 10 || code === 13 || code === 9) {
              str += String.fromCharCode(code);
            } else {
              str += ' ';
            }
          }
          const clean = str.replace(/\s+/g, ' ').trim();
          if (clean.length > 50) {
            setInputText(clean);
          }
        }
      };
      readerBinary.readAsArrayBuffer(file);
    }
  };

  const calculateCardCount = (text = '') => {
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < 40) return 5;
    if (wordCount < 150) return 6;
    if (wordCount < 400) return 8;
    if (wordCount < 1000) return 12;
    if (wordCount < 2000) return 16;
    return 20; // Up to 20 cards for large documents
  };

  const handleSaveApiKey = () => {
    const trimmed = apiKeyInput.trim();
    if (!trimmed) return;
    setApiKey(trimmed);
    setApiKeySaved(true);
    setScanError(null);
    setTimeout(() => setApiKeySaved(false), 3000);
  };

  const handleStartAiScan = async () => {
    if (!inputText.trim() && !filePayload) return;
    setIsScanning(true);
    setGeneratedCards([]);
    setScanError(null);

    const targetCount = calculateCardCount(inputText);

    try {
      const result = await generateFlashcardsFromText(inputText, targetCount, filePayload, deckTitle || extractedFileMeta?.name);
      const { cards, error } = result || {};

      if (error) {
        setScanError(error);
      } else if (cards && cards.length > 0) {
        setGeneratedCards(cards);
        logActivity('AI Scan Completed', 'AI', { tokens: cards.length * 10 });
      } else {
        setScanError('EMPTY_RESPONSE');
      }
    } catch (err) {
      console.error('FileScanner scan error:', err);
      setScanError('ALL_MODELS_FAILED');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveDeck = async () => {
    if (!generatedCards.length) return;

    const newDeckId = 'deck-' + Date.now();
    const nowIso = new Date().toISOString();

    const newDeck = {
      id: newDeckId,
      title: deckTitle || 'New AI Generated Deck',
      description: `Generated by Bee AI from ${extractedFileMeta?.name || 'study notes'}.`,
      subjectCategory: 'General Study',
      tags: ['ai-generated', 'gemini-flash'],
      createdAt: nowIso,
      updatedAt: nowIso
    };

    await db.decks.add(newDeck);

    const cardsToInsert = generatedCards.map((c, idx) => ({
      id: `card-${newDeckId}-${idx}`,
      deckId: newDeckId,
      cardType: c.cardType || 'flashcard',
      frontContent: c.frontContent,
      backContent: c.backContent,
      options: c.options,
      hintText: c.hintText,
      dynamicMnemonic: c.dynamicMnemonic,
      easeFactor: 2.5,
      intervalDays: 0,
      repetitions: 0,
      dueDate: new Date().toISOString().split('T')[0],
      status: 'new'
    }));

    await db.cards.bulkAdd(cardsToInsert);

    if (onDeckCreated) {
      onDeckCreated(newDeckId);
    }
  };

  const errorInfo = scanError ? ERROR_MESSAGES[scanError] || ERROR_MESSAGES['ALL_MODELS_FAILED'] : null;
  const needsApiKey = scanError === 'NO_API_KEY' || scanError === 'INVALID_API_KEY';
  const currentKey = getApiKey();

  return (
    <div className="max-w-4xl mx-auto space-y-6 select-none">
      {/* Header Banner */}
      <div className="glass-panel p-6 border-sky-500/30 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="text-sky-400" size={24} />
            <h2 className="text-2xl font-bold text-white font-display">AI Scan &amp; Deck Studio</h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Upload PDFs, handwritten notes, textbook scans, or paste text to auto-generate active recall cards with Gemini AI!
          </p>
        </div>
        <BeeAnimatedMascot size="lg" animated={true} speechBubble="Bee is ready to scan!" />
      </div>

      {/* API Key Status Banner (if no key configured) */}
      {!currentKey && !scanError && (
        <div className="glass-panel p-4 border-amber-500/30 bg-amber-500/5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Key size={18} className="text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          <div className="flex-1">
            <p className="text-xs font-bold text-amber-300">Gemini API Key Required</p>
            <p className="text-[11px] text-amber-400/80">Enter your Google Gemini API key to generate real AI flashcards from your documents. Get a free key at <strong>aistudio.google.com</strong>.</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="AIza..."
              className="flex-1 sm:w-52 bg-slate-950 border border-amber-500/40 focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleSaveApiKey()}
            />
            <button
              onClick={handleSaveApiKey}
              className="btn-primary text-xs py-1.5 px-3 shrink-0"
            >
              {apiKeySaved ? <CheckCircle2 size={14} /> : 'Save Key'}
              {apiKeySaved && ' Saved!'}
            </button>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorInfo && (
        <div className={`glass-panel p-4 border ${errorInfo.color} flex flex-col gap-3`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <errorInfo.icon size={18} className={`${errorInfo.textColor} shrink-0 mt-0.5`} />
              <div>
                <p className={`text-sm font-bold ${errorInfo.textColor}`}>{errorInfo.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{errorInfo.desc}</p>
              </div>
            </div>
            <button onClick={() => setScanError(null)} className="text-slate-500 hover:text-slate-300 shrink-0">
              <X size={16} />
            </button>
          </div>

          {/* Inline API key input for key errors */}
          {needsApiKey && (
            <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
              <Key size={14} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Paste your Gemini API key (AIza...)"
                className="flex-1 bg-slate-950 border border-slate-700 focus:border-sky-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleSaveApiKey()}
              />
              <button
                onClick={handleSaveApiKey}
                className="btn-primary text-xs py-1.5 px-3 shrink-0"
              >
                {apiKeySaved ? '✓ Saved!' : 'Save & Retry'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Multimodal Dropzone & Text Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dropzone */}
        <div className="glass-panel p-6 border-dashed border-2 border-slate-700 hover:border-sky-500 transition-all flex flex-col items-center justify-center text-center relative overflow-hidden group">
          {/* Holographic Scanner Beam when scanning */}
          {isScanning && (
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_20px_#1ea5fc] animate-laser-scan z-20" />
          )}

          <input
            type="file"
            accept=".pdf,.txt,.md,.png,.jpg,.jpeg"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
          />

          <div className="p-4 rounded-2xl bg-sky-500/10 text-sky-400 mb-3 group-hover:scale-110 transition-transform">
            {extractedFileMeta?.type?.includes('image') ? (
              <ImageIcon size={36} />
            ) : extractedFileMeta ? (
              <FileText size={36} />
            ) : (
              <UploadCloud size={36} />
            )}
          </div>

          <h3 className="text-base font-bold text-white mb-1">
            {extractedFileMeta ? extractedFileMeta.name : 'Drag & Drop PDF or Image Scans'}
          </h3>
          <p className="text-xs text-slate-400 mb-3">
            {extractedFileMeta
              ? `${extractedFileMeta.size} • Ready for AI processing`
              : 'Supports PDF, JPG/PNG Scans, Handwritten Notes, or Text Files'}
          </p>
          <span className="text-[11px] font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-3 py-1 rounded-full">
            {extractedFileMeta ? 'Change File' : 'Browse File'}
          </span>
        </div>

        {/* Pasteable Text Area */}
        <div className="glass-panel p-6 flex flex-col justify-between space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Or Paste Lecture Notes / Text
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste lecture text, key definitions, or exam topics here..."
              className="w-full h-36 bg-slate-900/90 border border-slate-800 focus:border-sky-500 rounded-xl p-3.5 text-sm text-slate-200 placeholder-slate-500 outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <input
              type="text"
              value={deckTitle}
              onChange={(e) => setDeckTitle(e.target.value)}
              placeholder="Deck Title (e.g. Biology Ch 3)"
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none flex-1"
            />

            <button
              onClick={handleStartAiScan}
              disabled={isScanning || (!inputText.trim() && !filePayload)}
              className="btn-primary text-xs disabled:opacity-50 shrink-0"
            >
              {isScanning ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Scanning...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Generate Cards
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Generated Cards Preview Section */}
      {generatedCards.length > 0 && (
        <div className="glass-panel p-6 space-y-4 border-sky-500/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Generated Active Recall Cards ({generatedCards.length})</h3>
              <p className="text-xs text-slate-400">Review your generated cards before saving to your library</p>
            </div>

            <button onClick={handleSaveDeck} className="btn-primary text-xs">
              <CheckCircle2 size={16} />
              Save to My Decks
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {generatedCards.map((card, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-sky-500/40 space-y-2">
                <div className="flex items-center justify-between text-xs text-sky-400 font-bold uppercase">
                  <span>Card #{idx + 1} ({card.cardType || 'flashcard'})</span>
                  <span className="text-amber-400 text-[10px]">✨ Gemini AI</span>
                </div>
                <p className="text-sm font-semibold text-slate-200">Q: {card.frontContent}</p>
                <p className="text-xs text-slate-400 border-t border-slate-800 pt-2">A: {card.backContent}</p>
                {card.options && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {card.options.map((opt, oi) => (
                      <span
                        key={oi}
                        className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                          opt.toLowerCase().trim() === (card.backContent || '').toLowerCase().trim()
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        {opt}
                      </span>
                    ))}
                  </div>
                )}
                {card.dynamicMnemonic && (
                  <p className="text-[11px] text-amber-300/90 italic bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                    💡 Mnemonic: {card.dynamicMnemonic}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
