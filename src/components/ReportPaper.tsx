import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, FileText, Sparkles, Download, Maximize2, Crop, CloudUpload, Loader2 } from 'lucide-react';
import SafeLazyImage from './SafeLazyImage';
import { School } from '../types';
import {
  convertToThaiNumerals,
  getThaiDisplayWidth,
  stripEmojis,
  cleanReporterName,
  parseReporterRankAndName,
  extractReporterFromRow,
  formatThaiDate,
  parseThaiDateComponents,
  getCurrentThaiDateComponents,
  convertYearToBE,
  isNegativeOrNone,
  isProblemOrSuggestion
} from '../utils';

interface ReportPaperProps {
  index: number;
  logo: string | null;
  row: string[];
  headers: string[];
  schoolName: string;
  classNameVal: string;
  roomName: string;
  reportDate: string;
  timestampVal: string;
  isKindergarten: boolean;
  isHideImages: boolean;
  isChecked: boolean;
  onCheckboxChange: (checked: boolean) => void;
  onSavePrincipal: (schoolId: string, fullName: string) => void;
  onSaveAddress: (schoolId: string, address: string) => void;
  onOpenMapPicker: (schoolId: string) => void;
  onDownloadSingleJPG: (index: number) => void;
  onDownloadSinglePDF: (index: number) => void;
  onImageClick: (src: string) => void;
  schoolsDB: School[];
  printDate: string;
}

// Clean up and format timestamp
function formatReportTimestamp(raw: string): string {
  if (!raw) return '';
  let cleaned = convertYearToBE(raw);
  cleaned = convertToThaiNumerals(cleaned);
  if (cleaned.includes(':') && !cleaned.includes('น.')) {
    cleaned += ' น.';
  }
  return cleaned;
}

function smartShortenThaiText(text: string): string {
  if (!text || typeof text !== 'string') return text;
  let cleaned = text.trim();
  if (cleaned === '-' || cleaned === '' || cleaned.length <= 40) return cleaned;

  // Remove common repetitive boilerplate words
  cleaned = cleaned
    .replace(/^ครูผู้สอน(?:ได้)?(?:จัดกิจกรรมการเรียนรู้|ทำการสอน|ได้สอน|ดำเนินการสอน)\s*(?:เรื่อง|เกี่ยวกับการเรียนรู้เรื่อง)?\s*/g, '')
    .replace(/^นักเรียน(?:สามารถ)?(?:ได้เรียนรู้|เรียนรู้|ศึกษา|ทำความเข้าใจ)\s*(?:เรื่อง)?\s*/g, '')
    .replace(/^จัดกิจกรรมการเรียนรู้\s*(?:เรื่อง)?\s*/g, '')
    .replace(/^ดำเนินการสอน\s*(?:เรื่อง)?\s*/g, '')
    .replace(/^ทำการสอน\s*(?:เรื่อง)?\s*/g, '')
    .replace(/^การจัดกิจกรรมการเรียนการสอน\s*(?:เรื่อง)?\s*/g, '');

  // Collapse excess whitespace and newlines
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // If text is overly long (> 140 chars), summarize cleanly at natural boundary
  if (cleaned.length > 130) {
    const parts = cleaned.split(/(?:\r?\n|;|\.\s+|\s{2,})/);
    if (parts.length > 1 && parts[0].length >= 35) {
      cleaned = parts[0].trim();
    } else {
      cleaned = cleaned.slice(0, 120).trim() + '...';
    }
  }

  return cleaned;
}

function getProxiedImageUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/') || url.startsWith('http://localhost') || url.startsWith('https://localhost')) {
    return url;
  }
  return `/api/proxy-image?url=${encodeURIComponent(url)}`;
}

export default function ReportPaper({
  index,
  logo,
  row,
  headers,
  schoolName,
  classNameVal,
  roomName,
  reportDate,
  timestampVal,
  isKindergarten,
  isHideImages,
  isChecked,
  onCheckboxChange,
  onSavePrincipal,
  onSaveAddress,
  onOpenMapPicker,
  onDownloadSingleJPG,
  onDownloadSinglePDF,
  onImageClick,
  schoolsDB,
  printDate,
}: ReportPaperProps) {
  // Find school metadata
  const matchedSchool = schoolsDB.find(s => schoolName.includes(s.keyword));
  const schoolId = matchedSchool ? matchedSchool.keyword : schoolName;

  // Local or synced states for address and principal
  const [address, setAddress] = useState('');
  const [principalRank, setPrincipalRank] = useState('');
  const [principalName, setPrincipalName] = useState('');
  const [selfEval, setSelfEval] = useState<string | null>(null);

  // Address upload to server states
  const [isUploadingAddress, setIsUploadingAddress] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Principal upload to server states
  const [isUploadingPrincipal, setIsUploadingPrincipal] = useState(false);
  const [uploadPrincipalSuccess, setUploadPrincipalSuccess] = useState(false);

  const handleUploadPrincipal = async () => {
    let combined = '';
    if (principalRank && principalName) combined = `${principalRank} ${principalName}`;
    else if (principalRank || principalName) combined = `${principalRank}${principalName}`;
    if (!combined) return;

    setIsUploadingPrincipal(true);
    setUploadPrincipalSuccess(false);
    try {
      const response = await fetch('/api/custom-principals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          schoolName: schoolName,
          schoolId: schoolId,
          principal: combined
        })
      });
      if (response.ok) {
        setUploadPrincipalSuccess(true);
        setTimeout(() => setUploadPrincipalSuccess(false), 3000);
      } else {
        alert('ไม่สามารถอัปโหลดรายชื่อครูใหญ่ไปยังระบบได้สำเร็จ');
      }
    } catch (e) {
      console.error('Error uploading principal:', e);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเพื่ออัปโหลดรายชื่อครูใหญ่');
    } finally {
      setIsUploadingPrincipal(false);
    }
  };

  const handleUploadAddress = async () => {
    if (!address) return;
    setIsUploadingAddress(true);
    setUploadSuccess(false);
    try {
      const response = await fetch('/api/custom-addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          schoolName: schoolName,
          schoolId: schoolId,
          address: address
        })
      });
      if (response.ok) {
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      } else {
        alert('ไม่สามารถอัปโหลดที่อยู่ไปยังระบบได้สำเร็จ');
      }
    } catch (e) {
      console.error('Error uploading address:', e);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเพื่ออัปโหลดที่อยู่');
    } finally {
      setIsUploadingAddress(false);
    }
  };

  // AI summary states - Default to true (ตั้งค่าการย่อด้วย AI เป็นค่าเริ่มต้น)
  const [isAiSummarized, setIsAiSummarized] = useState(true);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [aiPeriods, setAiPeriods] = useState<Record<string, { meta: any[]; mains: any[] }> | null>(null);
  const [imageFitMode, setImageFitMode] = useState<'cover' | 'contain'>('cover');

  const reportCacheKey = `ai_summary_${schoolName}_${classNameVal}_${roomName}_${reportDate}`.replace(/\s+/g, '_');

  // Check cache on mount - default to true
  useEffect(() => {
    try {
      const cached = localStorage.getItem(reportCacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        setAiPeriods(parsed.summarizedPeriods || null);
        setIsAiSummarized(parsed.isActive !== false);
      } else {
        setAiPeriods(null);
        setIsAiSummarized(true);
      }
    } catch (e) {
      console.error('Error reading AI cache:', e);
      setIsAiSummarized(true);
    }
  }, [reportCacheKey]);

  // Parse principal name parts
  useEffect(() => {
    let pFullName = matchedSchool ? matchedSchool.principal : '';
    
    // Check custom overrides in localStorage if not found
    try {
      const customPrincipals = JSON.parse(localStorage.getItem('customPrincipals') || '{}');
      if (customPrincipals[schoolId]) pFullName = customPrincipals[schoolId];
    } catch (e) {}

    if (pFullName) {
      const titleRegex = /^(?:ว่าที่\s*)?(พล\.ต\.อ\.|พล\.ต\.ท\.|พล\.ต\.ต\.|พ\.ต\.อ\.|พ\.ต\.ท\.|พ\.ต\.ต\.|ร\.ต\.อ\.|ร\.ต\.ท\.|ร\.ต\.ต\.|ด\.ต\.|จ\.ส\.ต\.|ส\.ต\.อ\.|ส\.ต\.ท\.|ส\.ต\.ต\.|พลฯ|ร\.ต\.|ร้อยตรี|ดร\.|ศ\.|รศ\.|ผศ\.|นายแพทย์|แพทย์หญิง|นพ\.|พญ\.|นาย|นาง|นางสาว|น\.ส\.|ครู)\s*(หญิง)?\s*/;
      const match = pFullName.match(titleRegex);
      if (match) {
        let matchedTitle = match[0].trim();
        if (matchedTitle === 'นางสาว') matchedTitle = 'น.ส.';
        const nonRankTitles = ['นาย', 'นาง', 'นางสาว', 'น.ส.', 'ครู', 'ดร.', 'ศ.', 'รศ.', 'ผศ.', 'นายแพทย์', 'แพทย์หญิง', 'นพ.', 'พญ.'];
        if (nonRankTitles.includes(matchedTitle)) {
          setPrincipalRank('');
          setPrincipalName(matchedTitle + pFullName.replace(titleRegex, '').trim());
        } else {
          setPrincipalRank(matchedTitle);
          setPrincipalName(pFullName.replace(titleRegex, '').trim());
        }
      } else {
        setPrincipalRank('');
        setPrincipalName(pFullName);
      }
    } else {
      setPrincipalRank('');
      setPrincipalName('');
    }
  }, [matchedSchool, schoolId]);

  // Sync address
  useEffect(() => {
    let addr = matchedSchool ? matchedSchool.address : '';
    try {
      const customAddresses = JSON.parse(localStorage.getItem('customAddresses') || '{}');
      if (customAddresses[schoolId]) addr = customAddresses[schoolId];
    } catch (e) {}

    setAddress(convertToThaiNumerals(addr.replace(/^บ้าน/, 'บ.')));
  }, [matchedSchool, schoolId]);

  // Handle principal changes
  const handlePrincipalChange = (rank: string, name: string) => {
    let combined = '';
    if (rank && name) combined = `${rank} ${name}`;
    else if (rank || name) combined = `${rank}${name}`;
    onSavePrincipal(schoolId, combined);
  };

  // Collect row data
  let generalHtmlParts: React.ReactNode[] = [];
  let detailsList: any[] = [];
  let generalDetails: any[] = [];
  let imagesList: string[] = [];
  let rowSubdiv = '';

  // Extract reporter with robust multi-column & content-based parsing
  const repInfo = extractReporterFromRow(row, headers);
  let reporterRank = repInfo.rank || '';
  let reporterName = repInfo.name || '';

  const generalKeywords = ['วันที่', 'เวลา', 'สังกัด', 'สถานที่', 'นักเรียน', 'สัปดาห์', 'อีเมล', 'ประทับเวลา'];
  const reporterKeywords = [
    'ผู้รายงาน',
    'ผู้รายงานข้อมูล',
    'ชื่อ-สกุล',
    'ชื่อ - สกุล',
    'ชื่อ-นามสกุล',
    'ชื่อ - นามสกุล',
    'ชื่อและนามสกุล',
    'ชื่อสกุล',
    'ชื่อ',
    'สกุล',
    'นามสกุล',
    'รับผิดชอบ',
    'ผู้สอน',
    'ครูผู้สอน',
    'ยศ',
    'คำนำหน้า',
    'คำนำหน้านาม',
    'คำนำหน้าชื่อ',
    'ผู้จัดทำ',
    'ผู้บันทึก',
    'ผู้ปฏิบัติ',
    'ลงชื่อ',
    'เบอร์โทรศัพท์มือถือ',
    'เบอร์โทร',
    'โทรศัพท์'
  ];

  headers.forEach((rawHeader, colIdx) => {
    if (!rawHeader) return;
    const cleanHeader = stripEmojis(rawHeader);
    const lowerHeader = cleanHeader.toLowerCase();
    const rawValue = row[colIdx];
    if (rawValue === null || rawValue === undefined) return;
    let value = String(rawValue);
    if (value.trim() === '' || /^[\-\s]+$/.test(value)) return;

    value = value.replace(/รร\.ตขด\.ปากห้วยม่วง/g, 'รร.ตชด.ปากห้วยม่วง').replace(/ชำปะโต/g, 'ซำปะโต');

    if (lowerHeader.includes('รายชื่อ') || value.toLowerCase().includes('.pdf')) {
      return;
    } else if (
      lowerHeader.includes('รูป') ||
      lowerHeader.includes('ภาพ') ||
      lowerHeader.includes('อัฟโหลด') ||
      lowerHeader.includes('อัปโหลด') ||
      value.includes('drive.google.com')
    ) {
      const urls = value.split(/[\s,]+/).map(u => u.trim()).filter(u => u.startsWith('http'));
      if (urls.length > 0) {
        imagesList.push(...urls);
      }
      return;
    }

    if (lowerHeader.includes('โรงเรียน') || lowerHeader.includes('สถานศึกษา') || lowerHeader.includes('รร.')) {
      return;
    }

    const normalizedHeader = lowerHeader.replace(/ช้ัน/g, 'ชั้น');
    if ((normalizedHeader === 'ห้อง' || normalizedHeader === 'ห้องที่' || normalizedHeader === 'ห้องเรียน' || normalizedHeader.includes('ระบุห้อง')) && !normalizedHeader.includes('จำนวน')) {
      return;
    }

    if (normalizedHeader.includes('ชั้น') || normalizedHeader.includes('ระดับ') || normalizedHeader.includes('สายชั้น') || normalizedHeader.includes('ห้องเรียนที่สอน')) {
      if (!normalizedHeader.includes('นักเรียน') && !normalizedHeader.includes('จำนวน')) {
        return;
      }
    }

    // Skip reporter columns from middle content (they belong in signature area)
    if (colIdx === repInfo.sourceColIdx || reporterKeywords.some(kw => lowerHeader.includes(kw))) {
      if (
        lowerHeader.includes('วิชา') ||
        lowerHeader.includes('กิจกรรม') ||
        lowerHeader.includes('เรื่อง') ||
        lowerHeader.includes('หลักสูตร') ||
        lowerHeader.includes('หน่วย') ||
        lowerHeader.includes('สาระ') ||
        lowerHeader.includes('สื่อ') ||
        lowerHeader.includes('ใบงาน') ||
        lowerHeader.includes('ชิ้นงาน') ||
        lowerHeader.includes('นักเรียน') ||
        lowerHeader.includes('โรงเรียน')
      ) {
        // Not purely reporter, fall through to details
      } else {
        return;
      }
    }

    if (generalKeywords.some(kw => lowerHeader.includes(kw))) {
      if (lowerHeader.includes('ประทับเวลา') || lowerHeader.includes('วันที่')) return;
      if (lowerHeader.includes('สังกัด') || lowerHeader.includes('กก.ตชด') || lowerHeader.includes('กองกำกับการ')) {
        if (!rowSubdiv) rowSubdiv = value;
        return;
      }
      if (!lowerHeader.includes('อีเมล')) {
        let displayValue = convertToThaiNumerals(value);
        generalDetails.push({ header: convertToThaiNumerals(cleanHeader), value: displayValue, originalHeader: lowerHeader });
      }
    } else {
      if (lowerHeader.includes('เบอร์') || lowerHeader.includes('โทร')) return;
      if (lowerHeader.includes('สังกัด') || lowerHeader.includes('กก.ตชด') || lowerHeader.includes('กองกำกับการ')) {
        if (!rowSubdiv) rowSubdiv = value;
        return;
      }
      
      const isFullWidth = ['ปัญหา', 'อุปสรรค', 'ข้อขัดข้อง', 'เสนอแนะ', 'แนวทาง', 'แก้ไข', 'รายละเอียด', 'ผลการ', 'รายชื่อ', 'สื่อ', 'ใบงาน', 'ชิ้นงาน'].some(kw => lowerHeader.includes(kw));
      const spanClass = isFullWidth ? 'col-span-full border-l-2 border-slate-300 pl-3 bg-white py-1' : 'col-span-1';
      let displayValue = convertToThaiNumerals(value);
      detailsList.push({ cleanHeader: convertToThaiNumerals(cleanHeader), lowerHeader, spanClass, displayValue });
    }
  });

  const [userReporterRank, setUserReporterRank] = useState(reporterRank);
  const [userReporterName, setUserReporterName] = useState(reporterName);

  // Effective timestamp and automatic date parsing
  let effectiveTimestamp = timestampVal || '';
  if (!effectiveTimestamp && headers && row) {
    const tsIdx = headers.findIndex(h => h && (
      h.toLowerCase().includes('ประทับเวลา') ||
      h.toLowerCase().includes('timestamp') ||
      h.toLowerCase().includes('วันเวลา') ||
      h.toLowerCase().includes('วันที่และเวลา') ||
      h.toLowerCase().includes('วัน/เวลา')
    ));
    if (tsIdx !== -1 && row[tsIdx]) {
      effectiveTimestamp = String(row[tsIdx]).trim();
    }
  }
  if (!effectiveTimestamp && reportDate) {
    effectiveTimestamp = reportDate;
  }

  const parsedDate = parseThaiDateComponents(effectiveTimestamp);

  const currentThaiDate = getCurrentThaiDateComponents();

  const [userDay, setUserDay] = useState(parsedDate?.day || '');
  const [userMonth, setUserMonth] = useState(parsedDate?.shortMonthName || parsedDate?.monthName || '');
  const [userYear, setUserYear] = useState(parsedDate?.shortYearBE || parsedDate?.yearBE || '');

  const [supervisorDay, setSupervisorDay] = useState(currentThaiDate.day);
  const [supervisorMonth, setSupervisorMonth] = useState(currentThaiDate.shortMonthName);
  const [supervisorYear, setSupervisorYear] = useState(currentThaiDate.shortYearBE);

  useEffect(() => {
    setUserReporterRank(reporterRank);
  }, [reporterRank]);

  useEffect(() => {
    setUserReporterName(reporterName);
  }, [reporterName]);

  useEffect(() => {
    if (parsedDate) {
      setUserDay(parsedDate.day);
      setUserMonth(parsedDate.shortMonthName || parsedDate.monthName);
      setUserYear(parsedDate.shortYearBE || parsedDate.yearBE);
    }
  }, [effectiveTimestamp]);

  // Construct School and Class label
  let schoolAndClass = schoolName ? schoolName : '';
  if (classNameVal) {
    let cleanClass = classNameVal.trim();
    cleanClass = cleanClass.replace(/ป\.\s*([0-9๐-๙]+)/g, 'ประถมศึกษาปีที่ $1');
    cleanClass = cleanClass.replace(/ม\.\s*([0-9๐-๙]+)/g, 'มัธยมศึกษาปีที่ $1');
    cleanClass = cleanClass.replace(/อ\.\s*([0-9๐-๙]+)/g, 'อนุบาลปีที่ $1');
    cleanClass = cleanClass.replace(/อนุบาล\s*([0-9๐-๙]+)/g, 'อนุบาลปีที่ $1');
    if (!cleanClass.startsWith('ชั้น') && !cleanClass.startsWith('ระดับ')) cleanClass = 'ชั้น ' + cleanClass;
    schoolAndClass += (schoolName ? `  ${cleanClass}` : cleanClass);
  }
  if (roomName && roomName.trim() !== '' && !/^[\-\s]+$/.test(roomName)) {
    let cleanRoom = roomName.trim().replace(/^ห้อง(?:ที่)?\s*/, '');
    schoolAndClass += ` ห้อง ${cleanRoom}`;
  }
  schoolAndClass = convertToThaiNumerals(schoolAndClass);

  // Find general subdivision item
  let subdivVal = matchedSchool ? `กก.ตชด.${matchedSchool.subdiv}` : (rowSubdiv || '');
  
  // Format period items
  let groupedPeriods: Record<string, { title: string; order: number; meta: any[]; mains: any[] }> = {};
  let generalDetailsList: any[] = [];
  let maxPeriods = isKindergarten ? 4 : 6;
  const replacePeriodRegex = /คาบ(?:ที่)?\s*[1-6๑-๖]|กิจกรรม(?:ที่)?\s*[1-6๑-๖](?!\s*(?:\.\s*[0-9๑-๙]|[0-9๑-๙]))|วิชา(?:ที่)?\s*[1-6๑-๖](?!\s*(?:\.\s*[0-9๑-๙]|[0-9๑-๙]))|ว\.(?:ที่)?\s*[1-6๑-๖](?!\s*(?:\.\s*[0-9๑-๙]|[0-9๑-๙]))/ig;

  detailsList.forEach(detail => {
    let searchStr = detail.lowerHeader;
    searchStr = searchStr.replace(/ใบกิจกรรม(?:ที่)?\s*[0-9๑-๖]+/g, '');
    searchStr = searchStr.replace(/ใบงาน(?:ที่)?\s*[0-9๑-๖]+/g, '');
    searchStr = searchStr.replace(/ชิ้นงาน(?:ที่)?\s*[0-9๑-๖]+/g, '');

    let pNumStr = null;
    let mPeriod = searchStr.match(/คาบ(?:ที่)?\s*([1-6๑-๖])/);
    if (mPeriod) pNumStr = mPeriod[1];
    else {
      mPeriod = searchStr.match(/กิจกรรม(?:ที่)?\s*([1-6๑-๖])(?!\s*(?:\.\s*[0-9๑-๙]|[0-9๑-๙]))/);
      if (mPeriod) pNumStr = mPeriod[1];
      else {
        mPeriod = searchStr.match(/วิชา(?:ที่)?\s*([1-6๑-๖])(?!\s*(?:\.\s*[0-9๑-๙]|[0-9๑-๙]))/);
        if (mPeriod) pNumStr = mPeriod[1];
        else {
          mPeriod = searchStr.match(/ว\.(?:ที่)?\s*([1-6๑-๖])(?!\s*(?:\.\s*[0-9๑-๙]|[0-9๑-๙]))/);
          if (mPeriod) pNumStr = mPeriod[1];
        }
      }
    }

    if (pNumStr) {
      const thaiToArabic: Record<string, number> = { '๑': 1, '๒': 2, '๓': 3, '๔': 4, '๕': 5, '๖': 6 };
      const pNum = thaiToArabic[pNumStr] || parseInt(pNumStr);
      const key = `period_${pNum}`;

      if (!groupedPeriods[key]) {
        groupedPeriods[key] = {
          title: `${isKindergarten ? 'กิจกรรมที่' : 'คาบที่'} ${convertToThaiNumerals(pNum)}`,
          order: pNum,
          meta: [],
          mains: [],
        };
      }

      let cleanLabel = detail.cleanHeader.replace(replacePeriodRegex, '').trim();
      cleanLabel = cleanLabel.replace(/^[-\.\:\(\)]+|[-\.\:\(\)]+$/g, '').trim();

      if (detail.lowerHeader.includes('หน่วย') || detail.lowerHeader.includes('เรื่อง') || detail.lowerHeader.includes('สาระ') || detail.lowerHeader.includes('มาตรฐาน')) {
        groupedPeriods[key].meta.push({ label: cleanLabel, value: detail.displayValue });
      } else if (
        detail.lowerHeader.includes('เนื้อหา') ||
        detail.lowerHeader.includes('รายละเอียด') ||
        detail.lowerHeader.includes('ผลการ') ||
        detail.lowerHeader.includes('ปัญหา') ||
        detail.lowerHeader.includes('อุปสรรค') ||
        detail.lowerHeader.includes('ข้อเสนอ') ||
        detail.lowerHeader.includes('สื่อ') ||
        detail.lowerHeader.includes('ใบงาน') ||
        detail.lowerHeader.includes('ชิ้นงาน')
      ) {
        let label = cleanLabel;
        if (!label) {
          if (detail.lowerHeader.includes('ปัญหา')) label = 'ปัญหา/อุปสรรค';
          else if (detail.lowerHeader.includes('เนื้อหา')) label = 'เนื้อหา';
          else if (detail.lowerHeader.includes('สื่อ') || detail.lowerHeader.includes('ใบงาน') || detail.lowerHeader.includes('ชิ้นงาน')) label = 'สื่อ/ใบงาน/ชิ้นงาน';
          else label = 'รายละเอียด';
        }
        if (label.includes('สื่อ') || label.includes('ใบงาน') || label.includes('ชิ้นงาน')) {
          label = 'สื่อ/ใบงาน/ชิ้นงาน';
        }

        // Omit problems/suggestions when the answer is "ไม่มี" / none / empty
        if (isProblemOrSuggestion(detail.lowerHeader) || isProblemOrSuggestion(label)) {
          if (isNegativeOrNone(detail.displayValue)) {
            return;
          }
        }

        groupedPeriods[key].mains.push({ label, value: detail.displayValue });
      } else {
        if (detail.displayValue !== '-' && !detail.displayValue.match(/^[0-9๐-๙]+$/)) {
          groupedPeriods[key].title += ` : ${detail.displayValue}`;
        } else {
          groupedPeriods[key].meta.push({ label: detail.cleanHeader, value: detail.displayValue });
        }
      }
    } else {
      // Omit general details when the item is a problem/suggestion and answer is "ไม่มี" / none / empty
      if (isProblemOrSuggestion(detail.lowerHeader) && isNegativeOrNone(detail.displayValue)) {
        return;
      }
      generalDetailsList.push(detail);
    }
  });

  // Override groupedPeriods with AI summarized content if active
  if (isAiSummarized && aiPeriods) {
    Object.keys(groupedPeriods).forEach(k => {
      const summary = aiPeriods[k];
      if (summary) {
        if (summary.meta) {
          groupedPeriods[k].meta = summary.meta;
        }
        if (summary.mains) {
          groupedPeriods[k].mains = summary.mains;
        }
      }
    });
  }

  // Keep periods within limit
  const periodKeys = Object.keys(groupedPeriods)
    .filter(k => groupedPeriods[k].order <= maxPeriods)
    .sort((a, b) => groupedPeriods[a].order - groupedPeriods[b].order);

  // Photos rendering
  const maxImageLimit = isKindergarten ? 4 : 6;
  const maxImages = imagesList.slice(0, maxImageLimit);

  // Self Evaluation Callback
  const handleEvalClick = (val: string) => {
    setSelfEval(prev => (prev === val ? null : val));
  };

  // Function to call Gemini API and summarize
  const handleToggleAiSummary = async () => {
    if (isAiSummarized) {
      setIsAiSummarized(false);
      try {
        const cached = localStorage.getItem(reportCacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          parsed.isActive = false;
          localStorage.setItem(reportCacheKey, JSON.stringify(parsed));
        }
      } catch (e) {}
      return;
    }

    if (aiPeriods) {
      setIsAiSummarized(true);
      try {
        const cached = localStorage.getItem(reportCacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          parsed.isActive = true;
          localStorage.setItem(reportCacheKey, JSON.stringify(parsed));
        }
      } catch (e) {}
      return;
    }

    // Compile periods from the current groupedPeriods (before override)
    // To get the original periods, we parse the raw detailsList which we already did
    const payloadPeriods = Object.keys(groupedPeriods).map(k => ({
      key: k,
      title: groupedPeriods[k].title,
      meta: groupedPeriods[k].meta,
      mains: groupedPeriods[k].mains
    }));

    if (payloadPeriods.length === 0) return;

    setIsSummarizing(true);
    try {
      const response = await fetch('/api/summarize-periods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ periods: payloadPeriods })
      });

      if (!response.ok) {
        throw new Error('Failed to summarize periods');
      }

      const data = await response.json();
      if (data && data.summarizedPeriods) {
        // Map array back to Record
        const summarizedRecord: Record<string, { meta: any[]; mains: any[] }> = {};
        data.summarizedPeriods.forEach((item: any) => {
          if (item.key) {
            summarizedRecord[item.key] = {
              meta: item.meta || [],
              mains: item.mains || []
            };
          }
        });

        setAiPeriods(summarizedRecord);
        setIsAiSummarized(true);

        // Save to cache
        try {
          localStorage.setItem(reportCacheKey, JSON.stringify({
            summarizedPeriods: summarizedRecord,
            isActive: true
          }));
        } catch (e) {}
      }
    } catch (error) {
      console.error('AI summarization failed:', error);
      alert('ไม่สามารถย่อสรุปด้วย AI ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSummarizing(false);
    }
  };

  // QR Server link
  const selectEl = document.getElementById('urlSelect') as HTMLSelectElement;
  const currentUrl = selectEl ? selectEl.value : '';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(currentUrl)}&margin=0`;

  return (
    <div
      className="a4-paper text-[13px] text-slate-800 relative select-none transition-opacity duration-300 border border-slate-300"
    >
      {/* Background Watermark Logo */}
      {logo && (
        <div
          data-html2canvas-ignore="true"
          className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0 overflow-hidden no-print"
        >
          <img
            src={logo}
            alt="Watermark"
            className="w-[50%] max-w-[220px] object-contain grayscale"
            style={{ opacity: 0.03, width: '220px', height: '220px', objectFit: 'contain' }}
          />
        </div>
      )}



      {/* Main Content Body */}
      <div className="flex-grow flex flex-col justify-start space-y-1.5 overflow-hidden relative z-10">
        {/* Header Block */}
        <div className="text-center mb-0.5 pb-1 border-b border-black -mt-1.5 shrink-0" style={{ letterSpacing: 'normal', marginTop: '-6px' }}>
          {logo && (
            <img
              src={logo}
              alt="Logo"
              className="h-10 mx-auto mb-1 object-contain"
              style={{ height: '40px', width: 'auto', maxHeight: '40px', objectFit: 'contain' }}
            />
          )}
          <h2 className="text-[17.5px] font-bold text-black leading-tight">รายงานผลการปฏิบัติงานการจัดการเรียนรู้</h2>
          {schoolAndClass && <p className="text-[13.5px] font-bold text-black mt-0.5 leading-tight">{schoolAndClass}</p>}
          <p className="text-[12px] mt-0.5 text-black font-normal">
            รายงานประจำวันที่: <span className="font-normal text-black">{convertToThaiNumerals(formatThaiDate(reportDate || effectiveTimestamp))}</span>
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-1 flex-grow flex flex-col justify-start" style={{ letterSpacing: 'normal' }}>
          {/* Section 1: General Info */}
          <div className="shrink-0">
            <div className="flex items-center bg-[#f0f4f8] border-l-[5px] border-[#0f2b5c] px-2 py-0.5 mb-1.5 mt-0.5">
              <span className="font-bold text-[13px] text-black">๑. ข้อมูลทั่วไป</span>
            </div>
            <div className="px-2 space-y-1 text-[12px] text-black leading-relaxed">
              {/* Row 1: Subdiv & Principal */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-0.5">
                {subdivVal && (
                  <div className="inline-block shrink-0">
                    <span className="font-bold text-black">สังกัด/หน่วยงาน:</span>{' '}
                    <span className="text-black ml-0.5">{convertToThaiNumerals(subdivVal)}</span>
                  </div>
                )}
                {(principalName || principalRank || true) && (
                  <div className="inline-flex items-center group/principal relative shrink-0">
                    <span className="font-bold text-black mr-1">ครูใหญ่:</span>
                    <div className="principal-input-parent inline-flex items-center gap-1">
                      <input
                        type="text"
                        value={principalRank}
                        onChange={(e) => {
                          setPrincipalRank(e.target.value);
                          handlePrincipalChange(e.target.value, principalName);
                        }}
                        className="principal-rank-input bg-transparent border-none outline-none text-black text-[12px] px-0 py-0 transition-all print-input placeholder-slate-300 text-left"
                        style={{ width: `${Math.max(28, getThaiDisplayWidth(principalRank || '', 28))}px` }}
                        placeholder="ยศ"
                        title="พิมพ์เพื่อแก้ไขยศ/ตำแหน่งครูใหญ่"
                      />
                      <input
                        type="text"
                        value={principalName}
                        onChange={(e) => {
                          setPrincipalName(e.target.value);
                          handlePrincipalChange(principalRank, e.target.value);
                        }}
                        className="principal-name-input bg-transparent border-none outline-none text-black text-[12px] px-0 py-0 transition-all print-input placeholder-slate-300 text-left"
                        style={{ width: `${Math.max(60, getThaiDisplayWidth(principalName || '', 60))}px` }}
                        placeholder="ชื่อ-สกุล ครูใหญ่"
                        title="พิมพ์เพื่อแก้ไขชื่อครูใหญ่"
                      />
                    </div>
                    
                    {/* Cloud upload button to upload principal keyed by school name */}
                    <button
                      type="button"
                      onClick={handleUploadPrincipal}
                      disabled={isUploadingPrincipal}
                      data-html2canvas-ignore="true"
                      className={`ml-1 transition-all p-0.5 rounded cursor-pointer no-print ${
                        uploadPrincipalSuccess 
                          ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                          : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                      }`}
                      title="อัปโหลดรายชื่อครูใหญ่นี้บันทึกไว้ในระบบคลาวด์"
                    >
                      {isUploadingPrincipal ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : uploadPrincipalSuccess ? (
                        <svg className="w-3.5 h-3.5 text-emerald-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <CloudUpload className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <div
                      data-html2canvas-ignore="true"
                      className="absolute -top-4 left-10 text-[9px] text-blue-500 opacity-0 group-hover/principal:opacity-100 transition-opacity no-print pointer-events-none whitespace-nowrap"
                    >
                      แก้ไขแล้วคลิกปุ่มก้อนเมฆเพื่ออัปโหลดลงระบบ
                    </div>
                  </div>
                )}
              </div>

              {/* Row 2: Address */}
              {schoolId && (
                <div className="flex items-center gap-x-2 mt-0.5 w-full">
                  <div className="inline-flex items-center group/address relative w-full">
                    <span className="font-bold text-black mr-1 shrink-0">ที่ตั้ง:</span>
                    <div className="school-address-input-parent inline-flex items-center bg-transparent flex-1 min-w-0">
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => {
                          setAddress(e.target.value);
                          onSaveAddress(schoolId, e.target.value);
                        }}
                        className="school-address-input bg-transparent border-none outline-none text-black text-[12px] px-0 py-0 transition-all print-input placeholder-slate-300 w-full"
                        placeholder="ที่ตั้งโรงเรียน"
                        title="พิมพ์เพื่อแก้ไขที่ตั้งโรงเรียน"
                      />
                    </div>
                    {/* Cloud upload button to upload address keyed by school name */}
                    <button
                      type="button"
                      onClick={handleUploadAddress}
                      disabled={isUploadingAddress}
                      data-html2canvas-ignore="true"
                      className={`ml-1 transition-all p-0.5 rounded cursor-pointer no-print shrink-0 ${
                        uploadSuccess 
                          ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                          : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                      }`}
                      title="อัปโหลดที่อยู่นี้บันทึกไว้ในระบบคลาวด์"
                    >
                      {isUploadingAddress ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : uploadSuccess ? (
                        <svg className="w-3.5 h-3.5 text-emerald-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <CloudUpload className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <div
                      data-html2canvas-ignore="true"
                      className="absolute -top-4 left-10 text-[9px] text-blue-500 opacity-0 group-hover/address:opacity-100 transition-opacity no-print pointer-events-none whitespace-nowrap"
                    >
                      แก้ไขแล้วคลิกปุ่มก้อนเมฆเพื่ออัปโหลดลงระบบ
                    </div>
                  </div>
                </div>
              )}

              {/* Row 3: General Details (Students and weeks) */}
              {generalDetails.filter(item => !item.originalHeader.includes('สังกัด') && !item.originalHeader.includes('กก.ตชด') && !item.originalHeader.includes('กองกำกับการ')).length > 0 && (
                <div className="flex flex-wrap items-center gap-x-8 gap-y-0.5 mt-0.5">
                  {generalDetails
                    .filter(item => !item.originalHeader.includes('สังกัด') && !item.originalHeader.includes('กก.ตชด') && !item.originalHeader.includes('กองกำกับการ'))
                    .map((item, dIdx) => (
                      <div key={dIdx} className="inline-block">
                        <span className="font-bold text-black">{item.header}:</span>{' '}
                        <span className="text-black ml-0.5">{convertToThaiNumerals(item.value)}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Operational Details / Experience Recording */}
          <div className="shrink-0">
            <div className="flex items-center bg-[#f0f4f8] border-l-[5px] border-[#0f2b5c] px-2 py-0.5 mb-1.5 mt-1.5">
              <span className="font-bold text-[13px] text-black">
                {isKindergarten ? '๒. บันทึกผลการจัดประสบการณ์ประจำวัน' : '๒. รายละเอียดการปฏิบัติงาน'}
              </span>
            </div>
            <div className="w-full px-0.5">
              {periodKeys.length > 0 ? (
                <div className={`grid ${isKindergarten ? 'grid-cols-2' : 'grid-cols-3'} gap-2 w-full`}>
                  {periodKeys.map((k) => {
                    const period = groupedPeriods[k];
                    return (
                      <div
                        key={k}
                        className="border border-blue-200 rounded-xl bg-white shadow-none flex flex-col p-2.5 min-h-[90px] break-inside-avoid"
                      >
                        {/* Period Title Centered */}
                        <div className="text-center font-bold text-[12px] text-black mb-1 leading-tight">
                          {convertToThaiNumerals(period.title)}
                        </div>
                        {/* Full-width dashed line */}
                        <div className="border-b border-dashed border-slate-300 w-full mb-1.5"></div>

                        {/* Content */}
                        <div className="space-y-1 text-[11px] leading-snug text-left">
                          {period.meta
                            .filter(m => !(isProblemOrSuggestion(m.label) && isNegativeOrNone(m.value)))
                            .map((m, mIdx) => {
                              let formattedLabel = m.label;
                              const lowerL = (m.label || '').toLowerCase();
                              if (lowerL.includes('หน่วย') || lowerL.includes('บท') || (lowerL.includes('เรื่อง') && !lowerL.includes('เนื้อหา'))) {
                                formattedLabel = 'บทที่/หน่วยการเรียนรู้';
                              }
                              const displayVal = (isAiSummarized && !aiPeriods) ? smartShortenThaiText(m.value) : m.value;
                              return (
                                <div key={mIdx} className="text-left leading-tight">
                                  <span className="font-bold text-black">{formattedLabel ? formattedLabel + ': ' : ''}</span>
                                  <span className="text-black whitespace-pre-wrap break-words">{convertToThaiNumerals(displayVal)}</span>
                                </div>
                              );
                            })}
                          {period.mains
                            .filter(m => !(isProblemOrSuggestion(m.label) && isNegativeOrNone(m.value)))
                            .map((m, mIdx) => {
                              let formattedLabel = m.label;
                              const lowerL = (m.label || '').toLowerCase();
                              if (lowerL.includes('เนื้อหา') || lowerL.includes('รายละเอียด') || lowerL.includes('ผลการ')) {
                                formattedLabel = 'เนื้อหาพอสังเขป';
                              } else if (lowerL.includes('สื่อ') || lowerL.includes('ใบงาน') || lowerL.includes('ชิ้นงาน')) {
                                formattedLabel = 'สื่อ/ใบงาน/ชิ้นงาน';
                              }
                              const displayVal = (isAiSummarized && !aiPeriods) ? smartShortenThaiText(m.value) : m.value;
                              return (
                                <div key={mIdx} className="text-left leading-tight">
                                  <span className="font-bold text-black">{formattedLabel}: </span>
                                  <span className="text-black whitespace-pre-wrap break-words">{convertToThaiNumerals(displayVal)}</span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-slate-400 italic text-center py-2">- ไม่มีข้อมูลปฏิบัติงานรายคาบ -</p>
              )}

              {/* Fallback general details list */}
              {generalDetailsList.filter(d => !(isProblemOrSuggestion(d.lowerHeader) && isNegativeOrNone(d.displayValue))).length > 0 && (
                <div className={`${periodKeys.length > 0 ? 'mt-2 border-t border-slate-200 pt-1.5' : 'mt-1'} grid grid-cols-1 gap-1.5 w-full`}>
                  {generalDetailsList
                    .filter(d => !(isProblemOrSuggestion(d.lowerHeader) && isNegativeOrNone(d.displayValue)))
                    .map((detail, dIdx) => (
                    <div key={dIdx} className="break-inside-avoid min-w-0 bg-slate-50/50 p-2 border-l-2 border-slate-400 rounded-r-sm leading-tight" style={{ letterSpacing: 'normal' }}>
                      <p className="font-bold text-slate-800 text-[11px] inline-block mb-0.5">{detail.cleanHeader}</p>
                      <p className="whitespace-pre-line break-words text-black text-[11px] text-left" style={{ lineHeight: '1.4' }}>- {detail.displayValue}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Photos Grid (ภาพประกอบการปฏิบัติงาน) */}
          {!isHideImages && (
            <div className="avoid-page-break mt-1 image-section-wrapper flex-1 flex flex-col justify-start w-full min-h-0">
              <div className="flex items-center justify-between bg-[#f0f4f8] border-l-[5px] border-[#0f2b5c] px-2.5 py-1 mb-1.5 mt-0.5 rounded-r-md shrink-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[13px] text-black tracking-tight">๓. ภาพประกอบการปฏิบัติงาน</span>
                </div>
              </div>
              {maxImages.length > 0 ? (() => {
                const renderImg = (imgUrl: string, idx: number, extraWrapperClass = '') => {
                  const matchId = imgUrl.match(/(?:id=|\/d\/|folders\/)([\w-_]+)/);
                  const id = matchId ? matchId[1] : null;
                  
                  let displayUrl = getProxiedImageUrl(imgUrl);
                  let fallbacks: string[] = [];
                  if (id) {
                    displayUrl = getProxiedImageUrl(`https://drive.google.com/thumbnail?id=${id}&sz=s600`);
                    fallbacks = [
                      getProxiedImageUrl(`https://lh3.googleusercontent.com/d/${id}=s600`),
                      getProxiedImageUrl(`https://drive.google.com/thumbnail?id=${id}&sz=s1000`),
                      getProxiedImageUrl(`https://drive.google.com/uc?export=view&id=${id}`)
                    ];
                  }

                  const thaiIdx = convertToThaiNumerals(idx + 1);

                  return (
                    <div
                      key={idx}
                      className={`bg-slate-100 rounded-lg overflow-hidden border border-slate-200/90 shadow-2xs relative group flex items-center justify-center w-full h-full min-h-0 min-w-0 transition-all duration-200 hover:border-blue-400 hover:shadow-xs ${extraWrapperClass}`}
                    >
                      <SafeLazyImage
                        src={displayUrl}
                        alt={`Activity Photo ${idx + 1}`}
                        crossOrigin="anonymous"
                        imageFitMode={imageFitMode}
                        onClick={() => onImageClick(imgUrl)}
                        fallbacks={fallbacks}
                        title="คลิกเพื่อดูรูปภาพขนาดเต็มและดาวน์โหลด"
                      />

                      {/* Hover Hint Overlay (no-print) */}
                      <div
                        data-html2canvas-ignore="true"
                        className="absolute bottom-1.5 right-1.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none no-print"
                      >
                        <span className="bg-slate-900/75 backdrop-blur-md text-white text-[9px] font-semibold px-2 py-0.5 rounded-full shadow-md border border-white/20 flex items-center gap-1">
                          <svg className="w-2.5 h-2.5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          คลิกดูภาพเต็ม
                        </span>
                      </div>
                    </div>
                  );
                };

                if (maxImages.length === 1) {
                  // 1 Image: Takes 100% of available section space
                  return (
                    <div className="w-full h-full flex-1 min-h-0 flex justify-center items-center px-0 py-0.5">
                      {renderImg(maxImages[0], 0)}
                    </div>
                  );
                } else if (maxImages.length === 2) {
                  // 2 Images: 2 Balanced Columns filling 100% height and width
                  return (
                    <div className="grid grid-cols-2 gap-2 px-0 w-full h-full flex-1 min-h-0 py-0.5">
                      {maxImages.map((img, idx) => renderImg(img, idx))}
                    </div>
                  );
                } else if (maxImages.length === 3) {
                  // 3 Images: 3 Equal Columns filling 100% height and width
                  return (
                    <div className="grid grid-cols-3 gap-2 px-0 w-full h-full flex-1 min-h-0 py-0.5">
                      {maxImages.map((img, idx) => renderImg(img, idx))}
                    </div>
                  );
                } else if (maxImages.length === 4) {
                  // 4 Images: 2x2 Equal Grid filling 100% available area
                  return (
                    <div className="grid grid-cols-2 grid-rows-2 gap-1.5 px-0 w-full h-full flex-1 min-h-0 py-0.5 overflow-hidden">
                      {maxImages.map((img, idx) => renderImg(img, idx))}
                    </div>
                  );
                } else if (maxImages.length === 5) {
                  // 5 Images: Top 3, Bottom 2 filling 100% available area
                  return (
                    <div className="grid grid-rows-2 gap-1.5 px-0 w-full h-full flex-1 min-h-0 py-0.5 overflow-hidden">
                      <div className="grid grid-cols-3 gap-1.5 w-full h-full min-h-0">
                        {maxImages.slice(0, 3).map((img, idx) => renderImg(img, idx))}
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 w-full h-full min-h-0">
                        {maxImages.slice(3, 5).map((img, idx) => renderImg(img, idx + 3))}
                      </div>
                    </div>
                  );
                } else {
                  // 6 Images: 3x2 Grid filling 100% available area
                  return (
                    <div className="grid grid-cols-3 grid-rows-2 gap-1.5 px-0 w-full h-full flex-1 min-h-0 py-0.5 overflow-hidden">
                      {maxImages.slice(0, 6).map((img, idx) => renderImg(img, idx))}
                    </div>
                  );
                }
              })() : (
                <p className="text-slate-400 italic pl-4 text-[11px] py-2">- ไม่มีการแนบภาพประกอบ -</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Signature and Approval Footer */}
      <div className="mt-auto flex justify-between items-start avoid-page-break relative z-10 w-full border-t border-slate-200 pt-2 pb-0 px-2" style={{ marginTop: 'auto' }}>
        {/* Left Side: Supervisor comment and Approval signature */}
        <div className="w-[50%] text-xs text-black flex flex-col pr-3">
          <p className="font-normal text-[12px] text-black text-center mb-1">ความเห็นของผู้ตรวจ / ผู้บังคับบัญชา</p>
          <div className="space-y-2 my-1 w-full">
            <div className="border-b border-slate-300 w-full h-3"></div>
            <div className="border-b border-slate-300 w-full h-3"></div>
          </div>
          
          <div className="flex flex-col items-center w-full mt-2 relative group/principal select-none">
            <div
              data-html2canvas-ignore="true"
              className="absolute -top-3 right-0 text-[9px] text-blue-500 opacity-0 group-hover/principal:opacity-100 transition-opacity no-print flex items-center gap-1 pointer-events-none z-10"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              พิมพ์แก้ไขยศ/ชื่อในช่องด้านล่าง
            </div>

            <div className="w-full max-w-[240px] flex flex-col items-center">
              {/* Line 1: ลงชื่อ + ยศ (Aligned to left of signature block per Thai Police regulations) */}
              <div className="w-full flex items-center justify-start pl-3 text-[12px] font-normal text-black gap-1 leading-relaxed min-h-[24px]">
                <span className="shrink-0">ลงชื่อ</span>
                <input
                  type="text"
                  value={principalRank}
                  onChange={(e) => {
                    setPrincipalRank(e.target.value);
                    handlePrincipalChange(e.target.value, principalName);
                  }}
                  className="text-left bg-transparent hover:bg-slate-50 focus:bg-white border-b border-transparent hover:border-slate-300 focus:border-blue-400 outline-none text-black px-1 py-0.5 text-[12px] font-normal transition-all print-input placeholder-slate-300 leading-relaxed"
                  style={{ width: `${Math.max(40, getThaiDisplayWidth(principalRank || 'ยศ', 28))}px` }}
                  placeholder="ยศ"
                  title="พิมพ์เพื่อแก้ไข ยศ"
                />
              </div>

              {/* Line 2: (ชื่อ-นามสกุล) Centered with dynamic tight parenthesis */}
              <div className="flex items-center justify-center mt-1.5 text-[12px] font-normal text-black w-full leading-relaxed min-h-[24px]">
                <span className="shrink-0">(</span>
                <input
                  type="text"
                  value={principalName}
                  onChange={(e) => {
                    setPrincipalName(e.target.value);
                    handlePrincipalChange(principalRank, e.target.value);
                  }}
                  className="text-center bg-transparent hover:bg-slate-50 focus:bg-white border-b border-transparent hover:border-slate-300 focus:border-blue-400 outline-none text-black px-0.5 py-0.5 text-[12px] font-normal transition-all print-input placeholder-slate-300 leading-relaxed"
                  style={{ width: `${getThaiDisplayWidth(principalName || 'ชื่อ-สกุล', 10)}px` }}
                  placeholder="ชื่อ-สกุล"
                  title="พิมพ์เพื่อแก้ไข ชื่อ-สกุล"
                />
                <span className="shrink-0">)</span>
              </div>

              {/* Line 3: ตำแหน่ง Centered with ample line height */}
              <p className="text-black font-normal text-center mt-1 text-[11px] leading-[1.65] w-full break-words px-1">
                ตำแหน่ง ครูใหญ่{schoolName ? ' ' + convertToThaiNumerals(schoolName) : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Self Evaluation, Reporter signature */}
        <div className="w-[50%] text-xs text-black flex flex-col pl-3 border-l border-slate-200">
          {/* Self evaluation form checkable ticks */}
          <div className="mb-1 flex flex-col pb-0.5">
            <p className="font-normal text-black mb-1 text-[11.5px] text-center">การประเมินตนเองในการจัดการเรียนรู้ :</p>
            <div className="grid grid-cols-2 gap-y-1 gap-x-3 text-justify mt-0 ml-[30px]" style={{ textAlign: 'justify', marginTop: '0px', marginLeft: '30px' }}>
              {['ดีมาก', 'ดี', 'พอใช้', 'ปรับปรุง'].map(option => (
                <label key={option} className="flex items-center gap-1.5 cursor-pointer text-[11.5px] font-normal text-black select-none">
                  {/* Custom checkable square that renders identically in html2canvas and prints perfectly */}
                  <div className="w-3.5 h-3.5 border border-slate-800 rounded-sm flex items-center justify-center shrink-0 bg-white">
                    {selfEval === option && (
                      <span className="text-[10px] text-slate-950 font-extrabold leading-none -mt-0.5 select-none">✓</span>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    checked={selfEval === option}
                    onChange={() => handleEvalClick(option)}
                    className="sr-only"
                  />
                  <span className="font-normal">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-b border-slate-200 my-1 w-full"></div>

          {/* Reporter Sign section */}
          <div className="flex flex-col items-center mt-1 w-full relative group/reporter select-none">
            <div
              data-html2canvas-ignore="true"
              className="absolute -top-3 right-0 text-[9px] text-blue-500 opacity-0 group-hover/reporter:opacity-100 transition-opacity no-print flex items-center gap-1 pointer-events-none z-10"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              พิมพ์แก้ไขยศ/ชื่อในช่องด้านล่าง
            </div>

            <div className="w-full max-w-[240px] flex flex-col items-center">
              {/* Line 1: ลงชื่อ + ยศ (Aligned to left of signature block per Thai Police regulations) */}
              <div className="w-full flex items-center justify-start pl-3 text-[12px] font-normal text-black gap-1 leading-relaxed min-h-[24px]">
                <span className="shrink-0">ลงชื่อ</span>
                <input
                  type="text"
                  value={userReporterRank}
                  onChange={(e) => setUserReporterRank(e.target.value)}
                  className="text-left bg-transparent hover:bg-slate-50 focus:bg-white border-b border-transparent hover:border-slate-300 focus:border-blue-400 outline-none text-black px-1 py-0.5 text-[12px] font-normal transition-all print-input placeholder-slate-300 leading-relaxed"
                  style={{ width: `${Math.max(40, getThaiDisplayWidth(userReporterRank || 'ยศ', 28))}px` }}
                  placeholder="ยศ"
                  title="พิมพ์เพื่อแก้ไข ยศผู้รายงาน"
                />
              </div>

              {/* Line 2: (ชื่อ-นามสกุล) Centered with dynamic tight parenthesis */}
              <div className="flex items-center justify-center mt-1.5 text-[12px] font-normal text-black w-full leading-relaxed min-h-[24px]">
                <span className="shrink-0">(</span>
                <input
                  type="text"
                  value={userReporterName}
                  onChange={(e) => setUserReporterName(e.target.value)}
                  className="text-center bg-transparent hover:bg-slate-50 focus:bg-white border-b border-transparent hover:border-slate-300 focus:border-blue-400 outline-none text-black px-0.5 py-0.5 text-[12px] font-normal transition-all print-input placeholder-slate-300 leading-relaxed"
                  style={{ width: `${getThaiDisplayWidth(userReporterName || 'ชื่อ-สกุล ผู้รายงาน', 10)}px` }}
                  placeholder="ชื่อ-สกุล ผู้รายงาน"
                  title="พิมพ์เพื่อแก้ไข ชื่อ-สกุลผู้รายงาน"
                />
                <span className="shrink-0">)</span>
              </div>

              {/* Line 3: ตำแหน่ง Centered with ample line height */}
              <p className="text-black font-normal text-center mt-1 text-[11px] leading-[1.65] w-full break-words px-1">
                ตำแหน่ง ผู้รายงาน
              </p>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
