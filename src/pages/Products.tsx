
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type { Profile } from '../types/database';
import * as XLSX from 'xlsx';
import { motion } from 'framer-motion';
import { PageContainer } from '../components/layouts/PageContainer';
import { ThemedSection } from '../components/ui/theme-provider';
import { ProductForm } from '../components/products/ProductForm';
import { ProductFilters } from '../components/products/ProductFilters';
import { ProductList } from '../components/products/ProductList';
import { ProductActions } from '../components/products/ProductActions';

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

  useEffect(() => {
    fetchProducts(1, true);
  }, [selectedCategory]);

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

  const loadMoreProducts = () => {
    if (hasMore && !loading) {
      fetchProducts(page + 1);
    }
  };

  const exportProducts = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Usuário não autenticado');
        return;
      }

      let allProducts: { nome: string; valor: number; categoria: string | null; numero: number }[] = [];
      let currentPage = 0;
      const exportPageSize = 3000;

      while (true) {
        const { data, error } = await supabase
          .from('produtos')
          .select('nome, valor, categoria, numero')
          .eq('user_id', session.user.id)
          .order('nome')
          .range(currentPage * exportPageSize, (currentPage + 1) * exportPageSize - 1);

        if (error) throw error;

        if (!data || data.length === 0) break;

        allProducts = [...allProducts, ...data];
        currentPage++;
      }

      if (allProducts.length === 0) {
        toast.error('Nenhum produto encontrado para exportar');
        return;
      }

      const ws = XLSX.utils.json_to_sheet(allProducts);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Produtos');
      XLSX.writeFile(wb, `produtos_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success(`Todos os ${allProducts.length} produtos exportados com sucesso!`);
    } catch (error) {
      console.error('Erro ao exportar produtos:', error);
      toast.error('Erro ao exportar produtos. Verifique o console para mais detalhes.');
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

      const { data: maxNumberData, error: maxNumberError } = await supabase
        .from('produtos')
        .select('numero')
        .eq('user_id', session.user.id)
        .order('numero', { ascending: false })
        .limit(1);

      if (maxNumberError) throw maxNumberError;

      const nextNumber = maxNumberData && maxNumberData[0]?.numero 
        ? maxNumberData[0].numero + 1 
        : 1;

      const newProduct = {
        nome: productName,
        valor: parseFloat(parsedValue.toFixed(2)),
        categoria: productCategory || null,
        user_id: session.user.id,
        numero: nextNumber,
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

        const { data: maxNumberData, error: maxNumberError } = await supabase
          .from('produtos')
          .select('numero')
          .eq('user_id', session.user.id)
          .order('numero', { ascending: false })
          .limit(1);

        if (maxNumberError) throw maxNumberError;

        let nextNumber = maxNumberData && maxNumberData[0]?.numero 
          ? maxNumberData[0].numero + 1 
          : 1;

        const productsToUpsert = uniqueProducts.map(product => {
          const productWithNumber = {
            nome: product.nome,
            valor: product.valor,
            categoria: product.categoria,
            user_id: session.user.id,
            numero: nextNumber,
          };
          nextNumber++;
          return productWithNumber;
        });

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
    <PageContainer>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-extrabold text-foreground text-center sm:text-left">
            Gerenciamento de Produtos
          </h1>
          <p className="mt-2 text-muted-foreground text-center sm:text-left">
            Adicione, edite e organize seus produtos com facilidade
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Column */}
          <div className="lg:col-span-2">
            <ThemedSection>
              <ProductForm
                productName={productName}
                productValue={productValue}
                productCategory={productCategory}
                saving={saving}
                editingProduct={editingProduct}
                onProductNameChange={setProductName}
                onProductValueChange={setProductValue}
                onProductCategoryChange={setProductCategory}
                onSubmit={editingProduct ? saveEdit : addProduct}
                onCancel={editingProduct ? cancelEditing : undefined}
                onDeleteAll={deleteAllProducts}
                productsCount={products.length}
              />
            </ThemedSection>
          </div>

          {/* Actions Column */}
          <div>
            <ThemedSection>
              <ProductActions
                onExport={exportProducts}
                onFileUpload={handleFileUpload}
                saving={saving}
                uploadedFile={uploadedFile}
              />
            </ThemedSection>
          </div>
        </div>

        <ThemedSection className="mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold text-foreground">Produtos Cadastrados</h2>
            <ProductFilters
              selectedCategory={selectedCategory}
              searchTerm={editSearchTerm}
              categories={categories}
              onCategoryChange={setSelectedCategory}
              onSearchChange={setEditSearchTerm}
            />
          </div>

          <ProductList
            products={filteredProducts}
            loading={loading}
            hasMore={hasMore}
            editingProduct={editingProduct}
            onEdit={startEditing}
            onDelete={deleteProduct}
            onLoadMore={loadMoreProducts}
          />
        </ThemedSection>
      </div>
    </PageContainer>
  );
}
