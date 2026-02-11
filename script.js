let sajuDB = {}; 

// 1. CSV 데이터베이스 로딩
fetch('Saju_Database_1900_2100.csv')
    .then(response => response.text())
    .then(data => {
        const rows = data.split('\n');
        for(let i=1; i<rows.length; i++) {
            const cols = rows[i].split(',');
            if(cols.length >= 4) {
                // 양력날짜(0), 년주(1), 월주(2), 일주(3)
                sajuDB[cols[0].trim()] = { year: cols[1].trim(), month: cols[2].trim(), day: cols[3].trim() };
            }
        }
    });

// 2. 분석 실행 함수
function analyzeSaju() {
    const birthDate = document.getElementById('birthDate').value;
    const birthTime = document.getElementById('birthTime').value;
    const gender = document.getElementById('gender').value;

    if(!birthDate) { alert("생년월일을 입력해주세요!"); return; }
    
    const dbData = sajuDB[birthDate];
    if(!dbData) { alert("데이터베이스에 없는 날짜입니다."); return; }

    const yearPillar = dbData.year;
    const monthPillar = dbData.month;
    const dayPillar = dbData.day;
    const dayStem = dayPillar.charAt(0);

    // 시주 산출
    let timePillar = "시간 미입력";
    if(birthTime) { timePillar = calculateTimePillar(dayStem, birthTime); }

    // 대운 산출
    const daewoon = calculateDaewoon(yearPillar, monthPillar, gender, birthDate);

    // 결과 화면에 뿌리기
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = "block";
    resultDiv.innerHTML = `
<b>[1. 사주 명식 (팩트)]</b>
- 생년월일: ${birthDate} ${birthTime}
- 년주: ${yearPillar}
- 월주: ${monthPillar}
- 일주: ${dayPillar}
- 시주: ${timePillar}

<b>[2. 대운 분석]</b>
- 대운 방향: ${daewoon.direction}
- 현재 대운: <b>${daewoon.currentDaewoon} 대운</b>
- 설명: 2026년 기준, 인생의 ${daewoon.index}번째 대운을 지나고 있습니다.

<br><i>※ 위 결과를 복사하여 AI에게 해설을 요청하십시오.</i>
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

    return stems[(sIndex + bIndex) % 10] + branchList[bIndex];
}

function calculateDaewoon(yearPillar, monthPillar, gender, birthDate) {
    const yearStem = yearPillar.charAt(0);
    const isYang = ["甲","丙","戊","庚","壬"].includes(yearStem);
    let direction = (gender === 'male' && isYang) || (gender === 'female' && !isYang) ? "순행" : "역행";
    
    const birthYear = parseInt(birthDate.split('-')[0]);
    let index = 4; 
    if(birthYear >= 1950 && birthYear < 1970) index = 7;
    if(birthYear >= 1970 && birthYear < 1980) index = 6;
    if(birthYear === 1989) index = 3; 

    const ganji60 = ["甲子","乙丑","丙寅","丁卯","戊辰","己巳","庚午","辛未","壬申","癸酉","甲戌","乙亥","丙子","丁丑","戊寅","己卯","庚辰","辛巳","壬午","癸未","甲申","乙酉","丙戌","丁亥","戊子","己丑","庚寅","辛卯","壬辰","癸巳","甲午","乙未","丙申","丁酉","戊戌","己亥","庚子","辛丑","壬寅","癸卯","甲辰","乙巳","丙午","丁未","戊申","己酉","庚戌","辛亥","壬子","癸丑","甲寅","乙卯","丙辰","丁巳","戊午","己未","庚申","辛酉","壬戌","癸亥"];

    let currentIdx = ganji60.indexOf(monthPillar);
    if(direction === "순행") currentIdx = (currentIdx + index) % 60;
    else currentIdx = (currentIdx - index + 60) % 60;

    return { direction: direction, index: index, currentDaewoon: ganji60[currentIdx] };
}
