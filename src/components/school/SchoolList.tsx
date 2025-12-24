'use client';

import { useSchoolStore } from '@/lib/stores/schoolStore';
import SchoolCard from './SchoolCard';

export default function SchoolList() {
  const { filteredSchools, selectSchool, selectedSchool } = useSchoolStore();

  return (
    <div className="h-full overflow-auto p-4 space-y-3">
      {filteredSchools.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>조건에 맞는 학교가 없습니다.</p>
          <p className="text-sm mt-1">필터 조건을 변경해보세요.</p>
        </div>
      ) : (
        filteredSchools.map((school) => (
          <SchoolCard
            key={school.id}
            school={school}
            isSelected={selectedSchool?.id === school.id}
            onClick={() => selectSchool(school)}
          />
        ))
      )}
    </div>
  );
}
