'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSchoolStore } from '@/lib/stores/schoolStore';
import { SchoolInfo, RiskLevel } from '@/lib/types/school';
import MapControls from './MapControls';
import MapLegend from './MapLegend';

declare global {
  interface Window {
    kakao: any;
  }
}

// 김제시 전체 범위 (모든 학교 좌표 기반)
// 북: 35.91 (치문초), 남: 35.72 (금산초/원평초)
// 서: 126.74 (광활초), 동: 127.03 (금산초)
const GIMJE_BOUNDS = {
  sw: { lat: 35.71, lng: 126.73 }, // 남서쪽
  ne: { lat: 35.92, lng: 127.04 }, // 북동쪽
};
const GIMJE_CENTER = { lat: 35.815, lng: 126.885 };

// 학교 이름 축약 (김제초등학교 → 김제초, 김제검산초등학교 → 검산초)
const getShortName = (name: string): string => {
  // 먼저 "초등학교"를 "초"로 변경
  let shortName = name.replace('초등학교', '초');

  // "김제초"는 그대로 유지, 나머지는 "김제" 제거
  if (shortName === '김제초') {
    return '김제초';
  }
  return shortName.replace('김제', '');
};

const getMarkerColor = (school: SchoolInfo): string => {
  if (school.status === 'closing') return '#EF4444';
  if (school.status === 'closed') return '#6B7280';

  if (school.totalStudents <= 10) return '#EF4444';
  if (school.totalStudents <= 30) return '#F97316';
  if (school.totalStudents <= 60) return '#EAB308';
  return '#22C55E';
};

const getRiskBadge = (riskLevel: RiskLevel): string => {
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

const getRiskColor = (riskLevel: RiskLevel): string => {
  switch (riskLevel) {
    case 'critical':
      return '#EF4444';
    case 'high':
      return '#F97316';
    case 'medium':
      return '#EAB308';
    case 'low':
      return '#22C55E';
  }
};

const getTierColor = (tier: number): string => {
  switch (tier) {
    case 1:
      return '#3B82F6'; // blue
    case 2:
      return '#22C55E'; // green
    case 3:
      return '#EAB308'; // yellow
    case 4:
      return '#F97316'; // orange
    case 5:
      return '#EF4444'; // red
    default:
      return '#6B7280'; // gray
  }
};

export default function SchoolMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [overlays, setOverlays] = useState<any[]>([]);
  const [activeOverlay, setActiveOverlay] = useState<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const initialBoundsSet = useRef(false);

  const { filteredSchools, selectSchool, selectedSchool } = useSchoolStore();

  // 지도 초기화
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const kakaoMapApiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;

    if (!kakaoMapApiKey) {
      console.log('Kakao Map API key not found, using fallback display');
      setIsMapLoaded(false);
      return;
    }

    // 이미 카카오맵 스크립트가 로드되어 있는지 확인
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => {
        initializeMap();
      });
      return;
    }

    // 이미 스크립트 태그가 있는지 확인
    const existingScript = document.querySelector('script[src*="dapi.kakao.com"]');
    if (existingScript) {
      // 스크립트가 로드될 때까지 대기
      const checkKakao = setInterval(() => {
        if (window.kakao && window.kakao.maps) {
          clearInterval(checkKakao);
          window.kakao.maps.load(() => {
            initializeMap();
          });
        }
      }, 100);
      return () => clearInterval(checkKakao);
    }

    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoMapApiKey}&autoload=false`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        initializeMap();
      });
    };

    script.onerror = () => {
      console.error('Kakao Map script failed to load');
      setIsMapLoaded(false);
    };

    function initializeMap() {
      if (mapRef.current && !map) {
        // 김제시 전체 학교가 보이는 고정 뷰
        // 스크린샷 기준 최적화된 중심점과 줌 레벨
        const gimjeCenterLat = 35.815;
        const gimjeCenterLng = 126.9;

        const options = {
          center: new window.kakao.maps.LatLng(gimjeCenterLat, gimjeCenterLng),
          level: 10, // 김제시 전체가 보이는 줌 레벨 (고정)
        };
        const newMap = new window.kakao.maps.Map(mapRef.current, options);

        setMap(newMap);
        setIsMapLoaded(true);

        const zoomControl = new window.kakao.maps.ZoomControl();
        newMap.addControl(
          zoomControl,
          window.kakao.maps.ControlPosition.RIGHT
        );

        const mapTypeControl = new window.kakao.maps.MapTypeControl();
        newMap.addControl(
          mapTypeControl,
          window.kakao.maps.ControlPosition.TOPRIGHT
        );

        console.log('지도 초기화 완료, 현재 중심:', newMap.getCenter().toString());
      }
    }
  }, [map]);

  // 초기 로드 시 김제 지역으로 이동 (학교 좌표 평균 기반)
  useEffect(() => {
    if (!map || !isMapLoaded || filteredSchools.length === 0) return;
    if (initialBoundsSet.current) return;

    // 모든 학교 좌표의 평균으로 중심점 계산
    let sumLat = 0, sumLng = 0;
    let minLat = 999, maxLat = -999, minLng = 999, maxLng = -999;

    filteredSchools.forEach((school) => {
      sumLat += school.latitude;
      sumLng += school.longitude;
      minLat = Math.min(minLat, school.latitude);
      maxLat = Math.max(maxLat, school.latitude);
      minLng = Math.min(minLng, school.longitude);
      maxLng = Math.max(maxLng, school.longitude);
    });

    const centerLat = sumLat / filteredSchools.length;
    const centerLng = sumLng / filteredSchools.length;

    console.log('김제 중심점:', centerLat, centerLng);
    console.log('범위:', minLat, '-', maxLat, ',', minLng, '-', maxLng);

    // 중심점으로 이동하고 적절한 줌 레벨 설정
    map.setCenter(new window.kakao.maps.LatLng(centerLat, centerLng));
    map.setLevel(10);

    initialBoundsSet.current = true;
  }, [map, isMapLoaded, filteredSchools]);

  // 마커 생성 및 업데이트
  useEffect(() => {
    if (!map || !isMapLoaded || filteredSchools.length === 0) return;

    // 기존 오버레이 제거
    overlays.forEach((overlay) => overlay.setMap(null));

    const newOverlays: any[] = [];

    filteredSchools.forEach((school) => {
      const position = new window.kakao.maps.LatLng(
        school.latitude,
        school.longitude
      );

      const markerColor = getMarkerColor(school);
      const shortName = getShortName(school.name);

      const markerContent = document.createElement('div');
      markerContent.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
        " class="school-marker-container" data-id="${school.id}">
          <div style="
            width: 28px;
            height: 28px;
            background: ${markerColor};
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 10px;
            transition: transform 0.2s;
          " class="school-marker">
            ${school.totalStudents}
          </div>
          <div style="
            background: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            color: #374151;
            white-space: nowrap;
            margin-top: 2px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          " class="school-label">
            ${shortName}
          </div>
        </div>
      `;

      const container = markerContent.querySelector('.school-marker-container');
      container?.addEventListener('click', () => {
        // 지도에서 마커 클릭 시 팝업만 표시 (selectSchool 호출하지 않음)
        showInfoWindow(school, position);
      });

      container?.addEventListener('mouseenter', () => {
        const marker = container.querySelector('.school-marker') as HTMLElement;
        if (marker) marker.style.transform = 'scale(1.2)';
      });

      container?.addEventListener('mouseleave', () => {
        const marker = container.querySelector('.school-marker') as HTMLElement;
        if (marker) marker.style.transform = 'scale(1)';
      });

      const customOverlay = new window.kakao.maps.CustomOverlay({
        position: position,
        content: markerContent,
        yAnchor: 1,
      });

      customOverlay.setMap(map);
      newOverlays.push(customOverlay);
    });

    setOverlays(newOverlays);
  }, [map, filteredSchools, isMapLoaded]);

  // 인포윈도우 표시
  const showInfoWindow = useCallback(
    (school: SchoolInfo, position: any) => {
      if (!map || !isMapLoaded) return;

      if (activeOverlay) {
        activeOverlay.setMap(null);
      }

      const content = document.createElement('div');
      content.innerHTML = `
      <div style="
        padding: 16px;
        min-width: 300px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        font-family: 'Pretendard', -apple-system, sans-serif;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #1f2937;">${school.name}</h3>
          <div style="display: flex; gap: 6px; align-items: center;">
            ${school.tier ? `<span style="
              font-size: 12px;
              padding: 4px 8px;
              border-radius: 9999px;
              background: ${getTierColor(school.tier)}20;
              color: ${getTierColor(school.tier)};
              font-weight: 600;
            ">${school.tier}급지</span>` : ''}
            <span style="
              font-size: 12px;
              padding: 4px 8px;
              border-radius: 9999px;
              background: ${getRiskColor(school.riskLevel)}20;
              color: ${getRiskColor(school.riskLevel)};
              font-weight: 600;
            ">${getRiskBadge(school.riskLevel)}</span>
          </div>
        </div>

        ${
          school.status === 'closing'
            ? `
          <div style="
            background: #FEE2E2;
            color: #DC2626;
            padding: 10px;
            border-radius: 8px;
            margin-bottom: 12px;
            font-size: 13px;
            font-weight: 500;
          ">
            ${school.closingDate} 폐교 예정
          </div>
        `
            : ''
        }

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px;">
          <div style="background: #F3F4F6; padding: 10px; border-radius: 8px;">
            <div style="font-size: 11px; color: #6B7280; margin-bottom: 2px;">학생수</div>
            <div style="font-size: 20px; font-weight: 700; color: #1f2937;">${school.totalStudents}<span style="font-size: 12px; font-weight: 400;">명</span></div>
          </div>
          <div style="background: #F3F4F6; padding: 10px; border-radius: 8px;">
            <div style="font-size: 11px; color: #6B7280; margin-bottom: 2px;">교사수</div>
            <div style="font-size: 20px; font-weight: 700; color: #1f2937;">${school.teachersExcludingAdmin}<span style="font-size: 12px; font-weight: 400;">명</span></div>
          </div>
          <div style="background: #F3F4F6; padding: 10px; border-radius: 8px;">
            <div style="font-size: 11px; color: #6B7280; margin-bottom: 2px;">학급수</div>
            <div style="font-size: 20px; font-weight: 700; color: #1f2937;">${school.classCount}<span style="font-size: 12px; font-weight: 400;">개</span></div>
          </div>
          <div style="background: #F3F4F6; padding: 10px; border-radius: 8px;">
            <div style="font-size: 11px; color: #6B7280; margin-bottom: 2px;">교사당 학생</div>
            <div style="font-size: 20px; font-weight: 700; color: #1f2937;">${school.studentTeacherRatio.toFixed(1)}<span style="font-size: 12px; font-weight: 400;">명</span></div>
          </div>
        </div>

        <div style="display: flex; gap: 16px; margin-bottom: 12px; font-size: 13px;">
          <span style="color: ${school.principal.exists ? '#22C55E' : '#EF4444'};">
            교장: ${school.principal.exists ? '있음' : '공석'}
          </span>
          <span style="color: ${school.vicePrincipal.exists ? '#22C55E' : '#EF4444'};">
            교감: ${school.vicePrincipal.exists ? '있음' : '공석'}
          </span>
        </div>

        ${
          school.vacancies > 0
            ? `
          <div style="color: #DC2626; font-size: 13px; margin-bottom: 8px; font-weight: 500;">
            결원 ${school.vacancies}명
          </div>
        `
            : ''
        }

        ${
          school.estimatedTransferOut > 0
            ? `
          <div style="color: #F59E0B; font-size: 13px; margin-bottom: 8px; font-weight: 500;">
            예상 전출: ${school.estimatedTransferOut}명
          </div>
        `
            : ''
        }

        <div style="display: flex; gap: 8px; margin-top: 14px;">
          <button id="detail-btn-${school.id}" style="
            flex: 1;
            padding: 10px;
            background: #3B82F6;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 600;
            transition: background 0.2s;
          ">
            상세보기
          </button>
          <button id="compare-btn-${school.id}" style="
            padding: 10px 16px;
            background: #E5E7EB;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            transition: background 0.2s;
          ">
            비교
          </button>
          <button id="close-btn-${school.id}" style="
            padding: 10px 12px;
            background: transparent;
            border: 1px solid #E5E7EB;
            border-radius: 8px;
            cursor: pointer;
            font-size: 13px;
          ">
            X
          </button>
        </div>
      </div>
    `;

      // 버튼 이벤트 먼저 연결
      const closeBtn = content.querySelector(`#close-btn-${school.id}`);
      const detailBtn = content.querySelector(`#detail-btn-${school.id}`);

      const infoOverlay = new window.kakao.maps.CustomOverlay({
        position: position,
        content: content,
        yAnchor: 1.2,
      });

      // X 버튼 클릭 이벤트
      closeBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        infoOverlay.setMap(null);
        setActiveOverlay(null);
      });

      // 상세보기 버튼 클릭 이벤트
      detailBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        window.location.href = `/schools/${school.id}`;
      });

      infoOverlay.setMap(map);
      setActiveOverlay(infoOverlay);
    },
    [map, activeOverlay, isMapLoaded]
  );

  // 지도 중심 이동
  const panTo = useCallback(
    (lat: number, lng: number, level: number = 5) => {
      if (map && isMapLoaded) {
        const moveLatLng = new window.kakao.maps.LatLng(lat, lng);
        map.panTo(moveLatLng);
        map.setLevel(level);
      }
    },
    [map, isMapLoaded]
  );

  // 선택된 학교의 팝업 표시 (목록에서 클릭 시)
  useEffect(() => {
    if (selectedSchool && map && isMapLoaded) {
      const position = new window.kakao.maps.LatLng(
        selectedSchool.latitude,
        selectedSchool.longitude
      );

      // 해당 학교가 현재 화면에 보이는지 확인
      const bounds = map.getBounds();
      const isInBounds = bounds.contain(position);

      // 화면에 없으면 해당 학교가 보이도록 이동 (줌 레벨은 유지)
      if (!isInBounds) {
        map.panTo(position);
      }

      // 팝업 표시
      showInfoWindow(selectedSchool, position);
    }
  }, [selectedSchool, map, isMapLoaded]);

  // API 키가 없을 때 폴백 UI
  if (!process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY) {
    return (
      <div className="relative w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            지도를 표시하려면 API 키가 필요합니다
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            .env.local 파일에 NEXT_PUBLIC_KAKAO_MAP_API_KEY를 설정해주세요.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg text-left">
            <p className="text-xs text-gray-500 mb-2">현재 표시 중인 학교:</p>
            <p className="text-2xl font-bold text-blue-600">
              {filteredSchools.length}개
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />

      {/* 지도 컨트롤 - 리셋 버튼 누르면 초기 뷰로 복귀 */}
      <MapControls
        onReset={() => {
          if (map && window.kakao) {
            // 초기 뷰와 동일한 설정
            map.setCenter(new window.kakao.maps.LatLng(35.815, 126.9));
            map.setLevel(10);
          }
        }}
        onZoomIn={() => map?.setLevel(map.getLevel() - 1)}
        onZoomOut={() => map?.setLevel(map.getLevel() + 1)}
      />

      {/* 범례 */}
      <MapLegend />

      {/* 학교 수 표시 */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-4 py-2">
        <span className="text-sm">
          김제시 초등학교: <strong>{filteredSchools.length}</strong>개
        </span>
      </div>
    </div>
  );
}
