'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { SchoolInfo, RiskLevel } from '@/lib/types/school';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

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

export default function SchoolDetailPage() {
  const params = useParams();
  const [school, setSchool] = useState<SchoolInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        const response = await fetch('/api/schools');
        const data = await response.json();
        if (data.success) {
          const found = data.data.find(
            (s: SchoolInfo) => s.id === params.id
          );
          setSchool(found || null);
        }
      } catch (error) {
        console.error('Failed to fetch school:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchool();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            학교를 찾을 수 없습니다
          </h1>
          <Link href="/">
            <Button>지도로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                ← 목록으로
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{school.name}</h1>
              <p className="text-sm text-gray-500">{school.address}</p>
            </div>
          </div>
          <Badge variant={getRiskBadgeVariant(school.riskLevel)}>
            {getRiskLabel(school.riskLevel)}
          </Badge>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-6xl mx-auto p-6">
        {/* 폐교 예정 경고 */}
        {school.status === 'closing' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">
              {school.closingDate} 폐교 예정
            </p>
            {school.notes && (
              <p className="text-red-600 text-sm mt-1">{school.notes}</p>
            )}
          </div>
        )}

        {/* 요약 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold text-blue-600">
                {school.totalStudents}
              </div>
              <div className="text-sm text-gray-500">전체 학생수</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold text-green-600">
                {school.totalTeachers}
              </div>
              <div className="text-sm text-gray-500">전체 교원수</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold text-purple-600">
                {school.classCount}
              </div>
              <div className="text-sm text-gray-500">학급수</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold text-orange-600">
                {school.studentTeacherRatio.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">교사당 학생</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold text-cyan-600">
                {school.averageClassSize.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">학급당 평균</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <div
                className={`text-3xl font-bold ${
                  school.vacancies > 0 ? 'text-red-600' : 'text-gray-600'
                }`}
              >
                {school.vacancies}
              </div>
              <div className="text-sm text-gray-500">결원</div>
            </CardContent>
          </Card>
        </div>

        {/* 탭 컨텐츠 */}
        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList>
            <TabsTrigger value="basic">기본정보</TabsTrigger>
            <TabsTrigger value="students">학생현황</TabsTrigger>
            <TabsTrigger value="teachers">교원현황</TabsTrigger>
            <TabsTrigger value="hr">인사이동정보</TabsTrigger>
            <TabsTrigger value="facility">시설정보</TabsTrigger>
          </TabsList>

          {/* 기본정보 탭 */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700">학교명</h4>
                    <p className="text-gray-900">{school.name}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">주소</h4>
                    <p className="text-gray-900">{school.address}</p>
                  </div>
                  {school.phone && (
                    <div>
                      <h4 className="font-medium text-gray-700">전화번호</h4>
                      <p className="text-gray-900">{school.phone}</p>
                    </div>
                  )}
                  {school.homepage && (
                    <div>
                      <h4 className="font-medium text-gray-700">홈페이지</h4>
                      <a
                        href={school.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {school.homepage}
                      </a>
                    </div>
                  )}
                  {school.foundedDate && (
                    <div>
                      <h4 className="font-medium text-gray-700">설립일</h4>
                      <p className="text-gray-900">{school.foundedDate}</p>
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-gray-700">학교유형</h4>
                    <p className="text-gray-900">
                      {school.schoolType === 'urban' ? '도시' : '농촌'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">소규모학교</h4>
                    <p className="text-gray-900">
                      {school.isSmallSchool ? '예' : '아니오'}
                    </p>
                  </div>
                </div>

                {school.specialPrograms.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">
                        특색 프로그램
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {school.specialPrograms.map((program) => (
                          <Badge key={program} variant="secondary">
                            {program}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {school.riskFactors.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium text-red-700 mb-2">
                        위험 요소
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {school.riskFactors.map((factor) => (
                          <Badge key={factor} variant="destructive">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 학생현황 탭 */}
          <TabsContent value="students">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>학생 현황</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {school.totalStudents}
                        </div>
                        <div className="text-sm text-gray-500">전체</div>
                      </div>
                      {school.maleStudents !== undefined && (
                        <div className="p-4 bg-sky-50 rounded-lg">
                          <div className="text-2xl font-bold text-sky-600">
                            {school.maleStudents}
                          </div>
                          <div className="text-sm text-gray-500">남학생</div>
                        </div>
                      )}
                      {school.femaleStudents !== undefined && (
                        <div className="p-4 bg-pink-50 rounded-lg">
                          <div className="text-2xl font-bold text-pink-600">
                            {school.femaleStudents}
                          </div>
                          <div className="text-sm text-gray-500">여학생</div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>연도별 학생수 추이</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={school.yearlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="students"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        name="학생수"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 교원현황 탭 */}
          <TabsContent value="teachers">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>교원 현황</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {school.totalTeachers}
                        </div>
                        <div className="text-sm text-gray-500">전체 교원</div>
                      </div>
                      <div className="p-4 bg-emerald-50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-emerald-600">
                          {school.teachersExcludingAdmin}
                        </div>
                        <div className="text-sm text-gray-500">
                          교사 (관리직 제외)
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className={`p-4 rounded-lg ${
                          school.principal.exists
                            ? 'bg-gray-50'
                            : 'bg-red-50'
                        }`}
                      >
                        <div className="font-medium">교장</div>
                        <div
                          className={`text-lg ${
                            school.principal.exists
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {school.principal.exists ? '재직중' : '공석'}
                        </div>
                        {school.principal.yearsAtSchool && (
                          <div className="text-sm text-gray-500">
                            현 학교 {school.principal.yearsAtSchool}년 근무
                          </div>
                        )}
                      </div>
                      <div
                        className={`p-4 rounded-lg ${
                          school.vicePrincipal.exists
                            ? 'bg-gray-50'
                            : 'bg-red-50'
                        }`}
                      >
                        <div className="font-medium">교감</div>
                        <div
                          className={`text-lg ${
                            school.vicePrincipal.exists
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {school.vicePrincipal.exists ? '재직중' : '공석'}
                        </div>
                        {school.vicePrincipal.yearsAtSchool && (
                          <div className="text-sm text-gray-500">
                            현 학교 {school.vicePrincipal.yearsAtSchool}년 근무
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>연도별 교원수 추이</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={school.yearlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="teachers" fill="#22C55E" name="교원수" />
                      <Bar dataKey="classes" fill="#8B5CF6" name="학급수" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 인사이동정보 탭 */}
          <TabsContent value="hr">
            <Card>
              <CardHeader>
                <CardTitle>인사이동 관련 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-orange-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {school.estimatedTransferOut}
                    </div>
                    <div className="text-sm text-gray-500">예상 전출</div>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {school.vacancies}
                    </div>
                    <div className="text-sm text-gray-500">현 결원</div>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {school.teachersNearRetirement}
                    </div>
                    <div className="text-sm text-gray-500">정년 근접</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {school.teachersOver5Years}
                    </div>
                    <div className="text-sm text-gray-500">5년+ 근무자</div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <h4 className="font-medium mb-4">인사이동 분석</h4>
                  <div className="space-y-3">
                    {school.estimatedTransferOut > 0 && (
                      <div className="p-3 bg-orange-50 rounded-lg text-orange-800">
                        약 {school.estimatedTransferOut}명의 교사가 전출할
                        것으로 예상됩니다.
                      </div>
                    )}
                    {school.vacancies > 0 && (
                      <div className="p-3 bg-red-50 rounded-lg text-red-800">
                        현재 {school.vacancies}명의 결원이 있습니다.
                      </div>
                    )}
                    {!school.principal.exists && (
                      <div className="p-3 bg-red-50 rounded-lg text-red-800">
                        교장 공석 상태입니다.
                      </div>
                    )}
                    {!school.vicePrincipal.exists && (
                      <div className="p-3 bg-orange-50 rounded-lg text-orange-800">
                        교감 공석 상태입니다.
                      </div>
                    )}
                    {school.teachersOver5Years > 0 && (
                      <div className="p-3 bg-yellow-50 rounded-lg text-yellow-800">
                        5년 이상 근무 교사가 {school.teachersOver5Years}명
                        있어 전출 가능성이 있습니다.
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 시설정보 탭 */}
          <TabsContent value="facility">
            <Card>
              <CardHeader>
                <CardTitle>시설 현황</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-700">체육관</div>
                    <div
                      className={`text-lg ${
                        school.hasGym ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      {school.hasGym ? '있음' : '없음'}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-700">수영장</div>
                    <div
                      className={`text-lg ${
                        school.hasPool ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      {school.hasPool ? '있음' : '없음'}
                    </div>
                  </div>
                  {school.playgroundSize && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="font-medium text-gray-700">운동장</div>
                      <div className="text-lg text-gray-900">
                        {school.playgroundSize.toLocaleString()}㎡
                      </div>
                    </div>
                  )}
                </div>

                {school.notes && (
                  <>
                    <Separator className="my-4" />
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="font-medium text-blue-700 mb-1">
                        비고
                      </div>
                      <p className="text-blue-800">{school.notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
