'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ActivityCalendar, ThemeInput } from 'react-activity-calendar';
import { getActivityData } from '@/actions/activityActions';

const theme: ThemeInput = {
  light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
  dark: ['#27272a', '#064e3b', '#065f46', '#047857', '#10b981'],
};

export default function ActivityHeatmap() {
  const [data, setData] = useState<any[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      const result = await getActivityData();
      setData(result);
    }
    loadData();
  }, []);

  useEffect(() => {
    if (data.length > 0 && scrollContainerRef.current) {
      // Scroll to the end (most recent data) on mount
      const container = scrollContainerRef.current;
      container.scrollLeft = container.scrollWidth;
    }
  }, [data]);

  if (!data || data.length === 0) return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm h-32 animate-pulse flex items-center justify-center">
      <p className="text-gray-400 text-sm">Loading activity...</p>
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm max-w-sm">
      <div className="flex flex-col gap-2">
        <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
          Activity Insights
        </h2>
        {/* We limit the visible container width and allow horizontal scrolling */}
        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto pb-2 scrollbar-hide scroll-smooth border border-gray-50 rounded-lg p-2 bg-gray-50/30"
        >
          <div className="min-w-fit">
            <ActivityCalendar
              data={data}
              theme={theme}
              colorScheme="light"
              showWeekdayLabels={false}
              blockSize={10}
              blockMargin={3}
              fontSize={10}
              labels={{
                totalCount: '{{count}} activities in the last year',
              }}
            />
          </div>
        </div>
        <div className="flex justify-between items-center mt-1">
          <p className="text-[9px] text-gray-400 italic">
            Last 12 months (scroll left)
          </p>
          <div className="flex gap-1">
             {[0,1,2,3,4].map(l => (
               <div key={l} className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: theme.light?.[l] || '#ebedf0' }} />
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
