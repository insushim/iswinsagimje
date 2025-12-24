'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useSchoolStore } from '@/lib/stores/schoolStore';
import { SchoolInfo } from '@/lib/types/school';
import StatsDashboard from '@/components/dashboard/StatsDashboard';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { setSchools, schools, setLoading } = useSchoolStore();

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              ← 지도로 돌아가기
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">통계 대시보드</h1>
        </div>
      </header>

      {/* 대시보드 컨텐츠 */}
      <StatsDashboard />
    </div>
  );
}
