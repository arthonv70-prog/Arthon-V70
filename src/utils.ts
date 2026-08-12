export function parseThaiDateObj(dStr: string): Date {
  if (!dStr) return new Date(0);

  const thaiNums = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
  let arabicStr = String(dStr);
  for (let i = 0; i < 10; i++) {
    arabicStr = arabicStr.split(thaiNums[i]).join(String(i));
  }

  let str = arabicStr.trim().split(/[\s,]+/)[0];
  let parts = str.split(/[\/\-]/);

  if (parts.length >= 3) {
    let d = parseInt(parts[0]);
    let m = parseInt(parts[1]);
    let y = parseInt(parts[2]);

    if (parts[0].length === 4) {
      y = parseInt(parts[0]);
      m = parseInt(parts[1]);
      d = parseInt(parts[2]);
    } else if (m > 12 && d <= 12) {
      let temp = m;
      m = d;
      d = temp;
    }

    if (y > 2400) y -= 543;
    return new Date(y, m - 1, d);
  }

  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const shortThaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];

  let spaceParts = arabicStr.trim().split(/\s+/);
  if (spaceParts.length >= 3) {
    let d = parseInt(spaceParts[0]);
    let mStr = spaceParts[1];
    let y = parseInt(spaceParts[2]);

    let m = thaiMonths.indexOf(mStr);
    if (m === -1) m = shortThaiMonths.indexOf(mStr);

    if (!isNaN(d) && m !== -1 && !isNaN(y)) {
      if (y > 2400) y -= 543;
      return new Date(y, m, d);
    }
  }

  return new Date(0);
}

export function cleanReporterName(rawName: string): string {
  if (!rawName) return '';
  let name = stripEmojis(String(rawName)).trim();

  // Guard against grade/class names
  if (
    name.includes('อนุบาล') ||
    name.includes('ประถม') ||
    name.includes('มัธยม') ||
    name.includes('ปี 69') ||
    name.includes('ชั้นเรียน') ||
    name.includes('ควบชั้น') ||
    name.includes('มากกว่า 1 ห้อง') ||
    name.includes('ระดับชั้น')
  ) {
    return '';
  }

  name = name.replace(/^นางสาว\s*/, 'น.ส.');
  name = name.replace(/^(?:ผู้รายงานข้อมูล|ผู้รายงาน|ผู้สอน|ครูผู้สอน|ผู้รับผิดชอบ|ชื่อ-สกุล|ชื่อ - สกุล|ชื่อ-นามสกุล|ชื่อ - นามสกุล|ชื่อและนามสกุล|ชื่อ|ลงชื่อ|ยศ-ตำแหน่ง|ยศ - ตำแหน่ง|ยศ|คำนำหน้า|คำนำหน้านาม|คำนำหน้าชื่อ)\s*[:\-\.]*\s*/i, '').trim();
  
  // Strip phone prefix labels
  name = name.replace(/(?:เบอร์โทรศัพท์มือถือ|เบอร์โทรศัพท์|เบอร์โทร|เบอร์มือถือ|โทรศัพท์มือถือ|โทรศัพท์|โทร\.|โทร|มือถือ|tel|phone|mobile)\s*[:\-\.]*\s*/gi, ' ').trim();

  // Delete phone numbers (with or without dashes/spaces, 9-10 digits or international format)
  name = name.replace(/(?:^|[^\d])(?:\+?66|0)\d{1,2}[\s\-\.]?\d{3,4}[\s\-\.]?\d{3,4}(?:[^\u0E00-\u0E7F]*)/g, ' ').trim();
  name = name.replace(/\b0\d{8,9}\b/g, ' ').trim();
  name = name.replace(/[0-9]{9,12}/g, ' ').trim();
  
  // Delete Thai phone numbers
  name = name.replace(/\(?[๐-๙]{2,3}\)?[\s\-\.]?[๐-๙]{3,4}[\s\-\.]?[๐-๙]{4}/g, ' ').trim();
  
  // Strip trailing notes like "ก 31" or room numbers or "(ถ้ามี)"
  name = name.replace(/\s*[ก-ฮ]\s*\d+.*$/g, '').trim();
  name = name.replace(/\s*\(ถ้ามี\)\s*$/g, '').trim();

  // Delete remaining standalone phone labels
  name = name.replace(/\b(?:เบอร์โทรศัพท์มือถือ|เบอร์โทรศัพท์|เบอร์โทร|เบอร์มือถือ|โทรศัพท์มือถือ|โทรศัพท์|โทร\.|โทร|มือถือ)\b/gi, '').trim();

  // Delete trailing roles
  name = name.replace(/\s*[\(\[\{]?(?:ผู้รายงานข้อมูล|ผู้รายงาน|ผู้สอน|ครูผู้สอน|ครูประจำชั้น|ผู้รับผิดชอบ|นักศึกษาฝึกสอน)[\)\]\}]?\s*$/i, '').trim();
  
  // Delete empty parentheses, brackets, colons and special chars
  name = name.replace(/\(\s*\)/g, '').trim();
  name = name.replace(/\[\s*\]/g, '').trim();
  name = name.replace(/^[:\-\(\)\.\s]+|[:\-\(\)\.\s]+$/g, '').trim();
  name = name.replace(/\s+/g, ' ').trim();
  return name;
}

export interface ReporterInfo {
  rank: string;
  name: string;
  fullName: string;
}

export function parseReporterRankAndName(rawValue: string): ReporterInfo {
  if (!rawValue) return { rank: '', name: '', fullName: '' };
  
  let val = stripEmojis(String(rawValue)).trim();
  
  // Guard against grade/class names
  if (
    val.includes('อนุบาล') ||
    val.includes('ประถม') ||
    val.includes('มัธยม') ||
    val.includes('ปี 69') ||
    val.includes('ชั้นเรียน') ||
    val.includes('ควบชั้น') ||
    val.includes('มากกว่า 1 ห้อง') ||
    val.includes('ระดับชั้น')
  ) {
    return { rank: '', name: '', fullName: '' };
  }

  // Strip common label prefixes
  val = val.replace(/^(?:ผู้รายงานข้อมูล|ผู้รายงาน|ผู้สอน|ครูผู้สอน|ผู้รับผิดชอบ|ชื่อ-สกุล|ชื่อ - สกุล|ชื่อ-นามสกุล|ชื่อ - นามสกุล|ชื่อและนามสกุล|ชื่อ|ลงชื่อ|ยศ-ตำแหน่ง|ยศ - ตำแหน่ง|ยศ|คำนำหน้า|คำนำหน้านาม|คำนำหน้าชื่อ)\s*[:\-\.]*\s*/i, '').trim();
  // Strip leading numbering or bullet points
  val = val.replace(/^[0-9๑-๙]+[\.\s\-]+\s*/, '').trim();
  // Strip surrounding brackets
  val = val.replace(/^[\(\[\{]/, '').replace(/[\)\]\}]$/, '').trim();
  
  // Strip phone prefix labels
  val = val.replace(/(?:เบอร์โทรศัพท์มือถือ|เบอร์โทรศัพท์|เบอร์โทร|เบอร์มือถือ|โทรศัพท์มือถือ|โทรศัพท์|โทร\.|โทร|มือถือ|tel|phone|mobile)\s*[:\-\.]*\s*/gi, ' ').trim();

  // Strip phone numbers
  val = val.replace(/(?:^|[^\d])(?:\+?66|0)\d{1,2}[\s\-\.]?\d{3,4}[\s\-\.]?\d{3,4}(?:[^\u0E00-\u0E7F]*)/g, ' ').trim();
  val = val.replace(/\b0\d{8,9}\b/g, ' ').trim();
  val = val.replace(/[0-9]{9,12}/g, ' ').trim();
  val = val.replace(/\(?[๐-๙]{2,3}\)?[\s\-\.]?[๐-๙]{3,4}[\s\-\.]?[๐-๙]{4}/g, ' ').trim();
  val = val.replace(/\s*[ก-ฮ]\s*\d+.*$/g, '').trim();
  val = val.replace(/\s*\(ถ้ามี\)\s*$/g, '').trim();
  
  // Strip trailing role indicators in parentheses or at end
  val = val.replace(/\s*[\(\[\{]?(?:ผู้รายงานข้อมูล|ผู้รายงาน|ผู้สอน|ครูผู้สอน|ครูประจำชั้น|ผู้รับผิดชอบ|นักศึกษาฝึกสอน)[\)\]\}]?\s*$/i, '').trim();
  // Strip empty parentheses
  val = val.replace(/\(\s*\)/g, '').trim();
  val = val.replace(/\[\s*\]/g, '').trim();
  val = val.replace(/^[:\-\(\)\.\s]+|[:\-\(\)\.\s]+$/g, '').trim();
  val = val.replace(/\s+/g, ' ').trim();

  // Normalize full Thai police ranks to standard short police ranks
  const fullRankMap: Record<string, string> = {
    'ว่าที่ พลตำรวจเอก': 'ว่าที่ พล.ต.อ.',
    'ว่าที่ พลตำรวจโท': 'ว่าที่ พล.ต.ท.',
    'ว่าที่ พลตำรวจตรี': 'ว่าที่ พล.ต.ต.',
    'ว่าที่ พันตำรวจเอก': 'ว่าที่ พ.ต.อ.',
    'ว่าที่ พันตำรวจโท': 'ว่าที่ พ.ต.ท.',
    'ว่าที่ พันตำรวจตรี': 'ว่าที่ พ.ต.ต.',
    'ว่าที่ ร้อยตำรวจเอก': 'ว่าที่ ร.ต.อ.',
    'ว่าที่ ร้อยตำรวจโท': 'ว่าที่ ร.ต.ท.',
    'ว่าที่ ร้อยตำรวจตรี': 'ว่าที่ ร.ต.ต.',
    'ว่าที่ ดาบตำรวจ': 'ว่าที่ ด.ต.',
    'ว่าที่ จ่าสิบตำรวจ': 'ว่าที่ จ.ส.ต.',
    'ว่าที่ สิบตำรวจเอก': 'ว่าที่ ส.ต.อ.',
    'ว่าที่ สิบตำรวจโท': 'ว่าที่ ส.ต.ท.',
    'ว่าที่ สิบตำรวจตรี': 'ว่าที่ ส.ต.ต.',
    'ว่าที่ ร้อยตรี': 'ว่าที่ ร.ต.',
    'พลตำรวจเอก': 'พล.ต.อ.',
    'พลตำรวจโท': 'พล.ต.ท.',
    'พลตำรวจตรี': 'พล.ต.ต.',
    'พันตำรวจเอก': 'พ.ต.อ.',
    'พันตำรวจโท': 'พ.ต.ท.',
    'พันตำรวจตรี': 'พ.ต.ต.',
    'ร้อยตำรวจเอก': 'ร.ต.อ.',
    'ร้อยตำรวจโท': 'ร.ต.ท.',
    'ร้อยตำรวจตรี': 'ร.ต.ต.',
    'ดาบตำรวจ': 'ด.ต.',
    'จ่าสิบตำรวจ': 'จ.ส.ต.',
    'สิบตำรวจเอก': 'ส.ต.อ.',
    'สิบตำรวจโท': 'ส.ต.ท.',
    'สิบตำรวจตรี': 'ส.ต.ต.',
    'พลตำรวจ': 'พลฯ',
    'ร้อยตรี': 'ร.ต.',
    'จ่าสิบเอก': 'จ.ส.อ.',
    'จ่าสิบโท': 'จ.ส.ท.',
    'สิบเอก': 'ส.อ.',
    'สิบโท': 'ส.ท.',
    'สิบตรี': 'ส.ต.',
  };

  for (const [full, abbr] of Object.entries(fullRankMap)) {
    if (val.startsWith(full)) {
      val = abbr + val.slice(full.length);
      break;
    }
  }

  // Handle female variations e.g. "ส.ต.อ. หญิง" -> "ส.ต.อ.หญิง", "ด.ต. (หญิง)" -> "ด.ต.หญิง"
  val = val.replace(/(\.(?:ต|ส|อ|ท|ร|ป)\.)\s*(?:\(หญิง\)|หญิง)/g, '$1หญิง');

  // Match military/police ranks vs civilian titles
  const policeRankRegex = /^(?:ว่าที่\s*)?(?:พล\.ต\.อ\.|พล\.ต\.ท\.|พล\.ต\.ต\.|พ\.ต\.อ\.|พ\.ต\.ท\.|พ\.ต\.ต\.|ร\.ต\.อ\.|ร\.ต\.ท\.|ร\.ต\.ต\.|ด\.ต\.|จ\.ส\.ต\.|ส\.ต\.อ\.|ส\.ต\.ท\.|ส\.ต\.ต\.|จ\.ส\.อ\.|จ\.ส\.ท\.|ส\.อ\.|ส\.ท\.|ส\.ต\.|พลฯ|ร\.ต\.)\s*(?:หญิง)?/i;
  
  const civilianTitleRegex = /^(?:นายแพทย์|แพทย์หญิง|นพ\.|พญ\.|ดร\.|ศ\.|รศ\.|ผศ\.|อาจารย์|อ\.|ครูอัตราจ้าง|ครูผู้ช่วย|ครู|นางสาว|นาง|นาย|น\.ส\.)\s*(?:หญิง)?/i;

  let rank = '';
  let name = val;

  const policeMatch = val.match(policeRankRegex);
  if (policeMatch) {
    rank = policeMatch[0].trim();
    name = val.replace(policeRankRegex, '').trim();
  } else {
    const civilianMatch = val.match(civilianTitleRegex);
    if (civilianMatch) {
      let matchedTitle = civilianMatch[0].trim();
      if (matchedTitle === 'นางสาว') matchedTitle = 'น.ส.';
      rank = matchedTitle;
      name = val.replace(civilianTitleRegex, '').trim();
    }
  }

  name = cleanReporterName(name);

  let fullName = rank ? `${rank} ${name}`.trim() : name;
  return { rank, name, fullName };
}

export interface ExtractedReporter {
  rank: string;
  name: string;
  fullName: string;
  sourceColIdx: number;
}

export function extractReporterFromRow(row: string[], headers?: string[]): ExtractedReporter {
  if (!row || row.length === 0) {
    return { rank: '', name: '', fullName: '', sourceColIdx: -1 };
  }

  const effectiveHeaders = headers || (row as any)._headers || [];
  
  let foundRank = '';
  let foundFirstName = '';
  let foundSurname = '';
  let foundCombinedName = '';
  let matchedColIdx = -1;

  // 1. Header-based pass
  if (effectiveHeaders.length > 0) {
    effectiveHeaders.forEach((h: string, colIdx: number) => {
      if (!h) return;
      const rawVal = row[colIdx];
      if (rawVal === null || rawVal === undefined) return;
      const val = String(rawVal).trim();
      if (!val || val === '-' || val === '--' || /^[\-\s]+$/.test(val)) return;

      const cleanH = stripEmojis(h);
      const lowerH = cleanH.toLowerCase().trim();

      // Skip non-reporter columns
      if (
        lowerH.includes('โรงเรียน') ||
        lowerH.includes('สถานศึกษา') ||
        lowerH.includes('รร.') ||
        lowerH.includes('วิชา') ||
        lowerH.includes('กิจกรรม') ||
        lowerH.includes('เรื่อง') ||
        lowerH.includes('หลักสูตร') ||
        lowerH.includes('หน่วย') ||
        lowerH.includes('สาระ') ||
        lowerH.includes('สื่อ') ||
        lowerH.includes('ใบงาน') ||
        lowerH.includes('ชิ้นงาน') ||
        lowerH.includes('นักเรียน') ||
        lowerH.includes('ประทับเวลา') ||
        lowerH.includes('วันที่') ||
        lowerH.includes('ห้อง') ||
        lowerH.includes('ชั้น') ||
        lowerH.includes('ระดับ') ||
        lowerH.includes('ปัญหา') ||
        lowerH.includes('อุปสรรค') ||
        lowerH.includes('รูป') ||
        lowerH.includes('ภาพ') ||
        lowerH.includes('อีเมล')
      ) {
        return;
      }

      // Check if header is purely Rank / Title
      const isPureRankHeader = (lowerH === 'ยศ' || lowerH === 'ยศ (ถ้ามี)' || lowerH === 'คำนำหน้า' || lowerH === 'คำนำหน้านาม' || lowerH === 'คำนำหน้าชื่อ') ||
        (lowerH.includes('ยศ') && !lowerH.includes('ชื่อ') && !lowerH.includes('สกุล') && !lowerH.includes('ผู้รายงาน')) ||
        (lowerH.includes('คำนำหน้า') && !lowerH.includes('ชื่อ') && !lowerH.includes('สกุล') && !lowerH.includes('ผู้รายงาน'));

      // Check if header is purely Surname
      const isPureSurnameHeader = (lowerH === 'สกุล' || lowerH === 'นามสกุล') ||
        ((lowerH.includes('สกุล') || lowerH.includes('นามสกุล')) && !lowerH.includes('ชื่อ') && !lowerH.includes('ยศ') && !lowerH.includes('ผู้รายงาน'));

      // Check if header is purely First Name
      const isPureFirstNameHeader = (lowerH === 'ชื่อ' || lowerH === 'ชื่อจริง') && !lowerH.includes('สกุล') && !lowerH.includes('นามสกุล') && !lowerH.includes('ยศ');

      // Check if header is Reporter Name or Teacher Name or Combined Name
      const isReporterHeader =
        lowerH.includes('ผู้รายงาน') ||
        lowerH.includes('ผู้รายงานข้อมูล') ||
        lowerH.includes('ครูผู้สอน') ||
        lowerH.includes('ผู้สอน') ||
        lowerH.includes('ผู้รับผิดชอบ') ||
        lowerH.includes('ผู้จัดทำ') ||
        lowerH.includes('ผู้บันทึก') ||
        lowerH.includes('ผู้ปฏิบัติ') ||
        lowerH.includes('ชื่อ-สกุล') ||
        lowerH.includes('ชื่อ - สกุล') ||
        lowerH.includes('ชื่อ-นามสกุล') ||
        lowerH.includes('ชื่อ - นามสกุล') ||
        lowerH.includes('ชื่อและนามสกุล') ||
        lowerH.includes('ชื่อสกุล') ||
        lowerH.includes('ลงชื่อ') ||
        (lowerH.includes('ยศ') && (lowerH.includes('ชื่อ') || lowerH.includes('ผู้') || lowerH.includes('สกุล') || lowerH.includes('เบอร์')));

      if (isPureRankHeader) {
        const parsed = parseReporterRankAndName(val);
        if (parsed.rank) foundRank = parsed.rank;
        else if (parsed.name && !foundRank) foundRank = parsed.name;
        if (matchedColIdx === -1) matchedColIdx = colIdx;
      } else if (isPureSurnameHeader) {
        const parsed = parseReporterRankAndName(val);
        if (parsed.name) foundSurname = parsed.name;
        if (matchedColIdx === -1) matchedColIdx = colIdx;
      } else if (isPureFirstNameHeader) {
        const parsed = parseReporterRankAndName(val);
        if (parsed.rank && !foundRank) foundRank = parsed.rank;
        if (parsed.name) foundFirstName = parsed.name;
        if (matchedColIdx === -1) matchedColIdx = colIdx;
      } else if (isReporterHeader) {
        const parsed = parseReporterRankAndName(val);
        if (parsed.rank && !foundRank) foundRank = parsed.rank;
        if (parsed.name) {
          foundCombinedName = parsed.name;
          matchedColIdx = colIdx;
        }
      }
    });
  }

  // 2. Combine firstName + surname if separate columns were found
  let finalName = foundCombinedName;
  if (foundFirstName) {
    finalName = foundSurname ? `${foundFirstName} ${foundSurname}` : foundFirstName;
  } else if (foundSurname && !finalName) {
    finalName = foundSurname;
  }

  // 3. Fallback: Content-based scan across row if no reporter name was detected from headers
  if (!finalName) {
    const policeRankRegex = /^(?:ว่าที่\s*)?(?:พล\.ต\.อ\.|พล\.ต\.ท\.|พล\.ต\.ต\.|พ\.ต\.อ\.|พ\.ต\.ท\.|พ\.ต\.ต\.|ร\.ต\.อ\.|ร\.ต\.ท\.|ร\.ต\.ต\.|ด\.ต\.|จ\.ส\.ต\.|ส\.ต\.อ\.|ส\.ต\.ท\.|ส\.ต\.ต\.|จ\.ส\.อ\.|จ\.ส\.ท\.|ส\.อ\.|ส\.ท\.|ส\.ต\.|พลฯ|ร\.ต\.)\s*(?:หญิง)?/i;
    const civilianTitleRegex = /^(?:นายแพทย์|แพทย์หญิง|นพ\.|พญ\.|ดร\.|ศ\.|รศ\.|ผศ\.|อาจารย์|อ\.|ครูอัตราจ้าง|ครูผู้ช่วย|ครู|นางสาว|นาง|นาย|น\.ส\.)\s*(?:หญิง)?/i;

    for (let i = 0; i < row.length; i++) {
      const cellVal = String(row[i] || '').trim();
      if (!cellVal || cellVal.length < 3 || cellVal.length > 70) continue;
      // Skip URLs, schools, numbers, dates
      if (cellVal.includes('http') || cellVal.includes('docs.google') || cellVal.includes('drive.google')) continue;
      if (cellVal.includes('โรงเรียน') || cellVal.includes('สถานศึกษา') || cellVal.includes('รร.ตชด') || cellVal.includes('รร.ตขด')) continue;
      if (cellVal.includes('วิชา') || cellVal.includes('เรื่อง') || cellVal.includes('หน่วย')) continue;
      if (
        cellVal.includes('อนุบาล') ||
        cellVal.includes('ประถม') ||
        cellVal.includes('มัธยม') ||
        cellVal.includes('ปี 69') ||
        cellVal.includes('ชั้นเรียน') ||
        cellVal.includes('ควบชั้น')
      ) continue;

      if (policeRankRegex.test(cellVal) || civilianTitleRegex.test(cellVal)) {
        const parsed = parseReporterRankAndName(cellVal);
        if (parsed.rank && !foundRank) foundRank = parsed.rank;
        if (parsed.name) {
          finalName = parsed.name;
          matchedColIdx = i;
          break;
        }
      }
    }
  }

  // Clean final name
  finalName = cleanReporterName(finalName);
  let finalRank = foundRank ? convertToThaiNumerals(foundRank) : '';
  let finalFullName = finalRank && finalName ? `${finalRank} ${finalName}`.trim() : (finalName || finalRank || '');

  return {
    rank: finalRank,
    name: finalName,
    fullName: finalFullName,
    sourceColIdx: matchedColIdx
  };
}

export function getThaiDisplayWidth(str: string, minWidth: number): number {
  if (!str) return minWidth;
  const len = str.replace(/[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/g, '').length;
  // Use a tighter multiplier and constant for a perfectly snug fit (approx 7.5px per Thai character at 12px font + 4px safety buffer)
  return Math.max(Math.ceil(len * 7.5 + 4), minWidth);
}

export function stripEmojis(str: string): string {
  if (!str) return '';
  return str.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '').trim();
}

export function convertToThaiNumerals(text: any): string {
  if (text === null || text === undefined) return '';
  text = String(text);
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  const thaiNums = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];

  for (let i = 0; i < parts.length; i++) {
    if (!parts[i].match(/^https?:\/\//)) {
      parts[i] = parts[i].replace(/[0-9]/g, (match: string) => thaiNums[parseInt(match)]);
    }
  }
  return parts.join('');
}

export function convertYearToBE(str: string): string {
  if (!str) return '';
  return str.replace(/\b(20\d{2})\b/g, (match) => {
    return (parseInt(match) + 543).toString();
  });
}

export function formatThaiDate(dateStr: string): string {
  if (!dateStr) return '-';

  const fullThaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const shortThaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];

  // Convert Thai numerals to Arabic numerals temporarily for clean numeric parsing
  const thaiNums = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
  let arabicStr = String(dateStr);
  for (let i = 0; i < 10; i++) {
    arabicStr = arabicStr.split(thaiNums[i]).join(String(i));
  }

  // Remove timestamp or extra time info if present
  let cleanStr = arabicStr.trim().split(/\s+/)[0];

  let day: number | null = null;
  let monthIdx: number | null = null;
  let year: number | null = null;

  // 1. Check if formatted with slash or dash e.g. "2026-08-08", "8/8/2026", "8/8/2569"
  let parts = cleanStr.split(/[-/]/);
  if (parts.length >= 2 && !isNaN(parseInt(parts[0])) && !isNaN(parseInt(parts[1]))) {
    if (parts[0].length === 4) {
      year = parseInt(parts[0]);
      monthIdx = parseInt(parts[1]) - 1;
      if (parts[2]) day = parseInt(parts[2]);
    } else {
      day = parseInt(parts[0]);
      monthIdx = parseInt(parts[1]) - 1;
      if (parts[2]) year = parseInt(parts[2]);
    }
  } else {
    // 2. Check if space-separated with Thai month e.g. "8 ส.ค. 2569", "8 สิงหาคม 2569", "8 ส.ค. 69"
    let spaceParts = arabicStr.replace(/พ\.ศ\./g, '').trim().split(/\s+/);
    if (spaceParts.length >= 2) {
      let dVal = parseInt(spaceParts[0]);
      if (!isNaN(dVal)) day = dVal;

      let mStr = spaceParts[1];
      let foundM = fullThaiMonths.indexOf(mStr);
      if (foundM === -1) foundM = shortThaiMonths.indexOf(mStr);
      if (foundM !== -1) monthIdx = foundM;

      if (spaceParts.length >= 3) {
        let yVal = parseInt(spaceParts[2]);
        if (!isNaN(yVal)) year = yVal;
      }
    }
  }

  if (day !== null && monthIdx !== null && monthIdx >= 0 && monthIdx < 12) {
    if (year === null) {
      year = new Date().getFullYear() + 543;
    } else if (year > 1000 && year < 2400) {
      year += 543;
    } else if (year > 0 && year < 100) {
      if (year < 50) year += 2543;
      else year += 2500;
    }
    return `${day} ${fullThaiMonths[monthIdx]} พ.ศ. ${year}`;
  }

  // Fallback for complex strings: replace short month with full month and ensure พ.ศ. + BE year
  let result = dateStr;
  shortThaiMonths.forEach((m, idx) => {
    if (result.includes(m)) {
      result = result.replace(m, fullThaiMonths[idx]);
    }
  });

  // Convert AD year to BE year
  result = convertYearToBE(result);

  // Add พ.ศ. before 4-digit BE year if not already present
  if (!result.includes('พ.ศ.')) {
    result = result.replace(/(\b25\d{2}\b)/g, 'พ.ศ. $1');
  }

  return result;
}

export interface ThaiDateComponents {
  day: string;
  monthName: string;
  shortMonthName: string;
  yearBE: string;
  shortYearBE: string;
  fullFormatted: string;
}

export function getCurrentThaiDateComponents(): ThaiDateComponents {
  const fullThaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const shortThaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  const now = new Date();
  const day = now.getDate();
  const monthIdx = now.getMonth();
  const yearBE = now.getFullYear() + 543;

  const dayThai = convertToThaiNumerals(day.toString());
  const monthName = fullThaiMonths[monthIdx];
  const shortMonthName = shortThaiMonths[monthIdx];
  const yearThai = convertToThaiNumerals(yearBE.toString());
  const shortYearThai = convertToThaiNumerals((yearBE % 100).toString());

  return {
    day: dayThai,
    monthName,
    shortMonthName,
    yearBE: yearThai,
    shortYearBE: shortYearThai,
    fullFormatted: `วันที่ ${dayThai} เดือน ${shortMonthName} พ.ศ. ${shortYearThai}`
  };
}

export function parseThaiDateComponents(dateOrTimestampStr: string): ThaiDateComponents | null {
  if (!dateOrTimestampStr) return null;

  const fullThaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const shortThaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];

  const thaiNums = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
  let arabicStr = String(dateOrTimestampStr).trim();
  for (let i = 0; i < 10; i++) {
    arabicStr = arabicStr.split(thaiNums[i]).join(String(i));
  }

  // Remove timestamp label if present
  let cleanStr = arabicStr.replace(/^ประทับเวลา\s*[:\-\s]*/i, '').trim();

  let day: number | null = null;
  let monthIdx: number | null = null;
  let year: number | null = null;

  // 1. Check if string contains Thai month (full or short)
  let foundMonthIdx = -1;
  for (let i = 0; i < fullThaiMonths.length; i++) {
    if (cleanStr.includes(fullThaiMonths[i])) {
      foundMonthIdx = i;
      break;
    }
  }
  if (foundMonthIdx === -1) {
    for (let i = 0; i < shortThaiMonths.length; i++) {
      if (cleanStr.includes(shortThaiMonths[i])) {
        foundMonthIdx = i;
        break;
      }
    }
  }

  if (foundMonthIdx !== -1) {
    monthIdx = foundMonthIdx;
    const numMatches = cleanStr.match(/\d+/g);
    if (numMatches && numMatches.length > 0) {
      day = parseInt(numMatches[0], 10);
      if (numMatches.length > 1) {
        for (let j = 1; j < numMatches.length; j++) {
          const val = parseInt(numMatches[j], 10);
          if (val > 1000 || val > 31) {
            year = val;
            break;
          }
        }
      }
    }
  } else {
    // 2. Delimiter separated e.g. "8/8/2026 14:30:00" or "2026-08-08" or "8/8/2569"
    const firstWord = cleanStr.split(/[T\s]+/)[0];
    const parts = firstWord.split(/[-/]/).filter(p => p.trim() !== '');
    if (parts.length >= 3) {
      let p0 = parseInt(parts[0], 10);
      let p1 = parseInt(parts[1], 10);
      let p2 = parseInt(parts[2], 10);

      if (parts[0].length === 4) {
        year = p0;
        monthIdx = p1 - 1;
        day = p2;
      } else {
        if (p1 > 12 && p0 <= 12) {
          monthIdx = p0 - 1;
          day = p1;
        } else {
          day = p0;
          monthIdx = p1 - 1;
        }
        year = p2;
      }
    }
  }

  if (day !== null && monthIdx !== null && monthIdx >= 0 && monthIdx < 12) {
    if (year === null) {
      year = new Date().getFullYear() + 543;
    } else if (year > 1000 && year < 2400) {
      year += 543;
    } else if (year > 0 && year < 100) {
      if (year < 50) year += 2543;
      else year += 2500;
    }

    const dayThai = convertToThaiNumerals(day.toString());
    const monthName = fullThaiMonths[monthIdx];
    const shortMonthName = shortThaiMonths[monthIdx];
    const yearThai = convertToThaiNumerals(year.toString());
    const shortYearThai = convertToThaiNumerals((year % 100).toString());

    return {
      day: dayThai,
      monthName,
      shortMonthName,
      yearBE: yearThai,
      shortYearBE: shortYearThai,
      fullFormatted: `วันที่ ${dayThai} เดือน ${shortMonthName} พ.ศ. ${shortYearThai}`
    };
  }

  return null;
}

export function formatShortThaiDate(dateStr: string): string {
  if (!dateStr) return '-';
  let datePart = dateStr.split(' ')[0];
  let parts = datePart.split(/[-/]/);
  if (parts.length === 3) {
    let day, month, year;
    if (parts[0].length === 4) {
      year = parseInt(parts[0]);
      month = parseInt(parts[1]);
      day = parseInt(parts[2]);
    } else {
      day = parseInt(parts[0]);
      month = parseInt(parts[1]);
      year = parseInt(parts[2]);
    }
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      const shortThaiMonths = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
      ];
      if (month >= 1 && month <= 12) return `${day} ${shortThaiMonths[month - 1]}`;
    }
  }
  
  const fullMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const shortMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  let temp = dateStr;
  fullMonths.forEach((m, idx) => {
    temp = temp.replace(m, shortMonths[idx]);
  });
  temp = temp.replace(/25[0-9]{2}/g, '').trim();
  temp = temp.replace(/\b20[0-9]{2}\b/g, '').trim();
  return temp;
}

export function getApproximateCoords(address: string, index: number): [number, number] {
  const provinceCoords: Record<string, [number, number]> = {
    'สุรินทร์': [14.88, 103.49],
    'บุรีรัมย์': [14.99, 103.10],
    'อุบลราชธานี': [15.22, 104.85],
    'อำนาจเจริญ': [15.86, 104.62],
    'ศรีสะเกษ': [15.11, 104.32],
    'ยโสธร': [15.79, 104.14],
    'นครพนม': [17.40, 104.78],
    'สกลนคร': [17.16, 104.14],
    'เลย': [17.48, 101.72],
    'บึงกาฬ': [18.36, 103.65],
    'อุดรธานี': [17.41, 102.78]
  };

  let matchedProv = null;
  for (let prov in provinceCoords) {
    if (address.includes(prov)) {
      matchedProv = prov;
      break;
    }
  }

  let baseLat = matchedProv ? provinceCoords[matchedProv][0] : 16.43;
  let baseLng = matchedProv ? provinceCoords[matchedProv][1] : 102.83;

  let offsetLat = Math.sin(index * 123.45) * 0.15;
  let offsetLng = Math.cos(index * 678.90) * 0.15;

  return [baseLat + offsetLat, baseLng + offsetLng];
}

export function isNegativeOrNone(val: any): boolean {
  if (val === null || val === undefined) return true;
  const str = String(val).trim();
  // Strip punctuation, dashes, quotes, leading hyphens, bullets, spaces
  const clean = str.replace(/^[\s\-\–\—\.\:\,\;\"\'\*\_]+|[\s\-\–\—\.\:\,\;\"\'\*\_]+$/g, '').trim();
  if (!clean || clean === '-' || clean === 'ไม่มี' || clean === 'ไม่พบ' || clean === 'ปกติ' || clean === 'ราบรื่น') return true;

  // Patterns matching "ไม่มี" / "ไม่พบ" / "ไม่มีปัญหา" / "ไม่มีข้อเสนอแนะ" / etc.
  const noPattern = /^(ไม่มี|ไม่พบ|ปกติ|ราบรื่น|ไม่มีครับ|ไม่มีค่ะ|ไม่มีคะ|ไม่มีเลย|ไม่มีจ้า|ไม่มีปัญหา|ไม่มีปัญหาเลย|ไม่มีอุปสรรค|ไม่มีข้อขัดข้อง|ไม่มีข้อเสนอแนะ|ไม่มีข้อเสนอ|ไม่พบปัญหา|ไม่มีปัญหาใดๆ|ไม่มีปัญหาใด\s*ๆ|ไม่มีปัญหาใดๆทั้งสิ้น|ไม่มีปัญหาแต่อย่างใด|ไม่มีเพิ่มเติม|ไม่มีข้อเสนอแนะเพิ่มเติม|ไม่มีข้อเสนอแนะแนวทางแก้ไข|ไม่มีปัญหาและอุปสรรค|ไม่มีปัญหาและข้อขัดข้อง|ไม่มีปัญหาและข้อเสนอแนะ|ไม่มีปัญหาในการจัดการเรียนการสอน|ไม่มีข้อบกพร่อง|ไม่มีอุปสรรคใดๆ)$/i;
  if (noPattern.test(clean)) return true;

  const cleanNoSpace = clean.replace(/\s+/g, '');
  if (/^ไม่มี(ปัญหา|อุปสรรค|ข้อขัดข้อง|ข้อเสนอแนะ|ข้อเสนอ|แนวทาง|แก้ไข|เพิ่มเติม|ใดๆ|ใดๆทั้งสิ้น|ใดๆครับ|ใดๆค่ะ|ครับ|ค่ะ|คะ|เลย|จ้า|แต่อย่างใด)?$/i.test(cleanNoSpace)) {
    return true;
  }
  if (/^ไม่พบ(ปัญหา|อุปสรรค|ข้อขัดข้อง|สิ่งผิดปกติ|ข้อบกพร่อง)?$/i.test(cleanNoSpace)) {
    return true;
  }

  return false;
}

export function isProblemOrSuggestion(header: string): boolean {
  if (!header) return false;
  const lower = header.toLowerCase();
  return ['ปัญหา', 'อุปสรรค', 'ข้อขัดข้อง', 'เสนอแนะ', 'ข้อเสนอ', 'แนวทางแก้ไข', 'แนวทาง', 'แก้ไข'].some(kw => lower.includes(kw));
}

export function getProxiedImageUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/') || url.startsWith('http://localhost') || url.startsWith('https://localhost')) {
    return url;
  }
  return `/api/proxy-image?url=${encodeURIComponent(url)}`;
}

