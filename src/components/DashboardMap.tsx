import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { School } from '../types';
import { getApproximateCoords } from '../utils';
import {
  MapPin,
  RotateCcw,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Compass,
  X,
  Info,
  Table,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  User,
  Navigation,
  Check
} from 'lucide-react';

interface DashboardMapProps {
  schools: School[];
  statusMap: Record<string, { status: string; problems: string[] }>;
  onFilterSchool: (schoolKeyword: string) => void;
}

export default function DashboardMap({ schools, statusMap, onFilterSchool }: DashboardMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTable, setShowTable] = useState(false);
  const [tableSearch, setTableSearch] = useState('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  // Filtered schools for table
  const filteredSchoolsForTable = schools.filter(s => {
    if (!tableSearch.trim()) return true;
    const query = tableSearch.toLowerCase();
    const latStr = s.lat ? String(s.lat) : '';
    const lngStr = s.lng ? String(s.lng) : '';
    return (
      s.name.toLowerCase().includes(query) ||
      (s.principal && s.principal.toLowerCase().includes(query)) ||
      (s.address && s.address.toLowerCase().includes(query)) ||
      s.keyword.toLowerCase().includes(query) ||
      latStr.includes(query) ||
      lngStr.includes(query)
    );
  });

  const handleCopyCoords = (lat: number | undefined, lng: number | undefined, idx: number) => {
    if (!lat || !lng) return;
    const coordStr = `${lat}, ${lng}`;
    navigator.clipboard.writeText(coordStr);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  // Calculate status counts
  const stats = schools.reduce(
    (acc, school) => {
      const s = statusMap[school.keyword]?.status || 'gray';
      if (s === 'green') acc.green++;
      else if (s === 'yellow') acc.yellow++;
      else if (s === 'red') acc.red++;
      else acc.gray++;
      return acc;
    },
    { green: 0, yellow: 0, red: 0, gray: 0 }
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const mapContainer = containerRef.current;
    let resizeObserver: ResizeObserver | null = null;
    let mapInstance: L.Map | null = null;

    if (!mapRef.current) {
      // Clear stale leaflet id property to prevent double-init errors
      if (mapContainer && (mapContainer as any)._leaflet_id) {
        delete (mapContainer as any)._leaflet_id;
      }

      mapInstance = L.map(mapContainer, {
        zoomControl: true,
        scrollWheelZoom: false,
      }).setView([16.5, 103.5], 7);

      L.tileLayer('https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}', {
        attribution: '© Google Maps / OSM',
        maxZoom: 20,
      }).addTo(mapInstance);

      const markersGroup = L.layerGroup().addTo(mapInstance);
      
      mapRef.current = mapInstance;
      markersGroupRef.current = markersGroup;

      resizeObserver = new ResizeObserver(() => {
        if (mapInstance) {
          mapInstance.invalidateSize();
        }
      });
      resizeObserver.observe(mapContainer);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          console.error('Error removing leaflet map:', e);
        }
        mapRef.current = null;
        markersGroupRef.current = null;
      }
    };
  }, []);

  // Update Markers when schools or status changes
  useEffect(() => {
    const map = mapRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    schools.forEach((school, index) => {
      const sData = statusMap[school.keyword];
      const status = sData ? sData.status : 'gray';

      const coords: [number, number] = (school.lat && school.lng)
        ? [school.lat, school.lng]
        : getApproximateCoords(school.address, index);

      // Custom marker HTML using inline Tailwind colors
      let markerColorClass = 'bg-slate-400 opacity-70'; // gray
      let pulseRing = '';
      if (status === 'green') {
        markerColorClass = 'bg-emerald-500 ring-2 ring-emerald-300/80';
      } else if (status === 'yellow') {
        markerColorClass = 'bg-amber-500 ring-2 ring-amber-300/80';
      } else if (status === 'red') {
        markerColorClass = 'bg-red-500 animate-pulse ring-4 ring-red-300';
      }

      const markerHtml = `
        <div class="relative flex items-center justify-center">
          <div class="w-[20px] h-[20px] rounded-full border-2 border-white shadow-md transition-transform hover:scale-125 hover:z-[1000] flex items-center justify-center text-[9px] font-black text-white ${markerColorClass}">
            ${index + 1}
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: markerHtml,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -12],
      });

      const marker = L.marker(coords, { icon });

      // Create popup content
      let popupContent = `
        <div class="p-1 font-sans text-xs max-w-[260px]">
          <div class="flex items-center gap-1.5 mb-1 pb-1 border-b border-slate-200">
            <span class="w-5 h-5 rounded-md bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[10px] shrink-0">${index + 1}</span>
            <b class="text-xs text-blue-950 font-bold block truncate">${school.name}</b>
          </div>
          <span class="text-[11px] text-slate-500 block mb-2">${school.address}</span>
      `;

      if (status === 'gray') {
        popupContent += `<div class="flex items-center gap-1.5 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md text-[11px]"><span class="w-2 h-2 rounded-full bg-slate-400"></span> ยังไม่ส่งรายงาน</div>`;
      } else if (status === 'green') {
        popupContent += `<div class="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md font-medium text-[11px]"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> ส่งรายงานปกติ (ครบสมบูรณ์)</div>`;
      } else if (status === 'yellow') {
        popupContent += `<div class="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md font-medium text-[11px]"><span class="w-2 h-2 rounded-full bg-amber-500"></span> ส่งรายงานล่าช้า (>1 วัน)</div>`;
      } else if (status === 'red') {
        popupContent += `
          <div class="text-red-700 bg-red-50 p-2.5 rounded-md border border-red-100">
            <div class="font-bold flex items-center gap-1.5 mb-1 text-[11px]"><span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> พบปัญหา/อุปสรรค:</div>
            <ul class="pl-4 mt-1 text-[11px] list-disc space-y-1">
        `;
        const uniqueProbs = Array.from(new Set(sData.problems)).slice(0, 3);
        uniqueProbs.forEach(p => popupContent += `<li>${p}</li>`);
        if (sData.problems.length > 3) popupContent += `<li class="text-slate-400 italic">...และอื่นๆ</li>`;
        popupContent += `</ul></div>`;
      }

      // Action buttons inside popup
      popupContent += `
        <div class="mt-2.5 flex gap-1.5 w-full">
          <button id="btn-popup-filter-${index}" class="flex-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg transition-colors text-center shadow-xs truncate cursor-pointer">
            🔍 กรองข้อมูล รร. นี้
          </button>
          <a href="https://www.google.com/maps/search/?api=1&query=${coords[0]},${coords[1]}" target="_blank" class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition-colors text-center border border-slate-200 shadow-xs flex items-center justify-center gap-1 shrink-0">
            📍 นำทาง
          </a>
        </div>
      </div>
      `;

      marker.bindPopup(popupContent);
      marker.addTo(markersGroup);

      // Hook click event inside popup dynamically
      marker.on('popupopen', () => {
        const filterBtn = document.getElementById(`btn-popup-filter-${index}`);
        if (filterBtn) {
          filterBtn.addEventListener('click', () => {
            onFilterSchool(school.keyword);
            map.closePopup();
          });
        }
      });
    });
  }, [schools, statusMap, onFilterSchool]);

  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.setView([16.5, 103.5], 7, { animate: true });
    }
  };

  const handleSearchSchool = (keyword: string) => {
    setSearchTerm(keyword);
    if (!keyword.trim() || !mapRef.current) return;
    const matchIdx = schools.findIndex(
      s => s.name.toLowerCase().includes(keyword.toLowerCase()) || s.keyword.includes(keyword) || s.address.includes(keyword)
    );
    if (matchIdx !== -1) {
      const school = schools[matchIdx];
      const coords: [number, number] = (school.lat && school.lng)
        ? [school.lat, school.lng]
        : getApproximateCoords(school.address, matchIdx);
      mapRef.current.setView(coords, 12, { animate: true });
    }
  };

  return (
    <div className="app-card-surface p-3 sm:p-7 w-full space-y-3 sm:space-y-5">
      {/* Header Info Area */}
      <div className="flex flex-col gap-2 sm:gap-3 border-b border-slate-100 pb-2.5 sm:pb-4 w-full">
        <div className="flex items-start gap-2.5 sm:gap-3 w-full">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0 border border-blue-400/30 mt-0.5 sm:mt-0">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-100" />
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-extrabold text-blue-800 bg-blue-50 px-2 sm:px-2.5 py-0.5 rounded-full border border-blue-200/80 shadow-2xs shrink-0 whitespace-nowrap">
                บก.ตชด.ภาค ๒ (๕๓ โรงเรียน)
              </span>
            </div>
            <h3 className="typo-app-h3 text-slate-900 font-black text-sm sm:text-lg md:text-xl leading-snug truncate min-w-0 w-full">
              แผนที่ภูมิสารสนเทศแสดงสถานะความพร้อมรายโรงเรียน
            </h3>
            <p className="typo-app-subtext flex items-start sm:items-center gap-1 text-[11px] sm:text-sm text-slate-600 leading-normal">
              <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5 sm:mt-0" />
              <span className="text-[11px] sm:text-sm">ติดตามสถานะการส่งรายงานและความพร้อมของอุปกรณ์ปลายทางแบบเรียลไทม์รายพิกัด GIS</span>
            </p>
          </div>
        </div>
      </div>

      {/* Control Strip: Legend Status Badges & Quick Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 sm:gap-3 bg-slate-50/80 p-2 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-200/80">
        {/* Status Indicator Badges */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 sm:gap-2 text-xs font-bold w-full lg:w-auto">
          <span className="inline-flex items-center justify-center sm:justify-start gap-1 px-2 py-1.5 bg-white rounded-lg sm:rounded-xl shadow-2xs text-emerald-800 border border-emerald-200/80 text-[11px] sm:text-[11px] font-black whitespace-nowrap">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>ส่งปกติ ({stats.green})</span>
          </span>
          <span className="inline-flex items-center justify-center sm:justify-start gap-1 px-2 py-1.5 bg-white rounded-lg sm:rounded-xl shadow-2xs text-amber-800 border border-amber-200/80 text-[11px] sm:text-[11px] font-black whitespace-nowrap">
            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>ส่งล่าช้า ({stats.yellow})</span>
          </span>
          <span className="inline-flex items-center justify-center sm:justify-start gap-1 px-2 py-1.5 bg-white rounded-lg sm:rounded-xl shadow-2xs text-red-800 border border-red-200/80 text-[11px] sm:text-[11px] font-black whitespace-nowrap">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600 animate-pulse shrink-0" />
            <span>พบปัญหา ({stats.red})</span>
          </span>
          <span className="inline-flex items-center justify-center sm:justify-start gap-1 px-2 py-1.5 bg-white rounded-lg sm:rounded-xl shadow-2xs text-slate-700 border border-slate-200/80 text-[11px] sm:text-[11px] font-black whitespace-nowrap">
            <XCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>ยังไม่ส่ง ({stats.gray})</span>
          </span>
        </div>

        {/* Quick Search */}
        <div className="relative w-full lg:w-72 shrink-0">
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 absolute left-2.5 sm:left-3 top-2.5 sm:top-2.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="ค้นหาโรงเรียนบนแผนที่..."
            value={searchTerm}
            onChange={(e) => handleSearchSchool(e.target.value)}
            className="w-full text-[11px] sm:text-xs font-semibold pl-8 sm:pl-9 pr-8 py-1.5 sm:py-2 bg-white hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg sm:rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-2xs"
          />
          {searchTerm && (
            <button
              onClick={() => handleSearchSchool('')}
              className="absolute right-2.5 top-2 sm:top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative w-full h-[400px] sm:h-[460px] md:h-[500px] rounded-2xl border border-slate-200/80 overflow-hidden shadow-inner">
        <div ref={containerRef} className="w-full h-full z-0" />
        
        {/* Reset View Floating Button at Top Right Corner inside Map */}
        <button
          onClick={handleResetView}
          className="absolute top-3 right-3 z-[400] px-3.5 py-2 bg-white/95 hover:bg-white text-slate-800 hover:text-blue-700 active:scale-95 rounded-xl transition-all cursor-pointer shadow-md border border-slate-200/90 text-xs font-bold flex items-center gap-1.5 shrink-0 whitespace-nowrap backdrop-blur-md hover:border-blue-300"
          title="รีเซ็ตมุมมองศูนย์กลาง บก.ตชด.ภาค ๒"
        >
          <Compass className="w-4 h-4 text-blue-600 shrink-0" />
          <span>รีเซ็ตศูนย์กลาง</span>
        </button>
      </div>

      {/* School Directory Table Section (ที่ตั้งโรงเรียนและพิกัด GPS) */}
      <div className="pt-2 border-t border-slate-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <button
            onClick={() => setShowTable(prev => !prev)}
            className="flex items-center gap-2.5 text-left font-extrabold text-slate-800 hover:text-blue-700 transition-colors cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Table className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                <span>ตารางข้อมูลรายชื่อครูใหญ่ ที่ตั้ง และพิกัด GPS</span>
                <span className="text-[11px] font-black text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                  {filteredSchoolsForTable.length} / {schools.length} รร.
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">สังกัด บก.ตชด.ภาค ๒ (อ้างอิงฐานข้อมูลในระบบ)</p>
            </div>
            {showTable ? (
              <ChevronUp className="w-5 h-5 text-slate-400 ml-auto" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400 ml-auto" />
            )}
          </button>

          {showTable && (
            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ, ครูใหญ่, ที่ตั้ง, พิกัด..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="w-full text-xs font-semibold pl-8 pr-7 py-1.5 bg-white border border-slate-300 focus:border-blue-500 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              {tableSearch && (
                <button
                  onClick={() => setTableSearch('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {showTable && (
          <div className="overflow-x-auto rounded-2xl border border-slate-200/90 shadow-2xs bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 font-black border-b border-slate-200 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-3 text-center w-12">ลำดับ</th>
                  <th className="py-3 px-4 min-w-[180px]">ชื่อโรงเรียน</th>
                  <th className="py-3 px-4 min-w-[160px]">ชื่อครูใหญ่</th>
                  <th className="py-3 px-4 min-w-[260px]">ที่ตั้งโรงเรียน</th>
                  <th className="py-3 px-4 min-w-[170px]">พิกัด GPS (Lat, Lng)</th>
                  <th className="py-3 px-3 text-center w-28">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium text-xs">
                {filteredSchoolsForTable.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold italic">
                      ไม่พบข้อมูลโรงเรียนที่ค้นหา
                    </td>
                  </tr>
                ) : (
                  filteredSchoolsForTable.map((s, idx) => {
                    const originalIndex = schools.findIndex(item => item.keyword === s.keyword);
                    const coords = (s.lat && s.lng) ? [s.lat, s.lng] : getApproximateCoords(s.address, originalIndex);
                    
                    return (
                      <tr key={s.keyword || idx} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3 px-3 text-center font-bold text-slate-500 bg-slate-50/50">
                          {originalIndex !== -1 ? originalIndex + 1 : idx + 1}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                            <span>{s.name}</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                            กก.ตชด.{s.subdiv || '2'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>{s.principal || 'ไม่ระบุ'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 leading-relaxed max-w-xs">
                          {s.address || 'ไม่ระบุที่ตั้ง'}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] font-bold text-slate-800">
                          <div className="flex items-center gap-1.5">
                            <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded-md border border-slate-200 select-all">
                              {coords[0].toFixed(6)}, {coords[1].toFixed(6)}
                            </span>
                            <button
                              onClick={() => handleCopyCoords(coords[0], coords[1], idx)}
                              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                              title="คัดลอกพิกัด GPS"
                            >
                              {copiedIdx === idx ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleSearchSchool(s.name)}
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                              title="ซูมไปยังตำแหน่งบนแผนที่"
                            >
                              <Navigation className="w-3 h-3" />
                              <span className="hidden md:inline">แผนที่</span>
                            </button>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${coords[0]},${coords[1]}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                              title="เปิดใน Google Maps"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span className="hidden md:inline">นำทาง</span>
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

