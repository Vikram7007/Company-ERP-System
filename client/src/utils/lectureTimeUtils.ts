// Utility functions for Real-time Lecture Scheduling, Timing, Status, and Embeds

export interface LectureTimeInput {
  date: string;
  time: string;
  endTime?: string;
  durationMinutes?: number;
  status?: 'Upcoming' | 'Live' | 'Completed';
  recordingUrl?: string;
}

/**
 * Parses time string (e.g., "18:00 IST", "10:30 AM", "14:00", "09:15 pm")
 * into hours and minutes in 24-hour format.
 */
export function parseTimeString(timeStr: string): { hours: number; minutes: number } {
  if (!timeStr) return { hours: 10, minutes: 0 };

  const clean = timeStr.replace(/IST|UTC|GMT/gi, '').trim();
  const isPM = /pm/i.test(clean);
  const isAM = /am/i.test(clean);
  const digitsOnly = clean.replace(/[^\d:]/g, '');
  const parts = digitsOnly.split(':').map(Number);

  let hours = parts[0] || 0;
  const minutes = parts[1] || 0;

  if (isPM && hours < 12) {
    hours += 12;
  } else if (isAM && hours === 12) {
    hours = 0;
  }

  return { hours, minutes };
}

/**
 * Returns Date objects for Start and End of a lecture.
 */
export function getLectureDateRange(lecture: LectureTimeInput): { start: Date; end: Date } {
  const [year, month, day] = (lecture.date || '').split('-').map(Number);
  const defaultDate = new Date();
  const y = year || defaultDate.getFullYear();
  const m = month ? month - 1 : defaultDate.getMonth();
  const d = day || defaultDate.getDate();

  const { hours: startH, minutes: startM } = parseTimeString(lecture.time);
  const start = new Date(y, m, d, startH, startM, 0, 0);

  let end: Date;
  if (lecture.endTime) {
    const { hours: endH, minutes: endM } = parseTimeString(lecture.endTime);
    end = new Date(y, m, d, endH, endM, 0, 0);
    // If end time is before start time, assume it spans midnight or next day
    if (end.getTime() <= start.getTime()) {
      end = new Date(start.getTime() + (lecture.durationMinutes || 60) * 60 * 1000);
    }
  } else {
    const durationMins = lecture.durationMinutes && lecture.durationMinutes > 0 ? lecture.durationMinutes : 60;
    end = new Date(start.getTime() + durationMins * 60 * 1000);
  }

  return { start, end };
}

/**
 * Determines the REAL-TIME status of a lecture:
 * 'Completed' | 'Live' | 'Upcoming'
 */
export function getLectureRealTimeStatus(lecture: LectureTimeInput): 'Upcoming' | 'Live' | 'Completed' {
  // If explicitly marked as Completed or has a recording URL, it is Completed/Recorded
  if (lecture.status === 'Completed' || (lecture.recordingUrl && lecture.recordingUrl.trim().length > 0)) {
    return 'Completed';
  }

  const now = new Date();
  const { start, end } = getLectureDateRange(lecture);

  if (now.getTime() < start.getTime()) {
    return 'Upcoming';
  } else if (now.getTime() >= start.getTime() && now.getTime() <= end.getTime()) {
    return 'Live';
  } else {
    // Current time is past the end time -> lecture is finished/completed
    return 'Completed';
  }
}

/**
 * Returns human-readable relative time / countdown for the lecture.
 */
export function getLectureCountdown(lecture: LectureTimeInput): {
  badgeText: string;
  isLive: boolean;
  isUpcoming: boolean;
  isCompleted: boolean;
} {
  const status = getLectureRealTimeStatus(lecture);
  const now = new Date();
  const { start, end } = getLectureDateRange(lecture);

  if (status === 'Completed') {
    return {
      badgeText: 'Completed & Recorded',
      isLive: false,
      isUpcoming: false,
      isCompleted: true
    };
  }

  if (status === 'Live') {
    const remainingMins = Math.max(1, Math.round((end.getTime() - now.getTime()) / 60000));
    return {
      badgeText: `Live Now (${remainingMins}m left)`,
      isLive: true,
      isUpcoming: false,
      isCompleted: false
    };
  }

  // Upcoming
  const diffMs = start.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  let badgeText = 'Upcoming';
  if (diffMins < 60) {
    badgeText = `Starts in ${Math.max(1, diffMins)}m`;
  } else if (diffHours < 24) {
    badgeText = `Starts in ${diffHours}h`;
  } else if (diffDays === 1) {
    badgeText = 'Starts Tomorrow';
  } else {
    badgeText = `Starts in ${diffDays} days`;
  }

  return {
    badgeText,
    isLive: false,
    isUpcoming: true,
    isCompleted: false
  };
}

/**
 * Nicely formats date & time range (e.g. "Today • 10:00 AM - 11:30 AM")
 */
export function formatLectureSchedule(lecture: LectureTimeInput): string {
  const { start, end } = getLectureDateRange(lecture);
  const now = new Date();

  const isToday =
    start.getFullYear() === now.getFullYear() &&
    start.getMonth() === now.getMonth() &&
    start.getDate() === now.getDate();

  const isTomorrow =
    start.getFullYear() === now.getFullYear() &&
    start.getMonth() === now.getMonth() &&
    start.getDate() === now.getDate() + 1;

  let datePrefix = '';
  if (isToday) {
    datePrefix = 'Today';
  } else if (isTomorrow) {
    datePrefix = 'Tomorrow';
  } else {
    datePrefix = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  const startTimeStr = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const endTimeStr = end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  const durationMins = Math.round((end.getTime() - start.getTime()) / 60000);

  return `${datePrefix} • ${startTimeStr} - ${endTimeStr} (${durationMins}m)`;
}

/**
 * Embed URL generator for YouTube, Google Drive, or standard video formats.
 */
export function parseVideoEmbed(url: string): {
  type: 'youtube' | 'drive' | 'direct' | 'blob';
  embedUrl: string;
} {
  if (!url) {
    return { type: 'direct', embedUrl: '' };
  }

  // Blob or local data URL
  if (url.startsWith('blob:') || url.startsWith('data:')) {
    return { type: 'blob', embedUrl: url };
  }

  // YouTube
  // Patterns: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`
    };
  }

  // Google Drive
  // Patterns: drive.google.com/file/d/ID/view, drive.google.com/open?id=ID
  const driveMatch = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([\w-]+)/);
  if (driveMatch && driveMatch[1]) {
    return {
      type: 'drive',
      embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview`
    };
  }

  // Direct video (mp4, webm, etc.)
  return {
    type: 'direct',
    embedUrl: url
  };
}
