'use client';

import { useSchoolStore } from '@/lib/stores/schoolStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function FilterPanel() {
  const {
    filters,
    setFilters,
    resetFilters,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filteredSchools,
    schools,
  } = useSchoolStore();

  const handleStatusChange = (status: string, checked: boolean) => {
    const newStatus = checked
      ? [...filters.status, status]
      : filters.status.filter((s) => s !== status);
    setFilters({ status: newStatus as any });
  };

  const handleSchoolTypeChange = (type: string, checked: boolean) => {
    const newTypes = checked
      ? [...filters.schoolType, type]
      : filters.schoolType.filter((t) => t !== type);
    setFilters({ schoolType: newTypes as any });
  };

  const handleRiskLevelChange = (level: string, checked: boolean) => {
    const newLevels = checked
      ? [...filters.riskLevel, level]
      : filters.riskLevel.filter((l) => l !== level);
    setFilters({ riskLevel: newLevels as any });
  };

  return (
    <Card className="h-full overflow-auto border-0 shadow-none">
      <CardHeader className="pb-4 sticky top-0 bg-white z-10">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold">필터 및 검색</CardTitle>
          <Button variant="outline" size="sm" onClick={resetFilters}>
            초기화
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Badge variant="secondary" className="font-semibold">
            {filteredSchools.length}
          </Badge>
          <span>/ {schools.length}개 학교</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 검색 */}
        <div>
          <Label className="text-sm font-medium">학교 검색</Label>
          <Input
            placeholder="학교명 또는 주소 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mt-2"
          />
        </div>

        <Separator />

        {/* 정렬 */}
        <div>
          <Label className="text-sm font-medium">정렬 기준</Label>
          <select
            className="w-full mt-2 p-2 border rounded-md text-sm bg-white"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">학교명순</option>
            <option value="students_desc">학생수 많은순</option>
            <option value="students_asc">학생수 적은순</option>
            <option value="teachers_desc">교사수 많은순</option>
            <option value="teachers_asc">교사수 적은순</option>
            <option value="ratio_asc">교사당 학생 적은순</option>
            <option value="ratio_desc">교사당 학생 많은순</option>
            <option value="risk">위험도순</option>
          </select>
        </div>

        <Separator />

        {/* 운영 상태 */}
        <div>
          <Label className="text-sm font-medium">운영 상태</Label>
          <div className="mt-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="operating"
                  checked={filters.status.includes('operating')}
                  onCheckedChange={(checked) =>
                    handleStatusChange('operating', !!checked)
                  }
                />
                <label htmlFor="operating" className="text-sm cursor-pointer">
                  운영중
                </label>
              </div>
              <Badge variant="secondary">
                {schools.filter((s) => s.status === 'operating').length}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="closing"
                  checked={filters.status.includes('closing')}
                  onCheckedChange={(checked) =>
                    handleStatusChange('closing', !!checked)
                  }
                />
                <label
                  htmlFor="closing"
                  className="text-sm cursor-pointer text-red-600"
                >
                  폐교예정
                </label>
              </div>
              <Badge variant="destructive">
                {schools.filter((s) => s.status === 'closing').length}
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* 리스크 레벨 */}
        <div>
          <Label className="text-sm font-medium">위험도</Label>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="risk-critical"
                checked={filters.riskLevel.includes('critical')}
                onCheckedChange={(checked) =>
                  handleRiskLevelChange('critical', !!checked)
                }
              />
              <label
                htmlFor="risk-critical"
                className="text-sm cursor-pointer text-red-600 font-medium"
              >
                위험
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="risk-high"
                checked={filters.riskLevel.includes('high')}
                onCheckedChange={(checked) =>
                  handleRiskLevelChange('high', !!checked)
                }
              />
              <label
                htmlFor="risk-high"
                className="text-sm cursor-pointer text-orange-600 font-medium"
              >
                주의
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="risk-medium"
                checked={filters.riskLevel.includes('medium')}
                onCheckedChange={(checked) =>
                  handleRiskLevelChange('medium', !!checked)
                }
              />
              <label
                htmlFor="risk-medium"
                className="text-sm cursor-pointer text-yellow-600 font-medium"
              >
                관심
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="risk-low"
                checked={filters.riskLevel.includes('low')}
                onCheckedChange={(checked) =>
                  handleRiskLevelChange('low', !!checked)
                }
              />
              <label
                htmlFor="risk-low"
                className="text-sm cursor-pointer text-green-600 font-medium"
              >
                양호
              </label>
            </div>
          </div>
        </div>

        <Separator />

        {/* 학교 유형 */}
        <div>
          <Label className="text-sm font-medium">학교 유형</Label>
          <div className="mt-3 space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="urban"
                checked={filters.schoolType.includes('urban')}
                onCheckedChange={(checked) =>
                  handleSchoolTypeChange('urban', !!checked)
                }
              />
              <label htmlFor="urban" className="text-sm cursor-pointer">
                도시
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="rural"
                checked={filters.schoolType.includes('rural')}
                onCheckedChange={(checked) =>
                  handleSchoolTypeChange('rural', !!checked)
                }
              />
              <label htmlFor="rural" className="text-sm cursor-pointer">
                농촌
              </label>
            </div>
          </div>
        </div>

        <Separator />

        {/* 학생수 범위 */}
        <div>
          <Label className="text-sm font-medium">
            학생수: {filters.studentRange.min} - {filters.studentRange.max}명
          </Label>
          <Slider
            className="mt-4"
            min={0}
            max={700}
            step={10}
            value={[filters.studentRange.min, filters.studentRange.max]}
            onValueChange={([min, max]) =>
              setFilters({ studentRange: { min, max } })
            }
          />
        </div>

        <Separator />

        {/* 관리자 현황 */}
        <div>
          <Label className="text-sm font-medium">관리자 현황</Label>
          <div className="mt-3 space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="no-principal"
                checked={filters.hasPrincipal === false}
                onCheckedChange={(checked) =>
                  setFilters({
                    hasPrincipal: checked ? false : null,
                  })
                }
              />
              <label
                htmlFor="no-principal"
                className="text-sm cursor-pointer text-red-600"
              >
                교장 공석만 보기
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="no-vice-principal"
                checked={filters.hasVicePrincipal === false}
                onCheckedChange={(checked) =>
                  setFilters({
                    hasVicePrincipal: checked ? false : null,
                  })
                }
              />
              <label
                htmlFor="no-vice-principal"
                className="text-sm cursor-pointer text-red-600"
              >
                교감 공석만 보기
              </label>
            </div>
          </div>
        </div>

        <Separator />

        {/* 인사 관련 */}
        <div>
          <Label className="text-sm font-medium">기타 조건</Label>
          <div className="mt-3 space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="has-vacancy"
                checked={filters.hasVacancy === true}
                onCheckedChange={(checked) =>
                  setFilters({
                    hasVacancy: checked ? true : null,
                  })
                }
              />
              <label
                htmlFor="has-vacancy"
                className="text-sm cursor-pointer text-orange-600"
              >
                결원 있는 학교
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="small-school"
                checked={filters.isSmallSchool === true}
                onCheckedChange={(checked) =>
                  setFilters({
                    isSmallSchool: checked ? true : null,
                  })
                }
              />
              <label htmlFor="small-school" className="text-sm cursor-pointer">
                소규모 학교만 (60명 이하)
              </label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
