'use client';

import { useSchoolStore } from '@/lib/stores/schoolStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const COLORS = ['#22C55E', '#EAB308', '#F97316', '#EF4444', '#6B7280'];

interface StatCardProps {
  title: string;
  value: number;
  suffix?: string;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'orange';
}

function StatCard({
  title,
  value,
  suffix = '',
  color = 'blue',
}: StatCardProps) {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    orange: 'text-orange-600',
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-sm text-gray-500 mb-1">{title}</div>
        <div className={`text-3xl font-bold ${colorClasses[color]}`}>
          {value.toLocaleString()}
          <span className="text-sm font-normal text-gray-400 ml-1">
            {suffix}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StatsDashboard() {
  const { schools } = useSchoolStore();

  // 통계 계산
  const stats = {
    totalSchools: schools.length,
    operatingSchools: schools.filter((s) => s.status === 'operating').length,
    closingSchools: schools.filter((s) => s.status === 'closing').length,
    totalStudents: schools.reduce((sum, s) => sum + s.totalStudents, 0),
    totalTeachers: schools.reduce((sum, s) => sum + s.totalTeachers, 0),
    smallSchools: schools.filter((s) => s.isSmallSchool).length,
    principalVacancies: schools.filter((s) => !s.principal.exists).length,
    vicePrincipalVacancies: schools.filter((s) => !s.vicePrincipal.exists)
      .length,
    totalVacancies: schools.reduce((sum, s) => sum + s.vacancies, 0),
    expectedTransfers: schools.reduce(
      (sum, s) => sum + s.estimatedTransferOut,
      0
    ),
    urbanSchools: schools.filter((s) => s.schoolType === 'urban').length,
    ruralSchools: schools.filter((s) => s.schoolType === 'rural').length,
  };

  // 규모별 분포 데이터
  const sizeDistribution = [
    {
      name: '100명 이상',
      value: schools.filter((s) => s.totalStudents >= 100).length,
    },
    {
      name: '61-99명',
      value: schools.filter(
        (s) => s.totalStudents >= 61 && s.totalStudents < 100
      ).length,
    },
    {
      name: '31-60명',
      value: schools.filter(
        (s) => s.totalStudents >= 31 && s.totalStudents < 61
      ).length,
    },
    {
      name: '11-30명',
      value: schools.filter(
        (s) => s.totalStudents >= 11 && s.totalStudents < 31
      ).length,
    },
    {
      name: '10명 이하',
      value: schools.filter((s) => s.totalStudents <= 10).length,
    },
  ];

  // 학생수 상위 10개 학교
  const topSchools = [...schools]
    .sort((a, b) => b.totalStudents - a.totalStudents)
    .slice(0, 10)
    .map((s) => ({
      name: s.name.replace('초등학교', '초'),
      students: s.totalStudents,
      teachers: s.teachersExcludingAdmin,
    }));

  // 위험도별 분포
  const riskDistribution = [
    {
      name: '양호',
      value: schools.filter((s) => s.riskLevel === 'low').length,
      color: '#22C55E',
    },
    {
      name: '관심',
      value: schools.filter((s) => s.riskLevel === 'medium').length,
      color: '#EAB308',
    },
    {
      name: '주의',
      value: schools.filter((s) => s.riskLevel === 'high').length,
      color: '#F97316',
    },
    {
      name: '위험',
      value: schools.filter((s) => s.riskLevel === 'critical').length,
      color: '#EF4444',
    },
  ];

  // 교사당 학생수 분포
  const ratioData = schools
    .filter((s) => s.status === 'operating')
    .map((s) => ({
      name: s.name.replace('초등학교', '초'),
      ratio: s.studentTeacherRatio,
    }))
    .sort((a, b) => b.ratio - a.ratio)
    .slice(0, 15);

  if (schools.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        데이터를 불러오는 중...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          김제시 초등학교 현황 대시보드
        </h1>
        <p className="text-gray-500 mt-1">2024년 기준 현황 통계</p>
      </div>

      {/* 기본 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="총 학교수" value={stats.totalSchools} suffix="개" />
        <StatCard
          title="운영중"
          value={stats.operatingSchools}
          suffix="개"
          color="green"
        />
        <StatCard
          title="폐교예정"
          value={stats.closingSchools}
          suffix="개"
          color="red"
        />
        <StatCard title="총 학생수" value={stats.totalStudents} suffix="명" />
        <StatCard title="총 교원수" value={stats.totalTeachers} suffix="명" />
        <StatCard
          title="소규모학교"
          value={stats.smallSchools}
          suffix="개"
          color="yellow"
        />
      </div>

      {/* 인사 관련 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="교장 공석"
          value={stats.principalVacancies}
          suffix="개교"
          color="red"
        />
        <StatCard
          title="교감 공석"
          value={stats.vicePrincipalVacancies}
          suffix="개교"
          color="red"
        />
        <StatCard
          title="교사 결원"
          value={stats.totalVacancies}
          suffix="명"
          color="orange"
        />
        <StatCard
          title="예상 전출"
          value={stats.expectedTransfers}
          suffix="명"
          color="orange"
        />
      </div>

      {/* 차트 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 규모별 분포 */}
        <Card>
          <CardHeader>
            <CardTitle>학교 규모별 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sizeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}개`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sizeDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 위험도별 분포 */}
        <Card>
          <CardHeader>
            <CardTitle>위험도별 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}개`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 학생수 상위 학교 */}
        <Card>
          <CardHeader>
            <CardTitle>학생수 상위 10개 학교</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topSchools} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={80}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip />
                <Legend />
                <Bar dataKey="students" fill="#3B82F6" name="학생수" />
                <Bar dataKey="teachers" fill="#22C55E" name="교사수" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 교사당 학생수 */}
        <Card>
          <CardHeader>
            <CardTitle>학교별 교사당 학생수 (상위 15개)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ratioData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="ratio" fill="#8B5CF6" name="교사당 학생수" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 위험 학교 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">주의 필요 학교</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schools
              .filter(
                (s) => s.riskLevel === 'critical' || s.riskLevel === 'high'
              )
              .map((school) => (
                <div
                  key={school.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    school.riskLevel === 'critical'
                      ? 'border-red-500 bg-red-50'
                      : 'border-orange-500 bg-orange-50'
                  }`}
                >
                  <div className="font-semibold text-gray-900">
                    {school.name}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    학생 {school.totalStudents}명 | 교사{' '}
                    {school.teachersExcludingAdmin}명
                  </div>
                  <div className="text-xs text-red-600 mt-2 flex flex-wrap gap-1">
                    {school.riskFactors.map((factor, i) => (
                      <span
                        key={i}
                        className="bg-red-100 px-1.5 py-0.5 rounded"
                      >
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
