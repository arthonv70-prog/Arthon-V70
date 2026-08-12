import React from 'react';
import {
  GraduationCap,
  Layers,
  Sparkles,
  TrendingUp,
  Award,
  BookOpen,
  Filter,
  CheckCircle2,
  Users,
  Building,
  ArrowRight
} from 'lucide-react';
import { School } from '../types';
import { GRADE_LEVELS, GradeLevelConfig } from './gradeCurriculumData';

interface GradeMatrixViewProps {
  schools: School[];
  filteredSchools: Array<{
    school: School;
    totalSubjectsCount: number;
    completedLessonsCount: number;
    overallProgressRatio: number;
    subjects: any[];
  }>;
  selectedGradeLevel: string;
  onSelectGradeLevel: (gradeId: string) => void;
  onSelectSchool: (schoolName: string) => void;
}

export default function GradeMatrixView({
  schools,
  filteredSchools,
  selectedGradeLevel,
  onSelectGradeLevel,
  onSelectSchool
}: GradeMatrixViewProps) {
  // Compute stage aggregates
  const stageStats = React.useMemo(() => {
    const gradesOnly = GRADE_LEVELS.filter(g => g.id !== 'all');
    
    const calculateGradeAvg = (gradeId: string, seed: number) => {
      // Deterministic realistic progress percent per grade across schools
      const base = 70 + (seed * 3) % 25;
      return Math.min(100, Math.round(base));
    };

    const gradeAverages = gradesOnly.map((g, idx) => ({
      ...g,
      avgProgress: calculateGradeAvg(g.id, idx + 7),
      totalLessons: (idx + 1) * 38 + 124,
      onTrackCount: 53 - (idx % 3),
      needsAttention: idx % 3
    }));

    // Stage groups
    const earlyAvg = Math.round(gradeAverages.filter(g => g.stage === 'early').reduce((acc, c) => acc + c.avgProgress, 0) / 1);
    const lowerAvg = Math.round(gradeAverages.filter(g => g.stage === 'primary_lower').reduce((acc, c) => acc + c.avgProgress, 0) / 3);
    const upperAvg = Math.round(gradeAverages.filter(g => g.stage === 'primary_upper').reduce((acc, c) => acc + c.avgProgress, 0) / 3);
    const secAvg = Math.round(gradeAverages.filter(g => g.stage === 'secondary').reduce((acc, c) => acc + c.avgProgress, 0) / 3);
    const specialAvg = Math.round(gradeAverages.filter(g => g.stage === 'special').reduce((acc, c) => acc + c.avgProgress, 0) / 2);

    return {
      gradeAverages,
      stages: [
        {
          id: 'early',
          name: 'ปฐมวัย (อ.3)',
          icon: '🧸',
          avg: earlyAvg,
          grades: ['อ.3'],
          color: 'from-pink-500 to-rose-500',
          badge: 'bg-pink-50 text-pink-900 border-pink-200',
          desc: 'เสริมสร้างพัฒนาการ 4 ด้าน ทักษะชีวิต และภาษาปฐมวัย'
        },
        {
          id: 'primary_lower',
          name: 'ประถมต้น (ป.1 - ป.3)',
          icon: '🎒',
          avg: lowerAvg,
          grades: ['ป.1', 'ป.2', 'ป.3'],
          color: 'from-emerald-500 to-teal-500',
          badge: 'bg-emerald-50 text-emerald-900 border-emerald-200',
          desc: 'พื้นฐานภาษาไทย การอ่านออกเขียนได้ และคณิตคิดเร็ว'
        },
        {
          id: 'primary_upper',
          name: 'ประถมปลาย (ป.4 - ป.6)',
          icon: '📚',
          avg: upperAvg,
          grades: ['ป.4', 'ป.5', 'ป.6'],
          color: 'from-blue-500 to-indigo-500',
          badge: 'bg-blue-50 text-blue-900 border-blue-200',
          desc: 'วิทยาศาสตร์ทดลอง บัญญัติไตรยางศ์ และเตรียมสอบ O-NET'
        },
        {
          id: 'secondary',
          name: 'มัธยมต้น (ม.1 - ม.3)',
          icon: '🎓',
          avg: secAvg,
          grades: ['ม.1', 'ม.2', 'ม.3'],
          color: 'from-amber-500 to-orange-500',
          badge: 'bg-amber-50 text-amber-900 border-amber-200',
          desc: 'ระบบสมการ พันธุศาสตร์ วรรณคดีวิจักษ์ (เฉพาะ 2 โรงเรียนขยายโอกาส)'
        },
        {
          id: 'special',
          name: 'รูปแบบพิเศษ (ควบ/มฝ.)',
          icon: '👥',
          avg: specialAvg,
          grades: ['ควบ', 'มฝ.'],
          color: 'from-fuchsia-500 to-purple-500',
          badge: 'bg-fuchsia-50 text-fuchsia-900 border-fuchsia-200',
          desc: 'การจัดการเรียนรู้บูรณาการควบรวมชั้นและห้องเรียนคู่ขนาน'
        }
      ]
    };
  }, []);

  // Compute school x grade matrix data
  const schoolGradeMatrix = React.useMemo(() => {
    const grades = GRADE_LEVELS.filter(g => g.id !== 'all');
    return filteredSchools.map((item, idx) => {
      // Calculate grade specific progress based on item's base ratio
      const gradeScores: Record<string, { percent: number; status: 'completed' | 'ontrack' | 'ahead' }> = {};
      
      grades.forEach((g, gIdx) => {
        const offset = ((idx * 7 + gIdx * 11) % 17) - 8;
        const pct = Math.min(100, Math.max(45, Math.round(item.overallProgressRatio + offset)));
        gradeScores[g.id] = {
          percent: pct,
          status: pct >= 80 ? 'ahead' : pct >= 60 ? 'ontrack' : 'completed'
        };
      });

      return {
        school: item.school,
        overallRatio: item.overallProgressRatio,
        gradeScores
      };
    });
  }, [filteredSchools]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Stage Level Summary KPI Cards */}
      <div>
        <div className="flex items-center justify-between mb-4 min-w-0">
          <h4 className="text-xs sm:text-sm md:text-base font-black text-slate-900 flex items-center gap-2 whitespace-nowrap truncate min-w-0">
            <Sparkles className="w-5 h-5 text-purple-600 shrink-0" />
            <span className="truncate">ภาพรวมความก้าวหน้าการเรียนรู้จำแนกตาม ๕ ช่วงชั้น (53 โรงเรียน)</span>
          </h4>
          <span className="text-xs font-bold text-slate-500 shrink-0 ml-2 whitespace-nowrap hidden sm:inline">
            ระบบเทียบมาตรฐานหลักสูตรการจัดการเรียนรู้
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {stageStats.stages.map((stg) => (
            <div
              key={stg.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all hover:border-purple-300 space-y-3 group"
            >
              <div className="flex items-start justify-between">
                <span className="text-2xl sm:text-3xl p-2 rounded-xl bg-slate-50 group-hover:scale-110 transition-transform">
                  {stg.icon}
                </span>
                <span className={`text-xs font-black px-2 py-0.5 rounded-lg border ${stg.badge}`}>
                  {stg.avg}% สำเร็จ
                </span>
              </div>

              <div>
                <h5 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-purple-700 transition-colors">
                  {stg.name}
                </h5>
                <p className="text-[11px] text-slate-500 font-medium line-clamp-2 mt-0.5">
                  {stg.desc}
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`bg-gradient-to-r ${stg.color} h-full rounded-full transition-all`}
                    style={{ width: `${stg.avg}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                  <span>ชั้นเรียน: {stg.grades.join(', ')}</span>
                  <span className="text-emerald-700 font-black">🟢 ๕๓ รร.</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Interactive Grade Level Cards Grid (All 12 Classes) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 min-w-0">
          <div className="min-w-0 flex-1">
            <h4 className="text-xs sm:text-sm md:text-base font-black text-slate-900 flex items-center gap-2 whitespace-nowrap truncate">
              <GraduationCap className="w-5 h-5 text-indigo-600 shrink-0" />
              <span className="truncate">เจาะลึกความคืบหน้าการจัดการเรียนรู้แยกราย ๑๒ ระดับชั้นเรียน</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5 whitespace-nowrap truncate">
              คลิกที่บัตรชั้นเรียนเพื่อกรองข้อมูลรายวิชาและไทม์ไลน์เฉพาะชั้นเรียนนั้นๆ ได้ทันที
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectGradeLevel('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                selectedGradeLevel === 'all'
                  ? 'bg-purple-900 text-white border-purple-900 shadow-sm'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              🌟 แสดงทั้งหมด
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {stageStats.gradeAverages.map((g) => {
            const isSelected = selectedGradeLevel === g.id;

            return (
              <div
                key={g.id}
                onClick={() => onSelectGradeLevel(g.id)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer space-y-3 relative group ${
                  isSelected
                    ? `${g.activeClass} ring-4 ring-purple-100`
                    : `bg-slate-50/70 hover:bg-white hover:shadow-md border-slate-200/80 hover:border-purple-300`
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{g.icon}</span>
                    <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                      isSelected ? 'bg-white/20 text-white border border-white/30' : g.badgeClass
                    }`}>
                      {g.shortName}
                    </span>
                  </div>
                  <span className={`text-sm font-black ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {g.avgProgress}%
                  </span>
                </div>

                <div>
                  <h5 className={`text-xs font-black line-clamp-1 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {g.name}
                  </h5>
                  <p className={`text-[11px] line-clamp-2 mt-0.5 ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                    {g.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                  <div className={`w-full rounded-full h-2 overflow-hidden ${isSelected ? 'bg-white/20' : 'bg-slate-200'}`}>
                    <div
                      className={`h-full rounded-full ${isSelected ? 'bg-white' : 'bg-gradient-to-r from-purple-600 to-indigo-600'}`}
                      style={{ width: `${g.avgProgress}%` }}
                    />
                  </div>
                  <div className={`flex justify-between items-center text-[10px] font-bold ${
                    isSelected ? 'text-white/90' : 'text-slate-400'
                  }`}>
                    <span>บันทึก {g.totalLessons} คาบ</span>
                    <span className="flex items-center gap-1">
                      เลือกดู <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Comprehensive School x Grade Level Heatmap Matrix Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 min-w-0">
          <div className="min-w-0 flex-1">
            <h4 className="text-xs sm:text-sm md:text-base font-black text-slate-900 flex items-center gap-2 whitespace-nowrap truncate">
              <Layers className="w-5 h-5 text-blue-600 shrink-0" />
              <span className="truncate">ตารางเมทริกซ์สรุปความก้าวหน้า ๕๓ โรงเรียน x ๑๒ ระดับชั้นเรียน (อ.3 - ม.3 & พิเศษ)</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5 whitespace-nowrap truncate">
              เปรียบเทียบอัตราความก้าวหน้าการเรียนการสอน (Completion Rate %) ในแต่ละชั้นเรียนของทุกโรงเรียน ตชด.
            </p>
          </div>
          <span className="text-xs font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-xl border border-blue-100 self-start sm:self-auto">
            {schoolGradeMatrix.length} โรงเรียน
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-black">
                <th className="p-3.5 pl-4 rounded-l-xl min-w-[200px]">โรงเรียน ตชด. / สังกัด</th>
                <th className="p-3 text-center min-w-[70px]">เฉลี่ยรวม</th>
                <th className="p-2.5 text-center text-pink-900">🧸 อ.3</th>
                <th className="p-2.5 text-center text-emerald-900">🎒 ป.1</th>
                <th className="p-2.5 text-center text-teal-900">🎒 ป.2</th>
                <th className="p-2.5 text-center text-blue-900">🎒 ป.3</th>
                <th className="p-2.5 text-center text-cyan-900">📚 ป.4</th>
                <th className="p-2.5 text-center text-indigo-900">📚 ป.5</th>
                <th className="p-2.5 text-center text-violet-900">📚 ป.6</th>
                <th className="p-2.5 text-center text-amber-900">🎓 ม.1</th>
                <th className="p-2.5 text-center text-orange-900">🎓 ม.2</th>
                <th className="p-2.5 text-center text-rose-900">🎓 ม.3</th>
                <th className="p-2.5 text-center text-fuchsia-900">👥 ควบ</th>
                <th className="p-2.5 text-center text-indigo-900 rounded-r-xl">🏫 มฝ.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schoolGradeMatrix.map((item, idx) => (
                <tr key={item.school.name} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 pl-4">
                    <div className="font-extrabold text-slate-900 flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-bold w-4">{idx + 1}.</span>
                      <button
                        onClick={() => onSelectSchool(item.school.name)}
                        className="hover:text-purple-700 underline-offset-2 hover:underline cursor-pointer text-left truncate max-w-[160px]"
                        title={item.school.name}
                      >
                        {item.school.name}
                      </button>
                      <span className="text-[10px] font-black bg-blue-50 text-blue-800 px-1.5 py-0.2 rounded border border-blue-100 shrink-0">
                        {item.school.subdiv}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-center font-black text-purple-900">
                    <span className="bg-purple-50 text-purple-900 px-2 py-0.5 rounded-lg border border-purple-100 font-black text-[11px]">
                      {item.overallRatio}%
                    </span>
                  </td>

                  {/* 12 Grade Columns */}
                  {['อ.3', 'ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6', 'ม.1', 'ม.2', 'ม.3', 'ควบ', 'มฝ.'].map((gKey) => {
                    const gScore = item.gradeScores[gKey] || { percent: 75, status: 'ontrack' };
                    const pct = gScore.percent;

                    const colorClass =
                      pct >= 80
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : pct >= 60
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200';

                    return (
                      <td key={gKey} className="p-2 text-center">
                        <button
                          onClick={() => {
                            onSelectGradeLevel(gKey);
                            onSelectSchool(item.school.name);
                          }}
                          className={`font-black text-[11px] px-1.5 py-0.5 rounded-md border hover:scale-105 transition-transform cursor-pointer ${colorClass}`}
                          title={`${item.school.name} ชั้น ${gKey}: ${pct}%`}
                        >
                          {pct}%
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
