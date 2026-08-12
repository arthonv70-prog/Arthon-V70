import React, { useState } from 'react';
import {
  Trophy,
  Award,
  Shield,
  Building,
  Users,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MapPin,
  Sparkles,
  ArrowUpRight,
  Filter,
  Check,
  AlertCircle
} from 'lucide-react';
import { SubdivLeaderboardData } from '../types';

interface ComparativeLeaderboardProps {
  data: SubdivLeaderboardData[];
  onSelectSubdivFilter?: (subdivId: string) => void;
  isMultiClassroom?: boolean;
  isSecondary?: boolean;
}

export default function ComparativeLeaderboard({
  data,
  onSelectSubdivFilter,
  isMultiClassroom = false,
  isSecondary = false
}: ComparativeLeaderboardProps) {
  const [activeViewMode, setActiveViewMode] = useState<'all' | 'table' | 'charts'>('all');
  const [expandedSubdiv, setExpandedSubdiv] = useState<string | null>(null);

  // Sort data by rank (Coverage % desc, then Attendance Rate desc, then Total Reports desc)
  const rankedData = [...data].sort((a, b) => {
    if (b.coveragePct !== a.coveragePct) return b.coveragePct - a.coveragePct;
    if (b.attendanceRate !== a.attendanceRate) return b.attendanceRate - a.attendanceRate;
    return b.totalReports - a.totalReports;
  });

  // Calculate totals across all 4 subdivs
  const totalSchoolsOverall = isSecondary ? 2 : data.reduce((sum, item) => sum + item.totalSchools, 0); // 53 or 2 for secondary
  const submittedSchoolsOverall = data.reduce((sum, item) => sum + item.submittedCount, 0);
  const overallCoveragePct = totalSchoolsOverall > 0 ? Math.round((submittedSchoolsOverall / totalSchoolsOverall) * 100) : 0;
  
  const totalReportsOverall = data.reduce((sum, item) => sum + item.totalReports, 0);
  const totalPresentOverall = data.reduce((sum, item) => sum + item.attendancePresent, 0);
  const totalExpectedOverall = data.reduce((sum, item) => sum + item.attendanceTotal, 0);
  const overallAttendanceRate = totalExpectedOverall > 0 ? Math.round((totalPresentOverall / totalExpectedOverall) * 100) : 0;

  // Identify Top Leader & Action Needed Units
  const topPerformer = rankedData[0];
  const requiresSupport = [...rankedData].reverse().find(d => d.pendingSchools.length > 0) || rankedData[rankedData.length - 1];

  const getSubdivTheme = (subdivId: string) => {
    switch (subdivId) {
      case '21':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          badgeBg: 'bg-blue-600',
          barGradient: 'from-blue-600 to-indigo-600',
          iconColor: 'text-blue-600',
          lightBg: 'bg-blue-50/70',
        };
      case '22':
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-800',
          badgeBg: 'bg-emerald-600',
          barGradient: 'from-emerald-600 to-teal-600',
          iconColor: 'text-emerald-600',
          lightBg: 'bg-emerald-50/70',
        };
      case '23':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          text: 'text-purple-800',
          badgeBg: 'bg-purple-600',
          barGradient: 'from-purple-600 to-indigo-600',
          iconColor: 'text-purple-600',
          lightBg: 'bg-purple-50/70',
        };
      case '24':
      default:
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-800',
          badgeBg: 'bg-amber-600',
          barGradient: 'from-amber-600 to-orange-600',
          iconColor: 'text-amber-600',
          lightBg: 'bg-amber-50/70',
        };
    }
  };

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return {
          label: 'อันดับ 1',
          bg: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 border-amber-300 shadow-sm',
          icon: <Trophy className="w-4 h-4 text-amber-900 fill-amber-300" />,
        };
      case 1:
        return {
          label: 'อันดับ 2',
          bg: 'bg-slate-200 text-slate-800 border-slate-300',
          icon: <Award className="w-4 h-4 text-slate-600" />,
        };
      case 2:
        return {
          label: 'อันดับ 3',
          bg: 'bg-amber-100 text-amber-900 border-amber-200',
          icon: <Award className="w-4 h-4 text-amber-700" />,
        };
      default:
        return {
          label: `อันดับ ${index + 1}`,
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: <Shield className="w-3.5 h-3.5 text-slate-500" />,
        };
    }
  };

  return (
    <div className="app-card-surface p-4 sm:p-6 lg:p-7 space-y-5 sm:space-y-6 overflow-hidden relative">
      {/* Top Section Header */}
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:pb-5">
        <div className="space-y-1.5 w-full">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 typo-app-subtext font-black uppercase tracking-widest text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              <Trophy className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              EXECUTIVE LEADERBOARD
            </span>
            <span className="typo-app-subtext">
              กก.ตชด. 21, 22, 23, 24
            </span>
          </div>
          <h3 className="typo-app-h3 text-slate-900 font-extrabold text-sm sm:text-lg md:text-xl flex items-center gap-2 leading-snug truncate min-w-0 w-full">
            <span className="shrink-0">🏆</span>
            <span className="truncate">ตารางเปรียบเทียบผลงานรายกองกำกับการ</span>
          </h3>
          <p className="typo-app-body text-xs sm:text-sm text-slate-600 leading-relaxed">
            {isSecondary
              ? 'ภาพรวมการเข้าเรียน สถิติการส่งรายงาน และความครอบคลุมการจัดการศึกษาทางไกล (DLTV) เฉพาะ 2 โรงเรียนขยายโอกาส (ม.1 - ม.3)'
              : 'ภาพรวมการเข้าเรียน สถิติการส่งรายงาน และความครอบคลุมการจัดการศึกษาทางไกล (DLTV) ทั้ง 4 กองกำกับการ'}
          </p>
        </div>

        {/* View Mode Switcher Pills positioned strictly BELOW description line */}
        <div className="pt-1 flex items-center justify-start gap-1">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/80 shrink-0">
            <button
              onClick={() => setActiveViewMode('all')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeViewMode === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              แสดงทั้งหมด
            </button>
            <button
              onClick={() => setActiveViewMode('table')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeViewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-2xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ตารางอันดับ
            </button>
            <button
              onClick={() => setActiveViewMode('charts')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeViewMode === 'charts'
                  ? 'bg-white text-slate-900 shadow-2xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              กราฟเปรียบเทียบ
            </button>
          </div>
        </div>
      </div>

      {/* EXECUTIVE HIGHLIGHT CARDS (3 Executive Brief Cards organized in clean responsive tablet & desktop grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {/* Card 1: Top Performer */}
        {topPerformer && (
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-50/60 to-white rounded-2xl p-4 sm:p-5 border border-amber-200/90 shadow-2xs flex flex-col justify-between space-y-3 relative overflow-hidden min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/60 pb-2.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 bg-amber-100/90 px-2.5 py-1 rounded-full border border-amber-200 inline-flex items-center gap-1 shrink-0">
                <Trophy className="w-3.5 h-3.5 text-amber-600 fill-amber-300" />
                <span>หน่วยงานดีเยี่ยม</span>
              </span>
              <span className="text-xs font-black text-amber-800 bg-white px-2.5 py-1 rounded-md border border-amber-200 shadow-2xs shrink-0">
                อันดับ 1
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2 min-w-0">
                <span className="text-base sm:text-lg font-black text-slate-900 truncate">{topPerformer.fullName}</span>
                <span className="text-xs font-bold text-slate-500 shrink-0">({topPerformer.province})</span>
              </div>

              {/* Stats Box */}
              <div className="grid grid-cols-3 gap-2 bg-white/90 p-2.5 rounded-xl border border-amber-200/80 text-center shadow-2xs divide-x divide-amber-100 min-w-0">
                <div className="px-1 min-w-0">
                  <span className="text-[10px] sm:text-[11px] text-slate-500 font-bold block truncate">ครอบคลุม</span>
                  <span className="text-sm sm:text-base md:text-lg font-black text-emerald-700 block truncate">{topPerformer.coveragePct}%</span>
                </div>
                <div className="px-1 min-w-0">
                  <span className="text-[10px] sm:text-[11px] text-slate-500 font-bold block truncate">เข้าเรียนเฉลี่ย</span>
                  <span className="text-sm sm:text-base md:text-lg font-black text-blue-700 block truncate">{topPerformer.attendanceRate}%</span>
                </div>
                <div className="px-1 min-w-0">
                  <span className="text-[10px] sm:text-[11px] text-slate-500 font-bold block truncate">รายงานสะสม</span>
                  <span className="text-sm sm:text-base md:text-lg font-black text-indigo-700 block truncate">{topPerformer.totalReports}</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-amber-900/90 font-medium leading-relaxed bg-white/80 p-2.5 rounded-xl border border-amber-100">
              ✨ ส่งรายงานแล้ว <strong className="text-amber-950 font-bold">{topPerformer.submittedCount}/{topPerformer.totalSchools}</strong> รร. ดัชนีความพร้อม <strong className="text-emerald-700 font-bold">{topPerformer.readinessRate}%</strong>
            </p>
          </div>
        )}

        {/* Card 2: Overall Regional Overview */}
        <div className="bg-gradient-to-br from-blue-500/10 via-blue-50/50 to-white rounded-2xl p-4 sm:p-5 border border-blue-200/90 shadow-2xs flex flex-col justify-between space-y-3 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-200/60 pb-2.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-800 bg-blue-100/90 px-2.5 py-1 rounded-full border border-blue-200 inline-flex items-center gap-1 shrink-0">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>ภาพรวม 4 กก.</span>
            </span>
            <span className="text-xs font-black text-blue-800 bg-white px-2.5 py-1 rounded-md border border-blue-200 shadow-2xs shrink-0">
              บก.ตชด.ภาค 2
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="text-base sm:text-lg font-black text-slate-900 truncate">
              {isSecondary
                ? `${submittedSchoolsOverall} จาก 2 รร.เป้าหมาย (ม.1-ม.3)`
                : isMultiClassroom
                ? `${submittedSchoolsOverall} รร. (ตามรายงานจริง)`
                : `${submittedSchoolsOverall} จาก ${totalSchoolsOverall} โรงเรียนเป้าหมาย`}
            </div>

            {/* Stats Box */}
            <div className="grid grid-cols-3 gap-2 bg-white/90 p-2.5 rounded-xl border border-blue-200/80 text-center shadow-2xs divide-x divide-blue-100 min-w-0">
              <div className="px-1 min-w-0">
                <span className="text-[10px] sm:text-[11px] text-slate-500 font-bold block truncate">ครอบคลุมรวม</span>
                <span className="text-sm sm:text-base md:text-lg font-black text-blue-700 block truncate">{overallCoveragePct}%</span>
              </div>
              <div className="px-1 min-w-0">
                <span className="text-[10px] sm:text-[11px] text-slate-500 font-bold block truncate">เข้าเรียนรวม</span>
                <span className="text-sm sm:text-base md:text-lg font-black text-purple-700 block truncate">{overallAttendanceRate}%</span>
              </div>
              <div className="px-1 min-w-0">
                <span className="text-[10px] sm:text-[11px] text-slate-500 font-bold block truncate">รายงานรวม</span>
                <span className="text-sm sm:text-base md:text-lg font-black text-emerald-700 block truncate">{totalReportsOverall}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-extrabold text-blue-900">
              <span>ความก้าวหน้าการรายงานรวม</span>
              <span>{overallCoveragePct}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-300/60">
              <div
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${overallCoveragePct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Action Needed / Follow Up Unit */}
        {requiresSupport && (
          <div className="bg-gradient-to-br from-rose-500/10 via-rose-50/50 to-white rounded-2xl p-4 sm:p-5 border border-rose-200/90 shadow-2xs flex flex-col justify-between space-y-3 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-200/60 pb-2.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-rose-800 bg-rose-100/90 px-2.5 py-1 rounded-full border border-rose-200 inline-flex items-center gap-1 shrink-0">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>{isSecondary ? 'สรุปรายงาน ม.1-ม.3' : isMultiClassroom ? 'สรุปการส่งรายงาน' : 'หน่วยงานต้องเร่งรัด'}</span>
              </span>
              <span className="text-xs font-black text-rose-800 bg-white px-2.5 py-1 rounded-md border border-rose-200 shadow-2xs shrink-0">
                {isSecondary
                  ? `ส่งแล้ว ${submittedSchoolsOverall}/2 รร.`
                  : isMultiClassroom
                  ? `ส่งแล้ว ${requiresSupport.submittedCount} รร.`
                  : `ยังขาด ${requiresSupport.pendingSchools.length} รร.`}
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2 min-w-0">
                <span className="text-base sm:text-lg font-black text-slate-900 truncate">{requiresSupport.fullName}</span>
                <span className="text-xs font-bold text-slate-500 shrink-0">({requiresSupport.province})</span>
              </div>

              {/* Stats Box */}
              <div className="grid grid-cols-2 gap-2 bg-white/90 p-2.5 rounded-xl border border-rose-200/80 text-center shadow-2xs divide-x divide-rose-100 min-w-0">
                <div className="px-1 min-w-0">
                  <span className="text-[10px] sm:text-[11px] text-slate-500 font-bold block truncate">ครอบคลุม</span>
                  <span className="text-sm sm:text-base md:text-lg font-black text-rose-700 block truncate">{requiresSupport.coveragePct}%</span>
                </div>
                <div className="px-1 min-w-0">
                  <span className="text-[10px] sm:text-[11px] text-slate-500 font-bold block truncate">ส่งแล้ว</span>
                  <span className="text-sm sm:text-base md:text-lg font-black text-slate-800 block truncate">{requiresSupport.submittedCount}/{requiresSupport.totalSchools} รร.</span>
                </div>
              </div>
            </div>

            {isSecondary ? (
              <div className="text-[11px] text-amber-900/90 font-medium bg-white/80 p-2.5 rounded-xl border border-amber-100 flex items-center gap-1.5 min-w-0">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">มัธยมศึกษาตอนต้น 2 รร.ขยายโอกาส ({submittedSchoolsOverall}/2 รร.)</span>
              </div>
            ) : requiresSupport.pendingSchools.length > 0 ? (
              <div className="text-[11px] text-rose-900/90 font-medium bg-white/80 p-2.5 rounded-xl border border-rose-100 flex items-start gap-1.5 min-w-0">
                <span className="shrink-0">📌</span>
                <span className="line-clamp-2 leading-snug">
                  โรงเรียนที่ยังไม่ส่ง: <strong className="text-rose-700 font-bold">{requiresSupport.pendingSchools.slice(0, 3).join(', ')}{requiresSupport.pendingSchools.length > 3 ? ` และอีก ${requiresSupport.pendingSchools.length - 3} แห่ง` : ''}</strong>
                </span>
              </div>
            ) : (
              <div className="text-[11px] text-emerald-900/90 font-medium bg-white/80 p-2.5 rounded-xl border border-emerald-100 flex items-center gap-1.5 min-w-0">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>ครบถ้วน 100% ทุกโรงเรียนในสังกัด</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* VISUAL COMPARISON BARS CHART (When 'all' or 'charts' selected) */}
      {(activeViewMode === 'all' || activeViewMode === 'charts') && (
        <div className="bg-slate-50/90 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-4 sm:space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug truncate">
                กราฟเปรียบเทียบความครอบคลุมการรายงานและอัตราการเข้าเรียนเฉลี่ย
              </h4>
            </div>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-200/60 px-2.5 py-1 rounded-full whitespace-nowrap self-start sm:self-auto shrink-0">
              เปรียบเทียบ 4 กองกำกับการ
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Chart 1: Reporting Coverage Bar Chart */}
            <div className="space-y-3.5 bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-1.5">
                  <span className="text-blue-600">📊</span>
                  <span>1. ความครอบคลุมการรายงาน (% Coverage)</span>
                </span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  เป้าหมาย 100%
                </span>
              </div>

              <div className="space-y-3 pt-1">
                {rankedData.map((item) => {
                  const theme = getSubdivTheme(item.subdiv);
                  return (
                    <div key={item.subdiv} className="space-y-1.5 p-2 rounded-xl hover:bg-slate-50/80 transition-colors border border-transparent hover:border-slate-200/50">
                      <div className="flex flex-wrap items-center justify-between gap-1.5 min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${theme.badgeBg}`} />
                          <span className="font-extrabold text-slate-900 text-xs sm:text-sm whitespace-nowrap">{item.name}</span>
                          <span className="text-slate-500 font-bold text-xs whitespace-nowrap">({item.province})</span>
                        </div>
                        <div className="flex items-center gap-2 ml-auto shrink-0">
                          <span className="text-slate-900 font-black text-xs sm:text-sm">{item.coveragePct}%</span>
                          <span className="text-slate-600 font-bold text-[11px] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60 whitespace-nowrap">
                            {item.submittedCount}/{item.totalSchools} รร.
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200/80">
                        <div
                          className={`bg-gradient-to-r ${theme.barGradient} h-full rounded-full transition-all duration-700 shadow-2xs`}
                          style={{ width: `${item.coveragePct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart 2: Student Attendance Rate Bar Chart */}
            <div className="space-y-3.5 bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-1.5">
                  <span className="text-emerald-600">🎓</span>
                  <span>2. อัตราการเข้าเรียนเฉลี่ย (% Attendance)</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  รายหน่วย
                </span>
              </div>

              <div className="space-y-3 pt-1">
                {rankedData.map((item) => {
                  const theme = getSubdivTheme(item.subdiv);
                  return (
                    <div key={item.subdiv} className="space-y-1.5 p-2 rounded-xl hover:bg-slate-50/80 transition-colors border border-transparent hover:border-slate-200/50">
                      <div className="flex flex-wrap items-center justify-between gap-1.5 min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${theme.badgeBg}`} />
                          <span className="font-extrabold text-slate-900 text-xs sm:text-sm whitespace-nowrap">{item.name}</span>
                          <span className="text-slate-500 font-bold text-xs whitespace-nowrap">({item.province})</span>
                        </div>
                        <div className="flex items-center gap-2 ml-auto shrink-0">
                          <span className="text-slate-900 font-black text-xs sm:text-sm">{item.attendanceRate}%</span>
                          <span className="text-slate-600 font-bold text-[11px] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60 whitespace-nowrap">
                            {item.attendancePresent.toLocaleString()}/{item.attendanceTotal.toLocaleString()} คน
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200/80">
                        <div
                          className={`bg-gradient-to-r ${theme.barGradient} h-full rounded-full transition-all duration-700 shadow-2xs`}
                          style={{ width: `${item.attendanceRate}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LEADERBOARD TABLE (When 'all' or 'table' selected) */}
      {(activeViewMode === 'all' || activeViewMode === 'table') && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 px-1">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-600 shrink-0" />
              <h4 className="text-xs sm:text-sm md:text-base font-black text-slate-900 flex items-center gap-1.5 flex-wrap">
                <span>ตารางสรุปอันดับผลงานรายกองกำกับการ</span>
                <span className="text-xs font-semibold text-slate-500 font-sans hidden md:inline">(Comparative Leaderboard)</span>
              </h4>
            </div>
            <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">คลิกที่แถวเพื่อขยายดูรายชื่อโรงเรียน</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs scrollbar-thin">
            <table className="w-full text-left border-collapse min-w-[720px] sm:min-w-full">
              <thead>
                <tr className="bg-slate-50/90 text-slate-600 text-[11px] font-black uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-2.5 sm:px-3 md:px-4 w-16 text-center whitespace-nowrap">อันดับ</th>
                  <th className="py-3 px-2.5 sm:px-3 md:px-4 whitespace-nowrap">กองกำกับการ</th>
                  <th className="py-3 px-2.5 sm:px-3 md:px-4 text-center whitespace-nowrap">ความครอบคลุม</th>
                  <th className="py-3 px-2.5 sm:px-3 md:px-4 text-center whitespace-nowrap">อัตราเข้าเรียน</th>
                  <th className="py-3 px-2.5 sm:px-3 md:px-4 text-center whitespace-nowrap">รายงานสะสม</th>
                  <th className="py-3 px-2.5 sm:px-3 md:px-4 text-center whitespace-nowrap">ไร้อุปสรรค</th>
                  <th className="py-3 px-2.5 sm:px-3 md:px-4 text-center whitespace-nowrap">สถานะติดตาม</th>
                  <th className="py-3 px-2.5 sm:px-3 md:px-4 text-right w-10 sm:w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {rankedData.map((item, idx) => {
                  const rankInfo = getRankBadge(idx);
                  const theme = getSubdivTheme(item.subdiv);
                  const isExpanded = expandedSubdiv === item.subdiv;

                  return (
                    <React.Fragment key={item.subdiv}>
                      <tr
                        onClick={() => setExpandedSubdiv(isExpanded ? null : item.subdiv)}
                        className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                          idx === 0 ? 'bg-amber-50/20' : ''
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-3 px-2.5 sm:px-3 md:px-4 text-center font-black whitespace-nowrap">
                          <span className={`inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full border text-[11px] whitespace-nowrap ${rankInfo.bg}`}>
                            {rankInfo.icon}
                            <span>{rankInfo.label}</span>
                          </span>
                        </td>

                        {/* Unit Name */}
                        <td className="py-3 px-2.5 sm:px-3 md:px-4 font-bold">
                          <div className="flex items-center gap-2 sm:gap-2.5">
                            <div className={`w-8 h-8 shrink-0 rounded-xl ${theme.bg} ${theme.text} flex items-center justify-center font-black text-xs border ${theme.border}`}>
                              {item.subdiv}
                            </div>
                            <div className="min-w-0">
                              <span className="font-extrabold text-slate-900 block text-xs sm:text-sm whitespace-nowrap">{item.fullName}</span>
                              <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium whitespace-nowrap block">กองบังคับการ ตชด.ภาค 2 • จ.{item.province}</span>
                            </div>
                          </div>
                        </td>

                        {/* Coverage */}
                        <td className="py-3 px-2.5 sm:px-3 md:px-4 text-center whitespace-nowrap">
                          <div className="space-y-0.5 sm:space-y-1">
                            <span className="font-black text-slate-900 text-xs sm:text-sm block">{item.coveragePct}%</span>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full inline-block whitespace-nowrap">
                              {item.submittedCount}/{item.totalSchools} รร.
                            </span>
                          </div>
                        </td>

                        {/* Attendance Rate */}
                        <td className="py-3 px-2.5 sm:px-3 md:px-4 text-center whitespace-nowrap">
                          <div className="space-y-0.5 sm:space-y-1">
                            <span className="font-black text-purple-700 text-xs sm:text-sm block">{item.attendanceRate}%</span>
                            <span className="text-[10px] font-bold text-slate-500 block whitespace-nowrap">
                              {item.attendancePresent}/{item.attendanceTotal} คน
                            </span>
                          </div>
                        </td>

                        {/* Total Reports */}
                        <td className="py-3 px-2.5 sm:px-3 md:px-4 text-center font-black text-slate-900 text-xs sm:text-sm whitespace-nowrap">
                          {item.totalReports} <span className="text-[10px] sm:text-[11px] font-normal text-slate-500">คาบ</span>
                        </td>

                        {/* Readiness */}
                        <td className="py-3 px-2.5 sm:px-3 md:px-4 text-center whitespace-nowrap">
                          <span className="font-extrabold text-emerald-700 text-xs bg-emerald-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-emerald-200 inline-block whitespace-nowrap">
                            {item.readinessRate}%
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-2.5 sm:px-3 md:px-4 text-center whitespace-nowrap">
                          {item.pendingSchools.length === 0 ? (
                            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-black text-emerald-800 bg-emerald-100 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-emerald-200 whitespace-nowrap">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              ครบถ้วน 100%
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-black text-amber-800 bg-amber-100 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-amber-200 whitespace-nowrap">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              ขาดอีก {item.pendingSchools.length} รร.
                            </span>
                          )}
                        </td>

                        {/* Chevron */}
                        <td className="py-3 px-2.5 sm:px-3 md:px-4 text-right whitespace-nowrap">
                          <button className="p-1 rounded-lg hover:bg-slate-200/60 text-slate-400">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Sub-Row Detail */}
                      {isExpanded && (
                        <tr className="bg-slate-50/90 border-b border-slate-200">
                          <td colSpan={8} className="p-3.5 sm:p-5 space-y-3 sm:space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              {/* Submitted Schools List */}
                              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                                <span className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
                                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                  โรงเรียนที่ส่งรายงานแล้ว ({item.submittedCount} แห่ง):
                                </span>
                                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                                  {item.submittedSchools.map((sName, sIdx) => (
                                    <span key={sIdx} className="text-[11px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-1 rounded-lg">
                                      {sName}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Pending Schools List */}
                              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                                <span className="text-xs font-black text-amber-800 flex items-center gap-1.5">
                                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                  โรงเรียนที่ยังไม่ส่งรายงาน ({item.pendingSchools.length} แห่ง):
                                </span>
                                {item.pendingSchools.length === 0 ? (
                                  <span className="text-xs text-slate-500 italic block pt-1">
                                    ไม่มี - ครบถ้วนทุกโรงเรียนเรียบร้อยแล้ว
                                  </span>
                                ) : (
                                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                                    {item.pendingSchools.map((sName, sIdx) => (
                                      <span key={sIdx} className="text-[11px] font-bold bg-rose-50 text-rose-900 border border-rose-200 px-2.5 py-1 rounded-lg">
                                        {sName}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Quick Filter button */}
                            {onSelectSubdivFilter && (
                              <div className="flex justify-end pt-1">
                                <button
                                  onClick={() => onSelectSubdivFilter(item.subdiv)}
                                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Filter className="w-3.5 h-3.5" />
                                  <span>กรองข้อมูลเฉพาะ {item.name}</span>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
