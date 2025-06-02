import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type { Profile } from '../types/database';
import * as XLSX from 'xlsx';
import { motion } from 'framer-motion';
import { PageContainer } from '../components/layouts/PageContainer';
import { Section } from '../components/layouts/Section';
import { ProductForm } from '../components/products/ProductForm';
import { ProductActions } from '../components/products/ProductActions';
import { ProductEditModal } from '../components/products/ProductEditModal';
import { ProductCategorySection } from '../components/products/ProductCategorySection';
import { CategoryControls } from '../components/products/CategoryControls';
import { useProductsByCategory } from '../hooks/useProductsByCategory';

interface Product {
  id: string;
  nome: string;
  valor: number;
  categoria?: string | null;
}

export function Products() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [productName, setProductName] = useState('');
  const [productValue, setProductValue] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const {
    products,
    productsByCategory,
    categories,
    loading,
    expandedCategories,
    toggleCategory,
    expandAllCategories,
    collapseAllCategories,
    fetchAllProducts,
    updateProductInList,
    removeProductFromList,
    addProductToList,
  } = useProductsByCategory();

  useEffect(() => {
    getProfile();
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

  const exportProducts = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Usuário não autenticado');
        return;
      }

      if (products.length === 0) {
        toast.error('Nenhum produto encontrado para exportar');
        return;
      }

      const productsToExport = products.map(p => ({
        nome: p.nome,
        valor: p.valor,
        categoria: p.categoria || 'Sem categoria'
      }));

      const ws = XLSX.utils.json_to_sheet(productsToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Produtos');
      XLSX.writeFile(wb, `produtos_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success(`Todos os ${products.length} produtos exportados com sucesso!`);
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
      if (data && data[0]) {
        addProductToList(data[0]);
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
      removeProductFromList(id);
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
      fetchAllProducts();
    } catch (error) {
      console.error('Erro ao excluir todos os produtos:', error);
      toast.error('Erro ao excluir produtos');
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (product: Product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleModalSave = async (updatedProduct: Product) => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('produtos')
        .update({
          nome: updatedProduct.nome,
          valor: updatedProduct.valor,
          categoria: updatedProduct.categoria
        })
        .eq('id', updatedProduct.id);

      if (error) throw error;

      toast.success('Produto atualizado com sucesso!');
      updateProductInList(updatedProduct);
      setShowEditModal(false);
      setEditingProduct(null);
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
        fetchAllProducts();
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

  const uniqueCategories = Array.from(new Set(products.map(p => p.categoria).filter(Boolean))).sort();

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
          <div className="lg:col-span-2">
            <Section>
              <ProductForm
                productName={productName}
                productValue={productValue}
                productCategory={productCategory}
                saving={saving}
                editingProduct={null}
                onProductNameChange={setProductName}
                onProductValueChange={setProductValue}
                onProductCategoryChange={setProductCategory}
                onSubmit={addProduct}
                onDeleteAll={deleteAllProducts}
                productsCount={products.length}
              />
            </Section>
          </div>

          <div>
            <Section>
              <ProductActions
                onExport={exportProducts}
                onFileUpload={handleFileUpload}
                saving={saving}
                uploadedFile={uploadedFile}
              />
            </Section>
          </div>
        </div>

        <Section className="mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
            <h2 className="text-xl font-semibold text-foreground">Produtos por Categoria</h2>
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring focus:border-ring transition-all"
                placeholder="Buscar produto..."
              />
            </div>
          </div>

          <CategoryControls
            totalCategories={categories.length}
            expandedCount={expandedCategories.size}
            onExpandAll={expandAllCategories}
            onCollapseAll={collapseAllCategories}
          />

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-b-3 border-primary"></div>
            </div>
          ) : categories.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-muted/50 p-8 rounded-lg text-center"
            >
              <p className="text-muted-foreground text-lg font-medium">
                Nenhum produto encontrado.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {categories.map(category => (
                <ProductCategorySection
                  key={category}
                  categoryName={category}
                  products={productsByCategory[category]}
                  searchTerm={searchTerm}
                  editingProduct={editingProduct}
                  onEdit={startEditing}
                  onDelete={deleteProduct}
                  isExpanded={expandedCategories.has(category)}
                  onToggle={() => toggleCategory(category)}
                />
              ))}
            </div>
          )}
        </Section>

        <ProductEditModal
          product={editingProduct}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingProduct(null);
          }}
          onSave={handleModalSave}
          saving={saving}
        />
      </div>
    </PageContainer>
  );
}
