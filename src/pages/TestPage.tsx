
import { useEffect } from 'react';
import { Package, Truck, X, Plus } from 'lucide-react';
import MotoboyForm from '../components/MotoboyForm';
import MotoboysList from '../components/MotoboysList';
import DeliveryForm from '../components/DeliveryForm';
import DeliveriesList from '../components/DeliveriesList';
import { useDeliveryManagement } from '../hooks/useDeliveryManagement';

export default function TestPage() {
  const {
    loading,
    motoboys,
    deliveries,
    showMotoboyForm,
    setShowMotoboyForm,
    editingMotoboy,
    motoboyName,
    setMotoboyName,
    motoboyPhone,
    setMotoboyPhone,
    motoboyPlate,
    setMotoboyPlate,
    showDeliveryForm,
    setShowDeliveryForm,
    orderCode,
    setOrderCode,
    selectedPlatform,
    setSelectedPlatform,
    selectedMotoboy,
    setSelectedMotoboy,
    deliveryValue,
    setDeliveryValue,
    matchedComanda,
    loadingComandas,
    selectedDeliveries,
    pendingDeliveriesByMotoboy,
    resetMotoboyForm,
    handleMotoboySubmit,
    handleEditMotoboy,
    handleDeleteMotoboy,
    handleDeliverySubmit,
    handleUpdateDeliveryStatus,
    toggleDeliverySelection,
    assignSelectedDeliveriesToMotoboy,
    getMotoboyName,
    formatPlatform,
    fetchData
  } = useDeliveryManagement();
  
  // Load data when component mounts
  useEffect(() => {
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Gerenciamento de Entregas</h1>
          <p className="text-gray-600">Gerencie motoboys e entregas</p>
        </div>
        
        {/* Motoboys Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <Truck className="mr-2 h-5 w-5" />
              Motoboys
            </h2>
            <button 
              onClick={() => {
                resetMotoboyForm();
                setShowMotoboyForm(!showMotoboyForm);
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-indigo-700 transition-colors"
            >
              {showMotoboyForm ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
              {showMotoboyForm ? 'Cancelar' : 'Novo Motoboy'}
            </button>
          </div>
          
          {/* Motoboy Form */}
          {showMotoboyForm && (
            <MotoboyForm
              editingMotoboy={editingMotoboy}
              onSubmit={handleMotoboySubmit}
              onCancel={resetMotoboyForm}
              motoboyName={motoboyName}
              setMotoboyName={setMotoboyName}
              motoboyPhone={motoboyPhone}
              setMotoboyPhone={setMotoboyPhone}
              motoboyPlate={motoboyPlate}
              setMotoboyPlate={setMotoboyPlate}
            />
          )}
          
          {/* Motoboys List */}
          <MotoboysList
            motoboys={motoboys}
            pendingDeliveriesByMotoboy={pendingDeliveriesByMotoboy}
            onEdit={handleEditMotoboy}
            onDelete={handleDeleteMotoboy}
          />
        </div>
        
        {/* Deliveries Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Entregas
            </h2>
            <button 
              onClick={() => setShowDeliveryForm(!showDeliveryForm)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-indigo-700 transition-colors"
            >
              {showDeliveryForm ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
              {showDeliveryForm ? 'Cancelar' : 'Nova Entrega'}
            </button>
          </div>
          
          {/* Delivery Form */}
          {showDeliveryForm && (
            <DeliveryForm
              orderCode={orderCode}
              setOrderCode={setOrderCode}
              selectedPlatform={selectedPlatform}
              setSelectedPlatform={setSelectedPlatform}
              selectedMotoboy={selectedMotoboy}
              setSelectedMotoboy={setSelectedMotoboy}
              deliveryValue={deliveryValue}
              setDeliveryValue={setDeliveryValue}
              matchedComanda={matchedComanda}
              loadingComandas={loadingComandas}
              motoboys={motoboys}
              pendingDeliveriesByMotoboy={pendingDeliveriesByMotoboy}
              onSubmit={handleDeliverySubmit}
            />
          )}
          
          {/* Deliveries List */}
          <DeliveriesList
            deliveries={deliveries}
            selectedDeliveries={selectedDeliveries}
            toggleDeliverySelection={toggleDeliverySelection}
            getMotoboyName={getMotoboyName}
            formatPlatform={formatPlatform}
            handleUpdateDeliveryStatus={handleUpdateDeliveryStatus}
            motoboys={motoboys}
            assignSelectedDeliveriesToMotoboy={assignSelectedDeliveriesToMotoboy}
          />
        </div>
      </div>
    </div>
  );
}
