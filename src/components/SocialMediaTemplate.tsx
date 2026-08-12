import React from 'react';

interface SocialMediaTemplateProps {
  logo: string | null;
  schoolName: string;
  date: string;
  subject: string;
  imageUrl: string;
}

export default function SocialMediaTemplate({
  logo,
  schoolName,
  date,
  subject,
  imageUrl,
}: SocialMediaTemplateProps) {
  const defaultLogo = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231e3a8a"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>`;

  return (
    <div
      id="socialTemplateContainer"
      className="fixed -left-[9999px] top-0 no-print"
      style={{ pointerEvents: 'none' }}
    >
      <div
        id="socialTemplateContent"
        className="w-[1080px] h-[1080px] bg-white relative overflow-hidden flex flex-col items-center justify-between"
        style={{ fontFamily: "'Sarabun', sans-serif" }}
      >
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-[450px] bg-gradient-to-br from-blue-900 to-indigo-900 rounded-b-[120px] z-0 shadow-xl" />

        {/* Header */}
        <div className="relative z-10 w-full px-14 pt-14 flex justify-between items-center text-white">
          <div className="flex items-center gap-6">
            <img
              id="socialLogo"
              src={logo || defaultLogo}
              alt="Logo"
              className="w-28 h-28 object-contain bg-white rounded-full p-2.5 shadow-xl border-4 border-blue-100/20"
            />
            <div>
              <h2 className="text-[40px] font-black tracking-wide leading-tight drop-shadow-md">
                รายงานผลการปฏิบัติงาน
              </h2>
              <p className="text-2xl text-blue-100 mt-1 font-medium tracking-wider">
                กองกำกับการตำรวจตระเวนชายแดนภาค 2
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-white/10 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/20 shadow-inner">
              <span id="socialDate" className="text-[22px] font-bold tracking-wide">
                {date}
              </span>
            </div>
          </div>
        </div>

        {/* Main Image Container */}
        <div className="relative z-10 w-[940px] h-[640px] mt-8 bg-slate-900 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden border-[12px] border-white flex items-center justify-center">
          <img
            id="socialBgImage"
            src={imageUrl}
            crossOrigin="anonymous"
            alt="Blur Background"
            className="absolute inset-0 w-full h-full object-cover opacity-50 blur-xl scale-110"
          />
          <img
            id="socialMainImage"
            src={imageUrl}
            crossOrigin="anonymous"
            alt="Main Action"
            className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
          />
        </div>

        {/* Footer Details */}
        <div className="relative z-10 w-full px-12 pb-14 pt-8 flex flex-col items-center text-center">
          <h1
            id="socialSchool"
            className="text-[54px] font-black text-blue-950 mb-3 drop-shadow-sm leading-tight"
          >
            {schoolName}
          </h1>
          <p
            id="socialSubject"
            className="text-[32px] font-bold text-fuchsia-700 bg-fuchsia-50 px-8 py-2.5 rounded-full border-2 border-fuchsia-100 shadow-sm max-w-[90%] truncate"
          >
            {subject}
          </p>
        </div>

        {/* Watermark / Hashtag */}
        <div className="absolute bottom-6 right-8 opacity-40">
          <span className="text-xl font-bold text-slate-800 tracking-wider">#ตชดภาค2</span>
        </div>
      </div>
    </div>
  );
}
