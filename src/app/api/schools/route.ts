// app/api/schools/route.ts
import { NextRequest, NextResponse } from 'next/server';
import schoolsData from '@/data/gimje-schools.json';
import { SchoolInfo, RiskLevel } from '@/lib/types/school';

export async function GET(request: NextRequest) {
  try {
    const schools = schoolsData.schools as SchoolInfo[];

    // 통계 계산
    const statistics = {
      totalSchools: schools.length,
      totalStudents: schools.reduce((sum, s) => sum + (s.totalStudents || 0), 0),
      totalTeachers: schools.reduce((sum, s) => sum + (s.totalTeachers || 0), 0),
      closingSchools: schools.filter((s) => s.status === 'closing').length,
      smallSchools: schools.filter((s) => s.isSmallSchool).length,
      criticalSchools: schools.filter((s) => s.riskLevel === 'critical').length,
      principalVacancies: schools.filter((s) => !s.principal.exists).length,
      vicePrincipalVacancies: schools.filter((s) => !s.vicePrincipal.exists)
        .length,
      totalVacancies: schools.reduce((sum, s) => sum + (s.vacancies || 0), 0),
    };

    return NextResponse.json({
      success: true,
      data: schools,
      metadata: schoolsData.metadata,
      statistics,
    });
  } catch (error) {
    console.error('Error fetching schools:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch school data' },
      { status: 500 }
    );
  }
}
