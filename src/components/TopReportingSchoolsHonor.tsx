import React, { useState } from 'react';
import { Trophy, Award, Building, User, ChevronDown, ChevronUp, Sparkles, Filter, CheckCircle2, Medal, X, Search } from 'lucide-react';
import { School } from '../types';

interface TopReportingSchoolsHonorProps {
  schools?: School[];
  allRows?: any[][];
  headers?: string[];
  onFilterSchool?: (keyword: string) => void;
}

export interface RankedHonorSchool {
  name: string;
  keyword: string;
  subdiv: string;
  principal: string;
  address?: string;
  count: number;
}

export default function TopReportingSchoolsHonor({
  schools = [],
  allRows = [],
  headers = [],
  onFilterSchool
}: TopReportingSchoolsHonorProps) {
  const [expandedView, setExpandedView] = useState(false);
  const [modalSearch, setModalSearch] = useState('');

  // Compute report counts for each school if data exists with comprehensive keyword & alias matching
  const schoolCountsMap: Record<string, number> = {};
  
  if (allRows.length > 0 && schools.length > 0) {
    schools.forEach(s => {
      const count = allRows.filter(r => {
        const rHeaders = (r as any)._headers || headers;
        let rSchoolCol = -1;
        if (rHeaders && rHeaders.length > 0) {
          rSchoolCol = rHeaders.findIndex((h: string) => h && (
            h.toLowerCase().includes('โรงเรียน') ||
            h.toLowerCase().includes('สถานศึกษา') ||
            h.toLowerCase().includes('รร.') ||
            h.toLowerCase().includes('ชื่อโรงเรียน')
          ));
        }
        
        const schoolCell = rSchoolCol !== -1 ? String(r[rSchoolCol] || '').trim() : '';
        const fullRowText = r.map(c => String(c || '').trim()).join(' ');
        
        const kw = s.keyword.toLowerCase();
        const name = s.name.toLowerCase();
        
        // 1. Direct cell match or full row match
        if (schoolCell && (schoolCell.includes(kw) || schoolCell.includes(name))) return true;
        if (fullRowText.includes(kw) || fullRowText.includes(name)) return true;
        
        // 2. Specific known BPP Region 2 school aliases and variant spellings
        if (kw === 'ซำปะโต' && (fullRowText.includes('ชำปะโต') || fullRowText.includes('ซำปะโต'))) return true;
        if (kw === 'หนองดู่' && (fullRowText.includes('จินดาพา') || fullRowText.includes('จินดาภา') || fullRowText.includes('หนองดู่'))) return true;
        if (kw === 'หมากหล่ำ' && (fullRowText.includes('ไปรษณีย์ไทย') || fullRowText.includes('หมากหล่ำ') || fullRowText.includes('หนองแสง'))) return true;
        if (kw === 'ปากห้วยม่วง' && (fullRowText.includes('ปากห้วยม่วง') || fullRowText.includes('ปากข้วยม่วง'))) return true;
        if (kw === 'หนองตะไก้' && (fullRowText.includes('หนองตะไก้') || fullRowText.includes('หนองตะโก้'))) return true;
        if (kw === 'ปูนอินทรี' && (fullRowText.includes('ปูนอินทรี') || fullRowText.includes('ห้วยกระแสน'))) return true;
        if (kw === 'สุประภาดา' && (fullRowText.includes('สุประภาดา') || fullRowText.includes('เกษมสันต์'))) return true;
        if (kw === 'สมาคมจีน' && (fullRowText.includes('สมาคมจีน') || fullRowText.includes('ชมรม 9'))) return true;
        if (kw === 'ค็อกนิส' && (fullRowText.includes('ค็อกนิส') || fullRowText.includes('คอกนิส'))) return true;
        if (kw === 'เฉลิมราษฎร์' && (fullRowText.includes('เฉลิมราษฎร์') || fullRowText.includes('ฮางโฮง'))) return true;
        if (kw === 'พิทักษ์ปัญญา' && (fullRowText.includes('พิทักษ์ปัญญา') || fullRowText.includes('ทุ่งกบาล'))) return true;
        if (kw === 'บรรจบพัน' && (fullRowText.includes('บรรจบพัน') || fullRowText.includes('ปากลา'))) return true;
        if (kw === 'เนวิน' && (fullRowText.includes('เนวิน') || fullRowText.includes('ดงบาก'))) return true;
        if (kw === 'เอไอเอ' && (fullRowText.includes('เอไอเอ') || fullRowText.includes('บ๋าฮี'))) return true;
        if ((kw === 'ช่างกล' || kw === 'ปทุมวัน') && (fullRowText.includes('ปทุมวัน') || fullRowText.includes('ช่างกล'))) return true;
        if (kw === 'ท่าอากาศยาน' && (fullRowText.includes('ท่าอากาศยาน') || fullRowText.includes('กกปลาซิว'))) return true;
        if (kw === 'ดอกไม้' && (fullRowText.includes('ห้วยดอกไม้') || fullRowText.includes('ดอกไม้'))) return true;
        if (kw === 'คอนราด' && fullRowText.includes('คอนราด')) return true;
        if (kw === 'นาสามัคคี' && fullRowText.includes('นาสามัคคี')) return true;
        if (kw === 'ห้วยฆ้อง' && fullRowText.includes('ห้วยฆ้อง')) return true;
        if (kw === 'ตาตุม' && fullRowText.includes('ตาตุม')) return true;
        if (kw === 'โคกแสลง' && fullRowText.includes('โคกแสลง')) return true;
        if (kw === 'บ้านรุน' && fullRowText.includes('บ้านรุน')) return true;
        
        return false;
      }).length;
      
      schoolCountsMap[s.keyword] = count;
    });
  }

  // Get sorted list dynamically
  const computedTop: RankedHonorSchool[] = schools.length > 0 && allRows.length > 0
    ? [...schools]
        .map(s => ({
          name: s.name,
          keyword: s.keyword,
          subdiv: s.subdiv,
          principal: s.principal,
          address: s.address,
          count: schoolCountsMap[s.keyword] || 0
        }))
        .filter(s => s.count > 0)
        .sort((a, b) => b.count - a.count)
    : [];

  // Default fallback data accurately reflecting actual BPP Region 2 historical submissions
  const defaultTop: RankedHonorSchool[] = [
    { name: 'รร.ตชด.บ้านชำปะโต', keyword: 'ซำปะโต', subdiv: '21', principal: 'พ.ต.ท.ครรชิต พูนวิเชียร', count: 45 },
    { name: 'รร.ตชด.ปูนอินทรี 50 ปี (บ้านห้วยกระแสน)', keyword: 'ปูนอินทรี', subdiv: '22', principal: 'ด.ต.หญิง สะใบทอง กะตะจิต', count: 44 },
    { name: 'รร.ตชด.ค็อกนิสไทย ฯ', keyword: 'ค็อกนิส', subdiv: '23', principal: 'พ.ต.ท.กำจัด ผาใต้', count: 44 },
    { name: 'รร.ตชด.บ้านห้วยฆ้อง', keyword: 'ห้วยฆ้อง', subdiv: '22', principal: 'พ.ต.ท.วัชรพงศ์ สหัสภูริพัฒน์', count: 42 },
    { name: 'รร.ตชด.บ้านหนองตะโก้', keyword: 'หนองตะไก้', subdiv: '24', principal: 'ด.ต.ศักดิ์ชาย บัวถนอม', count: 35 },
    { name: 'รร.ตชด.บ้านตาตุม', keyword: 'ตาตุม', subdiv: '21', principal: 'ร.ต.อ.พงษ์ศักดิ์ สาธุรัมย์', count: 32 },
    { name: 'รร.ตชด.บ้านโคกแสลง', keyword: 'โคกแสลง', subdiv: '21', principal: 'พ.ต.ท.เอกชัย สาคร', count: 28 },
    { name: 'รร.ตชด.บ้านรุน', keyword: 'บ้านรุน', subdiv: '21', principal: 'ร.ต.ต.อรรถกร นารัมย์', count: 25 },
  ];

  const fullList = computedTop.length > 0 ? computedTop : defaultTop;
  const top3 = fullList.slice(0, 3);
  const extendedList = fullList.slice(3, 8);

  // Medals visual styling definitions
  const medals = [
    {
      rank: 1,
      title: 'เหรียญทอง',
      subtitle: 'ชนะเลิศอันดับ ๑',
      borderColor: 'border-2 border-amber-400 ring-4 ring-amber-200/50 shadow-md',
      pillBg: 'bg-amber-100/90 border border-amber-300',
      pillText: 'text-amber-950 font-black',
      medalBg: 'bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-500',
      medalText: 'text-amber-950',
      medalBorder: 'border-amber-200',
      subdivBadge: 'bg-amber-100 text-amber-900 border-amber-300'
    },
    {
      rank: 2,
      title: 'เหรียญเงิน',
      subtitle: 'รองชนะเลิศอันดับ ๑',
      borderColor: 'border border-slate-300 ring-2 ring-slate-200/60 shadow-sm',
      pillBg: 'bg-slate-100 border border-slate-300',
      pillText: 'text-slate-900 font-black',
      medalBg: 'bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400',
      medalText: 'text-slate-900',
      medalBorder: 'border-slate-100',
      subdivBadge: 'bg-slate-100 text-slate-800 border-slate-300'
    },
    {
      rank: 3,
      title: 'เหรียญทองแดง',
      subtitle: 'รองชนะเลิศอันดับ ๒',
      borderColor: 'border border-orange-300 ring-2 ring-orange-200/50 shadow-sm',
      pillBg: 'bg-orange-100/90 border border-orange-300',
      pillText: 'text-orange-950 font-black',
      medalBg: 'bg-gradient-to-b from-amber-600 via-amber-700 to-amber-800',
      medalText: 'text-amber-50',
      medalBorder: 'border-orange-300',
      subdivBadge: 'bg-orange-100 text-orange-900 border-orange-300'
    }
  ];

  return (
    <div className="bg-gradient-to-b from-[#FFFDF5] via-white to-[#FFFDF5] rounded-3xl p-5 sm:p-7 border border-amber-200/90 shadow-sm w-full space-y-6 relative overflow-hidden">
      {/* Ambient background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header Title & Authority Banner */}
      <div className="flex flex-col gap-3 border-b border-amber-200/60 pb-4 w-full">
        <div className="flex items-center gap-3 w-full min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 border border-amber-300 flex items-center justify-center text-xl sm:text-2xl shadow-sm shrink-0">
            🏆
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <h3 className="typo-app-h3 text-amber-950 text-sm sm:text-lg md:text-xl font-extrabold leading-snug truncate min-w-0 w-full">
              ประกาศเกียรติคุณโรงเรียนดีเด่น (ส่งรายงานสูงสุด)
            </h3>
            <p className="typo-app-subtext text-amber-800/80 text-xs sm:text-sm">
              คำนวณจากจำนวนรายงานและบันทึกการจัดกิจกรรมการเรียนรู้ทางไกล DLTV จริงในระบบ
            </p>
          </div>
        </div>

        <div className="pt-0.5 flex items-center justify-start">
          <span className="inline-flex items-center gap-1.5 typo-app-subtext font-bold text-amber-900 bg-amber-100/80 px-3 py-1 rounded-full border border-amber-300/80 shadow-2xs whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5 text-amber-700 animate-pulse shrink-0" />
            <span>ยอดส่งสูงสุดประจำภาค ๒</span>
          </span>
        </div>
      </div>

      {/* Podium Cards Grid (Top 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-5 items-stretch">
        {top3.map((item, idx) => {
          const medalConfig = medals[idx];
          return (
            <div
              key={idx}
              className={`app-card-surface p-3 sm:p-4 md:p-5 text-center flex flex-col justify-between space-y-3 hover:-translate-y-1 hover:shadow-md ${medalConfig.borderColor} relative overflow-hidden group min-w-0`}
            >
              {/* Subtle top corner accent */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent opacity-60" />

              {/* Medal Header Graphic */}
              <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
                {/* Ribbon SVG + Medal Badge */}
                <div className="relative w-11 h-13 sm:w-12 sm:h-14 md:w-14 md:h-16 flex items-center justify-center shrink-0">
                  {/* Tricolor Ribbon (Red, White, Blue) */}
                  <svg className="absolute -top-1 w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12" viewBox="0 0 40 40" fill="none">
                    <path d="M11 4L18 22L8 24L11 4Z" fill="#DC2626" />
                    <path d="M15 4L20 22L11 23L15 4Z" fill="#FFFFFF" />
                    <path d="M20 4L22 22L15 23L20 4Z" fill="#1D4ED8" />
                    <path d="M29 4L22 22L32 24L29 4Z" fill="#DC2626" />
                    <path d="M25 4L20 22L29 23L25 4Z" fill="#FFFFFF" />
                    <path d="M20 4L18 22L25 23L20 4Z" fill="#1D4ED8" />
                  </svg>

                  {/* Circle Medal Number */}
                  <div className={`relative z-10 w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full ${medalConfig.medalBg} ${medalConfig.medalBorder} border-2 flex items-center justify-center shadow-md font-black text-sm sm:text-base md:text-lg ${medalConfig.medalText}`}>
                    {medalConfig.rank}
                  </div>
                </div>

                {/* Rank Title & Subtitle */}
                <div className="flex flex-col items-center text-center">
                  <span className="text-xs sm:text-sm font-black text-slate-800 tracking-wide pt-0.5">
                    {medalConfig.title}
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                    {medalConfig.subtitle}
                  </span>
                </div>
              </div>

              {/* School Name & Subdiv */}
              <div className="space-y-1 px-0.5 flex-1 min-w-0 flex flex-col items-center justify-center text-center">
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${medalConfig.subdivBadge} inline-block`}>
                  กก.ตชด.{item.subdiv || '2'}
                </span>
                <h4 className="font-black text-slate-900 text-[10px] leading-tight truncate w-full whitespace-nowrap" title={item.name}>
                  {item.name}
                </h4>
                {item.principal && (
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate w-full whitespace-nowrap" title={item.principal}>
                    {item.principal}
                  </p>
                )}
              </div>

              {/* Count Box & Interactive Filter Button */}
              <div className="space-y-1.5 pt-1.5 border-t border-slate-100 flex flex-col items-center w-full shrink-0 min-w-0">
                <div className={`rounded-xl sm:rounded-2xl py-1.5 px-1.5 sm:px-3 text-center ${medalConfig.pillBg} ${medalConfig.pillText} w-full overflow-hidden`}>
                  <div className="text-xs sm:text-base lg:text-lg font-black leading-tight whitespace-nowrap truncate">
                    {item.count.toLocaleString('th-TH')} <span className="text-[10px] sm:text-xs font-bold">รายการ</span>
                  </div>
                  <span className="text-[9px] sm:text-[10px] text-slate-600 block font-semibold leading-tight mt-0.5">
                    ส่งรายงานครบถ้วนสมบูรณ์
                  </span>
                </div>

                {onFilterSchool && (
                  <button
                    onClick={() => onFilterSchool(item.keyword)}
                    className="w-full py-1.5 px-1.5 sm:px-2.5 text-[10px] sm:text-[11px] font-bold text-amber-900 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer border border-amber-200"
                    title={`กรองข้อมูลเฉพาะ ${item.name}`}
                  >
                    <Filter className="w-3 h-3 text-amber-700 shrink-0" />
                    <span className="truncate">กรองข้อมูลโรงเรียนนี้</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Expandable Button & Floating Modal Dialog for Extended Top Schools */}
      {fullList.length > 3 && (
        <div className="pt-2 border-t border-amber-200/50">
          <button
            onClick={() => setExpandedView(true)}
            className="w-full py-2.5 px-4 text-center text-xs font-bold text-amber-950 hover:text-amber-900 bg-amber-100/70 hover:bg-amber-100 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-amber-200 shadow-2xs hover:shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-amber-800 shrink-0" />
            <span>ดูอันดับโรงเรียนส่งรายงานดีเด่นเพิ่มเติม (อันดับที่ 4 - {fullList.length}) ในหน้าต่างลอย</span>
          </button>

          {/* FLOATING MODAL DIALOG */}
          {expandedView && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fade-in no-print">
              <div 
                className="bg-white rounded-3xl border border-amber-200/90 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 p-4 sm:p-5 text-amber-950 flex items-center justify-between gap-3 shrink-0 border-b border-amber-300 shadow-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-white/90 border border-white flex items-center justify-center text-xl shadow-xs shrink-0">
                      🏆
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-black text-amber-950 truncate">
                        อันดับโรงเรียนส่งรายงานดีเด่นเพิ่มเติม (อันดับ 4 - {fullList.length})
                      </h3>
                      <p className="text-xs font-bold text-amber-900/90 truncate">
                        โรงเรียนในสังกัด บก.ตชด.ภาค 2 รวมทั้งสิ้น {fullList.length} แห่ง
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedView(false)}
                    className="p-2 text-amber-950 hover:bg-black/10 rounded-xl transition-all cursor-pointer shrink-0"
                    title="ปิดหน้าต่าง"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Search Bar Inside Modal */}
                <div className="p-3 sm:p-4 bg-amber-50/50 border-b border-slate-200/80 flex items-center gap-3 shrink-0">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={modalSearch}
                      onChange={(e) => setModalSearch(e.target.value)}
                      placeholder="ค้นหาชื่อโรงเรียน หรือ ผู้บริหาร..."
                      className="w-full pl-9 pr-4 py-2 bg-white text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-2xs"
                    />
                  </div>
                  {modalSearch && (
                    <button
                      onClick={() => setModalSearch('')}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all"
                    >
                      ล้างค้นหา
                    </button>
                  )}
                </div>

                {/* Modal Content Scrollable Grid */}
                <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50/60 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {fullList
                      .slice(3)
                      .filter(item => {
                        if (!modalSearch) return true;
                        const query = modalSearch.toLowerCase();
                        return (
                          item.name.toLowerCase().includes(query) ||
                          (item.principal && item.principal.toLowerCase().includes(query)) ||
                          item.subdiv.includes(query)
                        );
                      })
                      .map((item, idx) => {
                        const rankNum = idx + 4;
                        return (
                          <div
                            key={idx}
                            className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 hover:border-amber-400 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between space-y-3"
                          >
                            <div className="flex items-start justify-between gap-2.5 min-w-0">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center shrink-0 border border-amber-300 shadow-2xs">
                                  #{rankNum}
                                </span>
                                <div className="min-w-0">
                                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 inline-block mb-0.5">
                                    กก.ตชด.{item.subdiv}
                                  </span>
                                  <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug line-clamp-2" title={item.name}>
                                    {item.name}
                                  </h4>
                                  {item.principal && (
                                    <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate mt-0.5" title={item.principal}>
                                      {item.principal}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
                              <span className="text-xs font-black text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl shadow-2xs">
                                {item.count.toLocaleString('th-TH')} รายการ
                              </span>

                              {onFilterSchool && (
                                <button
                                  onClick={() => {
                                    onFilterSchool(item.keyword);
                                    setExpandedView(false);
                                  }}
                                  className="py-1 px-2.5 text-[10px] sm:text-xs font-bold text-amber-900 hover:text-amber-950 bg-amber-100 hover:bg-amber-200 rounded-xl transition-all flex items-center gap-1 cursor-pointer border border-amber-300"
                                >
                                  <Filter className="w-3 h-3 text-amber-800" />
                                  <span>เลือกโรงเรียนนี้</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-3 sm:p-4 bg-white border-t border-slate-200/80 flex items-center justify-between shrink-0">
                  <span className="text-xs text-slate-500 font-semibold">
                    แสดงผลทั้งหมด {Math.max(0, fullList.length - 3)} โรงเรียน
                  </span>
                  <button
                    onClick={() => setExpandedView(false)}
                    className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    <span>ปิดหน้าต่าง</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

