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

const GIMJE_CENTER = { lat: 35.8037, lng: 126.8793 };

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

export default function SchoolMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [overlays, setOverlays] = useState<any[]>([]);
  const [activeOverlay, setActiveOverlay] = useState<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

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

    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoMapApiKey}&autoload=false`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        if (mapRef.current) {
          const options = {
            center: new window.kakao.maps.LatLng(
              GIMJE_CENTER.lat,
              GIMJE_CENTER.lng
            ),
            level: 8,
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
        }
      });
    };

    script.onerror = () => {
      console.log('Kakao Map script failed to load');
      setIsMapLoaded(false);
    };

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

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
      const markerSize = school.isSmallSchool ? 32 : 40;

      const markerContent = document.createElement('div');
      markerContent.innerHTML = `
        <div style="
          width: ${markerSize}px;
          height: ${markerSize}px;
          background: ${markerColor};
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 11px;
          cursor: pointer;
          transition: transform 0.2s;
        " class="school-marker" data-id="${school.id}">
          ${school.totalStudents}
        </div>
      `;

      markerContent.querySelector('.school-marker')?.addEventListener('click', () => {
        selectSchool(school);
        showInfoWindow(school, position);
      });

      markerContent.querySelector('.school-marker')?.addEventListener('mouseenter', (e) => {
        (e.target as HTMLElement).style.transform = 'scale(1.1)';
      });

      markerContent.querySelector('.school-marker')?.addEventListener('mouseleave', (e) => {
        (e.target as HTMLElement).style.transform = 'scale(1)';
      });

      const customOverlay = new window.kakao.maps.CustomOverlay({
        position: position,
        content: markerContent,
        yAnchor: 0.5,
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
          <span style="
            font-size: 12px;
            padding: 4px 8px;
            border-radius: 9999px;
            background: ${getRiskColor(school.riskLevel)}20;
            color: ${getRiskColor(school.riskLevel)};
            font-weight: 600;
          ">${getRiskBadge(school.riskLevel)}</span>
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

      const infoOverlay = new window.kakao.maps.CustomOverlay({
        position: position,
        content: content,
        yAnchor: 1.2,
      });

      infoOverlay.setMap(map);
      setActiveOverlay(infoOverlay);

      // 버튼 이벤트 추가
      setTimeout(() => {
        document
          .getElementById(`close-btn-${school.id}`)
          ?.addEventListener('click', () => {
            infoOverlay.setMap(null);
            setActiveOverlay(null);
          });

        document
          .getElementById(`detail-btn-${school.id}`)
          ?.addEventListener('click', () => {
            window.location.href = `/schools/${school.id}`;
          });
      }, 100);
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

  // 선택된 학교로 이동
  useEffect(() => {
    if (selectedSchool && map && isMapLoaded) {
      panTo(selectedSchool.latitude, selectedSchool.longitude, 4);
    }
  }, [selectedSchool, map, isMapLoaded, panTo]);

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

      {/* 지도 컨트롤 */}
      <MapControls
        onReset={() => panTo(GIMJE_CENTER.lat, GIMJE_CENTER.lng, 8)}
        onZoomIn={() => map?.setLevel(map.getLevel() - 1)}
        onZoomOut={() => map?.setLevel(map.getLevel() + 1)}
      />

      {/* 범례 */}
      <MapLegend />

      {/* 학교 수 표시 */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-4 py-2">
        <span className="text-sm">
          표시 중: <strong>{filteredSchools.length}</strong>개 학교
        </span>
      </div>
    </div>
  );
}
