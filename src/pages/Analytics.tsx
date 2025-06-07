
import { useState } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import { getInitialDateRange } from '../utils/dateUtils';
import type { DateRange } from 'react-date-range';
import { AnalyticsHeader } from '../components/analytics/AnalyticsHeader';
import { AnalyticsKPIs } from '../components/analytics/AnalyticsKPIs';
import { AnalyticsCharts } from '../components/analytics/AnalyticsCharts';
import { AnalyticsSecondaryCharts } from '../components/analytics/AnalyticsSecondaryCharts';
import { AnalyticsDataTables } from '../components/analytics/AnalyticsDataTables';

export default function Analytics() {
  const [dateRange, setDateRange] = useState<DateRange[]>(getInitialDateRange());
  
  const analyticsDateRange = dateRange[0].startDate && dateRange[0].endDate ? {
    start: dateRange[0].startDate,
    end: dateRange[0].endDate
  } : undefined;

  const { data, loading, refetch } = useAnalytics(analyticsDateRange);

  if (loading) {
    return (
      <div className="container mx-auto p-4 lg:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 lg:p-6 max-w-7xl">
      <AnalyticsHeader
        dateRange={dateRange}
        onDateChange={setDateRange}
        loading={loading}
        onRefetch={refetch}
      />

      <AnalyticsKPIs totalStats={data.totalStats} />

      <AnalyticsCharts 
        salesData={data.salesData}
        paymentMethods={data.paymentMethods}
      />

      <AnalyticsSecondaryCharts
        hourlyStats={data.hourlyStats}
        motoboyStats={data.motoboyStats}
      />

      <AnalyticsDataTables
        topProducts={data.topProducts}
        leastProducts={data.leastProducts}
        neighborhoodStats={data.neighborhoodStats}
        paymentMethods={data.paymentMethods}
      />
    </div>
  );
}
