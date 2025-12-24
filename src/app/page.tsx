'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSchoolStore } from '@/lib/stores/schoolStore';
import { SchoolInfo } from '@/lib/types/school';
import SchoolMap from '@/components/map/SchoolMap';
import FilterPanel from '@/components/filters/FilterPanel';
import SchoolList from '@/components/school/SchoolList';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export default function Home() {
  const {
    setSchools,
    isLoading,
    setLoading,
    compareSchools,
    clearCompare,
    removeFromCompare,
  } = useSchoolStore();
  const [activeTab, setActiveTab] = useState('map');

  useEffect(() => {
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
  }, [setSchools, setLoading]);

  return (
    <div className="h-screen flex flex-col">
      {/* 헤더 */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">
            김제시 초등학교 교원 인사이동 정보
          </h1>
          <Badge variant="secondary" className="text-xs">
            2025년 기준
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {/* 비교 학교 표시 */}
          {compareSchools.length > 0 && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  비교 ({compareSchools.length}/4)
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>학교 비교</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-3">
                  {compareSchools.map((school) => (
                    <div
                      key={school.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium">{school.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCompare(school.id)}
                      >
                        X
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-4">
                    <Link href="/compare" className="flex-1">
                      <Button
                        className="w-full"
                        disabled={compareSchools.length < 2}
                      >
                        비교하기
                      </Button>
                    </Link>
                    <Button variant="outline" onClick={clearCompare}>
                      초기화
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              통계 대시보드
            </Button>
          </Link>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 좌측 사이드바 - 필터 */}
        <aside className="w-80 border-r bg-white overflow-auto hidden lg:block">
          <FilterPanel />
        </aside>

        {/* 중앙 - 지도/목록 */}
        <main className="flex-1 flex flex-col">
          {/* 모바일 탭 */}
          <div className="lg:hidden border-b">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start rounded-none border-0 h-12">
                <TabsTrigger value="map" className="flex-1">
                  지도
                </TabsTrigger>
                <TabsTrigger value="list" className="flex-1">
                  목록
                </TabsTrigger>
                <TabsTrigger value="filter" className="flex-1">
                  필터
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* 데스크톱: 지도 + 목록 분할 */}
          <div className="flex-1 hidden lg:flex">
            <div className="flex-1 relative">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">데이터 로딩 중...</p>
                  </div>
                </div>
              ) : (
                <SchoolMap />
              )}
            </div>
            <div className="w-96 border-l bg-white overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <h2 className="font-semibold text-gray-900">학교 목록</h2>
              </div>
              <SchoolList />
            </div>
          </div>

          {/* 모바일: 탭 컨텐츠 */}
          <div className="flex-1 lg:hidden">
            <Tabs value={activeTab} className="h-full">
              <TabsContent value="map" className="h-full m-0">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600">데이터 로딩 중...</p>
                    </div>
                  </div>
                ) : (
                  <SchoolMap />
                )}
              </TabsContent>
              <TabsContent value="list" className="h-full m-0 overflow-auto">
                <SchoolList />
              </TabsContent>
              <TabsContent value="filter" className="h-full m-0 overflow-auto">
                <FilterPanel />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* 푸터 */}
      <footer className="bg-white border-t px-4 py-2 text-xs text-gray-500 flex items-center justify-between">
        <span>데이터 출처: NEIS, 학교알리미 | 마지막 업데이트: 2024-12-24</span>
        <span>전북특별자치도김제교육지원청</span>
      </footer>
    </div>
  );
}
