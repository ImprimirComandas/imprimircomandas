
import { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface CadastroProdutoFormProps {
  onSaveProduto: (nome: string, valor: string) => Promise<void>;
  onEditProduto: (id: string, nome: string, valor: string) => Promise<void>;
  editingProduct: { id: string; nome: string; valor: number } | null;
  setEditingProduct: (product: { id: string; nome: string; valor: number } | null) => void;
}

const CadastroProdutoForm = ({ 
  onSaveProduto, 
  onEditProduto, 
  editingProduct, 
  setEditingProduct 
}: CadastroProdutoFormProps) => {
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setNome(editingProduct.nome);
      setValor(editingProduct.valor.toString());
    } else {
      setNome('');
      setValor('');
    }
  }, [editingProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !valor) {
      toast.error('Preencha o nome e o valor do produto.');
      return;
    }
    const valorNum = Number(valor);
    if (isNaN(valorNum) || valorNum <= 0) {
      toast.error('O valor deve ser um número válido maior que zero.');
      return;
    }
    setSalvando(true);
    try {
      if (editingProduct) {
        await onEditProduto(editingProduct.id, nome, valor);
        toast.success('Produto atualizado com sucesso!');
      } else {
        await onSaveProduto(nome, valor);
        toast.success('Produto cadastrado com sucesso!');
      }
      setNome('');
      setValor('');
      setEditingProduct(null);
    } catch (error) {
      toast.error('Erro ao salvar produto.');
    } finally {
      setSalvando(false);
    }
  };

  const cancelEditing = () => {
    setEditingProduct(null);
    setNome('');
    setValor('');
  };

  return (
    <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
      <h2 className="text-lg font-semibold mb-4 text-blue-800">
        {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nomeProdutoCadastro" className="block text-sm font-medium text-gray-700">
            Nome do Produto
          </label>
          <input
            id="nomeProdutoCadastro"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Água Mineral 500ml"
            className="w-full p-2 border rounded text-sm"
          />
        </div>
        <div>
          <label htmlFor="valorProdutoCadastro" className="block text-sm font-medium text-gray-700">
            Valor (R$)
          </label>
          <input
            id="valorProdutoCadastro"
            type="number"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="0.00"
            className="w-full p-2 border rounded text-sm"
            step="0.01"
            min="0"
          />
        </div>
        <div className="flex justify-end space-x-3">
          {editingProduct && (
            <button
              type="button"
              onClick={cancelEditing}
              disabled={salvando}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={salvando}
            className={`inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 ${
              salvando ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Save className="h-4 w-4 mr-2" />
            {salvando ? 'Salvando...' : editingProduct ? 'Salvar Edição' : 'Cadastrar Produto'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CadastroProdutoForm;
