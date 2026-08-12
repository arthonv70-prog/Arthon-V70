import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

interface AIChatbotProps {
  contextData: any;
}

export default function AIChatbot({ contextData }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: `สวัสดีครับ! ผมคือ <b>AI Assistant</b> ผมได้อ่านข้อมูลแดชบอร์ดทั้งหมดเรียบร้อยแล้ว <br/><br/>ท่านสามารถสอบถามสถิติหรือเจาะลึกข้อมูลได้ทันที เช่น:
            <ul class="list-disc pl-4 mt-1.5 space-y-1 text-slate-600">
              <li><i>"สรุปภาพรวมวันนี้ให้หน่อย"</i></li>
              <li><i>"มีโรงเรียนไหนบ้างที่ยังไม่ส่งรายงาน"</i></li>
              <li><i>"วิชาไหนสอนบ่อยที่สุด"</i></li>
            </ul>`,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: textToSend,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Gather relevant dashboard context to ground Gemini
      let contextStr = "นี่คือข้อมูลสถิติปัจจุบันจากแดชบอร์ดที่คุณต้องใช้อ้างอิงในการตอบคำถาม:\n";
      if (contextData && contextData.totalReports > 0) {
        contextStr += `- จำนวนรายงานที่ส่งเข้ามาทั้งหมด: ${contextData.totalReports} รายการ\n`;
        contextStr += `- จำนวนโรงเรียนที่ส่งแล้ว: ${contextData.submittedSchoolsCount} แห่ง\n`;
        contextStr += `- จำนวนโรงเรียนที่ยังไม่ส่ง (ค้างส่ง): ${contextData.pendingSchoolsCount} แห่ง\n`;
        if (contextData.pendingSchoolsCount > 0) {
          contextStr += `- รายชื่อโรงเรียนที่ค้างส่ง: ${contextData.pendingSchoolsList}\n`;
        }
        contextStr += `- รายงานที่พบปัญหาและอุปสรรค: ${contextData.problemCount} รายการ\n`;
        contextStr += `- วิชายอดนิยม 5 อันดับแรก: ${contextData.topSubjects}\n`;
        contextStr += `- อัตราการเข้าเรียนเฉลี่ยของนักเรียน: ${contextData.attendanceRatio}%\n`;
        contextStr += `- เวลาที่มีการส่งรายงานล่าสุด: ${contextData.latestUpdate}\n`;
      } else {
        contextStr += "ขณะนี้ผู้ใช้ยังไม่ได้ดึงข้อมูลใดๆ เข้าสู่ระบบแดชบอร์ด (ข้อมูลว่างเปล่า)\n";
      }

      const conversationHistory = [...messages, userMessage].map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        text: msg.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: conversationHistory,
          context: contextStr,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Server error');
      }

      const resData = await res.json();
      
      // Clean and format markdown/newlines for html display safely
      let formattedText = resData.text || '';
      formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<b class="text-indigo-900">$1</b>'); // Bold
      formattedText = formattedText.replace(/\n/g, '<br/>'); // Newlines
      formattedText = formattedText.replace(/\*/g, '<span class="text-indigo-400 font-black mr-1">•</span>'); // Bullets

      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          text: formattedText,
        },
      ]);
    } catch (e: any) {
      console.error(e);
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          text: `<span class="text-red-500 font-medium">ขออภัย เกิดข้อผิดพลาดในการรับข้อมูลจากเซิร์ฟเวอร์ AI (${e.message}) กรุณาลองใหม่อีกครั้ง</span>`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const starterPrompts = [
    'สรุปภาพรวมวันนี้ให้หน่อย',
    'มีโรงเรียนไหนค้างส่งบ้าง',
    'วิชาไหนสอนบ่อยที่สุด',
  ];

  return (
    <div className="fixed bottom-20 right-4 md:bottom-24 md:right-8 z-50 flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white w-[300px] sm:w-[350px] md:w-[380px] h-[400px] md:h-[480px] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden mb-4 pointer-events-auto transition-transform duration-300 transform scale-100 opacity-100 origin-bottom-right">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 sm:p-4 flex justify-between items-center text-white shrink-0 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
            <div className="flex items-center gap-2.5 relative z-10">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm text-lg">✨</div>
              <div>
                <h3 className="font-bold text-sm leading-tight drop-shadow-sm">AI Data Assistant</h3>
                <p className="text-[10px] text-indigo-100 leading-tight">ขับเคลื่อนโดย Gemini 3.6 Flash</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-indigo-200 transition-colors p-1.5 relative z-10 bg-black/10 hover:bg-black/20 rounded-full"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 text-[13px] flex flex-col scrollbar-thin">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex w-full ${msg.role === 'user' ? 'justify-end pl-6' : 'items-start gap-2.5 max-w-[95%] pr-4'}`}
              >
                {msg.role !== 'user' && (
                  <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 text-indigo-600 border border-indigo-200 shadow-sm text-xs">
                    ✨
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] leading-relaxed text-[12.5px] ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                  }`}
                  dangerouslySetInnerHTML={{ __html: msg.text }}
                />
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-2.5 w-full max-w-[95%] pr-4 mt-2">
                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 text-indigo-600 border border-indigo-200 shadow-sm text-xs">
                  ✨
                </div>
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Starter Chips */}
          <div className="p-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
            {starterPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                disabled={isLoading}
                className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 rounded-full text-[11px] font-medium transition-colors shrink-0 whitespace-nowrap cursor-pointer disabled:opacity-50"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-slate-100 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputValue);
              }}
              className="flex items-center gap-2 bg-slate-100 rounded-full pl-4 pr-1.5 py-1.5 border border-slate-200 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="พิมพ์คำถามของคุณที่นี่..."
                disabled={isLoading}
                className="flex-1 bg-transparent border-none outline-none text-[13px] text-slate-700 placeholder-slate-400 py-1 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 transition-colors rounded-full shadow-md flex items-center justify-center disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-4 h-4 transform -rotate-45 ml-0.5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-3.5 md:p-4 rounded-full shadow-[0_4px_15px_rgba(79,70,229,0.4)] transition-all duration-300 transform hover:scale-110 pointer-events-auto flex items-center justify-center relative group z-50 cursor-pointer"
      >
        {isOpen ? (
          <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-purple-500 border-2 border-white"></span>
            </span>
          </>
        )}
      </button>
    </div>
  );
}
