import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Video, Link2, BookOpen, Layers, CheckCircle2, AlertCircle } from 'lucide-react';
import { LiveClass } from '../../types';

interface ScheduleLectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lectureData: Omit<LiveClass, 'id' | 'status'> & { id?: string; status?: 'Upcoming' | 'Live' | 'Completed' }) => void;
  initialData?: LiveClass | null;
  domains: string[];
  batches: string[];
  currentMentorName: string;
}

export const ScheduleLectureModal: React.FC<ScheduleLectureModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  domains,
  batches,
  currentMentorName
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    domain: domains[0] || 'MERN Stack Development',
    batch: batches[0] || 'Batch W-2026-A',
    mentorName: currentMentorName || 'Senior Mentor',
    date: todayStr,
    time: '10:00',
    endTime: '11:30',
    durationMinutes: 90,
    meetingPlatform: 'Google Meet' as LiveClass['meetingPlatform'],
    meetingUrl: '',
    recordingUrl: '',
    notesUrl: '',
    notesFileName: ''
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        domain: initialData.domain || domains[0] || 'MERN Stack Development',
        batch: initialData.batch || batches[0] || 'Batch W-2026-A',
        mentorName: initialData.mentorName || currentMentorName,
        date: initialData.date || todayStr,
        time: initialData.time || '10:00',
        endTime: initialData.endTime || '11:30',
        durationMinutes: initialData.durationMinutes || 90,
        meetingPlatform: initialData.meetingPlatform || 'Google Meet',
        meetingUrl: initialData.meetingUrl || '',
        recordingUrl: initialData.recordingUrl || '',
        notesUrl: initialData.notesUrl || '',
        notesFileName: initialData.notesFileName || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        domain: domains[0] || 'MERN Stack Development',
        batch: batches[0] || 'Batch W-2026-A',
        mentorName: currentMentorName || 'Senior Mentor',
        date: todayStr,
        time: '10:00',
        endTime: '11:30',
        durationMinutes: 90,
        meetingPlatform: 'Google Meet',
        meetingUrl: '',
        recordingUrl: '',
        notesUrl: '',
        notesFileName: ''
      });
    }
    setError(null);
  }, [initialData, isOpen, currentMentorName, domains, batches]);

  // Recalculate duration when time or endTime changes
  const handleTimeChange = (newStartTime: string, newEndTime: string) => {
    let duration = 60;
    try {
      const [startH, startM] = newStartTime.split(':').map(Number);
      const [endH, endM] = newEndTime.split(':').map(Number);
      if (!isNaN(startH) && !isNaN(endH)) {
        const diffMins = (endH * 60 + (endM || 0)) - (startH * 60 + (startM || 0));
        if (diffMins > 0) {
          duration = diffMins;
        }
      }
    } catch {
      duration = 60;
    }
    setFormData(prev => ({
      ...prev,
      time: newStartTime,
      endTime: newEndTime,
      durationMinutes: duration
    }));
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Please provide a lecture topic or title.');
      return;
    }
    if (!formData.meetingUrl.trim() && !formData.recordingUrl.trim()) {
      setError('Please enter a valid Meeting Link (Google Meet, Zoom, Teams) or a Video Recording URL.');
      return;
    }

    onSave({
      ...(initialData ? { id: initialData.id, status: initialData.status } : {}),
      title: formData.title.trim(),
      description: formData.description.trim(),
      domain: formData.domain,
      batch: formData.batch,
      mentorName: formData.mentorName || currentMentorName,
      date: formData.date,
      time: formData.time,
      endTime: formData.endTime,
      durationMinutes: Number(formData.durationMinutes) || 60,
      meetingPlatform: formData.meetingPlatform,
      meetingUrl: formData.meetingUrl.trim() || 'https://meet.google.com/new',
      recordingUrl: formData.recordingUrl.trim(),
      notesUrl: formData.notesUrl.trim(),
      notesFileName: formData.notesFileName.trim()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center font-bold">
              <Video className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">
                {initialData ? 'Edit Scheduled Lecture' : 'Schedule Live / Recorded Lecture'}
              </h3>
              <p className="text-xs text-slate-300">
                Setup real-time schedule, batch visibility, and meeting links
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto scrollbar-thin flex-1 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-2 text-rose-700 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block font-extrabold text-slate-700 mb-1">
              Lecture Title / Topic <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Building RESTful APIs with Node.js & Mongoose"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>

          {/* Domain & Batch Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-extrabold text-slate-700 mb-1">
                Domain / Specialization <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
              >
                {domains.map((dom) => (
                  <option key={dom} value={dom}>{dom}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-extrabold text-slate-700 mb-1">
                Target Student Batch <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.batch}
                onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
              >
                <option value="All Batches">All Batches (Combined)</option>
                {batches.filter(b => b !== 'All').map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-extrabold text-slate-700 mb-1 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span>Date <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-extrabold text-slate-700 mb-1 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                <span>Start Time <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => handleTimeChange(e.target.value, formData.endTime)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-extrabold text-slate-700 mb-1 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                <span>End Time</span>
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => handleTimeChange(formData.time, e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>
          </div>

          <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold flex items-center justify-between">
            <span>Calculated Duration:</span>
            <span className="font-extrabold text-indigo-600">{formData.durationMinutes} Minutes</span>
          </div>

          {/* Platform & Meeting Join URL */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-extrabold text-slate-700 mb-1">
                Platform
              </label>
              <select
                value={formData.meetingPlatform}
                onChange={(e) => setFormData({ ...formData, meetingPlatform: e.target.value as any })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
              >
                <option value="Google Meet">Google Meet</option>
                <option value="Zoom">Zoom</option>
                <option value="Microsoft Teams">Microsoft Teams</option>
                <option value="YouTube Live">YouTube Live</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-extrabold text-slate-700 mb-1 flex items-center space-x-1">
                <Link2 className="w-3.5 h-3.5 text-blue-500" />
                <span>Meeting Join URL <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="url"
                placeholder="https://meet.google.com/abc-defg-hij or Zoom join link"
                value={formData.meetingUrl}
                onChange={(e) => setFormData({ ...formData, meetingUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Optional Recording Video URL */}
          <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-200/80 space-y-3">
            <div>
              <label className="block font-extrabold text-orange-950 mb-1 flex items-center space-x-1.5">
                <Video className="w-3.5 h-3.5 text-orange-600" />
                <span>Recorded Video URL (Optional / After Class Ends)</span>
              </label>
              <input
                type="text"
                placeholder="YouTube embed link, Google Drive video link, or MP4 URL"
                value={formData.recordingUrl}
                onChange={(e) => setFormData({ ...formData, recordingUrl: e.target.value })}
                className="w-full px-3 py-2 bg-white rounded-xl border border-orange-200 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/30 text-xs"
              />
              <p className="text-[10px] text-slate-500 mt-1 font-medium">
                💡 Tip: You can leave this blank when scheduling. Once the class ends, you can click "End & Add Recording" to paste the recording link!
              </p>
            </div>

            {/* Optional Study Notes URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Study Notes / GitHub Repository Link
                </label>
                <input
                  type="text"
                  placeholder="https://github.com/... or Google Drive notes"
                  value={formData.notesUrl}
                  onChange={(e) => setFormData({ ...formData, notesUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-orange-200 text-slate-900 font-semibold text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Notes Display Name / PDF Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Session_5_Architecture_Notes.pdf"
                  value={formData.notesFileName}
                  onChange={(e) => setFormData({ ...formData, notesFileName: e.target.value })}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-orange-200 text-slate-900 font-semibold text-xs"
                />
              </div>
            </div>
          </div>

          {/* Description / Agenda */}
          <div>
            <label className="block font-extrabold text-slate-700 mb-1">
              Lecture Agenda / Key Discussion Points
            </label>
            <textarea
              rows={2}
              placeholder="Topics covered, prerequisite instructions for interns, or assignment brief..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-medium text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Action Buttons */}
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
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold shadow-lg shadow-orange-500/20 transition-all flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{initialData ? 'Save Changes' : 'Schedule Lecture'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
