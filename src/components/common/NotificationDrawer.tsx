import React, { useState } from 'react';
import { AppNotification } from '../../types';
import { Bell, Check, X, AlertTriangle, Info, CheckCircle2, ShieldAlert } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export const NotificationDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onClearAll
}) => {
  if (!isOpen) return null;

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'alert':
        return <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-teal-600 flex-shrink-0" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl border-l border-teal-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-teal-900 text-white">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-teal-800 rounded-lg">
              <Bell className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Notifikasi Sistem</h3>
              <p className="text-xs text-teal-200">
                {unreadCount > 0 ? `${unreadCount} belum dibaca` : 'Semua sudah dibaca'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-teal-800 text-teal-200 hover:text-white transition-colors"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        {notifications.length > 0 && (
          <div className="px-4 py-2 bg-teal-50 border-b border-teal-100 flex items-center justify-between text-xs text-teal-800">
            <span>Pemberitahuan monitoring sholat</span>
            <button 
              onClick={onClearAll}
              className="text-teal-700 font-medium hover:underline hover:text-teal-900"
            >
              Tandai semua dibaca
            </button>
          </div>
        )}

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-2 space-y-1">
          {notifications.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-30 text-teal-600" />
              <p className="text-sm font-medium">Tidak ada notifikasi baru</p>
              <p className="text-xs mt-1 text-gray-400">Notifikasi pengisian sholat dan absensi akan muncul di sini</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div 
                key={n.id}
                onClick={() => onMarkAsRead(n.id)}
                className={`p-3 rounded-lg transition-colors cursor-pointer border ${
                  !n.read 
                    ? 'bg-amber-50/60 border-amber-200 hover:bg-amber-100/50' 
                    : 'bg-white border-transparent hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {getIcon(n.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs font-semibold ${!n.read ? 'text-teal-950' : 'text-gray-700'}`}>
                        {n.title}
                      </h4>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">{n.date}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{n.message}</p>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
          <p className="text-[11px] text-teal-800 font-medium">SholTrack — Monitoring Sholat Santri Real-time</p>
        </div>
      </div>
    </div>
  );
};
