import React, { useState } from 'react';
import { X, Video, Upload, Link2, CheckCircle2, AlertCircle, FileText, Sparkles } from 'lucide-react';
import { LiveClass } from '../../types';

interface EndClassRecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (classId: string, recordingUrl: string, notesUrl?: string, notesFileName?: string) => void;
  liveClass: LiveClass | null;
}

export const EndClassRecordingModal: React.FC<EndClassRecordingModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  liveClass
}) => {
  const [sourceType, setSourceType] = useState<'url' | 'file'>('url');
  const [videoUrl, setVideoUrl] = useState('');
  const [notesUrl, setNotesUrl] = useState('');
  const [notesFileName, setNotesFileName] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [fileDetails, setFileDetails] = useState<{ name: string; size: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !liveClass) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      const preview = URL.createObjectURL(file);
      setVideoFile(file);
      setFilePreviewUrl(preview);
      setFileDetails({ name: file.name, size: `${sizeMb} MB` });
      setVideoUrl(preview);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = sourceType === 'url' ? videoUrl.trim() : (filePreviewUrl || videoUrl.trim());

    if (!finalUrl) {
      setError('Please provide a recording link (YouTube, Google Drive, MP4) or upload a video file.');
      return;
    }

    onConfirm(
      liveClass.id,
      finalUrl,
      notesUrl.trim() || undefined,
      notesFileName.trim() || undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-lg border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
              <Video className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">End Class & Publish Recording</h3>
              <p className="text-xs text-slate-300">
                Makes the session immediately available to students in {liveClass.batch}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-2 text-rose-700 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Session Summary Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
              {liveClass.domain}
            </span>
            <h4 className="text-sm font-extrabold text-slate-900">{liveClass.title}</h4>
            <p className="text-[11px] text-slate-500 font-semibold">
              Batch: <strong className="text-slate-800">{liveClass.batch}</strong> • Mentor: <strong className="text-slate-800">{liveClass.mentorName}</strong>
            </p>
          </div>

          {/* Source Type Toggle */}
          <div>
            <label className="block font-extrabold text-slate-700 mb-2">Select Recording Source:</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setSourceType('url')}
                className={`py-2 text-xs font-extrabold rounded-xl transition-all ${
                  sourceType === 'url' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🔗 Cloud URL (YouTube / Drive)
              </button>
              <button
                type="button"
                onClick={() => setSourceType('file')}
                className={`py-2 text-xs font-extrabold rounded-xl transition-all ${
                  sourceType === 'file' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                💻 Upload Laptop File
              </button>
            </div>
          </div>

          {sourceType === 'url' ? (
            <div>
              <label className="block font-extrabold text-slate-700 mb-1 flex items-center space-x-1">
                <Link2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Recording Video Link <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="text"
                required
                placeholder="https://www.youtube.com/watch?v=... or Google Drive URL"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-medium text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Supports YouTube videos, Google Drive recordings, and direct MP4/cloud links.
              </p>
            </div>
          ) : (
            <div>
              <label className="block font-extrabold text-slate-700 mb-1 flex items-center space-x-1">
                <Upload className="w-3.5 h-3.5 text-indigo-600" />
                <span>Select MP4 Video File <span className="text-rose-500">*</span></span>
              </label>
              <label className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
                <Upload className="w-8 h-8 text-indigo-500 mb-2" />
                <span className="font-extrabold text-indigo-900">Click to choose video from device</span>
                <span className="text-[10px] text-slate-500 mt-1">MP4, WebM, MOV supported</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {fileDetails && (
                <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-800 font-bold">
                  <span>📹 {fileDetails.name}</span>
                  <span className="text-[10px] bg-emerald-200 px-2 py-0.5 rounded">{fileDetails.size}</span>
                </div>
              )}
            </div>
          )}

          {/* Optional Notes Link */}
          <div>
            <label className="block font-extrabold text-slate-700 mb-1 flex items-center space-x-1">
              <FileText className="w-3.5 h-3.5 text-orange-500" />
              <span>Study Notes / GitHub Repository Link (Optional)</span>
            </label>
            <input
              type="text"
              placeholder="https://drive.google.com/... or GitHub link"
              value={notesUrl}
              onChange={(e) => setNotesUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-medium text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 font-extrabold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold shadow-lg shadow-emerald-600/20 transition-all flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save & Publish to Students</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
