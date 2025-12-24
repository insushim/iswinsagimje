'use client';

import Link from 'next/link';
import { SchoolInfo, RiskLevel } from '@/lib/types/school';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSchoolStore } from '@/lib/stores/schoolStore';

interface SchoolCardProps {
  school: SchoolInfo;
  isSelected?: boolean;
  onClick?: () => void;
}

const getRiskBadgeVariant = (
  riskLevel: RiskLevel
): 'destructive' | 'secondary' | 'outline' | 'default' => {
  switch (riskLevel) {
    case 'critical':
      return 'destructive';
    case 'high':
      return 'destructive';
    case 'medium':
      return 'secondary';
    case 'low':
      return 'outline';
  }
};

const getRiskLabel = (riskLevel: RiskLevel): string => {
  switch (riskLevel) {
    case 'critical':
      return '위험';
    case 'high':
      return '주의';
    case 'medium':
      return '관심';
    case 'low':
      return '양호';
  }
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'operating':
      return 'bg-green-100 text-green-700';
    case 'closing':
      return 'bg-red-100 text-red-700';
    case 'closed':
      return 'bg-gray-100 text-gray-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export default function SchoolCard({
  school,
  isSelected = false,
  onClick,
}: SchoolCardProps) {
  const { addToCompare, compareSchools } = useSchoolStore();
  const isInCompare = compareSchools.some((s) => s.id === school.id);

  return (
    <Card
      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500 shadow-md' : ''
      } ${school.status === 'closing' ? 'border-red-300 bg-red-50' : ''}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{school.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{school.address}</p>
        </div>
        <Badge variant={getRiskBadgeVariant(school.riskLevel)}>
          {getRiskLabel(school.riskLevel)}
        </Badge>
      </div>

      {school.status === 'closing' && (
        <div className="mb-3 text-xs font-medium text-red-600 bg-red-100 px-2 py-1.5 rounded">
          {school.closingDate} 폐교 예정
        </div>
      )}

      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="text-lg font-bold text-gray-900">
            {school.totalStudents}
          </div>
          <div className="text-xs text-gray-500">학생</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="text-lg font-bold text-gray-900">
            {school.teachersExcludingAdmin}
          </div>
          <div className="text-xs text-gray-500">교사</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="text-lg font-bold text-gray-900">
            {school.classCount}
          </div>
          <div className="text-xs text-gray-500">학급</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="text-lg font-bold text-gray-900">
            {school.studentTeacherRatio.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500">비율</div>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs mb-3">
        <span
          className={
            school.principal.exists ? 'text-green-600' : 'text-red-600'
          }
        >
          교장: {school.principal.exists ? '있음' : '공석'}
        </span>
        <span
          className={
            school.vicePrincipal.exists ? 'text-green-600' : 'text-red-600'
          }
        >
          교감: {school.vicePrincipal.exists ? '있음' : '공석'}
        </span>
        {school.vacancies > 0 && (
          <span className="text-orange-600">결원 {school.vacancies}명</span>
        )}
      </div>

      {school.specialPrograms.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {school.specialPrograms.map((program) => (
            <Badge key={program} variant="outline" className="text-xs">
              {program}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex gap-2 mt-3">
        <Link href={`/schools/${school.id}`} className="flex-1">
          <Button
            variant="default"
            size="sm"
            className="w-full"
            onClick={(e) => e.stopPropagation()}
          >
            상세보기
          </Button>
        </Link>
        <Button
          variant={isInCompare ? 'secondary' : 'outline'}
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            if (!isInCompare) {
              addToCompare(school);
            }
          }}
          disabled={isInCompare || compareSchools.length >= 4}
        >
          {isInCompare ? '비교중' : '비교'}
        </Button>
      </div>
    </Card>
  );
}
