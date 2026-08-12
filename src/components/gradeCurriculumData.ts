export interface GradeLevelConfig {
  id: string;
  code: string;
  name: string;
  shortName: string;
  stage: 'early' | 'primary_lower' | 'primary_upper' | 'secondary' | 'special';
  stageLabel: string;
  icon: string;
  colorClass: string;
  activeClass: string;
  badgeClass: string;
  borderClass: string;
  targetChapters: number;
  description: string;
}

export const GRADE_LEVELS: GradeLevelConfig[] = [
  {
    id: 'all',
    code: 'ALL',
    name: 'ทุกระดับชั้นเรียน (อนุบาล 3 - มัธยมศึกษาปีที่ 3)',
    shortName: 'ทุกชั้นเรียน',
    stage: 'early',
    stageLabel: 'ภาพรวมทุกช่วงชั้น',
    icon: '🌟',
    colorClass: 'text-purple-700 bg-purple-50 hover:bg-purple-100',
    activeClass: 'bg-purple-900 text-white border-purple-900 shadow-md ring-2 ring-purple-200',
    badgeClass: 'bg-purple-100 text-purple-900 border-purple-200',
    borderClass: 'border-purple-200',
    targetChapters: 6,
    description: 'ครอบคลุมทุกระดับชั้นเรียนตามหลักสูตรการศึกษาขั้นพื้นฐาน'
  },
  {
    id: 'อ.3',
    code: 'K3',
    name: 'อนุบาล 3 (ระดับปฐมวัย)',
    shortName: 'อ. 3',
    stage: 'early',
    stageLabel: 'ระดับปฐมวัย',
    icon: '🧸',
    colorClass: 'text-pink-700 bg-pink-50 hover:bg-pink-100',
    activeClass: 'bg-pink-600 text-white border-pink-600 shadow-md ring-2 ring-pink-200',
    badgeClass: 'bg-pink-100 text-pink-900 border-pink-200',
    borderClass: 'border-pink-200',
    targetChapters: 5,
    description: 'เสริมสร้างพัฒนาการ 4 ด้าน ทักษะชีวิต ภาษาปฐมวัย และความพร้อมการเรียนรู้'
  },
  {
    id: 'ป.1',
    code: 'P1',
    name: 'ประถมศึกษาปีที่ 1 (ป.1)',
    shortName: 'ป. 1',
    stage: 'primary_lower',
    stageLabel: 'ประถมศึกษาตอนต้น',
    icon: '🎒',
    colorClass: 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100',
    activeClass: 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-200',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    borderClass: 'border-emerald-200',
    targetChapters: 6,
    description: 'จำนวนนับ 1-100 สระ-พยัญชนะไทย Phonics A-Z สิ่งมีชีวิตรอบตัว'
  },
  {
    id: 'ป.2',
    code: 'P2',
    name: 'ประถมศึกษาปีที่ 2 (ป.2)',
    shortName: 'ป. 2',
    stage: 'primary_lower',
    stageLabel: 'ประถมศึกษาตอนต้น',
    icon: '🎒',
    colorClass: 'text-teal-700 bg-teal-50 hover:bg-teal-100',
    activeClass: 'bg-teal-600 text-white border-teal-600 shadow-md ring-2 ring-teal-200',
    badgeClass: 'bg-teal-100 text-teal-900 border-teal-200',
    borderClass: 'border-teal-200',
    targetChapters: 6,
    description: 'จำนวนนับไม่เกิน 1,000 มาตราตัวสะกด 8 มาตรา แสงและดิน เกษตรกลางวัน'
  },
  {
    id: 'ป.3',
    code: 'P3',
    name: 'ประถมศึกษาปีที่ 3 (ป.3)',
    shortName: 'ป. 3',
    stage: 'primary_lower',
    stageLabel: 'ประถมศึกษาตอนต้น',
    icon: '🎒',
    colorClass: 'text-blue-700 bg-blue-50 hover:bg-blue-100',
    activeClass: 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-200',
    badgeClass: 'bg-blue-100 text-blue-900 border-blue-200',
    borderClass: 'border-blue-200',
    targetChapters: 6,
    description: 'การคูณ-หาร เศษส่วนเบื้องต้น สำนวนไทย แรงและพลังงาน ประวัติศาสตร์ท้องถิ่น'
  },
  {
    id: 'ป.4',
    code: 'P4',
    name: 'ประถมศึกษาปีที่ 4 (ป.4)',
    shortName: 'ป. 4',
    stage: 'primary_upper',
    stageLabel: 'ประถมศึกษาตอนปลาย',
    icon: '📚',
    colorClass: 'text-cyan-700 bg-cyan-50 hover:bg-cyan-100',
    activeClass: 'bg-cyan-600 text-white border-cyan-600 shadow-md ring-2 ring-cyan-200',
    badgeClass: 'bg-cyan-100 text-cyan-900 border-cyan-200',
    borderClass: 'border-cyan-200',
    targetChapters: 6,
    description: 'จำนวนมากกว่า 100,000 ทศนิยม-เศษส่วน คำนาม-สรรพนาม การจำแนกสิ่งมีชีวิต'
  },
  {
    id: 'ป.5',
    code: 'P5',
    name: 'ประถมศึกษาปีที่ 5 (ป.5)',
    shortName: 'ป. 5',
    stage: 'primary_upper',
    stageLabel: 'ประถมศึกษาตอนปลาย',
    icon: '📚',
    colorClass: 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100',
    activeClass: 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-200',
    badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-200',
    borderClass: 'border-indigo-200',
    targetChapters: 6,
    description: 'ร้อยละ บัญญัติไตรยางศ์ กาพย์ยานี ๑๑ การเปลี่ยนแปลงสาร ภูมิศาสตร์ไทย'
  },
  {
    id: 'ป.6',
    code: 'P6',
    name: 'ประถมศึกษาปีที่ 6 (ป.6)',
    shortName: 'ป. 6',
    stage: 'primary_upper',
    stageLabel: 'ประถมศึกษาตอนปลาย',
    icon: '📚',
    colorClass: 'text-violet-700 bg-violet-50 hover:bg-violet-100',
    activeClass: 'bg-violet-600 text-white border-violet-600 shadow-md ring-2 ring-violet-200',
    badgeClass: 'bg-violet-100 text-violet-900 border-violet-200',
    borderClass: 'border-violet-200',
    targetChapters: 6,
    description: 'สมการและ ห.ร.ม./ค.ร.น. ขุนช้างขุนแผน ระบบร่างกาย O-NET Prep'
  },
  {
    id: 'ม.1',
    code: 'M1',
    name: 'มัธยมศึกษาปีที่ 1 (ม.1)',
    shortName: 'ม. 1',
    stage: 'secondary',
    stageLabel: 'มัธยมศึกษาตอนต้น',
    icon: '🎓',
    colorClass: 'text-amber-700 bg-amber-50 hover:bg-amber-100',
    activeClass: 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-200',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-200',
    borderClass: 'border-amber-200',
    targetChapters: 6,
    description: 'จำนวนเต็มและสมการเชิงเส้น นิราศภูเขาทอง เซลล์พืชสัตว์ ประวัติศาสตร์สุโขทัย'
  },
  {
    id: 'ม.2',
    code: 'M2',
    name: 'มัธยมศึกษาปีที่ 2 (ม.2)',
    shortName: 'ม. 2',
    stage: 'secondary',
    stageLabel: 'มัธยมศึกษาตอนต้น',
    icon: '🎓',
    colorClass: 'text-orange-700 bg-orange-50 hover:bg-orange-100',
    activeClass: 'bg-orange-600 text-white border-orange-600 shadow-md ring-2 ring-orange-200',
    badgeClass: 'bg-orange-100 text-orange-900 border-orange-200',
    borderClass: 'border-orange-200',
    targetChapters: 6,
    description: 'ทฤษฎีบทพีทาโกรัส ศิลาจารึกหลักที่ ๑ สารละลายและแรง ประวัติศาสตร์อยุธยา'
  },
  {
    id: 'ม.3',
    code: 'M3',
    name: 'มัธยมศึกษาปีที่ 3 (ม.3)',
    shortName: 'ม. 3',
    stage: 'secondary',
    stageLabel: 'มัธยมศึกษาตอนต้น',
    icon: '🎓',
    colorClass: 'text-rose-700 bg-rose-50 hover:bg-rose-100',
    activeClass: 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-200',
    badgeClass: 'bg-rose-100 text-rose-900 border-rose-200',
    borderClass: 'border-rose-200',
    targetChapters: 6,
    description: 'ระบบสมการเชิงเส้นสองตัวแปร พระอภัยมณี พันธุศาสตร์และระบบนิเวศ'
  },
  {
    id: 'ควบ',
    code: 'COMB',
    name: 'รร.ที่จัดการเรียนรู้แบบควบชั้นเรียน',
    shortName: 'ควบชั้น',
    stage: 'special',
    stageLabel: 'รูปแบบพิเศษ',
    icon: '👥',
    colorClass: 'text-fuchsia-700 bg-fuchsia-50 hover:bg-fuchsia-100',
    activeClass: 'bg-fuchsia-600 text-white border-fuchsia-600 shadow-md ring-2 ring-fuchsia-200',
    badgeClass: 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-200',
    borderClass: 'border-fuchsia-200',
    targetChapters: 6,
    description: 'การจัดการเรียนรู้บูรณาการแบบควบรวมชั้น (เช่น ป.1-2, ป.3-4, ป.5-6)'
  },
  {
    id: 'มฝ.',
    code: 'MULTI',
    name: 'รร.ที่มีการจัดการเรียนรู้มากกว่า 1 ห้องต่อชั้นเรียน',
    shortName: 'มฝ. (คู่ขนาน)',
    stage: 'special',
    stageLabel: 'รูปแบบพิเศษ',
    icon: '🏫',
    colorClass: 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100',
    activeClass: 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-200',
    badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-200',
    borderClass: 'border-indigo-200',
    targetChapters: 6,
    description: 'การจัดการเรียนรู้ห้องเรียนคู่ขนาน แยกกลุ่มย่อยพร้อมบันทึกสมรรถนะรายห้อง'
  }
];

export const STAGE_FILTERS = [
  { id: 'all', label: 'ทุกช่วงชั้น (12 ชั้นเรียน)', icon: '🌟' },
  { id: 'early', label: '🧸 ปฐมวัย (อ.3)', icon: '🧸' },
  { id: 'primary_lower', label: '🎒 ประถมต้น (ป.1 - ป.3)', icon: '🎒' },
  { id: 'primary_upper', label: '📚 ประถมปลาย (ป.4 - ป.6)', icon: '📚' },
  { id: 'secondary', label: '🎓 มัธยมต้น (ม.1 - ม.3)', icon: '🎓' },
  { id: 'special', label: '👥 รูปแบบพิเศษ (ควบ/มฝ.)', icon: '👥' }
];

export const SUBJECT_THEMES: Record<string, {
  bg: string;
  border: string;
  text: string;
  badge: string;
  line: string;
  glow: string;
  iconColor: string;
  lightBg: string;
}> = {
  'คณิตศาสตร์': {
    bg: 'bg-blue-50/70',
    border: 'border-blue-200',
    text: 'text-blue-900',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    line: 'bg-blue-500',
    glow: 'ring-blue-200 bg-blue-600',
    iconColor: 'text-blue-600',
    lightBg: 'bg-blue-500/10'
  },
  'ภาษาไทย': {
    bg: 'bg-emerald-50/70',
    border: 'border-emerald-200',
    text: 'text-emerald-900',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    line: 'bg-emerald-500',
    glow: 'ring-emerald-200 bg-emerald-600',
    iconColor: 'text-emerald-600',
    lightBg: 'bg-emerald-500/10'
  },
  'ภาษาอังกฤษ': {
    bg: 'bg-cyan-50/70',
    border: 'border-cyan-200',
    text: 'text-cyan-900',
    badge: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    line: 'bg-cyan-500',
    glow: 'ring-cyan-200 bg-cyan-600',
    iconColor: 'text-cyan-600',
    lightBg: 'bg-cyan-500/10'
  },
  'วิทยาศาสตร์': {
    bg: 'bg-indigo-50/70',
    border: 'border-indigo-200',
    text: 'text-indigo-900',
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    line: 'bg-indigo-500',
    glow: 'ring-indigo-200 bg-indigo-600',
    iconColor: 'text-indigo-600',
    lightBg: 'bg-indigo-500/10'
  },
  'วิทยาศาสตร์และเทคโนโลยี': {
    bg: 'bg-indigo-50/70',
    border: 'border-indigo-200',
    text: 'text-indigo-900',
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    line: 'bg-indigo-500',
    glow: 'ring-indigo-200 bg-indigo-600',
    iconColor: 'text-indigo-600',
    lightBg: 'bg-indigo-500/10'
  },
  'การงานอาชีพ': {
    bg: 'bg-purple-50/70',
    border: 'border-purple-200',
    text: 'text-purple-900',
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
    line: 'bg-purple-500',
    glow: 'ring-purple-200 bg-purple-600',
    iconColor: 'text-purple-600',
    lightBg: 'bg-purple-500/10'
  },
  'สังคมศึกษา': {
    bg: 'bg-amber-50/70',
    border: 'border-amber-200',
    text: 'text-amber-900',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    line: 'bg-amber-500',
    glow: 'ring-amber-200 bg-amber-600',
    iconColor: 'text-amber-600',
    lightBg: 'bg-amber-500/10'
  },
  'สังคมศึกษา ศาสนา และวัฒนธรรม': {
    bg: 'bg-amber-50/70',
    border: 'border-amber-200',
    text: 'text-amber-900',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    line: 'bg-amber-500',
    glow: 'ring-amber-200 bg-amber-600',
    iconColor: 'text-amber-600',
    lightBg: 'bg-amber-500/10'
  },
  'ศิลปะ': {
    bg: 'bg-pink-50/70',
    border: 'border-pink-200',
    text: 'text-pink-900',
    badge: 'bg-pink-100 text-pink-800 border-pink-200',
    line: 'bg-pink-500',
    glow: 'ring-pink-200 bg-pink-600',
    iconColor: 'text-pink-600',
    lightBg: 'bg-pink-500/10'
  },
  'สุขศึกษา': {
    bg: 'bg-rose-50/70',
    border: 'border-rose-200',
    text: 'text-rose-900',
    badge: 'bg-rose-100 text-rose-800 border-rose-200',
    line: 'bg-rose-500',
    glow: 'ring-rose-200 bg-rose-600',
    iconColor: 'text-rose-600',
    lightBg: 'bg-rose-500/10'
  },
  'สุขศึกษาและพลศึกษา': {
    bg: 'bg-rose-50/70',
    border: 'border-rose-200',
    text: 'text-rose-900',
    badge: 'bg-rose-100 text-rose-800 border-rose-200',
    line: 'bg-rose-500',
    glow: 'ring-rose-200 bg-rose-600',
    iconColor: 'text-rose-600',
    lightBg: 'bg-rose-500/10'
  },
  'ประวัติศาสตร์': {
    bg: 'bg-orange-50/70',
    border: 'border-orange-200',
    text: 'text-orange-900',
    badge: 'bg-orange-100 text-orange-800 border-orange-200',
    line: 'bg-orange-500',
    glow: 'ring-orange-200 bg-orange-600',
    iconColor: 'text-orange-600',
    lightBg: 'bg-orange-500/10'
  },
  'ซ่อมเสริม': {
    bg: 'bg-teal-50/70',
    border: 'border-teal-200',
    text: 'text-teal-900',
    badge: 'bg-teal-100 text-teal-800 border-teal-200',
    line: 'bg-teal-500',
    glow: 'ring-teal-200 bg-teal-600',
    iconColor: 'text-teal-600',
    lightBg: 'bg-teal-500/10'
  }
};

export const DEFAULT_THEME = {
  bg: 'bg-slate-50/70',
  border: 'border-slate-200',
  text: 'text-slate-900',
  badge: 'bg-slate-100 text-slate-800 border-slate-200',
  line: 'bg-slate-500',
  glow: 'ring-slate-200 bg-slate-600',
  iconColor: 'text-slate-600',
  lightBg: 'bg-slate-500/10'
};

// Canonical curriculum blueprints customized by Grade Level for Thai Border Patrol Police Schools (DLTV)
export const GRADE_CURRICULUM_BLUEPRINTS: Record<string, Record<string, { totalChapters: number; topics: { num: number; title: string; defaultDate: string; period: number }[] }>> = {
  'อ.3': {
    'กิจกรรมเสริมประสบการณ์': {
      totalChapters: 5,
      topics: [
        { num: 1, title: 'หน่วยที่ ๑: ตัวเราและประสาทสัมผัสทั้ง ๕', defaultDate: '๑๒ มิถุนายน ๒๕๖๙', period: 1 },
        { num: 2, title: 'หน่วยที่ ๒: โรงเรียนและเพื่อนแสนดี', defaultDate: '๒๖ มิถุนายน ๒๕๖๙', period: 1 },
        { num: 3, title: 'หน่วยที่ ๓: ธรรมชาติ ต้นไม้ และสายน้ำ', defaultDate: '๑๐ กรกฎาคม ๒๕๖๙', period: 2 },
        { num: 4, title: 'หน่วยที่ ๔: สัตว์เลี้ยงน่ารักรอบบ้าน', defaultDate: '๒๔ กรกฎาคม ๒๕๖๙', period: 2 },
        { num: 5, title: 'หน่วยที่ ๕: คมนาคมปลอดภัยและการเดินทาง', defaultDate: '๗ สิงหาคม ๒๕๖๙', period: 2 }
      ]
    },
    'ภาษาปฐมวัย': {
      totalChapters: 5,
      topics: [
        { num: 1, title: 'นิทานภาพและการฟังเสียงพยัญชนะเบื้องต้น', defaultDate: '๑๕ มิถุนายน ๒๕๖๙', period: 2 },
        { num: 2, title: 'คำศัพท์รูปภาพสัตว์ สิ่งของ และผลไม้', defaultDate: '๓ กรกฎาคม ๒๕๖๙', period: 2 },
        { num: 3, title: 'การเล่าเรื่องจากภาพและการออกเสียงคำคล้องจอง', defaultDate: '๑๗ กรกฎาคม ๒๕๖๙', period: 3 },
        { num: 4, title: 'การลากเส้นพื้นฐาน ๑๓ เส้นเตรียมความพร้อมเขียน', defaultDate: '๓๑ กรกฎาคม ๒๕๖๙', period: 3 },
        { num: 5, title: 'การสื่อสารความรู้สึกและการสนทนากลุ่ม', defaultDate: '๑๔ สิงหาคม ๒๕๖๙', period: 3 }
      ]
    },
    'คณิตศาสตร์ปฐมวัย': {
      totalChapters: 5,
      topics: [
        { num: 1, title: 'การเปรียบเทียบขนาด (เล็ก-ใหญ่, สูง-เตี้ย)', defaultDate: '๑๘ มิถุนายน ๒๕๖๙', period: 1 },
        { num: 2, title: 'การนับจำนวนนับ ๑ - ๑๐ ด้วยสื่อธรรมชาติ', defaultDate: '๒ กรกฎาคม ๒๕๖๙', period: 1 },
        { num: 3, title: 'การจับคู่หนึ่งต่อหนึ่งและรูปทรงเรขาคณิต', defaultDate: '๑๖ กรกฎาคม ๒๕๖๙', period: 2 },
        { num: 4, title: 'การจัดหมวดหมู่สีและขนาดสิ่งของ', defaultDate: '๓๐ กรกฎาคม ๒๕๖๙', period: 1 },
        { num: 5, title: 'การเพิ่ม-ลดจำนวนอย่างง่ายด้วยผลไม้จำลอง', defaultDate: '๑๓ สิงหาคม ๒๕๖๙', period: 2 }
      ]
    },
    'ศิลปะสร้างสรรค์': {
      totalChapters: 5,
      topics: [
        { num: 1, title: 'การฉีก ตัด ปะ กระดาษสีตามจินตนาการ', defaultDate: '๑๙ มิถุนายน ๒๕๖๙', period: 3 },
        { num: 2, title: 'การปั้นดินน้ำมันและแป้งโดว์รูปทรงสัตว์', defaultDate: '๘ กรกฎาคม ๒๕๖๙', period: 3 },
        { num: 3, title: 'การพิมพ์ภาพจากนิ้วมือและวัสดุธรรมชาติ', defaultDate: '๒๒ กรกฎาคม ๒๕๖๙', period: 3 },
        { num: 4, title: 'การระบายสีเทียนและการวาดภาพอิสระ', defaultDate: '๕ สิงหาคม ๒๕๖๙', period: 4 },
        { num: 5, title: 'การประดิษฐ์ของเล่นจากเศษวัสดุท้องถิ่น', defaultDate: '๑๙ สิงหาคม ๒๕๖๙', period: 4 }
      ]
    }
  },
  'ป.1': {
    'คณิตศาสตร์': {
      totalChapters: 6,
      topics: [
        { num: 1, title: 'จำนวนนับ ๑ ถึง ๑๐ และ ๐', defaultDate: '๑๗ มิถุนายน ๒๕๖๙', period: 1 },
        { num: 2, title: 'การบวกจำนวนสองจำนวนที่มีผลบวกไม่เกิน ๙', defaultDate: '๒ กรกฎาคม ๒๕๖๙', period: 1 },
        { num: 3, title: 'การลบจำนวนสองจำนวนที่มีตัวตั้งไม่เกิน ๙', defaultDate: '๑๖ กรกฎาคม ๒๕๖๙', period: 1 },
        { num: 4, title: 'จำนวนนับ ๑๑ ถึง ๒๐ และการเขียนตัวเลขไทย', defaultDate: '๓๐ กรกฎาคม ๒๕๖๙', period: 2 },
        { num: 5, title: 'การเปรียบเทียบและการเรียงลำดับจำนวน', defaultDate: '๑๓ สิงหาคม ๒๕๖๙', period: 2 },
        { num: 6, title: 'รูปเรขาคณิตสองมิติ (ทรงกลม สามเหลี่ยม สี่เหลี่ยม)', defaultDate: '๒๗ สิงหาคม ๒๕๖๙', period: 2 }
      ]
    },
    'ภาษาไทย': {
      totalChapters: 6,
      topics: [
        { num: 1, title: 'พยัญชนะไทย ๔๔ ตัว และการออกเสียง อักษร ๓ หมู่', defaultDate: '๑๘ มิถุนายน ๒๕๖๙', period: 2 },
        { num: 2, title: 'สระเดี่ยวเสียงสั้น-ยาว (อะ อา อิ อี อึ อือ อุ อู)', defaultDate: '๓ กรกฎาคม ๒๕๖๙', period: 2 },
        { num: 3, title: 'การประสมคำในมาตราแม่ ก กา', defaultDate: '๑๗ กรกฎาคม ๒๕๖๙', period: 2 },
        { num: 4, title: 'วรรณคดีลำนำ: เจ้าเนื้ออ่อน เอย และบทอาขยาน', defaultDate: '๓๑ กรกฎาคม ๒๕๖๙', period: 3 },
        { num: 5, title: 'การคัดลายมือตัวบรรจงเต็มบรรทัด', defaultDate: '๑๔ สิงหาคม ๒๕๖๙', period: 3 },
        { num: 6, title: 'การอ่านนิทานสั้นและตอบคำถามจับใจความ', defaultDate: '๒๘ สิงหาคม ๒๕๖๙', period: 3 }
      ]
    },
    'ภาษาอังกฤษ': {
      totalChapters: 5,
      topics: [
        { num: 1, title: 'Unit 1: Alphabet A-Z Phonics & Sounds', defaultDate: '๒๐ มิถุนายน ๒๕๖๙', period: 2 },
        { num: 2, title: 'Unit 2: Greetings, Hello & Goodbye', defaultDate: '๘ กรกฎาคม ๒๕๖๙', period: 2 },
        { num: 3, title: 'Unit 3: Classroom Objects (Book, Pen, Bag)', defaultDate: '๒๒ กรกฎาคม ๒๕๖๙', period: 2 },
        { num: 4, title: 'Unit 4: Numbers 1-10 & Colors', defaultDate: '๖ สิงหาคม ๒๕๖๙', period: 1 },
        { num: 5, title: 'Unit 5: My Body & Face Parts', defaultDate: '๒๐ สิงหาคม ๒๕๖๙', period: 2 }
      ]
    },
    'วิทยาศาสตร์': {
      totalChapters: 5,
      topics: [
        { num: 1, title: 'สิ่งมีชีวิตและสิ่งไม่มีชีวิตรอบตัวเรา', defaultDate: '๒๑ มิถุนายน ๒๕๖๙', period: 3 },
        { num: 2, title: 'ส่วนประกอบของพืชและหน้าที่ (ราก ลำต้น ใบ ดอก)', defaultDate: '๙ กรกฎาคม ๒๕๖๙', period: 3 },
        { num: 3, title: 'โครงสร้างภายนอกของสัตว์และแหล่งที่อยู่', defaultDate: '๒๓ กรกฎาคม ๒๕๖๙', period: 3 },
        { num: 4, title: 'ร่างกายของเราและการดูแลรักษาประสาทสัมผัส', defaultDate: '๗ สิงหาคม ๒๕๖๙', period: 4 },
        { num: 5, title: 'หินและวัสดุรอบตัวในชีวิตประจำวัน', defaultDate: '๒๑ สิงหาคม ๒๕๖๙', period: 4 }
      ]
    }
  },
  'ป.6': {
    'คณิตศาสตร์': {
      totalChapters: 6,
      topics: [
        { num: 1, title: 'ตัวประกอบของจำนวนนับ และจำนวนเฉพาะ', defaultDate: '๑๗ มิถุนายน ๒๕๖๙', period: 1 },
        { num: 2, title: 'การหา ห.ร.ม. และ ค.ร.น. และการแก้โจทย์ปัญหา', defaultDate: '๒ กรกฎาคม ๒๕๖๙', period: 1 },
        { num: 3, title: 'การบวก ลบ คูณ หารระคนของเศษส่วนและจำนวนคละ', defaultDate: '๑๖ กรกฎาคม ๒๕๖๙', period: 1 },
        { num: 4, title: 'ทศนิยม อัตราส่วน ร้อยละ และการคำนวณกำไร-ขาดทุน', defaultDate: '๓๐ กรกฎาคม ๒๕๖๙', period: 2 },
        { num: 5, title: 'สมการเชิงเส้นตัวแปรเดียวและการแก้สมการ', defaultDate: '๑๓ สิงหาคม ๒๕๖๙', period: 2 },
        { num: 6, title: 'รูปเรขาคณิตสามมิติ ปริมาตร และแผนภูมิรูปวงกลม', defaultDate: '๒๗ สิงหาคม ๒๕๖๙', period: 2 }
      ]
    },
    'ภาษาไทย': {
      totalChapters: 6,
      topics: [
        { num: 1, title: 'คำภาษาต่างประเทศในภาษาไทย (บาลี-สันสกฤต, เขมร, อังกฤษ)', defaultDate: '๑๘ มิถุนายน ๒๕๖๙', period: 2 },
        { num: 2, title: 'กลุ่มคำ ประโยคความรวม และประโยคความซ้อน', defaultDate: '๓ กรกฎาคม ๒๕๖๙', period: 2 },
        { num: 3, title: 'ระดับภาษาและคำราชาศัพท์ที่ควรรู้', defaultDate: '๑๗ กรกฎาคม ๒๕๖๙', period: 2 },
        { num: 4, title: 'วรรณคดีลำนำ: ขุนช้างขุนแผน ตอน กำเนิดพลายงาม', defaultDate: '๓๑ กรกฎาคม ๒๕๖๙', period: 3 },
        { num: 5, title: 'การเขียนเรียงความ ย่อความ และจดหมายทางการ', defaultDate: '๑๔ สิงหาคม ๒๕๖๙', period: 3 },
        { num: 6, title: 'การอ่านวิเคราะห์ วิจารณ์ และการเตรียมสอบ O-NET', defaultDate: '๒๘ สิงหาคม ๒๕๖๙', period: 3 }
      ]
    },
    'วิทยาศาสตร์': {
      totalChapters: 6,
      topics: [
        { num: 1, title: 'ระบบย่อยอาหารและระบบขับถ่ายของมนุษย์', defaultDate: '๒๑ มิถุนายน ๒๕๖๙', period: 3 },
        { num: 2, title: 'ระบบหมุนเวียนเลือดและระบบหายใจ', defaultDate: '๙ กรกฎาคม ๒๕๖๙', period: 3 },
        { num: 3, title: 'การแยกสารเนื้อผสม (การกรอง การตกตะกอน การระเหยแห้ง)', defaultDate: '๒๓ กรกฎาคม ๒๕๖๙', period: 3 },
        { num: 4, title: 'วงจรไฟฟ้าอย่างง่ายและแม่เหล็กไฟฟ้า', defaultDate: '๗ สิงหาคม ๒๕๖๙', period: 4 },
        { num: 5, title: 'หิน ซากดึกดำบรรพ์ และปรากฏการณ์ธรณีพิบัติภัย', defaultDate: '๒๑ สิงหาคม ๒๕๖๙', period: 4 },
        { num: 6, title: 'ดาราศาสตร์ เทคโนโลยีอวกาศ และระบบสุริยะ', defaultDate: '๒๙ สิงหาคม ๒๕๖๙', period: 4 }
      ]
    }
  },
  'ม.3': {
    'คณิตศาสตร์': {
      totalChapters: 6,
      topics: [
        { num: 1, title: 'ระบบสมการเชิงเส้นสองตัวแปรและการแก้กราฟ', defaultDate: '๑๗ มิถุนายน ๒๕๖๙', period: 1 },
        { num: 2, title: 'ฟังก์ชันกำลังสองและพาราโบลา', defaultDate: '๒ กรกฎาคม ๒๕๖๙', period: 1 },
        { num: 3, title: 'พีระมิด กรวย และทรงกลม (พื้นที่ผิวและปริมาตร)', defaultDate: '๑๖ กรกฎาคม ๒๕๖๙', period: 1 },
        { num: 4, title: 'ความน่าจะเป็นและการสุ่มตัวอย่าง', defaultDate: '๓๐ กรกฎาคม ๒๕๖๙', period: 2 },
        { num: 5, title: 'สถิติ แผนภาพกล่อง และการกระจายข้อมูล', defaultDate: '๑๓ สิงหาคม ๒๕๖๙', period: 2 },
        { num: 6, title: 'อัตราส่วนตรีโกณมิติและการนำไปใช้แก้โจทย์ปัญหา', defaultDate: '๒๗ สิงหาคม ๒๕๖๙', period: 2 }
      ]
    },
    'วิทยาศาสตร์': {
      totalChapters: 6,
      topics: [
        { num: 1, title: 'พันธุศาสตร์ โครโมโซม ยีน และการถ่ายทอดลักษณะทางพันธุกรรม', defaultDate: '๒๑ มิถุนายน ๒๕๖๙', period: 3 },
        { num: 2, title: 'คลื่นกล คลื่นแม่เหล็กไฟฟ้า และสเปกตรัมแสง', defaultDate: '๙ กรกฎาคม ๒๕๖๙', period: 3 },
        { num: 3, title: 'ปฏิกิริยาเคมี วัฏจักรคาร์บอน และวัสดุศาสตร์สมัยใหม่', defaultDate: '๒๓ กรกฎาคม ๒๕๖๙', period: 3 },
        { num: 4, title: 'ระบบนิเวศ ความหลากหลายทางชีวภาพ และการอนุรักษ์', defaultDate: '๗ สิงหาคม ๒๕๖๙', period: 4 },
        { num: 5, title: 'ดาราศาสตร์ เอกภพ กาแล็กซี และเทคโนโลยีอวกาศ', defaultDate: '๒๑ สิงหาคม ๒๕๖๙', period: 4 },
        { num: 6, title: 'การออกแบบโครงงานวิทยาศาสตร์เพื่อชุมชน ตชด.', defaultDate: '๒๙ สิงหาคม ๒๕๖๙', period: 4 }
      ]
    },
    'ภาษาไทย': {
      totalChapters: 6,
      topics: [
        { num: 1, title: 'วรรณคดี: พระอภัยมณี ตอน พระอภัยมณีหนีนางผีเสื้อสมุทร', defaultDate: '๑๘ มิถุนายน ๒๕๖๙', period: 2 },
        { num: 2, title: 'บทพากย์เอราวัณ และคุณค่าทางวรรณศิลป์', defaultDate: '๓ กรกฎาคม ๒๕๖๙', period: 2 },
        { num: 3, title: 'อิเหนา ตอน ศึกกะหมังกุหนิง และการวิเคราะห์ตัวละคร', defaultDate: '๑๗ กรกฎาคม ๒๕๖๙', period: 2 },
        { num: 4, title: 'การเขียนโครงงาน รายงานเชิงวิชาการ และการอ้างอิง', defaultDate: '๓๑ กรกฎาคม ๒๕๖๙', period: 3 },
        { num: 5, title: 'ทักษะการพูดอภิปราย โต้วาที และการสื่อสารในที่สาธารณะ', defaultDate: '๑๔ สิงหาคม ๒๕๖๙', period: 3 },
        { num: 6, title: 'การใช้ระดับภาษา ราชาศัพท์ และภาษิตสอนใจ', defaultDate: '๒๘ สิงหาคม ๒๕๖๙', period: 3 }
      ]
    }
  }
};
