import { useState, useEffect } from 'react';
import { PlusCircle, Save, Trash2, Search, Edit, X, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type { Profile } from '../types/database';
import * as XLSX from 'xlsx';

interface Product {
  id: string;
  nome: string;
  valor: number;
  categoria?: string | null;
}

export function Products() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [loading, setLoading] = useState(false);
  const [productName, setProductName] = useState('');
  const [productValue, setProductValue] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [editSearchTerm, setEditSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 20;

  useEffect(() => {
    getProfile();
    fetchCategories();
    fetchProducts(1, true);
  }, []);

  const getProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (error) throw error;
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data, error } = await supabase
          .from('produtos')
          .select('categoria')
          .eq('user_id', session.user.id)
          .not('categoria', 'is', null);
        
        if (error) throw error;
        
        const uniqueCategories = [...new Set(data?.map(item => item.categoria))] as string[];
        setCategories(uniqueCategories.sort());
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Erro ao carregar categorias');
    }
  };

  const fetchProducts = async (pageNumber: number, reset: boolean = false) => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        let query = supabase
          .from('produtos')
          .select('id, nome, valor, categoria')
          .eq('user_id', session.user.id)
          .order('nome')
          .range((pageNumber - 1) * pageSize, pageNumber * pageSize - 1);
        
        if (selectedCategory !== 'Todas') {
          query = query.eq('categoria', selectedCategory);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        setProducts(prev => reset ? (data || []) : [...prev, ...(data || [])]);
        setHasMore((data || []).length === pageSize);
        setPage(pageNumber);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1, true);
  }, [selectedCategory]);

  const loadMoreProducts = () => {
    if (hasMore && !loading) {
      fetchProducts(page + 1);
    }
  };

  const addProduct = async () => {
    if (!productName || !productValue) {
      toast.error('Por favor, preencha o nome e o valor do produto');
      return;
    }

    const parsedValue = parseFloat(productValue);
    if (isNaN(parsedValue) || parsedValue <= 0 || parsedValue > 9999999999.99) {
      toast.error('O valor do produto deve ser um número positivo até R$9.999.999.999,99');
      return;
    }

    try {
      setSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Usuário não autenticado');
        return;
      }

      const newProduct = {
        nome: productName,
        valor: parseFloat(parsedValue.toFixed(2)),
        categoria: productCategory || null,
        user_id: session.user.id
      };

      const { data, error } = await supabase
        .from('produtos')
        .upsert([newProduct], { onConflict: 'nome,user_id' })
        .select();

      if (error) throw error;
      
      toast.success('Produto adicionado/atualizado com sucesso!');
      setProducts(prev => {
        const updated = prev.filter(p => p.nome !== productName);
        return [...(data || []), ...updated].sort((a, b) => a.nome.localeCompare(b.nome));
      });
      if (productCategory && !categories.includes(productCategory)) {
        setCategories(prev => [...prev, productCategory].sort());
      }
      setProductName('');
      setProductValue('');
      setProductCategory('');
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error(`Erro ao adicionar produto: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Produto excluído com sucesso!');
      setProducts(prev => prev.filter(p => p.id !== id));
      // Atualizar categorias se necessário
      fetchCategories();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Erro ao excluir produto');
    }
  };

  const deleteAllProducts = async () => {
    if (!confirm('Tem certeza que deseja apagar TODOS os produtos? Esta ação não pode ser desfeita.')) return;
    if (prompt('Digite "CONFIRMAR" para prosseguir com a exclusão de todos os produtos.') !== 'CONFIRMAR') {
      toast.error('Confirmação incorreta. Exclusão cancelada.');
      return;
    }

    try {
      setSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Usuário não autenticado');
        return;
      }

      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('user_id', session.user.id);

      if (error) throw error;
      
      toast.success('Todos os produtos foram excluídos com sucesso!');
      setProducts([]);
      setCategories([]);
      setSelectedCategory('Todas');
      setPage(1);
      setHasMore(false);
    } catch (error) {
      console.error('Error deleting all products:', error);
      toast.error('Erro ao excluir produtos');
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (product: Product) => {
    setEditingProduct(product);
    setProductName(product.nome);
    setProductValue(product.valor.toString());
    setProductCategory(product.categoria || '');
  };

  const cancelEditing = () => {
    setEditingProduct(null);
    setProductName('');
    setProductValue('');
    setProductCategory('');
  };

  const saveEdit = async () => {
    if (!editingProduct || !productName || !productValue) {
      toast.error('Por favor, preencha o nome e o valor do produto');
      return;
    }

    const parsedValue = parseFloat(productValue);
    if (isNaN(parsedValue) || parsedValue <= 0 || parsedValue > 9999999999.99) {
      toast.error('O valor do produto deve ser um número positivo até R$9.999.999.999,99');
      return;
    }

    try {
      setSaving(true);
      
      const updatedProduct = {
        nome: productName,
        valor: parseFloat(parsedValue.toFixed(2)),
        categoria: productCategory || null,
      };

      const { error } = await supabase
        .from('produtos')
        .update(updatedProduct)
        .eq('id', editingProduct.id);

      if (error) throw error;
      
      toast.success('Produto atualizado com sucesso!');
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...updatedProduct } : p).sort((a, b) => a.nome.localeCompare(b.nome)));
      if (productCategory && !categories.includes(productCategory)) {
        setCategories(prev => [...prev, productCategory].sort());
      }
      cancelEditing();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(`Erro ao atualizar produto: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { 
        type: 'array',
        cellText: true,
        cellDates: false,
      });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];

      // Extrair cabeçalhos
      const headers = jsonData[0].map((h: any) => h?.toString().toLowerCase().trim());
      let nameColumn: number | null = null;
      let priceColumn: number | null = null;
      let categoryColumn: number | null = null;

      headers.forEach((header: string, index: number) => {
        if (['nome', 'produto', 'item'].includes(header)) nameColumn = index;
        if (['preço', 'valor', 'preco', 'custo'].includes(header)) priceColumn = index;
        if (['categoria', 'tipo', 'grupo'].includes(header)) categoryColumn = index;
      });

      if (nameColumn === null || priceColumn === null) {
        toast.error('O arquivo deve conter colunas para "nome" (ou "produto", "item") e "preço" (ou "valor", "custo").');
        setUploadedFile(null);
        event.target.value = '';
        return;
      }

      // Extrair e validar produtos
      const extractedProducts: { nome: string; valor: number; categoria: string | null }[] = [];
      const invalidProducts: string[] = [];

      jsonData.slice(1).forEach((row, index) => {
        if (!row[nameColumn] || row[priceColumn] == null) return;

        const nome = row[nameColumn].toString().trim();
        const rawPrice = row[priceColumn].toString().trim();
        let price: number;

        try {
          price = parseFloat(rawPrice.replace(',', '.').replace(/[^0-9.]/g, ''));
          if (isNaN(price) || price <= 0 || price > 9999999999.99) {
            invalidProducts.push(`Linha ${index + 2}: "${nome}" (valor inválido: "${rawPrice}")`);
            return;
          }
          price = parseFloat(price.toFixed(2));
        } catch {
          invalidProducts.push(`Linha ${index + 2}: "${nome}" (valor inválido: "${rawPrice}")`);
          return;
        }

        const categoria = categoryColumn !== null && row[categoryColumn] ? row[categoryColumn].toString().trim() : null;

        extractedProducts.push({ nome, valor: price, categoria });
      });

      if (extractedProducts.length === 0) {
        toast.error(`Nenhum produto válido encontrado. Produtos inválidos:\n${invalidProducts.join('\n')}`);
        setUploadedFile(null);
        event.target.value = '';
        return;
      }

      if (invalidProducts.length > 0) {
        toast.warning(`Alguns produtos foram ignorados devido a valores inválidos:\n${invalidProducts.join('\n')}`);
      }

      // Remover duplicatas, mantendo a última entrada
      const uniqueProductsMap = new Map<string, typeof extractedProducts[0]>();
      extractedProducts.forEach(product => {
        uniqueProductsMap.set(product.nome, product);
      });
      const uniqueProducts = Array.from(uniqueProductsMap.values());
      
      if (uniqueProducts.length < extractedProducts.length) {
        toast.warning(`Foram encontradas ${extractedProducts.length - uniqueProducts.length} entradas duplicadas no arquivo. Apenas a última entrada para cada nome foi mantida.`);
      }

      // Confirmar com o usuário
      const confirmMessage = `Foram encontrados ${uniqueProducts.length} produtos válidos:\n${uniqueProducts.map(p => `- ${p.nome} (${p.categoria || 'Sem categoria'}): R$${p.valor.toFixed(2)}`).join('\n')}\n\nDeseja adicioná-los ao banco de dados? Produtos com nomes iguais serão atualizados.`;
      if (!confirm(confirmMessage)) {
        setUploadedFile(null);
        event.target.value = '';
        return;
      }

      // Adicionar ou atualizar produtos
      try {
        setSaving(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error('Usuário não autenticado');
          return;
        }

        const productsToUpsert = uniqueProducts.map(product => ({
          nome: product.nome,
          valor: product.valor,
          categoria: product.categoria,
          user_id: session.user.id,
        }));

        const { error } = await supabase
          .from('produtos')
          .upsert(productsToUpsert, { onConflict: 'nome,user_id' });

        if (error) throw error;

        toast.success(`${uniqueProducts.length} produtos adicionados/atualizados com sucesso!`);
        fetchProducts(1, true);
        fetchCategories(); // Atualizar categorias após upload
      } catch (error) {
        console.error('Error upserting products:', error);
        toast.error(`Erro ao processar produtos: ${error.message || 'Erro desconhecido'}`);
      } finally {
        setSaving(false);
        setUploadedFile(null);
        event.target.value = '';
      }
    } catch (error) {
      console.error('Error reading file:', error);
      toast.error('Erro ao processar o arquivo. Verifique se é XLS, XLSX ou CSV válido.');
      setUploadedFile(null);
      event.target.value = '';
    }
  };

  // Filtrar produtos para exibição
  const filteredProducts = products
    .filter(product => 
      !editSearchTerm || product.nome.toLowerCase().includes(editSearchTerm.toLowerCase())
    )
    .sort((a, b) => a.nome.localeCompare(b.nome));

  return (
    <div className="min-h-screen bg-gray-100 py-6 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">
              {editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}
            </h2>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label htmlFor="product-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Produto
                </label>
                <input
                  id="product-name"
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                  placeholder="Ex: Água Mineral 500ml"
                />
              </div>
              
              <div>
                <label htmlFor="product-value" className="block text-sm font-medium text-gray-700 mb-1">
                  Valor (R$)
                </label>
                <input
                  id="product-value"
                  type="number"
                  value={productValue}
                  onChange={(e) => setProductValue(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="product-category" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria (opcional)
                </label>
                <input
                  id="product-category"
                  type="text"
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                  placeholder="Ex: Bebidas"
                />
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="product-file" className="block text-sm font-medium text-gray-700 mb-1">
                Importar Produtos de Arquivo (XLS, XLSX ou CSV)
              </label>
              <input
                id="product-file"
                type="file"
                accept=".xls,.xlsx,.csv"
                onChange={handleFileUpload}
                disabled={saving}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {uploadedFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Arquivo selecionado: {uploadedFile.name}
                </p>
              )}
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <button
                type="button"
                onClick={deleteAllProducts}
                disabled={saving || products.length === 0}
                className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Apagar Todos os Produtos
              </button>
              
              <div className="flex space-x-3">
                {editingProduct && (
                  <button
                    type="button"
                    onClick={cancelEditing}
                    disabled={saving}
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={editingProduct ? saveEdit : addProduct}
                  disabled={saving}
                  className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {saving ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Salvando...
                    </span>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingProduct ? 'Salvar Edição' : 'Adicionar Produto'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
              <h2 className="text-lg font-medium">Produtos Cadastrados</h2>
              
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="flex-1 sm:flex-initial">
                  <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <select
                    id="category-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                  >
                    <option value="Todas">Todas</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div className="relative flex-1 sm:flex-initial">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={editSearchTerm}
                    onChange={(e) => setEditSearchTerm(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2"
                    placeholder="Buscar produto..."
                  />
                </div>
              </div>
            </div>
            
            {loading && products.length === 0 ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-gray-50 p-4 rounded-md text-center">
                <p className="text-gray-500">Nenhum produto encontrado.</p>
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nome
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Categoria
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valor
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredProducts.map(product => (
                        <tr key={product.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {product.nome}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.categoria || 'Sem categoria'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            R$ {product.valor.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => startEditing(product)}
                                className="text-blue-600 hover:text-blue-900"
                                disabled={editingProduct !== null}
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => deleteProduct(product.id)}
                                className="text-red-600 hover:text-red-900"
                                disabled={editingProduct !== null}
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {hasMore && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={loadMoreProducts}
                      disabled={loading}
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Carregando...
                        </span>
                      ) : (
                        'Carregar Mais'
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}