import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  itemName = 'this item',
  title = 'Move to Recycle Bin',
  message,
  confirmText = 'Move to Recycle Bin',
  isPermanent = false
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className={`w-12 h-12 rounded-full ${isPermanent ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'} flex items-center justify-center mx-auto mb-4`}>
          {isPermanent ? (
            <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
          ) : (
            <Trash2 className="w-6 h-6 stroke-[2.2]" />
          )}
        </div>

        <h3 className="text-lg font-bold text-slate-900 text-center mb-1">
          {title}
        </h3>
        
        <p className="text-xs text-slate-500 text-center mb-6 leading-relaxed">
          {message ? (
            message
          ) : (
            <>
              {itemName && <span className="font-semibold text-slate-700 block mb-1">"{itemName}"</span>}
              Move this item to the Recycle Bin? You can restore it later.
            </>
          )}
        </p>

        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-white text-xs font-semibold shadow-sm transition ${
              isPermanent ? 'bg-red-600 hover:bg-red-700' : 'bg-[#1e5adb] hover:bg-blue-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
