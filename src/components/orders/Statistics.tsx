
import { Card, CardContent } from '@/components/ui/card';
import { Comanda } from '@/types';

interface StatisticsProps {
  comandas: Comanda[];
}

export function Statistics({ comandas }: StatisticsProps) {
  const totals = comandas.reduce(
    (acc, comanda) => {
      const valor = comanda.total || 0;
      acc.total += valor;
      if (comanda.pago) acc.confirmados += valor;
      else acc.naoConfirmados += valor;
      return acc;
    },
    { confirmados: 0, naoConfirmados: 0, total: 0 }
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-medium text-green-800">Confirmados</p>
          <p className="text-lg font-bold text-green-900">
            R$ {totals.confirmados.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-medium text-red-800">Não Confirmados</p>
          <p className="text-lg font-bold text-red-900">
            R$ {totals.naoConfirmados.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-medium text-gray-600">Total</p>
          <p className="text-lg font-bold text-gray-900">
            R$ {totals.total.toFixed(2)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
