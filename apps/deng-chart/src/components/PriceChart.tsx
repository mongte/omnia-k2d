"use client";

import React, { useState, useEffect } from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ChartData {
  name: string;
  timestamp: string;
  unixTime: number; // For proper numerical sorting/panning
  PremiumAppx?: number;
  CommonAppx?: number;
  AllAppx?: number;
  AllMin?: number;
  AllMax?: number;
  range?: [number, number]; // Area 표시 및 툴팁용 [min, max]
}

type TimeRange = '30m' | '1h' | '4h' | '1d' | 'all';

export default function PriceChart() {
  const [rawData, setRawData] = useState<ChartData[]>([]);
  const [displayData, setDisplayData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState<TimeRange>('1h');

  // Zoom state
  const [zoomLevel, setZoomLevel] = useState(1);

  // Drag to scroll states
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/prices", { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        // Add Unix time for numeric operations
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parsed: ChartData[] = json.data.map((d: any) => ({
          ...d,
          unixTime: new Date(d.timestamp).getTime()
        }));
        setRawData(parsed);
      } else {
        setError(json.error || "Failed to fetch data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter & Group data based on selected timeRange
  useEffect(() => {
    if (rawData.length === 0) return;

    let rangeMs = 0;
    switch (timeRange) {
      case '30m': rangeMs = 30 * 60 * 1000; break;
      case '1h': rangeMs = 60 * 60 * 1000; break;
      case '4h': rangeMs = 4 * 60 * 60 * 1000; break;
      case '1d': rangeMs = 24 * 60 * 60 * 1000; break;
      case 'all': rangeMs = 0; break;
    }

    if (rangeMs === 0) {
      setDisplayData(rawData);
      setZoomLevel(1);
      return;
    }

    // 매우 간단한 그룹화 로직: 시간을 interval(rangeMs)로 나누어 그룹핑
    const grouped = new Map<number, ChartData[]>();
    rawData.forEach(item => {
      const g = Math.floor(item.unixTime / rangeMs) * rangeMs;
      if (!grouped.has(g)) grouped.set(g, []);
      grouped.get(g)!.push(item);
    });

    const aggregated: ChartData[] = Array.from(grouped.entries()).map(([gTime, items]) => {
      let sumP = 0, sumC = 0, sumA = 0;
      let cntP = 0, cntC = 0, cntA = 0;
      let minA = Infinity, maxA = -Infinity;

      items.forEach(it => {
        if (it.PremiumAppx) { sumP += it.PremiumAppx; cntP++; }
        if (it.CommonAppx) { sumC += it.CommonAppx; cntC++; }
        if (it.AllAppx) { sumA += it.AllAppx; cntA++; }

        if (it.AllMin !== undefined) minA = Math.min(minA, it.AllMin);
        if (it.AllMax !== undefined) maxA = Math.max(maxA, it.AllMax);
      });
      
      const formatGroupDate = (date: Date) => {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        if (timeRange === '1d') {
          return `${month}/${day}`;
        }
        return `${month}/${day} ${date.getHours()}시${timeRange === '30m' && date.getMinutes()>0 ? ' 30분': ''}`;
      };

      return {
        unixTime: gTime,
        timestamp: new Date(gTime).toISOString(),
        name: formatGroupDate(new Date(gTime)),
        PremiumAppx: cntP > 0 ? Math.round(sumP / cntP) : undefined,
        CommonAppx: cntC > 0 ? Math.round(sumC / cntC) : undefined,
        AllAppx: cntA > 0 ? Math.round(sumA / cntA) : undefined,
        AllMin: minA !== Infinity ? minA : undefined,
        AllMax: maxA !== -Infinity ? maxA : undefined,
        range: minA !== Infinity && maxA !== -Infinity ? [minA, maxA] : undefined,
      };
    });

    aggregated.sort((a, b) => a.unixTime - b.unixTime);
    setDisplayData(aggregated);
    setZoomLevel(1); // 타임 레인지 변경 시 줌 리셋
  }, [rawData, timeRange]);

  // Handle Mouse Events for native drag-to-scroll panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault(); // 기본 드래그 방지
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Drag speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const formatYAxis = (tickItem: number) => {
    return new Intl.NumberFormat("ko-KR").format(tickItem);
  };

  return (
    <div className="w-full h-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 lg:p-8 border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
            시세 동향 (만당 가격)
          </h2>
          <div className="flex items-center gap-2 mt-3">
            {[
              { id: '30m', label: '30분' },
              { id: '1h', label: '1시간' },
              { id: '4h', label: '4시간' },
              { id: '1d', label: '일' },
              { id: 'all', label: '전체 시간' },
            ].map(range => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id as TimeRange)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  timeRange === range.id 
                  ? "bg-indigo-600 text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {range.label}
              </button>
            ))}
            
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 ml-2 pl-2 border-l border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.25))}
                className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="축소"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>
              </button>
              <span className="text-xs font-medium text-gray-500 w-8 text-center">{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(5, prev + 0.25))}
                className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="확대"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
              </button>
            </div>
          </div>
        </div>
        {process.env.NODE_ENV !== "production" && (
          <button
            onClick={fetchData}
            disabled={loading}
            className="mt-4 sm:mt-0 px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-semibold rounded-xl text-sm transition-all duration-200 flex items-center gap-2 transform active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>가져오는 중</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                <span>최신 동기화</span>
              </>
            )}
          </button>
        )}
      </div>

      {error ? (
        <div className="flex h-[400px] flex-col items-center justify-center p-8 bg-red-50 dark:bg-red-900/10 rounded-xl text-red-500">
          <svg className="w-12 h-12 mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="font-semibold text-lg text-center">{error}</span>
          <span className="text-sm mt-2 opacity-80">데이터 연결을 확인해주세요.</span>
        </div>
      ) : loading && rawData.length === 0 ? (
        <div className="flex h-[400px] items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
        </div>
      ) : displayData.length === 0 ? (
        <div className="flex h-[400px] flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-400">
          <svg className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" /></svg>
          <span className="font-semibold text-lg text-gray-500 dark:text-gray-400">데이터가 없습니다.</span>
          <p className="text-sm mt-1 mb-4 text-center">아직 크롤링된 내역이 없습니다. 수동 크롤링을 실행해보세요.</p>
        </div>
      ) : (
        <div className="relative h-[450px] w-full pt-4">
          {/* 차트를 좌우로 이동할 수 있다는 힌트 */}
          <div className="absolute left-16 top-2 z-20 w-max text-xs text-indigo-400 bg-white/90 dark:bg-gray-800/90 px-3 py-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-indigo-100 dark:border-indigo-900/30">
            드래그 스크롤 및 우상단 확대/축소 지원
          </div>

          {/* 고정된 Y축 오버레이 영역 (스크롤되지 않음) */}
          <div className="absolute left-0 top-4 bottom-0 z-10 w-[80px] bg-white dark:bg-gray-800 border-r border-transparent">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={displayData}
                margin={{ top: 10, right: 0, left: 10, bottom: 30 }}
              >
                <YAxis
                  tickFormatter={formatYAxis}
                  tick={{ fontSize: 13, fill: "#9CA3AF", fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  domain={["auto", "auto"]}
                  width={70}
                  tickMargin={0}
                />
                <Legend 
                  verticalAlign="top" 
                  height={50} 
                  iconType="circle" 
                  wrapperStyle={{ fontWeight: 600, fontSize: "14px", opacity: 0, pointerEvents: "none" }} 
                  formatter={(value: string) => value === "range" ? "전체 시세 밴드" : value}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 13, fill: "transparent", fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  padding={{ left: 20, right: 20 }}
                  tickMargin={16}
                  height={50}
                />
                {/* Y축 స్케일 계산을 위한 보이지 않는 더미 요소들 */}
                <Area dataKey="range" stroke="none" fill="none" isAnimationActive={false} activeDot={false} />
                <Line dataKey="AllAppx" stroke="none" dot={false} activeDot={false} isAnimationActive={false} />
                <Line dataKey="PremiumAppx" stroke="none" dot={false} activeDot={false} isAnimationActive={false} />
                <Line dataKey="CommonAppx" stroke="none" dot={false} activeDot={false} isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* 실제 드래그 스크롤 영역 */}
          <div 
            ref={scrollRef}
            className={`absolute left-[80px] right-0 top-4 bottom-0 overflow-x-auto overflow-y-hidden select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
          >
            <div style={{ minWidth: '100%', width: `${Math.max(100, displayData.length * 3 * zoomLevel)}%`, height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={displayData}
                  margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
                >
                  <defs>
                    <linearGradient id="colorAll" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-gray-700" opacity={0.5} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 13, fill: "#9CA3AF", fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    padding={{ left: 20, right: 20 }}
                    tickMargin={16}
                    height={50}
                  />
                  <YAxis
                    hide={true} // 메인 차트에서는 숨김 (오버레이에서 고정 표시)
                    domain={["auto", "auto"]}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                      backgroundColor: "var(--tw-bg-opacity, rgba(255, 255, 255, 0.9))",
                      backdropFilter: "blur(4px)",
                      padding: "16px",
                      color: "#1e293b",
                      fontWeight: 600,
                    }}
                    itemStyle={{
                      paddingTop: "6px"
                    }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any, name: any) => {
                      if (name === "range" && Array.isArray(value)) {
                        return [`최저 ${formatYAxis(value[0])} 원 ~ 최고 ${formatYAxis(value[1])} 원`, "전체 시세 밴드"];
                      }
                      return [`${formatYAxis(value || 0)} 원`, String(name)];
                    }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={50} 
                    iconType="circle" 
                    wrapperStyle={{ fontWeight: 600, fontSize: "14px" }} 
                    formatter={(value: string) => value === "range" ? "전체 시세 밴드" : value}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="range" 
                    fill="#818cf8" // 인디고 계열로 조금 더 진하게 (Tailwind indigo-400)
                    stroke="none" 
                    name="range" 
                    activeDot={false} 
                    opacity={0.3} // 색상이 진해졌으므로 투명도 조절
                  />
                  <Line
                    type="monotone"
                    name="전체 평균"
                    dataKey="AllAppx"
                    stroke="#6366f1"
                    strokeWidth={4}
                    dot={{ r: 5, strokeWidth: 2, fill: "#fff" }}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                    animationDuration={1500}
                    animationEasing="ease-in-out"
                  />
                  <Line
                    type="monotone"
                    name="프리미엄 리스트"
                    dataKey="PremiumAppx"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#fff" }}
                    activeDot={{ r: 6 }}
                    strokeDasharray="5 5"
                    animationDuration={1500}
                  />
                  <Line
                    type="monotone"
                    name="일반 리스트"
                    dataKey="CommonAppx"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#fff" }}
                    activeDot={{ r: 6 }}
                    strokeDasharray="5 5"
                    animationDuration={1500}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
