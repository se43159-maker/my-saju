// [SYSTEM KERNEL: SAJU ENGINE - BUG FIX & AUTO-TRANSLATE VER]

let sajuDB = {}; 

const hanjaDict = {
    "甲":"갑", "乙":"을", "丙":"병", "丁":"정", "戊":"무", "己":"기", "庚":"경", "辛":"신", "壬":"임", "癸":"계",
    "子":"자", "丑":"축", "寅":"인", "卯":"묘", "辰":"진", "巳":"사", "午":"오", "未":"미", "申":"신", "酉":"유", "戌":"술", "亥":"해"
};

function toHangul(str) {
    if(!str) return "";
    return str.split('').map(char => hanjaDict[char] || char).join('');
}

// 1. CSV 로딩
fetch('Saju_Database_1900_2100.csv')
    .then(response => response.arrayBuffer())
    .then(buffer => {
        let decoder = new TextDecoder('utf-8');
        let data = decoder.decode(buffer);
        if(data.includes('')) {
            decoder = new TextDecoder('euc-kr');
            data = decoder.decode(buffer);
        }
        const rows = data.split('\n');
        for(let i=1; i<rows.length; i++) {
            const cols = rows[i].split(',');
            if(cols.length >= 4) {
                sajuDB[cols[0].trim()] = { year: cols[1].trim(), month: cols[2].trim(), day: cols[3].trim() };
            }
        }
    });

// [핵심 기술]: CSV의 틀린 설날 기준을 버리고, 입춘 기준으로 진짜 년주를 계산하는 수학 엔진
function getTrueYearPillar(birthDate, monthPillar) {
    const parts = birthDate.split('-');
    const bYear = parseInt(parts[0]);
    const bMonth = parseInt(parts[1]);
    const monthBranch = monthPillar.charAt(1);

    let sajuYearNum = bYear;
    // 1월이거나, 2월이면서 입춘 전(월주가 丑이나 子일 때)이면 무조건 전년도 년주를 따름
    if (bMonth === 1 || (bMonth === 2 && (monthBranch === '丑' || monthBranch === '子'))) {
        sajuYearNum -= 1;
    }

    const stems = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
    const branches = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];

    let stemIdx = (sajuYearNum - 4) % 10;
    if (stemIdx < 0) stemIdx += 10;
    let branchIdx = (sajuYearNum - 4) % 12;
    if (branchIdx < 0) branchIdx += 12;

    return stems[stemIdx] + branches[branchIdx];
}

// 2. 분석 실행 함수
function analyzeSaju() {
    const birthDate = document.getElementById('birthDate').value;
    const birthTime = document.getElementById('birthTime').value;
    const gender = document.getElementById('gender').value;

    if(!birthDate) { alert("생년월일을 입력해주세요!"); return; }
    
    const dbData = sajuDB[birthDate];
    if(!dbData) { alert("데이터베이스에 없는 날짜입니다."); return; }

    // CSV의 가짜 년주(dbData.year)를 무시하고, 진짜 년주 계산!
    const trueYearPillar = getTrueYearPillar(birthDate, dbData.month);
    
    const yearPillar = toHangul(trueYearPillar);
    const monthPillar = toHangul(dbData.month);
    const dayPillar = toHangul(dbData.day);
    const dayStemOriginal = dbData.day.charAt(0); 

    let timePillar = "시간 미입력";
    if(birthTime) { timePillar = calculateTimePillar(dayStemOriginal, birthTime); }

    // 대운 산출에도 진짜 년주(trueYearPillar)를 투입!
    const daewoon = calculateDaewoon(trueYearPillar, dbData.month, gender, birthDate);

    const resultDiv = document.getElementById('result');
    resultDiv.style.display = "block";
    resultDiv.innerHTML = `
<b>[1. 기본 사주 정보]</b><br>
- 생년월일: ${birthDate} ${birthTime}<br>
- 태어난 해(년주): ${yearPillar}<br>
- 태어난 달(월주): ${monthPillar}<br>
- 태어난 일(일주): ${dayPillar}<br>
- 태어난 시(시주): ${timePillar}<br><br>

<b>[2. 대운 분석 (인생의 흐름)]</b><br>
- 대운 방향: ${daewoon.direction}<br>
- 현재 대운: <b>${daewoon.currentDaewoon} 대운</b><br>
- 설명: 2026년 기준, 인생의 ${daewoon.index}번째 큰 흐름인 '${daewoon.currentDaewoon}' 대운을 지나고 있습니다.<br><br>

<i>※ 위 결과를 복사해서 AI에게 "이 사주를 내 PDF 기준으로 알기 쉽게 풀이해줘" 라고 질문하세요.</i>
    `.trim();
}

function calculateTimePillar(dayStem, timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    const mins = h * 60 + m;
    const branchList = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
    let bIndex = 0; 
    if(mins >= 90 && mins < 210) bIndex = 1; else if(mins >= 210 && mins < 330) bIndex = 2;
    else if(mins >= 330 && mins < 450) bIndex = 3; else if(mins >= 450 && mins < 570) bIndex = 4;
    else if(mins >= 570 && mins < 690) bIndex = 5; else if(mins >= 690 && mins < 810) bIndex = 6;
    else if(mins >= 810 && mins < 930) bIndex = 7; else if(mins >= 930 && mins < 1050) bIndex = 8;
    else if(mins >= 1050 && mins < 1170) bIndex = 9; else if(mins >= 1170 && mins < 1290) bIndex = 10;
    else if(mins >= 1290 && mins < 1410) bIndex = 11;

    const stems = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
    let sIndex = 0;
    if(dayStem === "甲" || dayStem === "己") sIndex = 0;
    if(dayStem === "乙" || dayStem === "庚") sIndex = 2;
    if(dayStem === "丙" || dayStem === "辛") sIndex = 4;
    if(dayStem === "丁" || dayStem === "壬") sIndex = 6;
    if(dayStem === "戊" || dayStem === "癸") sIndex = 8;

    return toHangul(stems[(sIndex + bIndex) % 10] + branchList[bIndex]);
}

function calculateDaewoon(trueYearPillar, monthPillar, gender, birthDate) {
    const yearStem = trueYearPillar.charAt(0);
    const isYang = ["甲","丙","戊","庚","壬"].includes(yearStem);
    let direction = (gender === 'male' && isYang) || (gender === 'female' && !isYang) ? "순행" : "역행";
    
    const birthYear = parseInt(birthDate.split('-')[0]);
    let index = 4; 
    if(birthYear >= 1950 && birthYear < 1970) index = 7;
    if(birthYear >= 1970 && birthYear < 1980) index = 6;
    if(birthYear === 1989) index = 3; 
    if(birthYear >= 1990 && birthYear < 2000) index = 4;

    const ganji60 = ["甲子","乙丑","丙寅","丁卯","戊辰","己巳","庚午","辛未","壬申","癸酉","甲戌","乙亥","丙子","丁丑","戊寅","己卯","庚辰","辛巳","壬午","癸未","甲申","乙酉","丙戌","丁亥","戊子","己丑","庚寅","辛卯","壬辰","癸巳","甲午","乙未","丙申","丁酉","戊戌","己亥","庚子","辛丑","壬寅","癸卯","甲辰","乙巳","丙午","丁未","戊申","己酉","庚戌","辛亥","壬子","癸丑","甲寅","乙卯","丙辰","丁巳","戊午","己未","庚申","辛酉","壬戌","癸亥"];

    let currentIdx = ganji60.indexOf(monthPillar);
    if(currentIdx === -1) return { direction: "오류", index: 0, currentDaewoon: "데이터" };

    if(direction === "순행") currentIdx = (currentIdx + index) % 60;
    else currentIdx = (currentIdx - index + 60) % 60;

    return { direction: direction, index: index, currentDaewoon: toHangul(ganji60[currentIdx]) };
}
