// NEIS API를 통해 실제 학교 데이터 가져오기
import { NextRequest, NextResponse } from 'next/server';

const NEIS_API_KEY = process.env.NEIS_API_KEY || 'bc7aa3af58cf4f978b8100d76c981017';
const ATPT_OFCDC_SC_CODE = 'P10'; // 전북특별자치도교육청

interface NEISSchoolInfo {
  SD_SCHUL_CODE: string;
  SCHUL_NM: string;
  ORG_RDNMA: string;
  ORG_TELNO: string;
  HMPG_ADRES: string;
  FOND_YMD: string;
  SCHUL_KND_SC_NM: string;
  LCTN_SC_NM: string;
}

export async function GET(request: NextRequest) {
  try {
    // 전북 초등학교 전체 가져오기 (김제시만 필터링)
    const schoolInfoUrl = `https://open.neis.go.kr/hub/schoolInfo?KEY=${NEIS_API_KEY}&Type=json&pIndex=1&pSize=500&ATPT_OFCDC_SC_CODE=${ATPT_OFCDC_SC_CODE}&SCHUL_KND_SC_NM=초등학교`;

    const schoolInfoResponse = await fetch(schoolInfoUrl);
    const schoolInfoData = await schoolInfoResponse.json();

    if (!schoolInfoData.schoolInfo) {
      return NextResponse.json({
        success: false,
        error: 'No school data found',
        rawResponse: schoolInfoData
      });
    }

    const allSchools = schoolInfoData.schoolInfo[1].row as NEISSchoolInfo[];

    // 김제시 학교만 필터링
    const gimjeSchools = allSchools.filter((school) =>
      school.ORG_RDNMA.includes('김제시') || school.ORG_RDNMA.includes('김제')
    );

    // 각 학교별 학생수, 학급수 가져오기
    const schoolsWithDetails = await Promise.all(
      gimjeSchools.map(async (school) => {
        try {
          // 학급 정보 (학급수)
          const classUrl = `https://open.neis.go.kr/hub/classInfo?KEY=${NEIS_API_KEY}&Type=json&pIndex=1&pSize=100&ATPT_OFCDC_SC_CODE=${ATPT_OFCDC_SC_CODE}&SD_SCHUL_CODE=${school.SD_SCHUL_CODE}&AY=2024`;
          const classResponse = await fetch(classUrl);
          const classData = await classResponse.json();

          let classCount = 0;
          if (classData.classInfo && classData.classInfo[1]) {
            classCount = classData.classInfo[1].row.length;
          }

          // 학생수 현황
          const studentUrl = `https://open.neis.go.kr/hub/schoolInfo?KEY=${NEIS_API_KEY}&Type=json&ATPT_OFCDC_SC_CODE=${ATPT_OFCDC_SC_CODE}&SD_SCHUL_CODE=${school.SD_SCHUL_CODE}`;

          return {
            code: school.SD_SCHUL_CODE,
            name: school.SCHUL_NM,
            address: school.ORG_RDNMA,
            phone: school.ORG_TELNO,
            homepage: school.HMPG_ADRES,
            foundedDate: school.FOND_YMD,
            classCount: classCount,
            location: school.LCTN_SC_NM,
          };
        } catch (err) {
          return {
            code: school.SD_SCHUL_CODE,
            name: school.SCHUL_NM,
            address: school.ORG_RDNMA,
            phone: school.ORG_TELNO,
            homepage: school.HMPG_ADRES,
            foundedDate: school.FOND_YMD,
            classCount: 0,
            error: 'Failed to fetch details'
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      count: schoolsWithDetails.length,
      data: schoolsWithDetails,
    });
  } catch (error) {
    console.error('NEIS API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch from NEIS API', details: String(error) },
      { status: 500 }
    );
  }
}
