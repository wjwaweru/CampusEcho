import React, { useState } from 'react';
import { Download, Smartphone, X, Check, Apple } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface Props {
  className?: string;
  variant?: 'compact' | 'full' | 'banner';
}

export const PWAInstallButton: React.FC<Props> = ({ className = '', variant = 'compact' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setJustInstalled(true);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      {variant === 'compact' && (
        <button
          onClick={handleInstallClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition active:scale-95 ${className}`}
          title="Install CampusEcho on Android, iOS, or PC"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-100" />
          <span>Install App</span>
        </button>
      )}

      {variant === 'banner' && (
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white px-4 py-2.5 rounded-xl flex items-center justify-between shadow-md mb-4 border border-emerald-700/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-400/30">
              <Smartphone className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">Install CampusEcho on your phone</p>
              <p className="text-[11px] text-emerald-200/80">
                Fast offline access to your timetable, venue alerts, and campus notices.
              </p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-emerald-900 hover:bg-emerald-50 shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            Install
          </button>
        </div>
      )}

      {/* Guidance Modal for iOS and Android instructions */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  CE
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Install CampusEcho</h3>
                  <p className="text-xs text-slate-500">Android & iOS Native Experience</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs text-slate-600">
              {/* Android section */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>Android (Chrome / Edge)</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 leading-relaxed pl-1">
                  <li>Tap the three dots <strong>(⋮)</strong> in Chrome menu.</li>
                  <li>Select <strong>Add to Home screen</strong> or <strong>Install App</strong>.</li>
                  <li>Confirm install to get an icon on your home screen.</li>
                </ol>
              </div>

              {/* iOS section */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-1.5">
                  <Apple className="w-4 h-4 text-slate-800" />
                  <span>iPhone & iPad (Safari)</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 leading-relaxed pl-1">
                  <li>Tap the <strong>Share</strong> button (box with upward arrow) at the bottom.</li>
                  <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
                  <li>Tap <strong>Add</strong> in the top-right corner.</li>
                </ol>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200/60">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Runs full-screen without address bar, with cached offline support!</span>
              </div>
            </div>

            <div className="mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
