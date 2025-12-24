const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');

// CSV 파일 읽기 (EUC-KR/CP949 인코딩)
const csvPath = 'C:\\Users\\user\\Downloads\\전국초중등학교위치표준데이터.csv';
const buffer = fs.readFileSync(csvPath);
const content = iconv.decode(buffer, 'euc-kr');

const lines = content.split('\n');
const header = lines[0].split(',');

console.log('헤더:', header);
console.log('\n김제시 초등학교:');
console.log('---');

const schools = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('김제') && line.includes('초등학교')) {
    const cols = line.split(',');
    const school = {
      id: cols[0],
      name: cols[1],
      type: cols[2],
      foundedDate: cols[3],
      status: cols[6],
      addressJibun: cols[7],
      addressRoad: cols[8],
      eduOfficeCode: cols[9],
      eduOfficeName: cols[10],
      localEduCode: cols[11],
      localEduName: cols[12],
      latitude: parseFloat(cols[15]),
      longitude: parseFloat(cols[16])
    };
    schools.push(school);
    console.log(`${school.name}: ${school.latitude}, ${school.longitude}`);
  }
}

console.log('\n총', schools.length, '개 학교 발견');

// JSON으로 저장
fs.writeFileSync(
  path.join(__dirname, 'gimje-schools-coords.json'),
  JSON.stringify(schools, null, 2),
  'utf-8'
);

console.log('\n좌표 데이터가 gimje-schools-coords.json에 저장되었습니다.');
