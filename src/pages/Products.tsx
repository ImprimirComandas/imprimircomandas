import { useState, useEffect } from 'react';
import { PlusCircle, Save, Trash2, Search, Edit, X, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type { Profile } from '../types/database';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';

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
      console.error('Erro ao carregar perfil:', error);
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
      console.error('Erro ao carregar categorias:', error);
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
      console.error('Erro ao carregar produtos:', error);
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
        user_id: session.user.id,
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
      console.error('Erro ao adicionar produto:', error);
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
      fetchCategories();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
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
      console.error('Erro ao excluir todos os produtos:', error);
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
      setProducts(prev =>
        prev
          .map(p => (p.id === editingProduct.id ? { ...p, ...updatedProduct } : p))
          .sort((a, b) => a.nome.localeCompare(b.nome))
      );
      if (productCategory && !categories.includes(productCategory)) {
        setCategories(prev => [...prev, productCategory].sort());
      }
      cancelEditing();
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
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
      const jsonData = XLSX.utils.sheet_to_json<string[][]>(firstSheet, { header: 1 });

      const headers = jsonData[0].map((h: unknown) => (typeof h === 'string' ? h.toLowerCase().trim() : ''));
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

      const uniqueProductsMap = new Map<string, typeof extractedProducts[0]>();
      extractedProducts.forEach(product => {
        uniqueProductsMap.set(product.nome, product);
      });
      const uniqueProducts = Array.from(uniqueProductsMap.values());

      if (uniqueProducts.length < extractedProducts.length) {
        toast.warning(`Foram encontradas ${extractedProducts.length - uniqueProducts.length} entradas duplicadas no arquivo. Apenas a última entrada para cada nome foi mantida.`);
      }

      const confirmMessage = `Foram encontrados ${uniqueProducts.length} produtos válidos:\n${uniqueProducts
        .map(p => `- ${p.nome} (${p.categoria || 'Sem categoria'}): R$${p.valor.toFixed(2)}`)
        .join('\n')}\n\nDeseja adicioná-los ao banco de dados? Produtos com nomes iguais serão atualizados.`;
      if (!confirm(confirmMessage)) {
        setUploadedFile(null);
        event.target.value = '';
        return;
      }

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
        fetchCategories();
      } catch (error) {
        console.error('Erro ao processar produtos:', error);
        toast.error(`Erro ao processar produtos: ${error.message || 'Erro desconhecido'}`);
      } finally {
        setSaving(false);
        setUploadedFile(null);
        event.target.value = '';
      }
    } catch (error) {
      console.error('Erro ao ler arquivo:', error);
      toast.error('Erro ao processar o arquivo. Verifique se é XLS, XLSX ou CSV válido.');
      setUploadedFile(null);
      event.target.value = '';
    }
  };

  const filteredProducts = products
    .filter(product =>
      !editSearchTerm || product.nome.toLowerCase().includes(editSearchTerm.toLowerCase())
    )
    .sort((a, b) => a.nome.localeCompare(b.nome));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-extrabold text-gray-900 text-center sm:text-left">
            Gerenciamento de Produtos
          </h1>
          <p className="mt-2 text-gray-600 text-center sm:text-left">
            Adicione, edite e organize seus produtos com facilidade
          </p>
        </motion.div>

        {/* Formulário de Adição/Edição */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="product-name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Produto
              </label>
              <input
                id="product-name"
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="product-category" className="block text-sm font-medium text-gray-700 mb-1">
                Categoria (opcional)
              </label>
              <input
                id="product-category"
                type="text"
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Ex: Bebidas"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="product-file" className="block text-sm font-medium text-gray-700 mb-1">
                Importar Produtos (XLS, XLSX, CSV)
              </label>
              <input
                id="product-file"
                type="file"
                accept=".xls,.xlsx,.csv"
                onChange={handleFileUpload}
                disabled={saving}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              />
              {uploadedFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Arquivo selecionado: {uploadedFile.name}
                </p>
              )}
            </div>
          </div>
          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={deleteAllProducts}
              disabled={saving || products.length === 0}
              className="flex items-center px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Apagar Todos
            </button>
            <div className="flex gap-3">
              {editingProduct && (
                <button
                  onClick={cancelEditing}
                  disabled={saving}
                  className="flex items-center px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors duration-200"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </button>
              )}
              <button
                onClick={editingProduct ? saveEdit : addProduct}
                disabled={saving}
                className="flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {saving ? (
                  <svg
                    className="animate-spin h-4 w-4 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {saving ? 'Salvando...' : editingProduct ? 'Salvar Edição' : 'Adicionar Produto'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Lista de Produtos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-6"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Produtos Cadastrados</h2>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <div className="w-full sm:w-48">
                <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  id="category-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="Todas">Todas</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative w-full sm:w-64">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  value={editSearchTerm}
                  onChange={(e) => setEditSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Buscar produto..."
                />
                {editSearchTerm && (
                  <button
                    onClick={() => setEditSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {loading && products.length === 0 ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-b-3 border-blue-600"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-50 p-8 rounded-lg text-center"
            >
              <p className="text-gray-600 text-lg font-medium">
                Nenhum produto encontrado.
              </p>
            </motion.div>
          ) : (
            <div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoria
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <AnimatePresence>
                      {filteredProducts.map(product => (
                        <motion.tr
                          key={product.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
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
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => startEditing(product)}
                                disabled={editingProduct !== null}
                                className="p-2 rounded-full text-blue-600 hover:bg-blue-100 disabled:text-gray-400 disabled:hover:bg-transparent transition-colors duration-200"
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => deleteProduct(product.id)}
                                disabled={editingProduct !== null}
                                className="p-2 rounded-full text-red-600 hover:bg-red-100 disabled:text-gray-400 disabled:hover:bg-transparent transition-colors duration-200"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
              {hasMore && (
                <div className="mt-6 text-center">
                  <button
                    onClick={loadMoreProducts}
                    disabled={loading}
                    className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin h-4 w-4 mr-2 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
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
        </motion.div>
      </div>
    </div>
  );
}