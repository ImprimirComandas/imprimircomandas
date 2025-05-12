
import React, { useState } from 'react';
import { ThemedSection } from '@/components/ui/theme-provider';
import DeliveryDatePicker from './deliveryList/DeliveryDatePicker';
import NoDeliveriesFound from './deliveryList/NoDeliveriesFound';
import MotoboyDeliveryGroup from './deliveryList/MotoboyDeliveryGroup';
import DeleteDeliveryDialog from './deliveryList/DeleteDeliveryDialog';
import EditDeliveryDialog from './deliveryList/EditDeliveryDialog';
import LoadingSpinner from './deliveryList/LoadingSpinner';
import { useDeliveryList } from '@/hooks/useDeliveryList';
import { GroupedDeliveries, Entrega } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Printer, ChevronDown, Filter } from 'lucide-react';

export default function DeliveryList() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'list' | 'summary'>('list');
  const {
    loading,
    motoboys,
    bairros,
    groupedDeliveries,
    expandedMotoboys,
    expandedDates,
    activeSessions,
    deleteDialogOpen,
    editDialogOpen,
    deliveryToDelete,
    deliveryToEdit,
    deleteLoading,
    editLoading,
    setDeleteDialogOpen,
    setEditDialogOpen,
    toggleMotoboyExpand,
    toggleDateExpand,
    confirmDeleteDelivery,
    confirmEditDelivery,
    handleDeleteDelivery,
    handleSaveEditedDelivery
  } = useDeliveryList(selectedDate);

  // Calculamos totais para o sumário
  const deliverySummary = React.useMemo(() => {
    const summary = {
      totalDeliveries: 0,
      totalValue: 0,
      motoboyStats: [] as { id: string, name: string, count: number, value: number }[]
    };
    
    Object.entries(groupedDeliveries).forEach(([motoboyId, data]) => {
      const motoboyDeliveries = Object.values(data.deliveriesByDate).flat();
      const count = motoboyDeliveries.length;
      summary.totalDeliveries += count;
      summary.totalValue += data.totalValue;
      
      summary.motoboyStats.push({
        id: motoboyId,
        name: data.motoboyName,
        count,
        value: data.totalValue
      });
    });
    
    return summary;
  }, [groupedDeliveries]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ThemedSection className="mb-0">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Entregas por Motoboy</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {deliverySummary.totalDeliveries} entregas encontradas • Total: R$ {deliverySummary.totalValue.toFixed(2)}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
          <DeliveryDatePicker
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setViewMode(viewMode === 'list' ? 'summary' : 'list')}
              className="flex items-center"
            >
              {viewMode === 'list' ? 'Ver Resumo' : 'Ver Detalhes'}
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="sm" className="flex items-center">
              <Filter className="mr-1 h-4 w-4" />
              Filtrar
            </Button>
            
            <Button variant="outline" size="sm" className="flex items-center">
              <Printer className="mr-1 h-4 w-4" />
              Imprimir
            </Button>
            
            <Button variant="outline" size="sm" className="flex items-center">
              <Download className="mr-1 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>
      </div>
      
      {/* Visão de Resumo */}
      {viewMode === 'summary' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {deliverySummary.motoboyStats.map(stat => (
            <Card key={stat.id} className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">{stat.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center">
                      <span className="text-4xl font-bold text-primary">{stat.count}</span>
                      <span className="ml-2 text-sm text-muted-foreground">entregas</span>
                    </div>
                    <p className="text-sm text-muted-foreground">hoje</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-semibold">
                      R$ {stat.value.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">valor total</p>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full mt-4 text-primary"
                  onClick={() => {
                    setViewMode('list');
                    toggleMotoboyExpand(stat.id);
                  }}
                >
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>
          ))}
          
          {deliverySummary.motoboyStats.length === 0 && (
            <Card className="col-span-full border-border bg-card">
              <CardContent className="py-6 text-center text-muted-foreground">
                Nenhuma entrega encontrada para esta data.
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        /* Visão de Lista */
        <>
          {Object.keys(groupedDeliveries).length === 0 ? (
            <NoDeliveriesFound />
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedDeliveries).map(([motoboyId, data]) => (
                <MotoboyDeliveryGroup
                  key={motoboyId}
                  motoboyId={motoboyId}
                  data={data}
                  onDeleteDelivery={confirmDeleteDelivery}
                  onEditDelivery={confirmEditDelivery}
                  isSessionActive={activeSessions[motoboyId]}
                  expandedMotoboys={expandedMotoboys}
                  expandedDates={expandedDates}
                  onToggleMotoboy={toggleMotoboyExpand}
                  onToggleDate={toggleDateExpand}
                />
              ))}
            </div>
          )}
        </>
      )}

      <DeleteDeliveryDialog
        open={deleteDialogOpen}
        loading={deleteLoading}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteDelivery}
      />
      
      <EditDeliveryDialog
        open={editDialogOpen}
        loading={editLoading}
        delivery={deliveryToEdit}
        bairros={bairros}
        motoboys={motoboys}
        onOpenChange={setEditDialogOpen}
        onSave={handleSaveEditedDelivery}
      />
    </ThemedSection>
  );
}
