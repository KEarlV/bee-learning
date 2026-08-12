import React from 'react';
import { AlertTriangle, Trash2, HelpCircle, X, ShieldAlert } from 'lucide-react';
import BeeAnimatedMascot from './BeeAnimatedMascot';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Item?',
  description = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Delete Deck',
  cancelText = 'Cancel',
  variant = 'danger',
  icon: CustomIcon
}) {
  if (!isOpen) return null;

  const isDanger = variant === 'danger';
  const isWarning = variant === 'warning';

  const IconComponent = CustomIcon || (isDanger ? Trash2 : isWarning ? AlertTriangle : HelpCircle);

  const themeClasses = isDanger
    ? {
        panelBorder: 'border-rose-500/40 shadow-[0_0_50px_rgba(244,63,94,0.18)]',
        badgeBg: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
        iconBg: 'bg-gradient-to-br from-rose-500/20 to-red-500/10 text-rose-400 border border-rose-500/30 ring-4 ring-rose-500/10',
        confirmBtn: 'bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg shadow-rose-600/30 hover:shadow-rose-500/40 active:scale-[0.98]',
        speechBubble: 'Danger zone! Are you sure?'
      }
    : isWarning
    ? {
        panelBorder: 'border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.18)]',
        badgeBg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
        iconBg: 'bg-gradient-to-br from-amber-500/20 to-orange-500/10 text-amber-400 border border-amber-500/30 ring-4 ring-amber-500/10',
        confirmBtn: 'bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold shadow-lg shadow-amber-500/30 active:scale-[0.98]',
        speechBubble: 'Hold on! Double check this.'
      }
    : {
        panelBorder: 'border-sky-500/40 shadow-[0_0_50px_rgba(14,165,233,0.18)]',
        badgeBg: 'bg-sky-500/15 border-sky-500/30 text-sky-400',
        iconBg: 'bg-gradient-to-br from-sky-500/20 to-indigo-500/10 text-sky-400 border border-sky-500/30 ring-4 ring-sky-500/10',
        confirmBtn: 'bg-gradient-to-r from-sky-500 via-sky-400 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-lg shadow-sky-500/30 active:scale-[0.98]',
        speechBubble: 'Bee asks for confirmation!'
      };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none animate-in fade-in-0 duration-200">
      {/* Ambient background glow */}
      <div className={`absolute w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none ${isDanger ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-sky-500'}`} />

      <div className={`glass-panel w-full max-w-md p-6 relative ${themeClasses.panelBorder} shadow-2xl rounded-3xl space-y-5 transform transition-all duration-300 scale-100 z-10 overflow-hidden`}>
        {/* Top Accent Line */}
        <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${isDanger ? 'from-transparent via-rose-500 to-transparent' : isWarning ? 'from-transparent via-amber-500 to-transparent' : 'from-transparent via-sky-500 to-transparent'}`} />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800/80 transition-colors z-20"
        >
          <X size={18} />
        </button>

        {/* Mascot & Header Layout */}
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            <BeeAnimatedMascot size="sm" animated={true} speechBubble={themeClasses.speechBubble} />
          </div>

          <div className="space-y-1.5 flex-1 pr-4">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-xl shrink-0 ${themeClasses.iconBg}`}>
                <IconComponent size={18} />
              </div>
              <h3 className="text-lg font-bold text-white font-display leading-tight">{title}</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{description}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800/80">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all active:scale-95"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${themeClasses.confirmBtn}`}
          >
            <IconComponent size={14} />
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
