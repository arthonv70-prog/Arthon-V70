import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Target, 
  Workflow, 
  Award, 
  Layers, 
  FileText, 
  BarChart3, 
  Sliders, 
  Search, 
  MapPin, 
  AlertTriangle, 
  ShieldCheck, 
  Zap, 
  Info, 
  ArrowRight,
  GraduationCap,
  Image,
  Map,
  Compass,
  FileEdit,
  Globe,
  Printer,
  CheckCircle2,
  ListOrdered,
  HelpCircle,
  Clock,
  Share2
} from 'lucide-react';

interface SystemConceptGuideProps {
  onGoToDashboard?: () => void;
  onGoToReports?: () => void;
}

export default function SystemConceptGuide({
  onGoToDashboard,
  onGoToReports
}: SystemConceptGuideProps) {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'features' | 'workflow' | 'benefits'>('overview');

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-12 min-w-0">
      {/* Hero Welcome Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white p-6 sm:p-10 shadow-xl border border-indigo-900/50">
        {/* Abstract Glow circles in background */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300 animate-pulse" />
            <span>คู่มือการใช้งานและโครงสร้างการทำงานระบบ (Comprehensive System Guide)</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
            ระบบศูนย์บัญชาการข้อมูลสถิติ & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-100">รายงานผลการจัดการเรียนรู้</span>
          </h2>
          
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
            โรงเรียนตำรวจตระเวนชายแดน สังกัด กองบังคับการตำรวจตระเวนชายแดนภาค ๒ (บก.ตชด.ภาค ๒) 
            เครื่องมือดิจิทัลอัจฉริยะสำหรับครูผู้สอน ผู้บริหาร และผู้ตรวจการ เพื่อติดตามสถิติและจัดทำเอกสารมาตรฐานอย่างมีประสิทธิภาพ
          </p>

          {/* Quick Sub-navigation bar inside Hero */}
          <div className="pt-4 flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={() => setActiveSubTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'overview'
                  ? 'bg-white text-indigo-950 shadow-lg font-black'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>๑. ภาพรวม & เป้าประสงค์</span>
            </button>

            <button
              onClick={() => setActiveSubTab('features')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'features'
                  ? 'bg-amber-400 text-amber-950 shadow-lg font-black'
                  : 'bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/30'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>๒. คู่มือใช้งานแยกตามฟังก์ชัน</span>
            </button>

            <button
              onClick={() => setActiveSubTab('workflow')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'workflow'
                  ? 'bg-white text-indigo-950 shadow-lg font-black'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
              }`}
            >
              <Workflow className="w-4 h-4" />
              <span>๓. กลไกการประมวลผลข้อมูล</span>
            </button>

            <button
              onClick={() => setActiveSubTab('benefits')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'benefits'
                  ? 'bg-white text-indigo-950 shadow-lg font-black'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>๔. ประโยชน์ที่ได้รับ & คำถามบ่อย</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: OVERVIEW & OBJECTIVES */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          {/* Section 1: System Nature */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                <Info className="w-6 h-6" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-xs font-black">ส่วนที่ ๑</span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    ระบบนี้คืออะไร? (System Overview)
                  </h3>
                </div>
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                  <strong className="text-indigo-950 font-bold">ระบบสร้างรายงานผลการปฏิบัติงานการจัดการเรียนรู้ (Automatic Academic Reporting System)</strong> เป็นนวัตกรรมเว็บแอปพลิเคชันที่พัฒนาขึ้นเพื่อรองรับโรงเรียนตำรวจตระเวนชายแดนทั้ง 53 แห่ง ในสังกัด บก.ตชด.ภาค 2 (ครอบคลุม กก.ตชด.21, 22, 23, 24) ทำหน้าที่แปลงข้อมูลตอบแบบฟอร์มบันทึกการสอนออนไลน์ (<span className="font-semibold text-slate-900">Google Forms / Google Sheets</span>) ให้กลายเป็น <strong className="text-purple-900">แผงควบคุมสถิติยุทธศาสตร์เชิงลึก</strong> สำหรับผู้บริหาร และ <strong className="text-emerald-900">ฉบับเอกสารรายงานแบบมาตรฐาน A4</strong> พร้อมพิมพ์ลงนามได้ทันทีโดยไม่ต้องจัดหน้าใหม่
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Core Objectives Grid */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-black">เป้าประสงค์หลัก</span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  วัตถุประสงค์ในการพัฒนาระบบ
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-indigo-50/40 hover:border-indigo-200 transition-all space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Zap className="w-5 h-5" />
                </div>
                <h4 className="text-base font-black text-slate-900">ลดภาระงานซ้ำซ้อนของครูผู้สอน</h4>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  เปลี่ยนกระบวนการทำเอกสารจากการพิมพ์ข้อความ แทรกรูปภาพ ปรับขอบกระดาษใน Word/Excel ให้เหลือเพียงการกรอกข้อมูลแบบฟอร์มสั้นๆ
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-purple-50/40 hover:border-purple-200 transition-all space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h4 className="text-base font-black text-slate-900">ติดตามผลการเรียนการสอน Real-time</h4>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  ผู้บริหารสามารถตรวจสอบได้ทันทีว่าครูโรงเรียนใดสอนถึงบทใด รายวิชาใดล่าช้า และมีปัญหาอุปสรรคใดเกิดขึ้นในพื้นที่
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-emerald-50/40 hover:border-emerald-200 transition-all space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-base font-black text-slate-900">มาตรฐานรูปเล่มและเอกสารทางราชการ</h4>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  รับประกันความถูกต้องของการจัดพิมพ์ A4 โครงสร้างส่วนหัว ตราสัญลักษณ์ ยศ ตำแหน่งผู้บังคับบัญชา และรูปภาพกิจกรรม
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: FEATURE-BY-FEATURE USER MANUAL */}
      {(activeSubTab === 'features' || activeSubTab === 'overview') && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-xs font-black">คู่มือฉบับสมบูรณ์</span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    วิธีการใช้งานครอบคลุมทุกเมนูและฟังก์ชันระบบ
                  </h3>
                </div>
              </div>
            </div>

            {/* Menu 1: Dashboard */}
            <div className="p-5 sm:p-7 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-200/80 pb-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                  📊
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-black text-slate-900">
                    ๑. เมนู "แผงควบคุมสถิติหลัก" (Dashboard & Analytics)
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">มุมมองสถิติยุทธศาสตร์สำหรับผู้บริหารและผู้ตรวจสอบ</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <div className="space-y-2 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                  <h5 className="font-black text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    กล่องตัวเลขสถิติสำคัญ (KPi Metrics)
                  </h5>
                  <p className="text-slate-600 text-xs">
                    แสดงจำนวนรายงานรวมทั้งหมด, อัตราส่งตรงเวลา (%), จำนวนโรงเรียนที่ส่งรายงาน, และจำนวนรูปภาพกิจกรรมที่ถูกวิเคราะห์
                  </p>
                </div>

                <div className="space-y-2 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                  <h5 className="font-black text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    แผนที่เชิงภูมิศาสตร์ (Interactive Map)
                  </h5>
                  <p className="text-slate-600 text-xs">
                    แสดงตำแหน่งปักหมุดของทั้ง 53 โรงเรียน แยกตาม กก.ตชด.21-24 สามารถคลิกหมุดบนแผนที่เพื่อกรองรายงานเฉพาะโรงเรียนนั้นได้ทันที
                  </p>
                </div>

                <div className="space-y-2 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                  <h5 className="font-black text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-600" />
                    อันดับโรงเรียนส่งรายงานดีเด่น (Honor Leaderboard)
                  </h5>
                  <p className="text-slate-600 text-xs">
                    แสดง 3 อันดับแรกบนการ์ดเกียรติยศ และมีปุ่มกด <strong className="text-amber-900">"ดูอันดับเพิ่มเติมในหน้าต่างลอย"</strong> เพื่อเปิด Modal ดูอันดับและค้นหาทั้ง 53 โรงเรียน
                  </p>
                </div>

                <div className="space-y-2 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                  <h5 className="font-black text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    การวิเคราะห์อุปสรรคด้วย AI & สถิติ
                  </h5>
                  <p className="text-slate-600 text-xs">
                    สรุปประเด็นปัญหาอุปสรรคในการสอน (เช่น สื่อการสอนไม่พอ, ไฟฟ้าดับ, กิจกรรมแทรก) พร้อมข้อเสนอแนะเชิงแก้ไข
                  </p>
                </div>
              </div>
            </div>

            {/* Menu 2: Academic Progress */}
            <div className="p-5 sm:p-7 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-200/80 pb-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                  🧭
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-black text-slate-900">
                    ๒. เมนู "ระบบติดตามความก้าวหน้าการเรียนการสอน" (Academic Progress)
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">เครื่องมือติดตามเนื้อหาบทเรียนและวิเคราะห์แผนการสอน</p>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <div className="p-4 bg-white rounded-xl border border-slate-200/80 space-y-2">
                  <h5 className="font-black text-purple-950 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-purple-700" />
                    แผงควบคุม 3 ขั้นตอน (3-Step Filter Cockpit)
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 text-xs pl-1">
                    <li><strong>ขั้นตอนที่ 1:</strong> เลือกกองกำกับการ หรือ เจาะจงเลือกโรงเรียนรายแห่งจากตัวเลือก Dropdown (53 โรงเรียน)</li>
                    <li><strong>ขั้นตอนที่ 2:</strong> เลือกระดับชั้นเรียน (ป.1 - ป.6) หรือเลือกดูภาพรวมทุกระดับชั้น</li>
                    <li><strong>ขั้นตอนที่ 3:</strong> เลือกล่มสาระการเรียนรู้ (8 กลุ่มสาระ) หรือค้นหาด้วยคีย์เวิร์ด</li>
                  </ul>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200/80 space-y-2">
                  <h5 className="font-black text-purple-950 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-purple-700" />
                    การแสดงผลความคืบหน้ารายวิชา (Lesson Progress Card)
                  </h5>
                  <p className="text-slate-600 text-xs">
                    แสดงสถานะการสอนล่าสุด เช่น <span className="bg-purple-900 text-white px-2 py-0.5 rounded font-bold">🎯 กำลังสอนถึง: บทที่ 2 การบวกจำนวน</span>, วันที่สอนล่าสุด, หลอดความคืบหน้า (%) และรายการประเด็นอุปสรรคเฉพาะวิชา
                  </p>
                </div>
              </div>
            </div>

            {/* Menu 3: Reports */}
            <div className="p-5 sm:p-7 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-200/80 pb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                  📄
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-black text-slate-900">
                    ๓. เมนู "เอกสารรายงานผลตามมาตรฐาน (A4)" (Standard Reports & Print)
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">พิมพ์ฉบับจริง แก้ไขตัวอักษรบนหน้ากระดาษ และสร้างไฟล์ PDF</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <div className="space-y-2 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                  <h5 className="font-black text-emerald-950 flex items-center gap-2">
                    <FileEdit className="w-4 h-4 text-emerald-700" />
                    การแก้ไขข้อความสดบนหน้ากระดาษ (Inline Editing)
                  </h5>
                  <p className="text-slate-600 text-xs">
                    สามารถคลิกพิมพ์แก้ไขชื่อที่ตั้งโรงเรียน, ยศ, และ ชื่อ-สกุลของผู้บังคับบัญชา ได้ทันทีบนแผ่นกระดาษ A4 ระบบจะซิงค์ข้อมูลไปยังทุกหน้าของโรงเรียนเดียวกันโดยอัตโนมัติ
                  </p>
                </div>

                <div className="space-y-2 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                  <h5 className="font-black text-emerald-950 flex items-center gap-2">
                    <Image className="w-4 h-4 text-emerald-700" />
                    การประมวลผลรูปภาพกิจกรรมจาก Google Drive
                  </h5>
                  <p className="text-slate-600 text-xs">
                    รูปภาพกิจกรรมที่แนบมากับแบบฟอร์มจะถูกแปลงลิงก์อัตโนมัติ แสดงผลอย่างชัดเจนพร้อมคำอธิบายภาพใต้รูป
                  </p>
                </div>

                <div className="space-y-2 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                  <h5 className="font-black text-emerald-950 flex items-center gap-2">
                    <Printer className="w-4 h-4 text-emerald-700" />
                    การเลือกหน้าที่ต้องการพิมพ์ & ส่งออก PDF
                  </h5>
                  <p className="text-slate-600 text-xs">
                    เลือกพิมพ์แบบรายแผ่น (ติ๊กถูกมุมบน), ระบุช่วงหน้า (เช่น <code className="bg-slate-100 px-1 rounded">1-5, 8</code>) หรือกดปุ่ม <strong className="text-rose-700">"สร้างไฟล์ PDF"</strong> สีแดง เพื่อดาวน์โหลดไฟล์ไปใช้งาน
                  </p>
                </div>

                <div className="space-y-2 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                  <h5 className="font-black text-emerald-950 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-600" />
                    การปักหมุดที่ตั้งโรงเรียนบนแผนที่
                  </h5>
                  <p className="text-slate-600 text-xs">
                    คลิกไอคอนหมุดสีแดงท้ายช่องที่ตั้ง เพื่อเปิดแผนที่เลือกพิกัด latitude/longitude ของโรงเรียน
                  </p>
                </div>
              </div>
            </div>

            {/* Menu 4: Gallery Archive */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-3 border-b border-slate-200/80 pb-2">
                <div className="w-8 h-8 rounded-lg bg-pink-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  🖼️
                </div>
                <h4 className="text-base font-black text-slate-900">
                  ๔. คลังภาพกิจกรรม (Gallery Archive)
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                รวบรวมรูปภาพกิจกรรมการเรียนรู้ของทุกโรงเรียน สามารถสืบค้นตามระดับชั้น สาระการเรียนรู้ หรือวันที่ เพื่อนำภาพไปประกอบสื่อหรือนำเสนอผลงาน
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: DATA PROCESSING PIPELINE */}
      {(activeSubTab === 'workflow' || activeSubTab === 'overview') && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200/80 flex items-center justify-center shrink-0 shadow-2xs">
              <Workflow className="w-6 h-6" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-xs font-black">สถาปัตยกรรมข้อมูล</span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                กลไกการทำงานและประมวลผลข้อมูล 3 ขั้นตอน
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Step 1 */}
            <div className="relative p-6 rounded-2xl bg-gradient-to-b from-blue-50/80 to-white border border-blue-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black text-base flex items-center justify-center shadow-md shadow-blue-200">
                  1
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-100/60 px-2 py-0.5 rounded-md">
                  Ingestion
                </span>
              </div>
              <h4 className="text-base font-black text-slate-900">
                1. เชื่อมโยงและดึงข้อมูล (Sheets Ingestion)
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                ระบบเชื่อมต่อกับ Google Sheets ผ่าน URL CSV Export ดึงข้อมูลการตอบแบบฟอร์มบันทึกการสอนมาทำความสะอาด (Data Cleaning) และแปลงรูปแบบวันที่ให้อยู่ในมาตรฐานพุทธศักราช (พ.ศ.)
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 rounded-2xl bg-gradient-to-b from-purple-50/80 to-white border border-purple-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white font-black text-base flex items-center justify-center shadow-md shadow-purple-200">
                  2
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 bg-purple-100/60 px-2 py-0.5 rounded-md">
                  Analytics & AI
                </span>
              </div>
              <h4 className="text-base font-black text-slate-900">
                2. ประมวลผลสถิติและวิเคราะห์ (Data Processing)
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                จำแนกข้อมูลตามสังกัด กก.ตชด.21-24 คำนวณร้อยละความตรงต่อเวลา สกัดประเด็นปัญหาด้วยตัวกรองข้อความ และเชื่อมโยงเนื้อหาตามโครงสร้างหลักสูตรการศึกษา
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 rounded-2xl bg-gradient-to-b from-emerald-50/80 to-white border border-emerald-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-black text-base flex items-center justify-center shadow-md shadow-emerald-200">
                  3
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                  Render & PDF
                </span>
              </div>
              <h4 className="text-base font-black text-slate-900">
                3. จัดหน้ากระดาษ A4 และ พิมพ์ (Export Engine)
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                จัดองค์ประกอบรูปภาพ คำอธิบาย และแบบลงนามให้อยู่ในสัดส่วนกระดาษ A4 มาตรฐาน พร้อมเครื่องมือสร้าง PDF คุณภาพสูงที่ไม่สูญเสียความคมชัด
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: BENEFITS & TIPS */}
      {(activeSubTab === 'benefits' || activeSubTab === 'overview') && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-xs font-black">ประโยชน์ที่ได้รับ</span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  ข้อดีสำหรับครูผู้สอนและผู้บริหาร
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 transition-all space-y-2">
                <div className="text-2xl">⏱️</div>
                <h4 className="text-sm font-black text-slate-900">ประหยัดเวลา 90%</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  ไม่ต้องเสียเวลาคัดลอกข้อความและจัดเรียงรูปภาพในโปรแกรมพิมพ์งาน
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-purple-300 transition-all space-y-2">
                <div className="text-2xl">📱</div>
                <h4 className="text-sm font-black text-slate-900">รองรับทุกอุปกรณ์</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  ใช้งานได้ผ่านเว็บเบราว์เซอร์ทั้งบนคอมพิวเตอร์ แท็บเล็ต และสมาร์ทโฟน
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition-all space-y-2">
                <div className="text-2xl">📊</div>
                <h4 className="text-sm font-black text-slate-900">ข้อมูลถูกต้องแม่นยำ</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  ระบบดึงข้อมูลโดยตรงจากฐานข้อมูล ลดข้อผิดพลาดจากการคัดลอกด้วยมือ
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-amber-300 transition-all space-y-2">
                <div className="text-2xl">🌱</div>
                <h4 className="text-sm font-black text-slate-900">เป็นมิตรต่อสิ่งแวดล้อม</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  ตรวจทานความถูกต้องบนหน้าจอก่อนสั่งพิมพ์ ช่วยลดการสิ้นเปลืองกระดาษ
                </p>
              </div>
            </div>

            {/* Warning / Tip Box */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-950 text-xs sm:text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">ข้อแนะนำสำคัญในการสร้างไฟล์ PDF:</p>
                <p className="text-xs text-amber-900/90 leading-relaxed">
                  ในการสั่งพิมพ์หรือแปลงไฟล์ PDF หากมีเอกสารจำนวนมากเกิน 30-40 หน้า แนะนำให้ใช้ตัวเลือกกำหนดช่วงหน้า (เช่น <code className="bg-white/80 px-1 py-0.5 rounded font-bold border border-amber-200">1-15</code>) เพื่อการประมวลผลที่รวดเร็วและป้องกันเบราว์เซอร์ช้าลง
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Navigation Bar at bottom */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-slate-800">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-lg font-black text-white">พร้อมเริ่มต้นใช้งานระบบแล้วหรือยัง?</h4>
          <p className="text-xs text-slate-400">เลือกระบบที่ต้องการดำเนินการเพื่อเข้าสู่หน้าต่างทำงานทันที</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {onGoToDashboard && (
            <button
              onClick={onGoToDashboard}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-900/30 flex items-center gap-2 cursor-pointer shrink-0"
            >
              <BarChart3 className="w-4 h-4" />
              <span>ไปยัง แดชบอร์ดหลัก</span>
            </button>
          )}

          {onGoToReports && (
            <button
              onClick={onGoToReports}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-900/30 flex items-center gap-2 cursor-pointer shrink-0"
            >
              <FileText className="w-4 h-4" />
              <span>ไปยัง เอกสาร A4</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
