
import { useState, useEffect } from 'react';
import { PlusCircle, Save, Trash2, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface Product {
  id: string;
  nome: string;
  valor: number;
  created_at: string;
}

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newProduct, setNewProduct] = useState({ nome: '', valor: '' });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter(product =>
      product.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      // Verificar se o usuário está autenticado
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Você precisa estar logado para ver os produtos');
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('user_id', session.user.id)
        .order('nome');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar produtos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!newProduct.nome || !newProduct.valor) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    setSaving(true);
    try {
      // Verificar se o usuário está autenticado
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Você precisa estar logado para adicionar produtos');
        setSaving(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('produtos')
        .insert([{
          user_id: session.user.id,
          nome: newProduct.nome,
          valor: parseFloat(newProduct.valor)
        }])
        .select();

      if (error) throw error;

      setProducts(prev => [...prev, data[0]]);
      setNewProduct({ nome: '', valor: '' });
      toast.success('Produto salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error('Erro ao salvar produto. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProducts(prev => prev.filter(product => product.id !== id));
      toast.success('Produto excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast.error('Erro ao excluir produto. Tente novamente.');
    }
  };

  const handleAddFromSearch = (product: Product) => {
    setNewProduct({ nome: product.nome, valor: product.valor.toString() });
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Gerenciamento de Produtos</h1>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {searchTerm && (
                <div className="absolute bg-white border rounded-lg mt-1 w-full z-10 shadow-lg max-h-60 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleAddFromSearch(product)}
                    >
                      {product.nome}
                    </div>
                  ))}
                  {filteredProducts.length === 0 && (
                    <div className="p-2 text-gray-500">Nenhum produto encontrado</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Add New Product Form */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Adicionar Novo Produto</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Nome do produto"
                value={newProduct.nome}
                onChange={(e) => setNewProduct(prev => ({ ...prev, nome: e.target.value }))}
                className="flex-1 p-2 border rounded"
              />
              <input
                type="number"
                placeholder="Preço"
                value={newProduct.valor}
                onChange={(e) => setNewProduct(prev => ({ ...prev, valor: e.target.value }))}
                className="w-full sm:w-32 p-2 border rounded"
                step="0.01"
                min="0"
              />
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save size={20} />
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>

          {/* Products List */}
          {loading ? (
            <div className="text-center py-4">Carregando...</div>
          ) : (
            <div className="space-y-2">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 bg-white border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{product.nome}</h3>
                    <p className="text-gray-600">R$ {product.valor.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
              {filteredProducts.length === 0 && !loading && (
                <p className="text-center text-gray-500 py-4">
                  {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto adicionado ainda'}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
