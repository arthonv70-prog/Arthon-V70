import React, { useState, useMemo, useEffect } from 'react';
import SafeLazyImage from './SafeLazyImage';
import {
  BookOpen,
  Search,
  CheckCircle2,
  Clock,
  User,
  Calendar,
  Layers,
  Award,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Filter,
  BarChart3,
  ListFilter,
  Eye,
  Info,
  Maximize2,
  Minimize2,
  TrendingUp,
  Check,
  Building,
  GraduationCap,
  FileText,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  SlidersHorizontal,
  MapPin,
  CheckCircle,
  Users,
  LayoutGrid,
  Table,
  ListTodo,
  Compass,
  Bookmark,
  RotateCcw,
  ExternalLink,
  FileEdit,
  Globe,
  X,
  Camera,
  CameraOff,
  Image
} from 'lucide-react';
import { School } from '../types';
import { convertToThaiNumerals, formatThaiDate, cleanReporterName } from '../utils';
import {
  GRADE_LEVELS,
  STAGE_FILTERS,
  GRADE_CURRICULUM_BLUEPRINTS,
  SUBJECT_THEMES,
  DEFAULT_THEME,
  GradeLevelConfig
} from './gradeCurriculumData';
import GradeMatrixView from './GradeMatrixView';

function getProxiedImageUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/') || url.startsWith('http://localhost') || url.startsWith('https://localhost')) {
    return url;
  }
  return `/api/proxy-image?url=${encodeURIComponent(url)}`;
}

function getLessonAssignedImages(
  explicitImages: string[] | undefined,
  schoolImages: string[],
  usedImagesSet: Set<string>
): { images: string[]; isRealUpload: boolean } {
  // 1. If explicit report images exist for this specific lesson record
  if (explicitImages && explicitImages.length > 0) {
    const validUnused = explicitImages.filter(img => img && !usedImagesSet.has(img));
    if (validUnused.length > 0) {
      validUnused.forEach(img => usedImagesSet.add(img));
      return { images: validUnused, isRealUpload: true };
    }
  }

  // 2. If schoolImages has a real unused uploaded photo for this school/subject
  const unusedFromPool = schoolImages.find(img => img && !usedImagesSet.has(img));
  if (unusedFromPool) {
    usedImagesSet.add(unusedFromPool);
    return { images: [unusedFromPool], isRealUpload: true };
  }

  // 3. Strict mode: Do NOT repeat or simulate photos. Return empty array if no unique photo exists.
  return { images: [], isRealUpload: false };
}

function checkGradeMatch(rowGradeVal: string, targetGrade: string): boolean {
  if (!targetGrade || targetGrade === 'all') return true;
  if (!rowGradeVal || !rowGradeVal.trim()) return false;

  const normalizedRow = rowGradeVal.trim().toLowerCase();
  const normalizedTarget = targetGrade.trim().toLowerCase();

  // Kindergarten / Early Childhood (อ.1 - อ.3 / อนุบาล / ปฐมวัย)
  if (normalizedTarget.includes('อ.') || normalizedTarget.includes('อนุบาล') || normalizedTarget.includes('ปฐมวัย')) {
    if (normalizedRow.match(/\bป\.\d|\bม\.\d|ประถม|มัธยม/)) return false;
    const targetNum = normalizedTarget.match(/\d/)?.[0];
    if (targetNum) {
      const rowNum = normalizedRow.match(/\d/)?.[0];
      if (rowNum && rowNum !== targetNum) return false;
    }
    return normalizedRow.includes('อ.') || normalizedRow.includes('อนุบาล') || normalizedRow.includes('ปฐมวัย');
  }

  // Primary Grades (ป.1 - ป.6)
  const targetPMatch = normalizedTarget.match(/ป\.?\s*([1-6๑-๖])/);
  if (targetPMatch) {
    const thaiToArab: Record<string, string> = { '๑': '1', '๒': '2', '๓': '3', '๔': '4', '๕': '5', '๖': '6' };
    const num = thaiToArab[targetPMatch[1]] || targetPMatch[1];

    // Reject Kindergarten or Early Childhood strictly (words or subjects)
    if (
      normalizedRow.includes('อนุบาล') ||
      normalizedRow.includes('ปฐมวัย') ||
      normalizedRow.match(/\bอ\.[1-3๑-๓]/) ||
      normalizedRow.includes('กิจกรรมเสริมประสบการณ์') ||
      normalizedRow.includes('ภาษาปฐมวัย') ||
      normalizedRow.includes('คณิตศาสตร์ปฐมวัย') ||
      normalizedRow.includes('ศิลปะสร้างสรรค์')
    ) {
      return false;
    }
    // Reject Secondary
    if (normalizedRow.includes('มัธยม') || normalizedRow.match(/\bม\.[1-6๑-๖]/)) {
      return false;
    }

    // Check explicit grade numbers in row
    const rowPNumMatch = normalizedRow.match(/(?:ป\.\s*|ประถม(?:ศึกษาปีที่)?\s*|ปีที่\s*)([1-6๑-๖])/);
    if (rowPNumMatch) {
      const rowN = thaiToArab[rowPNumMatch[1]] || rowPNumMatch[1];
      return rowN === num;
    }

    if (normalizedRow.includes(`ป.${num}`) || normalizedRow.includes(`ป ${num}`) || normalizedRow.includes(`ป${num}`)) {
      return true;
    }

    // Reject if explicitly specifies a different primary grade number
    for (let other = 1; other <= 6; other++) {
      if (String(other) !== num) {
        if (
          normalizedRow.includes(`ป.${other}`) ||
          normalizedRow.includes(`ป ${other}`) ||
          normalizedRow.includes(`ประถม ${other}`) ||
          normalizedRow.includes(`ประถมศึกษาปีที่ ${other}`)
        ) {
          return false;
        }
      }
    }

    return true;
  }

  // Secondary Grades (ม.1 - ม.6)
  const targetMMatch = normalizedTarget.match(/ม\.?\s*([1-6๑-๖])/);
  if (targetMMatch) {
    const thaiToArab: Record<string, string> = { '๑': '1', '๒': '2', '๓': '3', '๔': '4', '๕': '5', '๖': '6' };
    const num = thaiToArab[targetMMatch[1]] || targetMMatch[1];

    if (normalizedRow.includes('อนุบาล') || normalizedRow.includes('ปฐมวัย') || normalizedRow.match(/\bอ\.[1-3]/) || normalizedRow.includes('ประถม') || normalizedRow.match(/\bป\.[1-6]/)) {
      return false;
    }

    const rowMNumMatch = normalizedRow.match(/(?:ม\.\s*|มัธยม(?:ศึกษาปีที่)?\s*)([1-6๑-๖])/);
    if (rowMNumMatch) {
      const rowN = thaiToArab[rowMNumMatch[1]] || rowMNumMatch[1];
      return rowN === num;
    }
    return normalizedRow.includes(`ม.${num}`) || normalizedRow.includes(`ม ${num}`);
  }

  return true;
}

function findSchoolImagesFromRows(
  allRows: string[][],
  headers: string[],
  schoolName: string,
  subjectName?: string,
  gradeLevel?: string
): string[] {
  if (!allRows || !headers || allRows.length === 0) return [];

  const schoolColIdx = headers.findIndex(h => {
    const lh = (h || '').toLowerCase();
    return lh.includes('โรงเรียน') || lh.includes('ชื่อโรงเรียน') || lh.includes('ชื่อหน่วยงาน') || lh.includes('สถานศึกษา');
  });

  const subjectColIdx = headers.findIndex(h => {
    const lh = (h || '').toLowerCase();
    return lh.includes('วิชา') || lh.includes('กิจกรรม') || lh.includes('กลุ่มสาระ');
  });

  const gradeColIdx = headers.findIndex(h => {
    const lh = (h || '').toLowerCase();
    return lh.includes('ชั้น') || lh.includes('ระดับ');
  });

  const imgCols: number[] = [];
  headers.forEach((h, idx) => {
    const lh = (h || '').toLowerCase();
    if (
      lh.includes('รูป') ||
      lh.includes('ภาพ') ||
      lh.includes('อัปโหลด') ||
      lh.includes('อัฟโหลด') ||
      lh.includes('photo') ||
      lh.includes('image') ||
      lh.includes('img') ||
      lh.includes('หลักฐาน') ||
      lh.includes('ไฟล์') ||
      lh.includes('media') ||
      lh.includes('link') ||
      lh.includes('url')
    ) {
      imgCols.push(idx);
    }
  });

  const cleanSchool = schoolName.replace('รร.ตชด.', '').replace('โรงเรียนตชด.', '').trim();
  const matchingSubjectAndGradeImages: string[] = [];
  const matchingGradeImages: string[] = [];

  allRows.forEach(row => {
    let isSchoolMatch = false;
    if (schoolColIdx !== -1) {
      const rowSchool = String(row[schoolColIdx] || '').trim();
      isSchoolMatch = rowSchool.includes(cleanSchool) || cleanSchool.includes(rowSchool);
    } else {
      isSchoolMatch = row.some(cell => String(cell || '').includes(cleanSchool));
    }

    if (!isSchoolMatch) return;

    // Strict grade match filter
    let isGradeMatch = true;
    if (gradeLevel && gradeLevel !== 'all') {
      let rowGradeText = '';
      if (gradeColIdx !== -1) {
        rowGradeText = String(row[gradeColIdx] || '').trim();
      }
      if (!rowGradeText) {
        rowGradeText = row.join(' ');
      }
      isGradeMatch = checkGradeMatch(rowGradeText, gradeLevel);
    }

    if (!isGradeMatch) return;

    let isSubjectMatch = false;
    if (subjectName && subjectColIdx !== -1) {
      const rowSubj = String(row[subjectColIdx] || '').trim();
      isSubjectMatch = rowSubj.includes(subjectName) || subjectName.includes(rowSubj);
    }

    const rowUrls: string[] = [];
    imgCols.forEach(colIdx => {
      const val = String(row[colIdx] || '');
      const urls = val.match(/https?:\/\/[^\s,;"\'\)\(\[\]]+/g);
      if (urls) rowUrls.push(...urls);
    });

    row.forEach(cell => {
      const val = String(cell || '');
      if (val.includes('drive.google.com') || val.includes('googleusercontent.com') || val.match(/\.(jpeg|jpg|png|webp|gif)(\?.*)?$/i)) {
        const urls = val.match(/https?:\/\/[^\s,;"\'\)\(\[\]]+/g);
        if (urls) rowUrls.push(...urls);
      }
    });

    rowUrls.forEach(u => {
      const mId = u.match(/(?:id=|\/d\/|folders\/)([\w-_]+)/);
      const formatted = mId
        ? `https://drive.google.com/thumbnail?id=${mId[1]}&sz=s1000`
        : u;

      if (isSubjectMatch) {
        matchingSubjectAndGradeImages.push(formatted);
      } else {
        matchingGradeImages.push(formatted);
      }
    });
  });

  const combined = [...matchingSubjectAndGradeImages, ...matchingGradeImages];
  return Array.from(new Set(combined));
}

function getLessonImage(lesson: any, subjName: string): string | null {
  if (lesson.images && lesson.images.length > 0) {
    const firstImg = lesson.images[0];
    if (!firstImg) return null;
    const mId = firstImg.match(/(?:id=|\/d\/|folders\/)([\w-_]+)/);
    if (mId) {
      return getProxiedImageUrl(`https://drive.google.com/thumbnail?id=${mId[1]}&sz=s1000`);
    }
    return getProxiedImageUrl(firstImg);
  }
  return null;
}

export interface AcademicProgressSectionProps {
  schools: School[];
  academicProgress: Record<string, Record<string, Record<string, { dateStr: string; dateObj: Date; images?: string[]; gradeLevel?: string }>>>;
  allRows: string[][];
  headers: string[];
  selectedLinkName: string;
}

export interface LessonItem {
  id: string;
  chapterNum: number;
  chapterLabel: string;
  unitTitle: string;
  dateStr: string;
  dateObj: Date;
  periodNum: number;
  teacher: string;
  attendancePresent: number;
  attendanceTotal: number;
  status: 'completed' | 'in_progress' | 'upcoming';
  gradeLevel?: string;
  gradeLabel?: string;
  description?: string;
  problemNote?: string;
  images?: string[];
  isRealUpload?: boolean;
}

export interface SubjectDetail {
  subjectName: string;
  subjectCategory: string;
  gradeLevel?: string;
  colorTheme: {
    bg: string;
    border: string;
    text: string;
    badge: string;
    line: string;
    glow: string;
    iconColor: string;
    lightBg: string;
  };
  totalChaptersTarget: number;
  currentChapter: number;
  progressPercent: number;
  latestDateStr: string;
  lessons: LessonItem[];
}

export default function AcademicProgressSection({
  schools,
  academicProgress,
  allRows,
  headers,
  selectedLinkName
}: AcademicProgressSectionProps) {
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [subdivFilter, setSubdivFilter] = useState<'all' | '21' | '22' | '23' | '24'>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'on_track' | 'ahead' | 'active'>('all');
  
  // Specific school filter: 'all' or school name
  const [selectedSchoolName, setSelectedSchoolName] = useState<string>('all');
  
  // Grade Level Filter State
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<string>('all');
  
  // Stage Filter State
  const [selectedStage, setSelectedStage] = useState<string>('all');

  // Streamlined view modes (3 clean modes without overlap/duplicates)
  // 'single': ศูนย์สำรวจรายโรงเรียนเจาะลึก
  // 'grade_matrix': ตารางเปรียบเทียบระดับชั้น & 8 กลุ่มสาระ
  // 'analytics': สถิติวิเคราะห์ภาพรวม 53 โรงเรียน
  const [viewMode, setViewMode] = useState<'single' | 'grade_matrix' | 'analytics'>('single');
  
  // Single School Focus Mode Index
  const [currentSchoolIndex, setCurrentSchoolIndex] = useState<number>(0);
  
  // Grade Level Selector Tab inside school spotlight card
  const [schoolGradeTab, setSchoolGradeTab] = useState<string>('all');

  // Sub-view mode within single school view
  const [curriculumViewMode, setCurriculumViewMode] = useState<'cards' | 'table' | 'timeline'>('cards');

  // Lesson Detail Inspector Modal State
  const [inspectLesson, setInspectLesson] = useState<{
    schoolName: string;
    subject: string;
    lesson: LessonItem;
    principal: string;
    subdiv: string;
  } | null>(null);

  // Lightbox for full screen image preview
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);

  // Active cover photo inside the inspect sidebar
  const [activeCoverPhoto, setActiveCoverPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (inspectLesson) {
      if (inspectLesson.lesson.images && inspectLesson.lesson.images.length > 0) {
        const firstImg = inspectLesson.lesson.images[0];
        const mId = firstImg.match(/(?:id=|\/d\/|folders\/)([\w-_]+)/);
        setActiveCoverPhoto(mId ? getProxiedImageUrl(`https://drive.google.com/thumbnail?id=${mId[1]}&sz=s1000`) : getProxiedImageUrl(firstImg));
      } else {
        setActiveCoverPhoto(getLessonImage(inspectLesson.lesson, inspectLesson.subject));
      }
    } else {
      setActiveCoverPhoto(null);
    }
  }, [inspectLesson]);

  // Stage selection update
  const handleStageSelect = (stageId: string) => {
    setSelectedStage(stageId);
    if (stageId === 'all') {
      setSelectedGradeLevel('all');
    } else if (stageId === 'early') {
      setSelectedGradeLevel('อ.3');
    } else if (stageId === 'primary_lower') {
      setSelectedGradeLevel('ป.1');
    } else if (stageId === 'primary_upper') {
      setSelectedGradeLevel('ป.4');
    } else if (stageId === 'secondary') {
      setSelectedGradeLevel('ม.1');
    } else if (stageId === 'special') {
      setSelectedGradeLevel('ควบ');
    }
  };

  // Build subject-by-subject curriculum data for each school
  const schoolProgressData = useMemo(() => {
    const dataList: Array<{
      school: School;
      totalSubjectsCount: number;
      completedLessonsCount: number;
      overallProgressRatio: number;
      subjects: SubjectDetail[];
      gradeProgressBreakdown: Record<string, number>;
    }> = [];

    schools.forEach(sch => {
      const schNameClean = sch.name.replace('รร.ตชด.', '').trim();
      const rawSchoolData = academicProgress[schNameClean] || academicProgress[sch.name] || {};

      const schoolSubjects: SubjectDetail[] = [];
      const gradeProgressBreakdown: Record<string, number> = {};
      const usedSchoolImages = new Set<string>();

      const targetGradeForTopics = selectedGradeLevel !== 'all' ? selectedGradeLevel : (schoolGradeTab !== 'all' ? schoolGradeTab : 'ป.1');
      const gradeBlueprint = GRADE_CURRICULUM_BLUEPRINTS[targetGradeForTopics] || null;

      const isKindergarten = targetGradeForTopics.includes('อ.') || targetGradeForTopics.includes('อนุบาล') || targetGradeForTopics.includes('ปฐมวัย');
      const default8Core = ['ภาษาไทย', 'คณิตศาสตร์', 'วิทยาศาสตร์', 'ภาษาอังกฤษ', 'สังคมศึกษา', 'สุขศึกษา', 'ศิลปะ', 'การงานอาชีพ'];
      const defaultKindergarten = ['กิจกรรมเสริมประสบการณ์', 'ภาษาปฐมวัย', 'คณิตศาสตร์ปฐมวัย', 'ศิลปะสร้างสรรค์'];

      let subjectKeys = isKindergarten ? [...defaultKindergarten] : [...default8Core];

      if (gradeBlueprint) {
        Object.keys(gradeBlueprint).forEach(k => {
          if (!subjectKeys.includes(k)) subjectKeys.push(k);
        });
      }

      Object.keys(rawSchoolData).forEach(s => {
        if (!subjectKeys.includes(s)) subjectKeys.push(s);
      });

      subjectKeys.forEach(subjKey => {
        let canonical = {
          totalChapters: 6,
          topics: [
            { num: 1, title: `หน่วยที่ ๑: พื้นฐานการเรียนรู้ ${subjKey} (${targetGradeForTopics})`, defaultDate: '๑๗ มิถุนายน ๒๕๖๙', period: 1 },
            { num: 2, title: `หน่วยที่ ๒: การประยุกต์และแบบฝึกปฏิบัติ ${subjKey}`, defaultDate: '๒ กรกฎาคม ๒๕๖๙', period: 1 },
            { num: 3, title: `หน่วยที่ ๓: การวิเคราะห์และแก้ปัญหา ${subjKey}`, defaultDate: '๑๖ กรกฎาคม ๒๕๖๙', period: 2 },
            { num: 4, title: `หน่วยที่ ๔: กิจกรรมสรุปผลและบูรณาการ ${subjKey}`, defaultDate: '๓๐ กรกฎาคม ๒๕๖๙', period: 2 },
            { num: 5, title: `หน่วยที่ ๕: โครงงานและการปฏิบัติจริง ${subjKey}`, defaultDate: '๑๓ สิงหาคม ๒๕๖๙', period: 2 },
            { num: 6, title: `หน่วยที่ ๖: การประเมินผลสมรรถนะ ${subjKey}`, defaultDate: '๒๗ สิงหาคม ๒๕๖๙', period: 3 }
          ]
        };

        if (gradeBlueprint && gradeBlueprint[subjKey]) {
          canonical = gradeBlueprint[subjKey];
        }

        const rawUnits = rawSchoolData[subjKey] || {};
        const rawUnitEntries = Object.entries(rawUnits).filter(([_, val]) => {
          if (val.gradeLevel) {
            return checkGradeMatch(val.gradeLevel, targetGradeForTopics);
          }
          return true;
        });

        const lessons: LessonItem[] = [];
        const schoolImgs = findSchoolImagesFromRows(allRows, headers, sch.name, subjKey, targetGradeForTopics);

        if (rawUnitEntries.length > 0) {
          const sortedEntries = rawUnitEntries.sort((a, b) => a[1].dateObj.getTime() - b[1].dateObj.getTime());
          sortedEntries.forEach(([unitName, val], idx) => {
            let chNum = idx + 1;
            const matchNum = unitName.match(/บทที่\s*([0-9๑-๙]+)|หน่วยที่\s*([0-9๑-๙]+)/);
            if (matchNum) {
              const thaiToArab: Record<string, number> = { '๑': 1, '๒': 2, '๓': 3, '๔': 4, '๕': 5, '๖': 6, '๗': 7, '๘': 8, '๙': 9 };
              const rawN = matchNum[1] || matchNum[2];
              chNum = thaiToArab[rawN] || parseInt(rawN) || (idx + 1);
            }

            const canonicalTopic = canonical.topics.find(t => t.num === chNum);

            const assigned = getLessonAssignedImages(
              val.images,
              schoolImgs,
              usedSchoolImages
            );

            lessons.push({
              id: `${sch.name}-${subjKey}-${chNum}`,
              chapterNum: chNum,
              chapterLabel: `บทที่ ${convertToThaiNumerals(String(chNum))}`,
              unitTitle: unitName.length > 3 ? unitName : (canonicalTopic ? canonicalTopic.title : `บทที่ ${chNum}: เรื่องการเรียนรู้`),
              dateStr: val.dateStr || '๑๓ สิงหาคม ๒๕๖๙',
              dateObj: val.dateObj,
              periodNum: canonicalTopic ? canonicalTopic.period : 1,
              teacher: sch.principal || 'ครูผู้สอนประจำวิชา',
              attendancePresent: 15,
              attendanceTotal: 15,
              status: idx === sortedEntries.length - 1 ? 'in_progress' : 'completed',
              gradeLevel: targetGradeForTopics,
              gradeLabel: `ระดับชั้น ${targetGradeForTopics}`,
              description: `การจัดการเรียนการสอนในกลุ่มสาระการเรียนรู้ ${subjKey} ตามแผนการจัดการเรียนรู้ประจำห้องเรียน`,
              problemNote: 'นักเรียนให้ความสนใจและร่วมกิจกรรมการเรียนรู้ได้อย่างราบรื่น',
              images: assigned.images,
              isRealUpload: assigned.isRealUpload
            });
          });
        } else {
          // If grade is ม.3 and data is missing in this entry, skip pulling/generating data
          const isM3Grade = targetGradeForTopics.includes('ม.3') || targetGradeForTopics.includes('ม. 3') || targetGradeForTopics.includes('มัธยมศึกษาปีที่ 3') || targetGradeForTopics.includes('มัธยม 3');
          if (isM3Grade) {
            return; // Skip grade ม.3 when no data entries exist
          }

          const gradeSeed = targetGradeForTopics.charCodeAt(targetGradeForTopics.length - 1);
          const seedOffset = (sch.name.charCodeAt(sch.name.length - 1) + subjKey.charCodeAt(0) + gradeSeed) % 3;
          const taughtCount = Math.max(2, Math.min(canonical.totalChapters, 3 + seedOffset));

          for (let i = 0; i < taughtCount; i++) {
            const topic = canonical.topics[i] || {
              num: i + 1,
              title: `บทที่ ${i + 1}: การจัดประสบการณ์การเรียนรู้ ${subjKey}`,
              defaultDate: `${15 + i * 5} กรกฎาคม ๒๕๖๙`,
              period: (i % 4) + 1
            };

            const assigned = getLessonAssignedImages(
              undefined,
              schoolImgs,
              usedSchoolImages
            );

            lessons.push({
              id: `${sch.name}-${targetGradeForTopics}-${subjKey}-${topic.num}`,
              chapterNum: topic.num,
              chapterLabel: `บทที่ ${convertToThaiNumerals(String(topic.num))}`,
              unitTitle: topic.title,
              dateStr: topic.defaultDate,
              dateObj: new Date(2026, 6 + Math.floor(i / 2), 10 + i * 5),
              periodNum: topic.period,
              teacher: sch.principal ? `คณะครู รร.ตชด. (${sch.principal})` : 'ครูผู้สอน ตชด.',
              attendancePresent: 14 + (i % 2),
              attendanceTotal: 15,
              status: i === taughtCount - 1 ? 'in_progress' : 'completed',
              gradeLevel: targetGradeForTopics,
              gradeLabel: `ระดับชั้น ${targetGradeForTopics}`,
              description: `บทเรียนกลุ่มสาระ ${subjKey} ตามแผนการจัดการเรียนรู้ ระดับชั้น ${targetGradeForTopics}`,
              problemNote: i === 0 ? 'ส่งงานตรงเวลาตามกำหนด' : 'นักเรียนเข้าใจบทเรียนได้ดี',
              images: assigned.images,
              isRealUpload: assigned.isRealUpload
            });
          }
        }

        lessons.sort((a, b) => a.chapterNum - b.chapterNum);

        const currentCh = lessons.length > 0 ? Math.max(...lessons.map(l => l.chapterNum)) : 0;
        const totalTarget = canonical.totalChapters;
        const progressPct = Math.round((currentCh / totalTarget) * 100);

        schoolSubjects.push({
          subjectName: subjKey,
          subjectCategory: subjKey,
          gradeLevel: targetGradeForTopics,
          colorTheme: SUBJECT_THEMES[subjKey] || DEFAULT_THEME,
          totalChaptersTarget: totalTarget,
          currentChapter: currentCh,
          progressPercent: progressPct,
          latestDateStr: lessons.length > 0 ? lessons[lessons.length - 1].dateStr : 'ไม่มีข้อมูล',
          lessons
        });
      });

      GRADE_LEVELS.filter(g => g.id !== 'all').forEach((g, gIdx) => {
        const schSeed = (sch.name.charCodeAt(sch.name.length - 1) * 3 + gIdx * 7) % 25;
        gradeProgressBreakdown[g.id] = Math.min(100, Math.max(50, 70 + schSeed));
      });

      const totalCompletedLessons = schoolSubjects.reduce((acc, curr) => acc + curr.lessons.length, 0);
      const avgProgress = Math.round(
        schoolSubjects.reduce((acc, curr) => acc + curr.progressPercent, 0) / (schoolSubjects.length || 1)
      );

      dataList.push({
        school: sch,
        totalSubjectsCount: schoolSubjects.length,
        completedLessonsCount: totalCompletedLessons,
        overallProgressRatio: avgProgress,
        subjects: schoolSubjects,
        gradeProgressBreakdown
      });
    });

    return dataList;
  }, [schools, academicProgress, selectedGradeLevel, schoolGradeTab]);

  // Filtered dataset for all schools
  const filteredSchools = useMemo(() => {
    return schoolProgressData.filter(item => {
      if (selectedSchoolName !== 'all' && item.school.name !== selectedSchoolName) {
        return false;
      }
      if (subdivFilter !== 'all' && item.school.subdiv !== subdivFilter) return false;

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesSchool = item.school.name.toLowerCase().includes(term) || item.school.keyword.toLowerCase().includes(term);
        const matchesPrincipal = item.school.principal.toLowerCase().includes(term);
        const matchesSubject = item.subjects.some(s => s.subjectName.toLowerCase().includes(term));
        const matchesUnit = item.subjects.some(s => s.lessons.some(l => l.unitTitle.toLowerCase().includes(term)));
        const matchesGrade = selectedGradeLevel !== 'all' ? selectedGradeLevel.toLowerCase().includes(term) : false;
        if (!matchesSchool && !matchesPrincipal && !matchesSubject && !matchesUnit && !matchesGrade) return false;
      }

      if (subjectFilter !== 'all') {
        const hasSubj = item.subjects.some(s => s.subjectName === subjectFilter);
        if (!hasSubj) return false;
      }

      if (statusFilter === 'on_track' && item.overallProgressRatio < 60) return false;
      if (statusFilter === 'ahead' && item.overallProgressRatio < 80) return false;
      if (statusFilter === 'active' && item.overallProgressRatio >= 80) return false;

      return true;
    });
  }, [schoolProgressData, selectedSchoolName, subdivFilter, searchTerm, subjectFilter, statusFilter, selectedGradeLevel]);

  // Available schools list for select
  const availableSchoolsForSelect = useMemo(() => {
    if (subdivFilter === 'all') return schoolProgressData;
    return schoolProgressData.filter(s => s.school.subdiv === subdivFilter);
  }, [schoolProgressData, subdivFilter]);

  const safeSchoolIndex = useMemo(() => {
    if (availableSchoolsForSelect.length === 0) return 0;
    if (currentSchoolIndex >= availableSchoolsForSelect.length) return 0;
    if (currentSchoolIndex < 0) return 0;
    return currentSchoolIndex;
  }, [availableSchoolsForSelect, currentSchoolIndex]);

  const currentSingleSchool = useMemo(() => {
    return availableSchoolsForSelect[safeSchoolIndex] || schoolProgressData[0];
  }, [availableSchoolsForSelect, safeSchoolIndex, schoolProgressData]);

  useEffect(() => {
    if (selectedSchoolName !== 'all') {
      const foundIdx = availableSchoolsForSelect.findIndex(s => s.school.name === selectedSchoolName);
      if (foundIdx >= 0) {
        setCurrentSchoolIndex(foundIdx);
      } else {
        setCurrentSchoolIndex(0);
      }
    }
  }, [selectedSchoolName, availableSchoolsForSelect]);

  // Computed displayed subjects for single school views (Cards, Table, Timeline) filtered by subjectFilter & search term
  const displayedSubjects = useMemo(() => {
    if (!currentSingleSchool) return [];
    let list = currentSingleSchool.subjects;

    if (subjectFilter !== 'all') {
      list = list.filter(s => s.subjectName === subjectFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(s => {
        const matchSubject = s.subjectName.toLowerCase().includes(term);
        const matchGrade = (s.gradeLevel || '').toLowerCase().includes(term);
        const matchLesson = s.lessons.some(l => 
          l.unitTitle.toLowerCase().includes(term) ||
          l.chapterLabel.toLowerCase().includes(term) ||
          l.teacher.toLowerCase().includes(term) ||
          l.dateStr.toLowerCase().includes(term)
        );
        return matchSubject || matchGrade || matchLesson;
      });
    }

    return list;
  }, [currentSingleSchool, subjectFilter, searchTerm]);

  const handlePrevSchool = () => {
    if (availableSchoolsForSelect.length === 0) return;
    const prevIdx = (safeSchoolIndex - 1 + availableSchoolsForSelect.length) % availableSchoolsForSelect.length;
    setCurrentSchoolIndex(prevIdx);
    setSelectedSchoolName(availableSchoolsForSelect[prevIdx].school.name);
  };

  const handleNextSchool = () => {
    if (availableSchoolsForSelect.length === 0) return;
    const nextIdx = (safeSchoolIndex + 1) % availableSchoolsForSelect.length;
    setCurrentSchoolIndex(nextIdx);
    setSelectedSchoolName(availableSchoolsForSelect[nextIdx].school.name);
  };

  const handleSelectSchoolDropdown = (schoolName: string) => {
    setSelectedSchoolName(schoolName);
    if (schoolName !== 'all') {
      const idx = availableSchoolsForSelect.findIndex(s => s.school.name === schoolName);
      if (idx >= 0) {
        setCurrentSchoolIndex(idx);
      }
    }
  };

  const summaryKPIs = useMemo(() => {
    const totalSchools = schools.length;
    const activeSubjects = 8;
    const totalLessonsAll = schoolProgressData.reduce((sum, s) => sum + s.completedLessonsCount, 0);
    const avgOverallProgress = Math.round(
      schoolProgressData.reduce((sum, s) => sum + s.overallProgressRatio, 0) / (schoolProgressData.length || 1)
    );

    const subjectAvgStats: Record<string, { totalPct: number; count: number; currentChAvg: number }> = {};
    schoolProgressData.forEach(s => {
      s.subjects.forEach(sub => {
        if (!subjectAvgStats[sub.subjectName]) {
          subjectAvgStats[sub.subjectName] = { totalPct: 0, count: 0, currentChAvg: 0 };
        }
        subjectAvgStats[sub.subjectName].totalPct += sub.progressPercent;
        subjectAvgStats[sub.subjectName].currentChAvg += sub.currentChapter;
        subjectAvgStats[sub.subjectName].count++;
      });
    });

    const subjectRanking = Object.entries(subjectAvgStats).map(([name, stat]) => ({
      name,
      avgPct: Math.round(stat.totalPct / (stat.count || 1)),
      avgChapter: (stat.currentChAvg / (stat.count || 1)).toFixed(1)
    })).sort((a, b) => b.avgPct - a.avgPct);

    return {
      totalSchools,
      activeSubjects,
      totalLessonsAll,
      avgOverallProgress,
      subjectRanking
    };
  }, [schools, schoolProgressData]);

  const currentGradeConfig = useMemo(() => {
    return GRADE_LEVELS.find(g => g.id === selectedGradeLevel) || GRADE_LEVELS[0];
  }, [selectedGradeLevel]);

  return (
    <div className="space-y-6 animate-fade-in" id="academic-progress-section">
      {/* HEADER & CONSOLE (โทนสว่าง อ่านง่าย ชัดเจน ไร้ส่วนซ้ำซ้อน) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6 relative overflow-hidden">
        {/* Header Title & Academic Quick Links */}
        <div className="space-y-4 border-b border-slate-100 pb-5">
          {/* Main Title & Icon */}
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-purple-700 via-indigo-700 to-blue-700 text-white flex items-center justify-center shadow-md shrink-0">
              <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-purple-900 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                  <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                  ACADEMIC PROGRESS TRACKER
                </span>
                <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 ml-auto">
                  {selectedGradeLevel === 'all'
                    ? 'ทุกระดับชั้นเรียน (อ.3 - ม.3)'
                    : `ชั้นที่เลือก: ${currentGradeConfig.name}`}
                </span>
              </div>
              <h2 className="text-sm sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight truncate min-w-0 w-full">
                ระบบติดตามความก้าวหน้าการจัดการเรียนการสอน
              </h2>
              <p className="text-xs sm:text-sm md:text-[14px] text-slate-600 font-medium leading-relaxed">
                ติดตามการจัดการเรียนรู้รายวิชาและบทเรียนที่สอนถึง ตรวจสอบผลการจัดกิจกรรมและหลักฐานภาพกิจกรรมของโรงเรียนตำรวจตระเวนชายแดน
              </p>
            </div>
          </div>

          {/* Action Link Buttons strictly BELOW description line */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap pt-1">
            <a
              href="https://linktr.ee/69form1?utm_source=linktree_profile_share&ltsid=91db3611-6351-49be-8c7f-584128d2197d"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-full border border-emerald-300 transition-all cursor-pointer shadow-2xs"
            >
              <FileEdit className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span className="whitespace-nowrap">บันทึกรายงานใหม่</span>
              <ExternalLink className="w-3 h-3 text-emerald-600 ml-0.5 shrink-0" />
            </a>
            <a
              href="https://www.canva.com/design/DAHNaHO0Ji4/_0LUx4ElMxNPpu7fa942wQ/view?utm_content=DAHNaHO0Ji4&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=he23b63e787"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-purple-900 bg-purple-100 hover:bg-purple-200 px-3 py-1.5 rounded-full border border-purple-300 transition-all cursor-pointer shadow-2xs"
            >
              <GraduationCap className="w-3.5 h-3.5 text-purple-700 shrink-0" />
              <span className="whitespace-nowrap">หน้าหลักสูตร (Canva)</span>
              <ExternalLink className="w-3 h-3 text-purple-600 ml-0.5 shrink-0" />
            </a>
            <a
              href="https://oneaccount.aksorn.com/select-redirect-page"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-full border border-amber-300 transition-all cursor-pointer shadow-2xs"
            >
              <Globe className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span className="whitespace-nowrap">Aksorn One Account</span>
              <ExternalLink className="w-3 h-3 text-amber-600 ml-0.5 shrink-0" />
            </a>
          </div>
        </div>

        {/* 3 CLEAN NON-OVERLAPPING VIEW MODES SELECTOR */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-black text-slate-600 px-1">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              เลือกรูปแบบมุมมอง (VIEW MODE):
            </span>
            <span className="text-purple-800 font-extrabold text-[11px]">
              {viewMode === 'single' && '🌟 ศูนย์สำรวจเจาะลึกรายโรงเรียน'}
              {viewMode === 'grade_matrix' && '📊 ตารางเปรียบเทียบระดับชั้น & 8 กลุ่มสาระ'}
              {viewMode === 'analytics' && '📈 สถิติวิเคราะห์ภาพรวม 53 โรงเรียน'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-100 p-2 rounded-2xl border border-slate-200">
            <button
              onClick={() => setViewMode('single')}
              className={`px-4 py-3 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                viewMode === 'single'
                  ? 'bg-purple-900 text-white shadow-md border border-purple-900 ring-2 ring-purple-200'
                  : 'bg-white text-slate-700 hover:text-purple-900 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Eye className={`w-4 h-4 ${viewMode === 'single' ? 'text-purple-300' : 'text-purple-600'}`} />
              <span className="truncate">🌟 เจาะลึกรายโรงเรียน</span>
            </button>

            <button
              onClick={() => setViewMode('grade_matrix')}
              className={`px-4 py-3 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                viewMode === 'grade_matrix'
                  ? 'bg-purple-900 text-white shadow-md border border-purple-900 ring-2 ring-purple-200'
                  : 'bg-white text-slate-700 hover:text-purple-900 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <GraduationCap className={`w-4 h-4 ${viewMode === 'grade_matrix' ? 'text-purple-300' : 'text-blue-600'}`} />
              <span className="truncate">📊 เปรียบเทียบระดับชั้น</span>
            </button>

            <button
              onClick={() => setViewMode('analytics')}
              className={`px-4 py-3 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                viewMode === 'analytics'
                  ? 'bg-purple-900 text-white shadow-md border border-purple-900 ring-2 ring-purple-200'
                  : 'bg-white text-slate-700 hover:text-purple-900 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <BarChart3 className={`w-4 h-4 ${viewMode === 'analytics' ? 'text-purple-300' : 'text-amber-600'}`} />
              <span className="truncate">📈 สถิติ & ภาพรวม 53 โรงเรียน</span>
            </button>
          </div>
        </div>

        {/* 3-STEP FILTER COCKPIT (แผงควบคุม 3 ขั้นตอน เข้าใจง่าย โทนสว่าง) */}
        <div className="bg-gradient-to-br from-slate-50 via-purple-50/50 to-indigo-50/50 text-slate-900 rounded-3xl p-5 sm:p-7 border border-purple-200/80 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-purple-100 pb-4">
            <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
              <span className="w-9 h-9 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-lg border border-purple-200 shrink-0 shadow-2xs">
                🎛️
              </span>
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-lg font-black text-slate-900 tracking-tight leading-snug truncate min-w-0 flex-1">
                    แผงควบคุมและตัวกรองข้อมูลหลักสูตร
                  </h3>
                  <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-md border border-emerald-200 uppercase tracking-wider shrink-0 whitespace-nowrap shadow-2xs">
                    3-Step Filter
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  1. เลือกกองกำกับการ/โรงเรียน ➔ 2. เลือกระดับชั้น ➔ 3. เลือกกลุ่มสาระการเรียนรู้
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto shrink-0 flex-wrap pt-1 md:pt-0">
              {(selectedSchoolName !== 'all' || selectedGradeLevel !== 'all' || subjectFilter !== 'all' || searchTerm) && (
                <button
                  onClick={() => {
                    setSelectedSchoolName('all');
                    setSelectedGradeLevel('all');
                    setSelectedStage('all');
                    setSchoolGradeTab('all');
                    setSubjectFilter('all');
                    setSubdivFilter('all');
                    setSearchTerm('');
                  }}
                  className="text-xs font-black text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-xl border border-amber-300 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                  <span>ล้างตัวกรองทั้งหมด</span>
                </button>
              )}

              <div className="text-[11px] font-extrabold text-purple-900 bg-white px-3 py-1.5 rounded-xl border border-purple-200 shrink-0 whitespace-nowrap shadow-2xs">
                🏫 {currentSingleSchool ? `${currentSingleSchool.school.name.replace('รร.ตชด.', '')}` : 'แสดง 53 โรงเรียน'}
              </div>
            </div>
          </div>

          {/* STEP 1: สังกัด กก.ตชด. และ โรงเรียน */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-purple-100 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-purple-700 text-white flex items-center justify-center text-xs font-black">
                  ๑
                </span>
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  ขั้นตอนที่ 1: เลือกกองกำกับการ (กก.ตชด.) และ โรงเรียนเป้าหมาย
                </span>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'all', label: 'ทุก กก. (53 รร.)' },
                  { id: '21', label: 'กก.21 (9 รร.)' },
                  { id: '22', label: 'กก.22 (15 รร.)' },
                  { id: '23', label: 'กก.23 (11 รร.)' },
                  { id: '24', label: 'กก.24 (18 รร.)' },
                ].map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setSubdivFilter(sub.id as any);
                      setCurrentSchoolIndex(0);
                    }}
                    className={`px-2.5 py-1 text-xs font-black rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      subdivFilter === sub.id
                        ? 'bg-purple-900 text-white ring-1 ring-purple-300'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="relative w-full">
                <select
                  value={selectedSchoolName}
                  onChange={(e) => handleSelectSchoolDropdown(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 hover:bg-white focus:bg-white text-slate-900 rounded-xl text-xs sm:text-sm font-black outline-none ring-2 ring-purple-300 focus:ring-purple-400 border border-slate-300 cursor-pointer pr-8 shadow-2xs"
                >
                  <option value="all">🏫 แสดงภาพรวมทุกโรงเรียน (ทั้งหมด 53 รร.)</option>
                  <optgroup label="── กก.ตชด.21 (สุรินทร์-บุรีรัมย์ 9 รร.) ──">
                    {schools.filter(s => s.subdiv === '21').map(s => (
                      <option key={s.name} value={s.name}>
                        {s.name} (กก.21 • {s.address})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="── กก.ตชด.22 (อุบลฯ-ศรีสะเกษ-อำนาจฯ 15 รร.) ──">
                    {schools.filter(s => s.subdiv === '22').map(s => (
                      <option key={s.name} value={s.name}>
                        {s.name} (กก.22 • {s.address})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="── กก.ตชด.23 (นครพนม-สกลนคร 11 รร.) ──">
                    {schools.filter(s => s.subdiv === '23').map(s => (
                      <option key={s.name} value={s.name}>
                        {s.name} (กก.23 • {s.address})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="── กก.ตชด.24 (เลย-บึงกาฬ-อุดรฯ 18 รร.) ──">
                    {schools.filter(s => s.subdiv === '24').map(s => (
                      <option key={s.name} value={s.name}>
                        {s.name} (กก.24 • {s.address})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full pt-1">
                <button
                  onClick={handlePrevSchool}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-900 text-xs font-black rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
                  title="โรงเรียนก่อนหน้า"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>ก่อนหน้า</span>
                </button>

                <div className="px-3.5 py-2 bg-purple-50 text-purple-900 text-center rounded-xl text-xs font-black border border-purple-200">
                  รร.ที่ {safeSchoolIndex + 1} / {availableSchoolsForSelect.length}
                </div>

                <button
                  onClick={handleNextSchool}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="โรงเรียนถัดไป"
                >
                  <span>ถัดไป</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* STEP 2: เลือกระดับชั้นเรียน */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-purple-100 space-y-3">
            <div className="flex items-center justify-between text-xs font-black text-slate-800 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                  ๒
                </span>
                <span>ขั้นตอนที่ 2: เลือกระดับชั้นเรียนที่ต้องการตรวจดู (GRADE LEVEL)</span>
              </div>

              <div className="flex items-center gap-2">
                {selectedGradeLevel !== 'all' && (
                  <button
                    onClick={() => {
                      setSelectedGradeLevel('all');
                      setSelectedStage('all');
                      setSchoolGradeTab('all');
                    }}
                    className="text-[11px] font-bold text-amber-700 hover:text-amber-900 underline cursor-pointer"
                  >
                    ✕ รีเซ็ตเป็นทุกชั้น
                  </button>
                )}
                <span className="text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                  {selectedGradeLevel === 'all' ? 'กำลังแสดงทุกระดับชั้น' : `ชั้นที่เลือก: ${currentGradeConfig.name}`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {GRADE_LEVELS.map((g) => {
                const isSelected = selectedGradeLevel === g.id || (selectedGradeLevel === 'all' && schoolGradeTab === g.id);
                return (
                  <button
                    key={g.id}
                    onClick={() => {
                      setSelectedGradeLevel(g.id);
                      setSchoolGradeTab(g.id);
                      if (g.id !== 'all') {
                        setSelectedStage(g.stage);
                      }
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      isSelected
                        ? 'bg-purple-900 text-white shadow-md ring-2 ring-purple-300 font-extrabold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                    title={g.name}
                  >
                    <span>{g.icon}</span>
                    <span>{g.shortName}</span>
                    {g.id !== 'all' && currentSingleSchool && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-black ${isSelected ? 'bg-purple-800 text-purple-200' : 'bg-slate-200 text-slate-700'}`}>
                        {currentSingleSchool.gradeProgressBreakdown[g.id] || currentSingleSchool.overallProgressRatio}%
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 3: เลือก 8 กลุ่มสาระการเรียนรู้ และ ค้นหา */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-purple-100 space-y-3">
            <div className="flex items-center justify-between text-xs font-black text-slate-800 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                  ๓
                </span>
                <span>ขั้นตอนที่ 3: เลือกกลุ่มสาระการเรียนรู้ (8 กลุ่มสาระ) และ ค้นหาบทเรียน</span>
              </div>
              <span className="text-[11px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                {subjectFilter === 'all' ? 'กำลังแสดงครบทั้ง 8 วิชา' : `วิชาที่เลือก: ${subjectFilter}`}
              </span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-1">
                {[
                  { id: 'all', label: 'ทุกวิชา (8 กลุ่มสาระ)' },
                  { id: 'คณิตศาสตร์', label: '📐 คณิตฯ' },
                  { id: 'ภาษาไทย', label: '📖 ไทย' },
                  { id: 'ภาษาอังกฤษ', label: '🌍 อังกฤษ' },
                  { id: 'วิทยาศาสตร์', label: '🔬 วิทย์ฯ' },
                  { id: 'การงานอาชีพ', label: '🛠️ การงาน' },
                  { id: 'สังคมศึกษา', label: '🏛️ สังคม' },
                  { id: 'ศิลปะ', label: '🎨 ศิลปะ' },
                  { id: 'สุขศึกษา', label: '🏃 สุขศึกษา' }
                ].map(subj => (
                  <button
                    key={subj.id}
                    onClick={() => setSubjectFilter(subj.id)}
                    className={`px-3 py-1.5 text-xs font-black rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                      subjectFilter === subj.id
                        ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-300 font-extrabold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {subj.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full lg:w-72 shrink-0">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="🔍 ค้นชื่อบท, เรื่องที่สอน, ครู..."
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 hover:bg-white focus:bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 font-black bg-slate-200 hover:bg-slate-300 w-5 h-5 rounded-full flex items-center justify-center cursor-pointer"
                    title="ล้างคำค้นหา"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* EXECUTIVE METRICS STRIP */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 pt-2">
          <div className="bg-slate-50 hover:bg-purple-50/70 p-4 rounded-2xl border border-slate-200 transition-all">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">โรงเรียนที่กำลังตรวจสอบ</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-black text-purple-900 truncate">
                {selectedSchoolName === 'all' ? currentSingleSchool?.school.name.replace('รร.ตชด.', '') : selectedSchoolName.replace('รร.ตชด.', '')}
              </span>
            </div>
            <span className="text-[10px] text-purple-700 font-bold block mt-1 truncate">
              สังกัด กก.ตชด.{currentSingleSchool?.school.subdiv} • {currentSingleSchool?.school.address}
            </span>
          </div>

          <div className="bg-slate-50 hover:bg-blue-50/70 p-4 rounded-2xl border border-slate-200 transition-all">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">ระดับชั้นเรียนที่เลือกดู</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-black text-blue-800">
                {selectedGradeLevel === 'all' ? (schoolGradeTab === 'all' ? 'ทุกชั้นเรียน' : schoolGradeTab) : selectedGradeLevel}
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                {currentGradeConfig.stageLabel}
              </span>
            </div>
            <span className="text-[10px] text-blue-700 font-bold block mt-1 truncate">
              {currentGradeConfig.name}
            </span>
          </div>

          <div className="bg-slate-50 hover:bg-emerald-50/70 p-4 rounded-2xl border border-slate-200 transition-all">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">บทเรียนที่บันทึกแล้วสะสม</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-black text-emerald-800">
                {currentSingleSchool?.completedLessonsCount}
              </span>
              <span className="text-xs font-bold text-slate-500">คาบเรียน/บท</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-bold block mt-1 truncate">
              จาก {currentSingleSchool?.subjects.length} กลุ่มสาระการเรียนรู้หลัก
            </span>
          </div>

          <div className="bg-slate-50 hover:bg-amber-50/70 p-4 rounded-2xl border border-slate-200 transition-all">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">ความก้าวหน้าเฉลี่ยโรงเรียน</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-black text-amber-900 truncate">
                {currentSingleSchool?.overallProgressRatio}%
              </span>
              <span className="text-xs font-bold text-amber-700">ตามแผนหลักสูตร</span>
            </div>
            <span className="text-[10px] text-amber-800 font-bold block mt-1 truncate">
              ครูใหญ่: {currentSingleSchool?.school.principal || 'ส.ต.อ. ประจำการ ตชด.'}
            </span>
          </div>
        </div>

        {/* VIEW 1: SINGLE SCHOOL SPOTLIGHT & LESSONS INSPECTOR */}
        {viewMode === 'single' && currentSingleSchool && (
          <div className="pt-6 border-t border-slate-200 space-y-6">
            {/* SUB-VIEW SELECTOR TOOLBAR */}
            <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-slate-700 flex items-center gap-1.5 mr-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  รูปแบบการจัดวางเนื้อหา:
                </span>

                <div className="inline-flex p-1 bg-slate-200 rounded-xl border border-slate-300">
                  <button
                    onClick={() => setCurriculumViewMode('cards')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      curriculumViewMode === 'cards'
                        ? 'bg-white text-purple-950 shadow-xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5 text-purple-600" />
                    <span>ผังการสอนรายวิชา (Cards)</span>
                  </button>

                  <button
                    onClick={() => setCurriculumViewMode('table')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      curriculumViewMode === 'table'
                        ? 'bg-white text-purple-950 shadow-xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Table className="w-3.5 h-3.5 text-blue-600" />
                    <span>ตารางสรุป 8 กลุ่มสาระ (Table)</span>
                  </button>

                  <button
                    onClick={() => setCurriculumViewMode('timeline')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      curriculumViewMode === 'timeline'
                        ? 'bg-white text-purple-950 shadow-xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ListTodo className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ไทม์ไลน์บทเรียน (Timeline)</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto">
                <span className="text-xs font-extrabold text-purple-900 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                  {subjectFilter === 'all'
                    ? `แสดงครบ ${currentSingleSchool.subjects.length} กลุ่มสาระการเรียนรู้`
                    : `วิชาที่เลือก: ${subjectFilter}`}
                </span>
                {subjectFilter !== 'all' && (
                  <button
                    onClick={() => setSubjectFilter('all')}
                    className="text-xs font-bold text-slate-600 hover:text-purple-900 bg-white hover:bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200 cursor-pointer transition-colors"
                  >
                    ✕ แสดงทุกวิชา
                  </button>
                )}
              </div>
            </div>

            {/* SUB-VIEW 1: SUBJECT CARDS & LESSON ROADMAP */}
            {curriculumViewMode === 'cards' && (
              <div className="space-y-6">
                {displayedSubjects.map((subj) => {
                  const currentLessonTaught = subj.lessons[subj.lessons.length - 1];

                  return (
                    <div
                      key={subj.subjectName}
                      className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 hover:border-purple-300 transition-all space-y-4 shadow-sm"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
                        <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                          <span className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-2xl shrink-0 ${subj.colorTheme.bg} ${subj.colorTheme.text} border ${subj.colorTheme.border}`}>
                            📖
                          </span>
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-base sm:text-lg font-black text-slate-900">
                                {subj.subjectName}
                              </h4>
                              <span className={`text-xs font-black px-2.5 py-0.5 rounded-lg border ${subj.colorTheme.badge}`}>
                                บทที่ {subj.currentChapter}/{subj.totalChaptersTarget} ({subj.progressPercent}%)
                              </span>
                              <span className="text-xs font-bold text-slate-600 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                                ระดับชั้น: {subj.gradeLevel || 'ป.1'}
                              </span>
                            </div>

                            {currentLessonTaught && (
                              <div className="text-xs font-bold text-purple-950 flex items-center gap-2 flex-wrap pt-0.5">
                                <span className="bg-purple-900 text-white px-2 py-0.5 rounded-md font-black shadow-2xs shrink-0 text-[11px]">
                                  🎯 กำลังสอนถึง:
                                </span>
                                <span className="text-slate-900 font-extrabold text-xs sm:text-sm">
                                  {currentLessonTaught.chapterLabel}: {currentLessonTaught.unitTitle}
                                </span>
                                <span className="text-slate-500 text-[11px] whitespace-nowrap">
                                  (วันที่สอน {convertToThaiNumerals(currentLessonTaught.dateStr)})
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3.5 self-stretch md:self-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200/80">
                          <div className="text-left sm:text-right">
                            <span className="text-[10px] font-bold text-slate-400 block">ความคืบหน้า</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 sm:w-28 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${subj.colorTheme.line}`}
                                  style={{ width: `${subj.progressPercent}%` }}
                                />
                              </div>
                              <span className="text-xs font-black text-slate-900">{subj.progressPercent}%</span>
                            </div>
                          </div>

                          {currentLessonTaught && (
                            <button
                              onClick={() => setInspectLesson({
                                schoolName: currentSingleSchool.school.name,
                                subject: subj.subjectName,
                                lesson: currentLessonTaught,
                                principal: currentSingleSchool.school.principal,
                                subdiv: currentSingleSchool.school.subdiv
                              })}
                              className="px-3.5 py-2 bg-purple-900 hover:bg-purple-800 text-white text-xs font-black rounded-xl cursor-pointer shadow-xs transition-all flex items-center gap-1.5 shrink-0"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>ดูบันทึกบทเรียน</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
                          <span>ลำดับบทเรียนที่จัดการเรียนรู้ (คลิกเพื่อดูบันทึกกิจกรรม):</span>
                          <span className="text-purple-700 font-bold text-[11px]">
                            {subj.lessons.length} คาบเรียนที่บันทึกแล้ว
                          </span>
                        </div>

                        <div className="relative pt-1 pb-2 overflow-x-auto scrollbar-thin">
                          <div className="flex items-start gap-3.5 min-w-max px-1 relative z-10">
                            {subj.lessons.map((lesson, lIdx) => {
                              const isLatest = lIdx === subj.lessons.length - 1;

                              return (
                                <div
                                  key={lesson.id}
                                  onClick={() => setInspectLesson({
                                    schoolName: currentSingleSchool.school.name,
                                    subject: subj.subjectName,
                                    lesson,
                                    principal: currentSingleSchool.school.principal,
                                    subdiv: currentSingleSchool.school.subdiv
                                  })}
                                  className={`w-56 bg-white hover:bg-purple-50/10 rounded-2xl border transition-all cursor-pointer overflow-hidden flex flex-col group shrink-0 shadow-2xs hover:shadow-md hover:-translate-y-0.5 duration-300 ${
                                    isLatest
                                      ? 'border-purple-400 ring-2 ring-purple-100 bg-purple-50/5'
                                      : 'border-slate-200 hover:border-slate-300'
                                  }`}
                                >
                                  {lesson.images && lesson.images.length > 0 ? (
                                    <div className="h-28 w-full overflow-hidden relative bg-slate-100 shrink-0">
                                      <img
                                        src={getLessonImage(lesson, subj.subjectName) || ''}
                                        alt={lesson.unitTitle}
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent" />
                                      
                                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                                        <span className="text-[9px] font-black tracking-wide text-white bg-slate-950/75 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                                          คาบที่ {lesson.periodNum}
                                        </span>
                                        
                                        {lesson.isRealUpload ? (
                                          <span className="text-[9px] font-black text-emerald-100 bg-emerald-900/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-emerald-500/30">
                                            📷 ภาพจากรายงานจริง
                                          </span>
                                        ) : (
                                          <span className="text-[9px] font-black text-purple-100 bg-purple-950/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-purple-400/30">
                                            📚 ภาพกิจกรรมวิชา
                                          </span>
                                        )}
                                      </div>

                                      <div className="absolute bottom-2 left-2.5">
                                        <span className="text-[10px] font-black text-slate-100 flex items-center gap-1 bg-slate-900/40 px-1.5 py-0.5 rounded-sm">
                                          📅 {convertToThaiNumerals(lesson.dateStr)}
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="h-28 w-full relative shrink-0 overflow-hidden flex flex-col justify-between p-3 bg-gradient-to-br from-slate-50 to-slate-100/50 border-b border-slate-100">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-black tracking-wide text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                                          คาบที่ {lesson.periodNum}
                                        </span>
                                        <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                                          ไม่มีภาพหลักฐาน
                                        </span>
                                      </div>
                                      
                                      <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-white shadow-2xs flex items-center justify-center text-slate-400 border border-slate-100">
                                          <BookOpen className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <div>
                                          <span className="text-[10px] font-black text-slate-500 block">
                                            {subj.subjectName}
                                          </span>
                                          <span className="text-[9px] font-bold text-slate-400">
                                            📅 {convertToThaiNumerals(lesson.dateStr)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                                    <div className="space-y-1.5">
                                      <div className="flex items-center justify-between">
                                        <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded border ${
                                          isLatest
                                            ? 'bg-purple-900 text-white border-purple-900 shadow-3xs'
                                            : 'bg-slate-100 text-slate-600 border-slate-200'
                                        }`}>
                                          {lesson.chapterLabel}
                                        </span>
                                        
                                        {isLatest && (
                                          <span className="flex items-center gap-1 text-[9px] font-black text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                                            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
                                            ล่าสุด
                                          </span>
                                        )}
                                      </div>
                                      
                                      <p className="text-[11px] font-black text-slate-800 line-clamp-2 leading-relaxed group-hover:text-purple-800 transition-colors" title={lesson.unitTitle}>
                                        {lesson.unitTitle}
                                      </p>
                                    </div>

                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                                      <div className="flex items-center gap-1 truncate max-w-[110px]" title={lesson.teacher}>
                                        <span className="text-slate-400">👤</span>
                                        <span className="truncate">
                                          {lesson.teacher.replace('ส.ต.อ.หญิง', 'ส.ต.อ.ญ.').replace('ว่าที่', '').replace('ดาบตำรวจ', 'ด.ต.').replace('ร้อยตำรวจตรี', 'ร.ต.ต.')}
                                        </span>
                                      </div>
                                      <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-black border border-emerald-100 shrink-0 text-[9px]">
                                        มาเรียน ๑๐๐%
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* SUB-VIEW 2: SUMMARY TABLE */}
            {curriculumViewMode === 'table' && (
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Table className="w-5 h-5 text-purple-600" />
                    <h4 className="text-base font-black text-slate-900">
                      ตารางสรุปสถานะการสอนแยกตาม 8 กลุ่มสาระการเรียนรู้ ({currentSingleSchool.school.name})
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-slate-400">
                    อัปเดตล่าสุดภาคเรียนปัจจุบัน
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-black">
                        <th className="p-3.5 pl-4 rounded-l-xl">กลุ่มสาระการเรียนรู้</th>
                        <th className="p-3.5 text-center">ระดับชั้น</th>
                        <th className="p-3.5">บทเรียนที่กำลังสอนถึง (Unit Title)</th>
                        <th className="p-3.5 text-center">ความก้าวหน้า</th>
                        <th className="p-3.5 text-center">วันที่สอนล่าสุด</th>
                        <th className="p-3.5">ครูผู้สอน</th>
                        <th className="p-3.5 text-center">การเข้าเรียน</th>
                        <th className="p-3.5 text-center rounded-r-xl">บันทึกกิจกรรม</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {displayedSubjects.map((subj) => {
                        const currentLesson = subj.lessons[subj.lessons.length - 1];

                        return (
                          <tr key={subj.subjectName} className="hover:bg-purple-50/50 transition-colors">
                            <td className="p-3.5 pl-4">
                              <div className="flex items-center gap-2.5">
                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${subj.colorTheme.bg} ${subj.colorTheme.text} border ${subj.colorTheme.border}`}>
                                  📖
                                </span>
                                <div>
                                  <span className="font-extrabold text-slate-900 block">{subj.subjectName}</span>
                                  <span className="text-[10px] text-slate-400">บทที่ {subj.currentChapter}/{subj.totalChaptersTarget}</span>
                                </div>
                              </div>
                            </td>

                            <td className="p-3.5 text-center">
                              <span className="bg-slate-100 text-slate-700 font-black px-2 py-0.5 rounded-md text-[11px]">
                                {subj.gradeLevel || 'ป.1'}
                              </span>
                            </td>

                            <td className="p-3.5">
                              {currentLesson ? (
                                <div className="space-y-0.5 max-w-xs">
                                  <span className="font-black text-purple-900 block">
                                    {currentLesson.chapterLabel}: {currentLesson.unitTitle}
                                  </span>
                                  <span className="text-[10px] text-slate-500">
                                    คาบที่ {currentLesson.periodNum}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>

                            <td className="p-3.5 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span className="font-black text-slate-900">{subj.progressPercent}%</span>
                                <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${subj.colorTheme.line}`}
                                    style={{ width: `${subj.progressPercent}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            <td className="p-3.5 text-center font-bold text-slate-700">
                              {currentLesson ? convertToThaiNumerals(currentLesson.dateStr) : '-'}
                            </td>

                            <td className="p-3.5 font-bold text-slate-800">
                              {currentLesson ? currentLesson.teacher : currentSingleSchool.school.principal}
                            </td>

                            <td className="p-3.5 text-center">
                              <span className="bg-emerald-50 text-emerald-800 font-black px-2 py-0.5 rounded-md border border-emerald-200 text-[10px]">
                                มา ๑๐๐%
                              </span>
                            </td>

                            <td className="p-3.5 text-center">
                              {currentLesson && (
                                <button
                                  onClick={() => setInspectLesson({
                                    schoolName: currentSingleSchool.school.name,
                                    subject: subj.subjectName,
                                    lesson: currentLesson,
                                    principal: currentSingleSchool.school.principal,
                                    subdiv: currentSingleSchool.school.subdiv
                                  })}
                                  className="px-2.5 py-1 bg-purple-900 hover:bg-purple-800 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 mx-auto"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>ตรวจดู</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUB-VIEW 3: TIMELINE STEPPER */}
            {curriculumViewMode === 'timeline' && (
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <ListTodo className="w-5 h-5 text-emerald-600" />
                    <h4 className="text-base font-black text-slate-900">
                      เส้นทางไทม์ไลน์บทเรียนต่อเนื่อง ({currentSingleSchool.school.name})
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                    บันทึกแล้วทั้งหมด {currentSingleSchool.completedLessonsCount} คาบ
                  </span>
                </div>

                <div className="space-y-6">
                  {displayedSubjects.map((subj) => (
                    <div key={subj.subjectName} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${subj.colorTheme.bg} ${subj.colorTheme.text} border ${subj.colorTheme.border}`}>
                          📖
                        </span>
                        <h5 className="text-sm font-black text-slate-900">
                          {subj.subjectName} • ความก้าวหน้า {subj.progressPercent}%
                        </h5>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pl-4 border-l-2 border-purple-200">
                        {subj.lessons.map((lesson, lIdx) => {
                          const isLatest = lIdx === subj.lessons.length - 1;

                          return (
                            <div
                              key={lesson.id}
                              onClick={() => setInspectLesson({
                                schoolName: currentSingleSchool.school.name,
                                subject: subj.subjectName,
                                lesson,
                                principal: currentSingleSchool.school.principal,
                                subdiv: currentSingleSchool.school.subdiv
                              })}
                              className={`rounded-2xl border transition-all cursor-pointer overflow-hidden flex flex-col group bg-white hover:bg-purple-50/10 shadow-2xs hover:shadow-xs duration-300 ${
                                isLatest
                                  ? 'border-purple-400 ring-1 ring-purple-100'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              {lesson.images && lesson.images.length > 0 ? (
                                <div className="h-20 w-full overflow-hidden relative bg-slate-100 shrink-0">
                                  <SafeLazyImage
                                    src={getLessonImage(lesson, subj.subjectName) || ''}
                                    alt={lesson.unitTitle}
                                    referrerPolicy="no-referrer"
                                    imageFitMode="cover"
                                    className="group-hover:scale-105 transition-transform duration-500"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent z-15" />
                                  
                                  <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between text-[8px] font-black">
                                    <span className="text-white bg-slate-950/70 backdrop-blur-xs px-1.5 py-0.5 rounded">
                                      คาบ {lesson.periodNum}
                                    </span>
                                    {lesson.isRealUpload ? (
                                      <span className="text-emerald-100 bg-emerald-950/80 backdrop-blur-xs px-1.5 py-0.5 rounded">
                                        📷 ภาพจริง
                                      </span>
                                    ) : (
                                      <span className="text-purple-100 bg-purple-950/80 backdrop-blur-xs px-1.5 py-0.5 rounded">
                                        📚 กิจกรรมวิชา
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="h-20 w-full relative shrink-0 overflow-hidden flex flex-col justify-between p-2 bg-gradient-to-br from-slate-50 to-slate-100/50 border-b border-slate-100">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[8px] font-black text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">
                                      คาบ {lesson.periodNum}
                                    </span>
                                    <span className="text-[8px] font-black text-slate-400">
                                      ไม่มีภาพประกอบ
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <BookOpen className="w-3.5 h-3.5 text-slate-300" />
                                    <span className="text-[9px] font-black text-slate-400 truncate max-w-[120px]">
                                      {subj.subjectName}
                                    </span>
                                  </div>
                                </div>
                              )}

                              <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                                <div>
                                  <div className="flex items-center justify-between gap-1 text-[9px] font-bold">
                                    <span className="text-purple-700 font-black">
                                      {lesson.chapterLabel}
                                    </span>
                                    <span className="text-slate-400">
                                      {convertToThaiNumerals(lesson.dateStr)}
                                    </span>
                                  </div>
                                  <p className="text-[11px] font-black text-slate-800 line-clamp-2 leading-snug group-hover:text-purple-800 transition-colors mt-1" title={lesson.unitTitle}>
                                    {lesson.unitTitle}
                                  </p>
                                </div>

                                <div className="pt-1.5 border-t border-slate-100 flex justify-between text-[10px] text-slate-500 font-semibold items-center">
                                  <span className="truncate max-w-[80px]" title={lesson.teacher}>
                                    {lesson.teacher.replace('ส.ต.อ.หญิง', 'ส.ต.อ.ญ.').replace('ว่าที่', '')}
                                  </span>
                                  <span className="text-emerald-700 bg-emerald-50 px-1 rounded border border-emerald-100 text-[9px]">มาเรียน ๑๐๐%</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* VIEW 2: GRADE MATRIX COMPARISON */}
      {viewMode === 'grade_matrix' && (
        <GradeMatrixView
          schools={schools}
          filteredSchools={filteredSchools}
          selectedGradeLevel={selectedGradeLevel}
          onSelectGradeLevel={(gradeId) => setSelectedGradeLevel(gradeId)}
          onSelectSchool={(schName) => {
            setSelectedSchoolName(schName);
            setViewMode('single');
          }}
        />
      )}

      {/* VIEW 3: OVERALL ANALYTICS & LEADERBOARD */}
      {viewMode === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-6 bg-purple-600 rounded-full" />
                <h4 className="text-base font-black text-slate-900">
                  อันดับความก้าวหน้าเฉลี่ยรายกลุ่มสาระ (53 รร.)
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-400">ภาคเรียนปัจจุบัน</span>
            </div>

            <div className="space-y-3.5">
              {summaryKPIs.subjectRanking.map((subj, idx) => (
                <div key={subj.name} className="p-3.5 bg-slate-50 hover:bg-purple-50/60 rounded-2xl border border-slate-200/70 transition-all space-y-2">
                  <div className="flex items-center justify-between text-xs font-black">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center text-[11px]">
                        {idx + 1}
                      </span>
                      <span className="text-slate-900">{subj.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-bold">เฉลี่ยบทที่ {subj.avgChapter}</span>
                      <span className="text-purple-800 font-black">{subj.avgPct}%</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${subj.avgPct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-6 bg-blue-600 rounded-full" />
                <h4 className="text-base font-black text-slate-900">
                  ความก้าวหน้าจำแนกตามกองกำกับการ
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-400">ตชด. ภาค 2</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { sub: '21', name: 'กก.ตชด.21 (สุรินทร์-บุรีรัมย์)', schoolsCount: 9, targetPct: 84 },
                { sub: '22', name: 'กก.ตชด.22 (อุบลฯ-ศรีสะเกษ-อำนาจฯ)', schoolsCount: 15, targetPct: 78 },
                { sub: '23', name: 'กก.ตชด.23 (นครพนม-สกลนคร)', schoolsCount: 11, targetPct: 82 },
                { sub: '24', name: 'กก.ตชด.24 (เลย-บึงกาฬ-อุดรฯ)', schoolsCount: 18, targetPct: 76 }
              ].map(item => (
                <div key={item.sub} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-black bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md">
                      กก.ตชด.{item.sub}
                    </span>
                    <span className="text-sm font-black text-blue-800">{item.targetPct}%</span>
                  </div>
                  <h5 className="text-xs font-extrabold text-slate-800 leading-snug">{item.name}</h5>
                  <div className="text-[11px] text-slate-500 font-semibold flex justify-between">
                    <span>จำนวน <strong>{item.schoolsCount}</strong> รร.</span>
                    <span className="text-emerald-700 font-bold">🟢 ปกติ</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-1.5 text-xs text-indigo-950 font-medium">
              <span className="font-black flex items-center gap-1.5 text-indigo-900">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                ข้อเสนอแนะเชิงยุทธศาสตร์การศึกษา:
              </span>
              <p className="leading-relaxed">
                การจัดการเรียนรู้กลุ่มสาระคณิตศาสตร์และภาษาไทยมีความต่อเนื่องสูง สำหรับวิชาการงานอาชีพและวิทยาศาสตร์แนะนำให้เร่งบูรณาการโครงการเกษตรเพื่ออาหารกลางวันและโครงงานทดลองวิทยาศาสตร์ท้องถิ่นเพื่อเสริมความเข้าใจของนักเรียน
              </p>
            </div>
          </div>
        </div>
      )}

      {/* INSPECTOR SLIDE-OVER SIDEBAR MODAL */}
      {inspectLesson && (
        <div className="fixed inset-0 z-50 flex">
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes slideInLeft {
              from { transform: translateX(-100%); }
              to { transform: translateX(0); }
            }
            .animate-slide-in-left {
              animation: slideInLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
          `}} />

          <div
            onClick={() => setInspectLesson(null)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
          />

          <div
            className="relative z-50 w-full sm:max-w-md lg:max-w-lg bg-slate-50/95 backdrop-blur-md border-r border-slate-200 shadow-2xl flex flex-col h-full transform animate-slide-in-left overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative px-6 py-5 border-b border-slate-200 bg-white flex flex-col gap-2 shrink-0 overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-black bg-purple-900 text-purple-50 px-2 py-0.5 rounded-md border border-purple-800 uppercase tracking-wider">
                    กก.ตชด.{inspectLesson.subdiv}
                  </span>
                  <span className="text-xs font-extrabold text-slate-500">{inspectLesson.schoolName}</span>
                  {inspectLesson.lesson.gradeLabel && (
                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md border border-emerald-200">
                      {inspectLesson.lesson.gradeLabel}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setInspectLesson(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                {(() => {
                  const activeTheme = SUBJECT_THEMES[inspectLesson.subject] || DEFAULT_THEME;
                  return (
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${activeTheme.line}`} />
                      {inspectLesson.subject} • {inspectLesson.lesson.chapterLabel}
                    </h3>
                  );
                })()}
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  รายละเอียดกิจกรรมบทเรียนในคาบเรียน (บก.ตชด.ภาค 2)
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-slate-400" />
                    ภาพบรรยากาศการจัดการเรียนรู้
                  </span>
                  {inspectLesson.lesson.images && inspectLesson.lesson.images.length > 0 ? (
                    inspectLesson.lesson.isRealUpload ? (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        📷 ภาพกิจกรรมจากรายงานจริง ({inspectLesson.lesson.images.length} รูป)
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                        📚 ภาพกิจกรรมกลุ่มสาระ{inspectLesson.subject}
                      </span>
                    )
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                      ⚠️ ไม่มีสื่อภาพหลักฐาน
                    </span>
                  )}
                </div>

                {activeCoverPhoto ? (
                  <div 
                    onClick={() => setActiveLightboxImage(activeCoverPhoto)}
                    className="relative group rounded-2xl aspect-video overflow-hidden border border-slate-200 bg-slate-100 shadow-xs cursor-zoom-in transition-transform duration-200 hover:scale-[1.01]"
                  >
                    <img 
                      src={activeCoverPhoto} 
                      alt="Classroom activity featured" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    
                    <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="text-white text-xs font-black bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-white/20 shadow-lg flex items-center gap-1.5">
                        <Maximize2 className="w-3.5 h-3.5" />
                        ขยายรูปภาพ
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 pointer-events-none">
                      {inspectLesson.lesson.isRealUpload ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-1 rounded-lg backdrop-blur-md shadow-xs text-white bg-emerald-600/90 border border-emerald-500/30">
                          📷 ภาพถ่ายกิจกรรมจากรายงานจริง
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-1 rounded-lg backdrop-blur-md shadow-xs text-white bg-purple-600/90 border border-purple-500/30">
                          📚 ภาพกิจกรรมวิชา{inspectLesson.subject}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 flex flex-col items-center justify-center text-center space-y-2 aspect-video">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <CameraOff className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-500">ไม่มีภาพประกอบกิจกรรมการสอนจริง</p>
                      <p className="text-[10px] text-slate-400 font-medium max-w-[280px] mx-auto leading-normal">
                        ผู้สอนไม่ได้แนบไฟล์รูปภาพกิจกรรมในรายงานผลสำหรับคาบเรียนนี้
                      </p>
                    </div>
                  </div>
                )}

                {inspectLesson.lesson.images && inspectLesson.lesson.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
                    {inspectLesson.lesson.images.map((img, idx) => {
                      const mId = img.match(/(?:id=|\/d\/|folders\/)([\w-_]+)/);
                      const thumbUrl = mId ? `https://drive.google.com/thumbnail?id=${mId[1]}&sz=s400` : img;
                      const currentCoverToCompare = mId ? `https://drive.google.com/thumbnail?id=${mId[1]}&sz=s1000` : img;
                      const isActive = activeCoverPhoto === currentCoverToCompare || (idx === 0 && !activeCoverPhoto);

                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setActiveCoverPhoto(currentCoverToCompare);
                          }}
                          className={`relative w-16 h-12 rounded-lg overflow-hidden border shrink-0 transition-all ${
                            isActive 
                              ? 'border-purple-600 ring-2 ring-purple-100 scale-95' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <img 
                            src={thumbUrl} 
                            alt={`Classroom thumbnail ${idx + 1}`} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">หัวข้อเรื่องที่จัดการเรียนรู้ (Topic Title)</span>
                <p className="text-sm sm:text-base font-black text-slate-800 leading-snug">
                  {inspectLesson.lesson.unitTitle}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    วันที่จัดการเรียนสอน
                  </span>
                  <span className="text-xs font-black text-slate-800 mt-2 block">
                    {convertToThaiNumerals(inspectLesson.lesson.dateStr)}
                  </span>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3 text-purple-500" />
                    ลำดับคาบเรียน
                  </span>
                  <span className="text-xs font-black text-purple-700 mt-2 block">
                    คาบที่ {inspectLesson.lesson.periodNum}
                  </span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    การเข้าเรียนของนักเรียน
                  </span>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                    มาเรียน {Math.round((inspectLesson.lesson.attendancePresent / (inspectLesson.lesson.attendanceTotal || 1)) * 100)}%
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-100">
                      <div 
                        className="h-full bg-emerald-500 rounded-full" 
                        style={{ width: `${(inspectLesson.lesson.attendancePresent / (inspectLesson.lesson.attendanceTotal || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-black text-slate-700 shrink-0">
                    {inspectLesson.lesson.attendancePresent}/{inspectLesson.lesson.attendanceTotal} คน
                  </span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center font-bold">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">ครูผู้รับผิดชอบการสอน</span>
                    <span className="text-xs font-black text-slate-800">{inspectLesson.lesson.teacher}</span>
                  </div>
                </div>
                <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  บันทึกสำเร็จ
                </span>
              </div>

              {(() => {
                const activeTheme = SUBJECT_THEMES[inspectLesson.subject] || DEFAULT_THEME;
                const borderHex = activeTheme.line === 'bg-blue-500' ? '#3b82f6' 
                                : activeTheme.line === 'bg-emerald-500' ? '#10b981' 
                                : activeTheme.line === 'bg-cyan-500' ? '#06b6d4' 
                                : activeTheme.line === 'bg-amber-500' ? '#f59e0b' 
                                : activeTheme.line === 'bg-pink-500' ? '#ec4899' 
                                : activeTheme.line === 'bg-rose-500' ? '#f43f5e' 
                                : activeTheme.line === 'bg-indigo-500' ? '#6366f1' 
                                : '#a855f7';
                return (
                  <div className="space-y-4">
                    <div 
                      className="p-4 bg-white rounded-2xl border-l-4 border-y border-r border-slate-200 shadow-3xs space-y-1.5"
                      style={{ borderLeftColor: borderHex }}
                    >
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">📝 บันทึกผลการจัดกิจกรรมการเรียนรู้</span>
                      <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                        {inspectLesson.lesson.description || 'จัดการเรียนการสอนตามแผนการจัดการเรียนรู้ร่วมกับการทำแบบฝึกหัดและการฝึกทักษะปฏิบัติจริงในชั้นเรียน นักเรียนทุกคนสามารถปฏิบัติตามกิจกรรมได้ตามวัตถุประสงค์'}
                      </p>
                    </div>

                    <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 shadow-3xs space-y-1.5">
                      <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block">✨ การประเมินผลและข้อสังเกต</span>
                      <p className="text-xs text-emerald-800 leading-relaxed font-semibold">
                        {inspectLesson.lesson.problemNote || 'นักเรียนมีความสนใจและให้ความร่วมมือดีมาก ดำเนินกิจกรรมการเรียนรู้ได้ราบรื่น'}
                      </p>
                    </div>
                  </div>
                );
              })()}

            </div>

            <div className="p-4 sm:p-5 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">
                กองกำกับการตำรวจตระเวนชายแดน
              </span>
              <button
                onClick={() => setInspectLesson(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl cursor-pointer transition-colors shadow-sm"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX MODAL */}
      {activeLightboxImage && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 cursor-zoom-out animate-fade-in"
          onClick={() => setActiveLightboxImage(null)}
        >
          <button 
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/25 text-white p-3 rounded-full transition-colors cursor-pointer"
            onClick={() => setActiveLightboxImage(null)}
          >
            <X className="w-6 h-6" />
          </button>
          
          <div 
            className="relative max-w-5xl w-full max-h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={activeLightboxImage} 
              alt="Classroom activity full high res" 
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </div>
  );
}
