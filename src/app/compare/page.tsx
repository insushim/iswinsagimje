'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useSchoolStore } from '@/lib/stores/schoolStore';
import { SchoolInfo, RiskLevel } from '@/lib/types/school';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

const COLORS = ['#3B82F6', '#22C55E', '#F59E0B', '#EF4444'];

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

export default function ComparePage() {
  const { compareSchools, removeFromCompare, clearCompare, setSchools, schools, setLoading } =
    useSchoolStore();

  useEffect(() => {
    if (schools.length === 0) {
      const fetchSchools = async () => {
        setLoading(true);
        try {
          const response = await fetch('/api/schools');
          const data = await response.json();
          if (data.success) {
            setSchools(data.data as SchoolInfo[]);
          }
        } catch (error) {
          console.error('Failed to fetch schools:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchSchools();
    }
  }, [schools.length, setSchools, setLoading]);

  if (compareSchools.length < 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            비교할 학교를 2개 이상 선택해주세요
          </h1>
          <p className="text-gray-500 mb-6">
            현재 선택된 학교: {compareSchools.length}개
          </p>
          <Link href="/">
            <Button>지도로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  // 비교 데이터 생성
  const comparisonData = [
    {
      name: '학생수',
      ...compareSchools.reduce(
        (acc, school, i) => ({
          ...acc,
          [school.name.replace('초등학교', '초')]: school.totalStudents,
        }),
        {}
      ),
    },
    {
      name: '교사수',
      ...compareSchools.reduce(
        (acc, school, i) => ({
          ...acc,
          [school.name.replace('초등학교', '초')]: school.teachersExcludingAdmin,
        }),
        {}
      ),
    },
    {
      name: '학급수',
      ...compareSchools.reduce(
        (acc, school, i) => ({
          ...acc,
          [school.name.replace('초등학교', '초')]: school.classCount,
        }),
        {}
      ),
    },
  ];

  // 레이더 차트 데이터
  const radarData = [
    {
      subject: '학생수',
      ...compareSchools.reduce(
        (acc, school) => ({
          ...acc,
          [school.name.replace('초등학교', '초')]: Math.min(
            school.totalStudents / 5,
            100
          ),
        }),
        {}
      ),
    },
    {
      subject: '교사수',
      ...compareSchools.reduce(
        (acc, school) => ({
          ...acc,
          [school.name.replace('초등학교', '초')]: Math.min(
            school.teachersExcludingAdmin * 5,
            100
          ),
        }),
        {}
      ),
    },
    {
      subject: '학급수',
      ...compareSchools.reduce(
        (acc, school) => ({
          ...acc,
          [school.name.replace('초등학교', '초')]: Math.min(
            school.classCount * 10,
            100
          ),
        }),
        {}
      ),
    },
    {
      subject: '시설',
      ...compareSchools.reduce(
        (acc, school) => ({
          ...acc,
          [school.name.replace('초등학교', '초')]:
            (school.hasGym ? 50 : 0) + (school.hasPool ? 50 : 0),
        }),
        {}
      ),
    },
    {
      subject: '안정성',
      ...compareSchools.reduce(
        (acc, school) => ({
          ...acc,
          [school.name.replace('초등학교', '초')]:
            school.riskLevel === 'low'
              ? 100
              : school.riskLevel === 'medium'
              ? 70
              : school.riskLevel === 'high'
              ? 40
              : 10,
        }),
        {}
      ),
    },
  ];

  const schoolNames = compareSchools.map((s) =>
    s.name.replace('초등학교', '초')
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                ← 지도로
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">학교 비교</h1>
          </div>
          <Button variant="outline" size="sm" onClick={clearCompare}>
            비교 초기화
          </Button>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* 선택된 학교 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {compareSchools.map((school, index) => (
            <Card
              key={school.id}
              className="relative"
              style={{ borderTopColor: COLORS[index], borderTopWidth: 4 }}
            >
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0"
                onClick={() => removeFromCompare(school.id)}
              >
                X
              </Button>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {school.name}
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">학생</span>
                    <span className="font-medium">{school.totalStudents}명</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">교사</span>
                    <span className="font-medium">
                      {school.teachersExcludingAdmin}명
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">상태</span>
                    <Badge
                      variant={
                        school.riskLevel === 'low' ? 'outline' : 'secondary'
                      }
                    >
                      {getRiskLabel(school.riskLevel)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 비교 차트 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 막대 차트 */}
          <Card>
            <CardHeader>
              <CardTitle>주요 지표 비교</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {schoolNames.map((name, index) => (
                    <Bar key={name} dataKey={name} fill={COLORS[index]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 레이더 차트 */}
          <Card>
            <CardHeader>
              <CardTitle>종합 비교</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  {schoolNames.map((name, index) => (
                    <Radar
                      key={name}
                      name={name}
                      dataKey={name}
                      stroke={COLORS[index]}
                      fill={COLORS[index]}
                      fillOpacity={0.3}
                    />
                  ))}
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* 상세 비교 테이블 */}
        <Card>
          <CardHeader>
            <CardTitle>상세 비교</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      항목
                    </th>
                    {compareSchools.map((school, index) => (
                      <th
                        key={school.id}
                        className="text-center py-3 px-4 font-medium"
                        style={{ color: COLORS[index] }}
                      >
                        {school.name.replace('초등학교', '초')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4 text-gray-600">전체 학생수</td>
                    {compareSchools.map((school) => (
                      <td
                        key={school.id}
                        className="text-center py-3 px-4 font-medium"
                      >
                        {school.totalStudents}명
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 text-gray-600">교사수</td>
                    {compareSchools.map((school) => (
                      <td
                        key={school.id}
                        className="text-center py-3 px-4 font-medium"
                      >
                        {school.teachersExcludingAdmin}명
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 text-gray-600">학급수</td>
                    {compareSchools.map((school) => (
                      <td
                        key={school.id}
                        className="text-center py-3 px-4 font-medium"
                      >
                        {school.classCount}개
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 text-gray-600">교사당 학생수</td>
                    {compareSchools.map((school) => (
                      <td
                        key={school.id}
                        className="text-center py-3 px-4 font-medium"
                      >
                        {school.studentTeacherRatio.toFixed(1)}명
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 text-gray-600">학급당 평균</td>
                    {compareSchools.map((school) => (
                      <td
                        key={school.id}
                        className="text-center py-3 px-4 font-medium"
                      >
                        {school.averageClassSize.toFixed(1)}명
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 text-gray-600">교장</td>
                    {compareSchools.map((school) => (
                      <td
                        key={school.id}
                        className={`text-center py-3 px-4 font-medium ${
                          school.principal.exists
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {school.principal.exists ? '재직' : '공석'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 text-gray-600">교감</td>
                    {compareSchools.map((school) => (
                      <td
                        key={school.id}
                        className={`text-center py-3 px-4 font-medium ${
                          school.vicePrincipal.exists
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {school.vicePrincipal.exists ? '재직' : '공석'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 text-gray-600">결원</td>
                    {compareSchools.map((school) => (
                      <td
                        key={school.id}
                        className={`text-center py-3 px-4 font-medium ${
                          school.vacancies > 0 ? 'text-red-600' : ''
                        }`}
                      >
                        {school.vacancies}명
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 text-gray-600">예상 전출</td>
                    {compareSchools.map((school) => (
                      <td
                        key={school.id}
                        className="text-center py-3 px-4 font-medium text-orange-600"
                      >
                        {school.estimatedTransferOut}명
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 text-gray-600">체육관</td>
                    {compareSchools.map((school) => (
                      <td
                        key={school.id}
                        className="text-center py-3 px-4 font-medium"
                      >
                        {school.hasGym ? 'O' : 'X'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 text-gray-600">학교유형</td>
                    {compareSchools.map((school) => (
                      <td
                        key={school.id}
                        className="text-center py-3 px-4 font-medium"
                      >
                        {school.schoolType === 'urban' ? '도시' : '농촌'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-gray-600">위험도</td>
                    {compareSchools.map((school) => (
                      <td key={school.id} className="text-center py-3 px-4">
                        <Badge
                          variant={
                            school.riskLevel === 'low' ||
                            school.riskLevel === 'medium'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {getRiskLabel(school.riskLevel)}
                        </Badge>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
