
import { useState } from 'react';
import { getInitialDateRange } from '../utils/dateUtils';
import type { DateRange } from 'react-date-range';
import { useAnalyticsOptimized } from '../hooks/useAnalyticsOptimized';
import { AnalyticsHeader } from '../components/analytics/AnalyticsHeader';
import { AnalyticsKPIs } from '../components/analytics/AnalyticsKPIs';
import { AnalyticsCharts } from '../components/analytics/AnalyticsCharts';
import { AnalyticsSecondaryCharts } from '../components/analytics/AnalyticsSecondaryCharts';
import { AnalyticsDataTables } from '../components/analytics/AnalyticsDataTables';
import { AnalyticsLoadingState } from '../components/analytics/AnalyticsLoadingState';
import { AnalyticsEmptyState } from '../components/analytics/AnalyticsEmptyState';
import { AnalyticsErrorState } from '../components/analytics/AnalyticsErrorState';

export default function Analytics() {
  const [dateRange, setDateRange] = useState<DateRange[]>(getInitialDateRange());
  
  const analyticsDateRange = dateRange[0].startDate && dateRange[0].endDate ? {
    start: dateRange[0].startDate,
    end: dateRange[0].endDate
  } : undefined;

  const { data, loading, error, refetch, isEmpty } = useAnalyticsOptimized(analyticsDateRange);

  if (loading) {
    return <AnalyticsLoadingState />;
  }

  if (error) {
    return <AnalyticsErrorState error={error.message} onRetry={refetch} />;
  }

  if (isEmpty) {
    return <AnalyticsEmptyState />;
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
