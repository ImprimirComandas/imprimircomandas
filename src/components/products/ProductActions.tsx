
import React from 'react';
import { Save, Upload } from 'lucide-react';
import { Card } from '../ui/card';

interface ProductActionsProps {
  onExport: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  saving: boolean;
  uploadedFile: File | null;
}

export function ProductActions({
  onExport,
  onFileUpload,
  saving,
  uploadedFile
}: ProductActionsProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Ações de Produtos</h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="product-file" className="block text-sm font-medium text-foreground mb-1">
            Importar Produtos (XLS, XLSX, CSV)
          </label>
          <input
            id="product-file"
            type="file"
            accept=".xls,.xlsx,.csv"
            onChange={onFileUpload}
            disabled={saving}
            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
          {uploadedFile && (
            <p className="mt-2 text-sm text-muted-foreground">
              Arquivo selecionado: {uploadedFile.name}
            </p>
          )}
        </div>
        
        <button
          onClick={onExport}
          className="w-full flex items-center justify-center px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors duration-200"
        >
          <Save className="h-4 w-4 mr-2" />
          Exportar Todos os Produtos
        </button>
      </div>
    </Card>
  );
}
