
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { supabase } from "../lib/supabase";
import { useToast } from "../hooks/use-toast";
import { Comanda } from "../types/database";

const Products = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para ver produtos",
          variant: "destructive",
        });
        return;
      }

      // Get unique products from all comandas
      const { data: comandas, error } = await supabase
        .from('comandas')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // Extract unique products from all comandas
      const allProducts: Record<string, { nome: string, valor: number, count: number }> = {};
      
      if (comandas) {
        comandas.forEach((comanda: Comanda) => {
          comanda.produtos.forEach(produto => {
            if (allProducts[produto.nome]) {
              allProducts[produto.nome].count += produto.quantidade;
            } else {
              allProducts[produto.nome] = { 
                nome: produto.nome, 
                valor: produto.valor,
                count: produto.quantidade 
              };
            }
          });
        });
      }

      setProducts(Object.values(allProducts));
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os produtos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Produtos</h1>
      
      <div className="flex justify-between mb-4">
        <span className="text-gray-600">
          {products.length} produtos encontrados
        </span>
        <Button variant="outline">Adicionar Produto</Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {products.length === 0 ? (
            <p className="text-gray-500 col-span-3 text-center">Nenhum produto encontrado</p>
          ) : (
            products.map((product, index) => (
              <div key={index} className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-medium">{product.nome}</h3>
                <p className="text-sm text-gray-500">Preço: R$ {product.valor.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Vendidos: {product.count}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Products;
