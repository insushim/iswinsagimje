// lib/stores/schoolStore.ts
import { create } from 'zustand';
import {
  SchoolInfo,
  FilterOptions,
  SchoolStatus,
  SchoolType,
  RiskLevel,
} from '@/lib/types/school';

interface SchoolState {
  schools: SchoolInfo[];
  filteredSchools: SchoolInfo[];
  selectedSchool: SchoolInfo | null;
  compareSchools: SchoolInfo[];
  isLoading: boolean;
  error: string | null;

  filters: FilterOptions;
  searchQuery: string;
  sortBy: string;

  // Actions
  setSchools: (schools: SchoolInfo[]) => void;
  selectSchool: (school: SchoolInfo | null) => void;
  addToCompare: (school: SchoolInfo) => void;
  removeFromCompare: (schoolId: string) => void;
  clearCompare: () => void;

  setFilters: (filters: Partial<FilterOptions>) => void;
  resetFilters: () => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: string) => void;

  applyFilters: () => void;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const defaultFilters: FilterOptions = {
  status: ['operating', 'closing'],
  studentRange: { min: 0, max: 700 },
  teacherRange: { min: 0, max: 100 },
  hasPrincipal: null,
  hasVicePrincipal: null,
  schoolType: ['urban', 'rural', 'island'],
  isSmallSchool: null,
  hasVacancy: null,
  riskLevel: ['low', 'medium', 'high', 'critical'],
  tier: [1, 2, 3, 4, 5],
};

export const useSchoolStore = create<SchoolState>((set, get) => ({
  schools: [],
  filteredSchools: [],
  selectedSchool: null,
  compareSchools: [],
  isLoading: false,
  error: null,

  filters: defaultFilters,
  searchQuery: '',
  sortBy: 'name',

  setSchools: (schools) => {
    set({ schools, filteredSchools: schools });
    get().applyFilters();
  },

  selectSchool: (school) => set({ selectedSchool: school }),

  addToCompare: (school) => {
    const { compareSchools } = get();
    if (
      compareSchools.length < 4 &&
      !compareSchools.find((s) => s.id === school.id)
    ) {
      set({ compareSchools: [...compareSchools, school] });
    }
  },

  removeFromCompare: (schoolId) => {
    set({
      compareSchools: get().compareSchools.filter((s) => s.id !== schoolId),
    });
  },

  clearCompare: () => set({ compareSchools: [] }),

  setFilters: (newFilters) => {
    set({ filters: { ...get().filters, ...newFilters } });
    get().applyFilters();
  },

  resetFilters: () => {
    set({ filters: defaultFilters, searchQuery: '' });
    get().applyFilters();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().applyFilters();
  },

  setSortBy: (sort) => {
    set({ sortBy: sort });
    get().applyFilters();
  },

  applyFilters: () => {
    const { schools, filters, searchQuery, sortBy } = get();

    let filtered = schools.filter((school) => {
      // 검색어 필터
      if (
        searchQuery &&
        !school.name.includes(searchQuery) &&
        !school.address.includes(searchQuery)
      ) {
        return false;
      }

      // 상태 필터
      if (!filters.status.includes(school.status)) return false;

      // 학생수 범위
      if (
        school.totalStudents < filters.studentRange.min ||
        school.totalStudents > filters.studentRange.max
      )
        return false;

      // 교사수 범위
      if (
        school.totalTeachers < filters.teacherRange.min ||
        school.totalTeachers > filters.teacherRange.max
      )
        return false;

      // 교장 유무
      if (
        filters.hasPrincipal !== null &&
        school.principal.exists !== filters.hasPrincipal
      )
        return false;

      // 교감 유무
      if (
        filters.hasVicePrincipal !== null &&
        school.vicePrincipal.exists !== filters.hasVicePrincipal
      )
        return false;

      // 학교 유형
      if (!filters.schoolType.includes(school.schoolType)) return false;

      // 소규모 학교
      if (
        filters.isSmallSchool !== null &&
        school.isSmallSchool !== filters.isSmallSchool
      )
        return false;

      // 결원 유무
      if (
        filters.hasVacancy !== null &&
        (school.vacancies > 0) !== filters.hasVacancy
      )
        return false;

      // 리스크 레벨
      if (!filters.riskLevel.includes(school.riskLevel)) return false;

      // 급지 필터
      if (school.tier && !filters.tier.includes(school.tier)) return false;

      return true;
    });

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'students_asc':
          return a.totalStudents - b.totalStudents;
        case 'students_desc':
          return b.totalStudents - a.totalStudents;
        case 'teachers_asc':
          return a.totalTeachers - b.totalTeachers;
        case 'teachers_desc':
          return b.totalTeachers - a.totalTeachers;
        case 'ratio_asc':
          return a.studentTeacherRatio - b.studentTeacherRatio;
        case 'ratio_desc':
          return b.studentTeacherRatio - a.studentTeacherRatio;
        case 'risk':
          const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
        case 'tier_asc':
          return (a.tier || 0) - (b.tier || 0);
        case 'tier_desc':
          return (b.tier || 0) - (a.tier || 0);
        default:
          return 0;
      }
    });

    set({ filteredSchools: filtered });
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
