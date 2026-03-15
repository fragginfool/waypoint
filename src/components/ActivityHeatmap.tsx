import React from 'react';
import { ActivityCalendar, ThemeInput } from 'react-activity-calendar';
import { getActivityData } from '@/actions/activityActions';

const theme: ThemeInput = {
  light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'], // Standard GitHub/Google Light green
  dark: ['#27272a', '#064e3b', '#065f46', '#047857', '#10b981'],
};

export default async function ActivityHeatmap() {
  const data = await getActivityData();

  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Activity Heatmap
        </h2>
        <div className="overflow-x-auto pb-2 scrollbar-hide">
          <ActivityCalendar
            data={data}
            theme={theme}
            colorScheme="light"
            showWeekdayLabels={true}
            labels={{
              totalCount: '{{count}} activities in the last year',
            }}
          />
        </div>
      </div>
    </div>
  );
}
