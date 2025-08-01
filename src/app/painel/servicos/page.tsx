// src/app/painel/servicos/page.tsx
'use client'; // << MUITO IMPORTANTE: Indica que este é um componente interativo que roda no navegador

import { useState, useEffect } from 'react';

// Definindo o tipo para um serviço, para usar com TypeScript
type Servico = {
  id: number;
  nome: string;
  duracao_minutos: number;
  preco: number;
};

export default function ServicosPage() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [nomeServico, setNomeServico] = useState('');
  const [duracao, setDuracao] = useState('');
  const [preco, setPreco] = useState('');

  // useEffect para buscar os dados da API quando o componente carregar
  useEffect(() => {
    async function fetchServicos() {
      // Usando o ID 1 do salão como exemplo fixo por enquanto
      const response = await fetch('http://localhost:8080/saloes/1/servicos');
      const data = await response.json();
      setServicos(data);
    }
    fetchServicos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const novoServico = {
        nome: nomeServico,
        duracao_minutos: parseInt(duracao, 10),
        preco: parseFloat(preco)
    };

    const response = await fetch('http://localhost:8080/saloes/1/servicos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(novoServico)
    });

    if (response.ok) {
        const servicoCriado = await response.json();
        setServicos([...servicos, servicoCriado]); // Adiciona o novo serviço à lista
        // Limpar o formulário
        setNomeServico('');
        setDuracao('');
        setPreco('');
    } else {
        alert("Erro ao criar serviço");
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h1 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Gerenciar Serviços</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        <div>
            <h2 style={{fontWeight: 500}}>Serviços Atuais</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {servicos.map((servico) => (
                <li key={servico.id} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
                  <strong>{servico.nome}</strong>
                  <p style={{margin: '5px 0 0'}}>Duração: {servico.duracao_minutos} min | Preço: R$ {servico.preco.toFixed(2)}</p>
                </li>
              ))}
            </ul>
        </div>

        <div>
            <h2 style={{fontWeight: 500}}>Adicionar Novo Serviço</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input type="text" value={nomeServico} onChange={(e) => setNomeServico(e.target.value)} placeholder="Nome do serviço" required style={{padding: '10px'}}/>
                <input type="number" value={duracao} onChange={(e) => setDuracao(e.target.value)} placeholder="Duração em minutos" required style={{padding: '10px'}}/>
                <input type="text" value={preco} onChange={(e) => setPreco(e.target.value)} placeholder="Preço (ex: 50.00)" required style={{padding: '10px'}}/>
                <button type="submit" style={{padding: '10px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>Adicionar Serviço</button>
            </form>
        </div>
      </div>
    </div>
  );
}