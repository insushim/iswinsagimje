// lib/types/school.ts

export type SchoolStatus = 'operating' | 'closing' | 'closed';
export type SchoolType = 'urban' | 'rural' | 'island';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface GradeStudents {
  grade1: number;
  grade2: number;
  grade3: number;
  grade4: number;
  grade5: number;
  grade6: number;
}

export interface TeachersByPosition {
  정교사1급: number;
  정교사2급: number;
  기간제교사: number;
  전문상담교사: number;
  사서교사: number;
  보건교사: number;
  영양교사: number;
  특수교사: number;
}

export interface AdminInfo {
  exists: boolean;
  yearsAtSchool?: number;
  totalExperience?: number;
  name?: string;
}

export interface YearlyData {
  year: number;
  students: number;
  teachers: number;
  classes: number;
}

export interface SchoolInfo {
  // 기본 정보
  id: string;
  name: string;
  address: string;
  phone?: string;
  homepage?: string;
  foundedDate?: string;

  // 위치
  latitude: number;
  longitude: number;

  // 상태
  status: SchoolStatus;
  closingDate?: string;

  // 학생 현황
  totalStudents: number;
  maleStudents?: number;
  femaleStudents?: number;
  gradeStudents?: GradeStudents;
  classCount: number;
  expectedEnrollment?: number;

  // 교원 현황
  totalTeachers: number;
  teachersExcludingAdmin: number;
  principal: AdminInfo;
  vicePrincipal: AdminInfo;
  teachersByPosition?: TeachersByPosition;

  // 인사 분석
  estimatedTransferOut: number;
  teachersNearRetirement: number;
  teachersOver5Years: number;
  vacancies: number;

  // 학교 특성
  schoolType: SchoolType;
  isSmallSchool: boolean;
  specialPrograms: string[];

  // 시설
  hasGym: boolean;
  hasPool: boolean;
  playgroundSize?: number;

  // 통계
  studentTeacherRatio: number;
  averageClassSize: number;
  yearlyData: YearlyData[];

  // 리스크
  riskLevel: RiskLevel;
  riskFactors: string[];

  // 기타
  notes?: string;
}

export interface FilterOptions {
  status: SchoolStatus[];
  studentRange: { min: number; max: number };
  teacherRange: { min: number; max: number };
  hasPrincipal: boolean | null;
  hasVicePrincipal: boolean | null;
  schoolType: SchoolType[];
  isSmallSchool: boolean | null;
  hasVacancy: boolean | null;
  riskLevel: RiskLevel[];
}

export interface MapConfig {
  center: { lat: number; lng: number };
  zoom: number;
  minZoom: number;
  maxZoom: number;
}

export interface SchoolDataResponse {
  success: boolean;
  data: SchoolInfo[];
  metadata: {
    region: string;
    educationOffice: string;
    educationOfficeCode: string;
    lastUpdated: string;
    source: string;
  };
  statistics: {
    totalSchools: number;
    totalStudents: number;
    totalTeachers: number;
    closingSchools: number;
    smallSchools: number;
    criticalSchools: number;
  };
}
