
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Comanda, Profile, Produto } from '../types/database';
import Header from './Header';
import ComandaForm from './ComandaForm';
import TrocoModal from './TrocoModal';
import TotaisPorFormaPagamento from './TotaisPorFormaPagamento';
import ComandasAnteriores from './ComandasAnteriores';
import { imprimirComanda, getUltimos8Digitos } from '../utils/printService';

interface DeliveryAppProps {
  profile: Profile | null;
}

export default function DeliveryApp({ profile }: DeliveryAppProps) {
  const [comanda, setComanda] = useState<Comanda>({
    produtos: [],
    total: 0,
    forma_pagamento: '',
    data: new Date().toISOString(),
    endereco: '',
    bairro: 'Jardim Paraíso',
    taxaentrega: 6,
    pago: false,
    quantiapaga: 0,
    troco: 0,
  });

  const [comandasAnteriores, setComandasAnteriores] = useState<Comanda[]>([]);
  const [nomeProduto, setNomeProduto] = useState('');
  const [valorProduto, setValorProduto] = useState('');
  const [quantidadeProduto, setQuantidadeProduto] = useState('1');
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [expandedComandas, setExpandedComandas] = useState<{ [key: string]: boolean }>({});
  const [showTrocoModal, setShowTrocoModal] = useState(false);
  const [needsTroco, setNeedsTroco] = useState<boolean | null>(null);
  const [quantiapagaInput, setquantiapagaInput] = useState('');

  useEffect(() => {
    const subtotal = comanda.produtos.reduce((acc, produto) => acc + (produto.valor * produto.quantidade), 0);
    setComanda(prev => ({ ...prev, total: subtotal }));
  }, [comanda.produtos]);

  const handleBairroChange = (bairro: string) => {
    const taxaentrega = bairro === 'Jardim Paraíso' ? 6 : 9;
    setComanda(prev => ({
      ...prev,
      bairro,
      taxaentrega,
    }));
  };

  const totalComTaxa = comanda.total + comanda.taxaentrega;

  useEffect(() => {
    carregarComandas();
  }, []);

  const carregarComandas = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não está autenticado. Faça login para carregar comandas.');
      }

      const { data, error } = await supabase
        .from('comandas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Erro ao carregar comandas do Supabase:', error);
        throw error;
      }

      console.log('Comandas carregadas:', data);
      setComandasAnteriores(data || []);
    } catch (error) {
      console.error('Erro ao carregar comandas:', error);
      alert('Erro ao carregar comandas anteriores. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const adicionarProduto = () => {
    if (!nomeProduto || !valorProduto || !quantidadeProduto) {
      alert('Preencha todos os campos do produto.');
      return;
    }

    const novoProduto: Produto = {
      nome: nomeProduto,
      valor: parseFloat(valorProduto),
      quantidade: parseInt(quantidadeProduto),
    };

    setComanda(prev => ({
      ...prev,
      produtos: [...prev.produtos, novoProduto],
    }));

    setNomeProduto('');
    setValorProduto('');
    setQuantidadeProduto('1');
  };

  const removerProduto = (index: number) => {
    setComanda(prev => ({
      ...prev,
      produtos: prev.produtos.filter((_, i) => i !== index),
    }));
  };

  const validarComanda = () => {
    if (!comanda.endereco) {
      alert('Por favor, preencha o endereço de entrega');
      return false;
    }
    if (!comanda.bairro) {
      alert('Por favor, selecione o bairro');
      return false;
    }
    if (comanda.produtos.length === 0) {
      alert('Por favor, adicione pelo menos um produto');
      return false;
    }
    if (!comanda.forma_pagamento) {
      alert('Por favor, selecione a forma de pagamento');
      return false;
    }
    if (comanda.forma_pagamento === 'dinheiro') {
      if (needsTroco === null) {
        alert('Por favor, confirme se precisa de troco.');
        return false;
      }
      if (needsTroco && (!comanda.quantiapaga || comanda.quantiapaga <= totalComTaxa)) {
        alert('Por favor, informe uma quantia válida para calcular o troco (deve ser maior que o total com a taxa).');
        return false;
      }
    }
    return true;
  };

  const handleFormaPagamentoChange = (forma: 'pix' | 'dinheiro' | 'cartao' | '') => {
    setComanda(prev => ({
      ...prev,
      forma_pagamento: forma,
      quantiapaga: 0,
      troco: 0,
    }));
    setNeedsTroco(null);
    setquantiapagaInput('');
    if (forma === 'dinheiro') {
      setShowTrocoModal(true);
    } else {
      setShowTrocoModal(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    if (field === 'nomeProduto') {
      setNomeProduto(value);
    } else if (field === 'valorProduto') {
      setValorProduto(value);
    } else if (field === 'quantidadeProduto') {
      setQuantidadeProduto(value);
    } else if (field === 'needsTroco') {
      setNeedsTroco(value);
    } else if (field === 'quantiapagaInput') {
      setquantiapagaInput(value);
    } else if (field === 'endereco' || field === 'pago') {
      setComanda(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleTrocoConfirm = () => {
    if (needsTroco === null) {
      alert('Por favor, selecione se precisa de troco.');
      return;
    }
    if (needsTroco) {
      const quantia = parseFloat(quantiapagaInput);
      if (isNaN(quantia) || quantia <= totalComTaxa) {
        alert('Por favor, informe uma quantia válida maior que o total da comanda (incluindo a taxa de entrega).');
        return;
      }
      const trocoCalculado = quantia - totalComTaxa;
      setComanda(prev => ({
        ...prev,
        quantiapaga: quantia,
        troco: trocoCalculado,
      }));
    } else {
      setComanda(prev => ({
        ...prev,
        quantiapaga: 0,
        troco: 0,
      }));
    }
    setShowTrocoModal(false);
  };

  const closeTrocoModal = () => {
    setShowTrocoModal(false);
    setNeedsTroco(null);
    setquantiapagaInput('');
    setComanda(prev => ({ ...prev, forma_pagamento: '', quantiapaga: 0, troco: 0 }));
  };

  const salvarComanda = async () => {
    if (!validarComanda()) return;

    setSalvando(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não está autenticado. Faça login para salvar comandas.');
      }

      const comandaData: Omit<Comanda, 'id' | 'created_at'> = {
        user_id: user.id,
        produtos: comanda.produtos,
        total: totalComTaxa,
        forma_pagamento: comanda.forma_pagamento,
        data: comanda.data,
        endereco: comanda.endereco,
        bairro: comanda.bairro,
        taxaentrega: comanda.taxaentrega,
        pago: comanda.pago,
      };

      if (comanda.forma_pagamento === 'dinheiro' && needsTroco && comanda.quantiapaga && comanda.troco) {
        comandaData.quantiapaga = comanda.quantiapaga;
        comandaData.troco = comanda.troco;
      } else {
        comandaData.quantiapaga = undefined;
        comandaData.troco = undefined;
      }

      console.log('Dados a serem salvos no Supabase:', comandaData);

      const { data, error } = await supabase
        .from('comandas')
        .insert([comandaData])
        .select();

      if (error) {
        console.error('Erro ao salvar no Supabase:', error);
        throw new Error(error.message || 'Erro ao salvar no banco de dados');
      }

      console.log('Comanda salva com sucesso:', data);
      await carregarComandas();
      setExpandedComandas({});

      const comandaParaImprimir = { ...comandaData, id: data[0].id };
      imprimirComanda(comandaParaImprimir);

      setComanda({
        produtos: [],
        total: 0,
        forma_pagamento: '',
        data: new Date().toISOString(),
        endereco: '',
        bairro: 'Jardim Paraíso',
        taxaentrega: 6,
        pago: false,
        quantiapaga: 0,
        troco: 0,
      });
      setNomeProduto('');
      setValorProduto('');
      setQuantidadeProduto('1');
      setNeedsTroco(null);
      setquantiapagaInput('');
    } catch (error: unknown) {
      console.error('Erro ao salvar comanda:', error);
      if (error instanceof Error) {
        alert(`Erro ao salvar comanda: ${error.message || 'Tente novamente.'}`);
      } else {
        alert('Erro ao salvar comanda: Tente novamente.');
      }
    } finally {
      setSalvando(false);
    }
  };

  const reimprimirComanda = (comandaAntiga: Comanda) => {
    imprimirComanda(comandaAntiga);
  };

  const excluirComanda = async (id: string | undefined) => {
    if (!id) return;
    if (!confirm('Tem certeza que deseja excluir este pedido?')) return;

    try {
      const { error } = await supabase
        .from('comandas')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir comanda:', error);
        throw error;
      }

      await carregarComandas();
      setExpandedComandas(prev => {
        const newExpanded = { ...prev };
        delete newExpanded[id];
        return newExpanded;
      });
    } catch (error) {
      console.error('Erro ao excluir comanda:', error);
      alert('Erro ao excluir o pedido. Tente novamente.');
    }
  };

  const toggleExpandComanda = (id: string) => {
    setExpandedComandas(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const calcularTotaisPorFormaPagamento = () => {
    const totais = {
      pix: 0,
      dinheiro: 0,
      cartao: 0,
      geral: 0,
    };

    comandasAnteriores.forEach(comanda => {
      totais.geral += comanda.total;
      if (comanda.forma_pagamento === 'pix') {
        totais.pix += comanda.total;
      } else if (comanda.forma_pagamento === 'dinheiro') {
        totais.dinheiro += comanda.total;
      } else if (comanda.forma_pagamento === 'cartao') {
        totais.cartao += comanda.total;
      }
    });

    return totais;
  };

  const totais = calcularTotaisPorFormaPagamento();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro ao fazer logout:', error);
        throw error;
      }
      console.log('Usuário deslogado com sucesso');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      alert('Erro ao fazer logout. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header profile={profile} onSignOut={handleSignOut} />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Formulário de Comanda */}
          <ComandaForm
            comanda={comanda}
            nomeProduto={nomeProduto}
            valorProduto={valorProduto}
            quantidadeProduto={quantidadeProduto}
            salvando={salvando}
            totalComTaxa={totalComTaxa}
            onAddProduto={adicionarProduto}
            onRemoveProduto={removerProduto}
            onSaveComanda={salvarComanda}
            onChange={handleChange}
            onBairroChange={handleBairroChange}
            onFormaPagamentoChange={handleFormaPagamentoChange}
          />

          {/* Modal de Troco */}
          <TrocoModal
            show={showTrocoModal}
            needsTroco={needsTroco}
            quantiapagaInput={quantiapagaInput}
            totalComTaxa={totalComTaxa}
            onClose={closeTrocoModal}
            onConfirm={handleTrocoConfirm}
            onChange={handleChange}
          />

          {/* Totais por Forma de Pagamento */}
          <TotaisPorFormaPagamento totais={totais} />

          {/* Comandas Anteriores */}
          <ComandasAnteriores
            comandas={comandasAnteriores}
            expandedComandas={expandedComandas}
            carregando={carregando}
            onReimprimir={reimprimirComanda}
            onExcluir={excluirComanda}
            onToggleExpand={toggleExpandComanda}
            getUltimos8Digitos={getUltimos8Digitos}
          />
        </div>
      </main>
    </div>
  );
}
