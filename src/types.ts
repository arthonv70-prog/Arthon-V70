export interface School {
  name: string;
  keyword: string;
  principal: string;
  subdiv: string;
  address: string;
  lat?: number;
  lng?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export interface ProblemItem {
  timestamp: number;
  dateStr: string;
  school: string;
  teacher: string;
  problems: string[];
}

export interface HighlightItem {
  school: string;
  subject: string;
  detail: string;
  thumb: string;
  full: string;
  rawImg: string;
}

export interface SocialMediaItem {
  school: string;
  date: string;
  subject: string;
  image: string;
  gradeLevel?: string;
}

export interface AppDataLink {
  name: string;
  url: string;
}

export interface TimelinessStats {
  onTime: number;
  late1to3: number;
  lateMore: number;
}

export interface SubdivLeaderboardData {
  subdiv: string; // '21', '22', '23', '24'
  name: string; // 'กก.ตชด.21'
  fullName: string; // 'กองกำกับการตำรวจตระเวนชายแดนที่ 21'
  province: string; // 'สุรินทร์'
  totalSchools: number; // 9, 15, 11, 18
  submittedCount: number;
  coveragePct: number;
  totalReports: number;
  attendancePresent: number;
  attendanceTotal: number;
  attendanceRate: number;
  problemCount: number;
  readinessRate: number;
  pendingSchools: string[];
  submittedSchools: string[];
}
