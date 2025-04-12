import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Comanda, Produto } from '../types/database';
import { imprimirComanda } from '../utils/printService';
import { toast } from 'sonner';

export const useComandaForm = (carregarComandas: () => Promise<void>, setSalvando: (value: boolean) => void) => {
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
  const [nomeProduto, setNomeProduto] = useState('');
  const [valorProduto, setValorProduto] = useState('');
  const [quantidadeProduto, setQuantidadeProduto] = useState('1');
  const [showTrocoModal, setShowTrocoModal] = useState(false);
  const [needsTroco, setNeedsTroco] = useState<boolean | null>(null);
  const [quantiapagaInput, setquantiapagaInput] = useState('');
  const [produtosCadastrados, setProdutosCadastrados] = useState<{id: string, nome: string, valor: number}[]>([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState<{id: string, nome: string, valor: number}[]>([]);
  const [pesquisaProduto, setPesquisaProduto] = useState('');

  useEffect(() => {
    carregarProdutosCadastrados();
  }, []);

  useEffect(() => {
    const subtotal = comanda.produtos.reduce((acc, produto) => acc + (produto.valor * produto.quantidade), 0);
    setComanda(prev => ({ ...prev, total: subtotal }));
  }, [comanda.produtos]);

  useEffect(() => {
    if (pesquisaProduto.trim() === '') {
      setProdutosFiltrados([]);
    } else {
      const filtrados = produtosCadastrados.filter(produto => 
        produto.nome.toLowerCase().includes(pesquisaProduto.toLowerCase())
      );
      setProdutosFiltrados(filtrados);
    }
  }, [pesquisaProduto, produtosCadastrados]);

  const carregarProdutosCadastrados = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return;
      }

      const { data, error } = await supabase
        .from('produtos')
        .select('id, nome, valor')
        .eq('user_id', session.user.id)
        .order('nome');

      if (error) throw error;
      setProdutosCadastrados(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos cadastrados:', error);
    }
  };

  const totalComTaxa = comanda.total + comanda.taxaentrega;

  const handleBairroChange = (bairro: string) => {
    const taxaentrega = bairro === 'Jardim Paraíso' ? 6 : 9;
    setComanda(prev => ({
      ...prev,
      bairro,
      taxaentrega,
    }));
  };

  const selecionarProdutoCadastrado = (produto: {id: string, nome: string, valor: number}) => {
    setNomeProduto(produto.nome);
    setValorProduto(produto.valor.toString());
    setPesquisaProduto('');
    setProdutosFiltrados([]);
  };

  const adicionarProduto = () => {
    if (!nomeProduto || !valorProduto || !quantidadeProduto) {
      toast.error('Preencha todos os campos do produto.');
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
    setPesquisaProduto('');
  };

  const removerProduto = (index: number) => {
    setComanda(prev => ({
      ...prev,
      produtos: prev.produtos.filter((_, i) => i !== index),
    }));
  };

  const validarComanda = () => {
    if (!comanda.endereco) {
      toast.error('Por favor, preencha o endereço de entrega');
      return false;
    }
    if (!comanda.bairro) {
      toast.error('Por favor, selecione o bairro');
      return false;
    }
    if (comanda.produtos.length === 0) {
      toast.error('Por favor, adicione pelo menos um produto');
      return false;
    }
    if (!comanda.forma_pagamento) {
      toast.error('Por favor, selecione a forma de pagamento');
      return false;
    }
    if (comanda.forma_pagamento === 'dinheiro') {
      if (needsTroco === null) {
        toast.error('Por favor, confirme se precisa de troco.');
        return false;
      }
      if (needsTroco && (!comanda.quantiapaga || comanda.quantiapaga <= totalComTaxa)) {
        toast.error('Por favor, informe uma quantia válida para calcular o troco (deve ser maior que o total com a taxa).');
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
    } else if (field === 'pesquisaProduto') {
      setPesquisaProduto(value);
    } else if (field === 'endereco' || field === 'pago') {
      setComanda(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleTrocoConfirm = () => {
    if (needsTroco === null) {
      toast.error('Por favor, selecione se precisa de troco.');
      return;
    }
    if (needsTroco) {
      const quantia = parseFloat(quantiapagaInput);
      if (isNaN(quantia) || quantia <= totalComTaxa) {
        toast.error('Por favor, informe uma quantia válida maior que o total da comanda (incluindo a taxa de entrega).');
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Você precisa estar logado para salvar comandas.');
        setSalvando(false);
        return;
      }

      const comandaData: Omit<Comanda, 'id' | 'created_at'> = {
        user_id: session.user.id,
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
      toast.success('Comanda salva com sucesso!');
      await carregarComandas();

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
        toast.error(`Erro ao salvar comanda: ${error.message || 'Tente novamente.'}`);
      } else {
        toast.error('Erro ao salvar comanda: Tente novamente.');
      }
    } finally {
      setSalvando(false);
    }
  };

  return {
    comanda,
    nomeProduto,
    valorProduto,
    quantidadeProduto,
    pesquisaProduto,
    produtosFiltrados,
    showTrocoModal,
    needsTroco,
    quantiapagaInput,
    totalComTaxa,
    handleBairroChange,
    adicionarProduto,
    removerProduto,
    handleFormaPagamentoChange,
    handleChange,
    handleTrocoConfirm,
    closeTrocoModal,
    salvarComanda,
    selecionarProdutoCadastrado
  };
};
