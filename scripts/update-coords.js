const fs = require('fs');
const path = require('path');

// 추출한 좌표 데이터
const coordsData = require('./gimje-schools-coords.json');

// 기존 학교 데이터
const schoolsPath = path.join(__dirname, '../src/data/gimje-schools.json');
const schoolsData = require(schoolsPath);

// 학교명으로 좌표 매핑
const coordsMap = {};
coordsData.forEach(school => {
  // "김제검산초등학교" -> "검산초등학교" 처리
  let name = school.name;
  if (name === '김제검산초등학교') {
    name = '검산초등학교';
  }
  coordsMap[name] = {
    latitude: school.latitude,
    longitude: school.longitude,
    address: school.addressRoad,
    foundedDate: school.foundedDate,
    officialId: school.id
  };
});

console.log('좌표 데이터:');
Object.keys(coordsMap).forEach(name => {
  console.log(`  ${name}: ${coordsMap[name].latitude}, ${coordsMap[name].longitude}`);
});

// 학교 데이터 업데이트
let updatedCount = 0;
let notFoundCount = 0;

schoolsData.schools.forEach(school => {
  const coords = coordsMap[school.name];
  if (coords) {
    console.log(`\n업데이트: ${school.name}`);
    console.log(`  이전: ${school.latitude}, ${school.longitude}`);
    console.log(`  이후: ${coords.latitude}, ${coords.longitude}`);

    school.latitude = coords.latitude;
    school.longitude = coords.longitude;
    school.address = coords.address;
    if (coords.foundedDate && !school.foundedDate) {
      school.foundedDate = coords.foundedDate;
    }
    updatedCount++;
  } else {
    console.log(`\n좌표 없음: ${school.name}`);
    notFoundCount++;
  }
});

// 저장
fs.writeFileSync(schoolsPath, JSON.stringify(schoolsData, null, 2), 'utf-8');

console.log(`\n=== 결과 ===`);
console.log(`업데이트된 학교: ${updatedCount}개`);
console.log(`좌표 없는 학교: ${notFoundCount}개`);
console.log(`\n학교 데이터가 업데이트되었습니다.`);
