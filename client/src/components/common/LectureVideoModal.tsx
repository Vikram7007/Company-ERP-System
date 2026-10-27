import React, { useEffect } from 'react';
import { X, Video, ExternalLink, Download, FileText, Calendar, Clock, User, Layers } from 'lucide-react';
import { parseVideoEmbed } from '../../utils/lectureTimeUtils';

interface LectureVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
  domain?: string;
  batch?: string;
  mentorName?: string;
  duration?: string;
  date?: string;
  notesUrl?: string;
  notesFileName?: string;
}

export const LectureVideoModal: React.FC<LectureVideoModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  title,
  domain,
  batch,
  mentorName,
  duration,
  date,
  notesUrl,
  notesFileName
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !videoUrl) return null;

  const { type, embedUrl } = parseVideoEmbed(videoUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-700/80 text-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-5 py-3.5 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center shrink-0">
              <Video className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-extrabold text-white truncate">{title || 'Recorded Lecture'}</h3>
              <p className="text-[11px] text-slate-400 truncate">
                {domain ? `${domain} • ` : ''}{batch || 'All Batches'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {videoUrl.startsWith('http') && (
              <a
                href={videoUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Close Player"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Area */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
          {type === 'youtube' ? (
            <iframe
              src={embedUrl}
              title={title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : type === 'drive' ? (
            <iframe
              src={embedUrl}
              title={title}
              className="w-full h-full border-0"
              allow="autoplay"
              allowFullScreen
            />
          ) : (
            <video
              src={embedUrl}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>

        {/* Details Footer */}
        <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3 text-slate-300">
            {mentorName && (
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
                <User className="w-3.5 h-3.5 text-orange-400" />
                <span>Mentor: <strong>{mentorName}</strong></span>
              </span>
            )}
            {date && (
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>{date}</span>
              </span>
            )}
            {duration && (
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Duration: <strong>{duration}</strong></span>
              </span>
            )}
          </div>

          {notesUrl && notesUrl !== '#' && (
            <a
              href={notesUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold rounded-xl transition-all shadow-md flex items-center space-x-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Study Notes {notesFileName ? `(${notesFileName})` : ''}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
