'use client';

import { useState, useEffect } from 'react';

// Tipos de dados
type Servico = { id: number; nome: string; duracao_minutos: number; preco: number; };
type AgendamentoRequest = { salao_id: number; servico_id: number; cliente_nome: string; cliente_contato: string; data_hora_inicio: string; };

export default function AgendamentoPage({ params }: { params: { salaoId: string } }) {
  // Estado para controlar o fluxo e o feedback
  const [etapa, setEtapa] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Estado para os dados do agendamento
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [servicoSelecionado, setServicoSelecionado] = useState<Servico | null>(null);
  const [dataSelecionada, setDataSelecionada] = useState('');
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [horarioSelecionado, setHorarioSelecionado] = useState('');

  // Estado para o formulário final
  const [nomeCliente, setNomeCliente] = useState('');
  const [contatoCliente, setContatoCliente] = useState('');
  
  const salaoId = parseInt(params.salaoId, 10);

  // Efeito para buscar os serviços do salão
  useEffect(() => {
    async function fetchServicos() {
      try {
        const response = await fetch(`http://localhost:8080/saloes/${salaoId}/servicos`);
        if (!response.ok) throw new Error('Falha ao buscar serviços.');
        const data = await response.json();
        setServicos(data);
      } catch (err) {
        setError('Não foi possível carregar os serviços. Tente recarregar a página.');
      }
    }
    fetchServicos();
  }, [salaoId]);

  const handleSelectServico = (servico: Servico) => {
    setServicoSelecionado(servico);
    setEtapa(2);
    setError(''); 
    setSuccessMessage('');
  };
  
  const handleDateChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const data = event.target.value;
    setDataSelecionada(data);
    setHorariosDisponiveis([]); 
    
    if (data && servicoSelecionado) {
      setIsLoading(true);
      setError('');
      try {
        const response = await fetch(`http://localhost:8080/saloes/${salaoId}/disponibilidade?data=${data}&servicoId=${servicoSelecionado.id}`);
        if (!response.ok) throw new Error('Falha ao buscar horários.');
        const horarios = await response.json();
        setHorariosDisponiveis(horarios);
        setEtapa(3);
      } catch (err) {
        setError('Não foi possível buscar os horários. Tente outra data.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSelectHorario = (horario: string) => {
    setHorarioSelecionado(horario);
    setEtapa(4);
  };

  const handleAgendamentoSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    const dataHoraISO = `${dataSelecionada}T${horarioSelecionado}:00Z`;
    const agendamento: AgendamentoRequest = {
        salao_id: salaoId,
        servico_id: servicoSelecionado!.id,
        cliente_nome: nomeCliente,
        cliente_contato: contatoCliente,
        data_hora_inicio: dataHoraISO,
    };
    
    try {
        const response = await fetch('http://localhost:8080/agendamentos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(agendamento)
        });
        if (!response.ok) throw new Error('Falha ao solicitar agendamento.');
        
        setSuccessMessage('Ótimo! Seu pedido de agendamento foi enviado com sucesso. Você receberá uma confirmação via WhatsApp em breve.');
        setEtapa(5); 

    } catch (err) {
        setError('Ocorreu um erro ao enviar seu pedido. Por favor, tente novamente.');
        setEtapa(4);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h1 style={{ textAlign: 'center', borderBottom: '1px solid #ccc', paddingBottom: '15px' }}>Agendamento Online</h1>
      
      {error && <p style={{color: 'red', background: '#ffebee', padding: '10px', borderRadius: '5px'}}>{error}</p>}
      
      {etapa === 5 ? (
        <div style={{color: 'green', background: '#e8f5e9', padding: '20px', borderRadius: '5px', textAlign: 'center'}}>
            <h2>{successMessage}</h2>
            <button onClick={() => window.location.reload()} style={{marginTop: '20px', padding: '10px 20px'}}>Fazer Novo Agendamento</button>
        </div>
      ) : (
        <>
          {etapa === 1 && (
            <div>
              <h2>Passo 1: Escolha um serviço</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {servicos.map(s => (
                  <button key={s.id} onClick={() => handleSelectServico(s)} style={{ padding: '15px', textAlign: 'left', cursor: 'pointer' }}>
                    {s.nome} (R$ {s.preco.toFixed(2)})
                  </button>
                ))}
              </div>
            </div>
          )}

          {etapa >= 2 && (
            <div style={{ marginTop: '20px' }}>
                <p><strong>Serviço:</strong> {servicoSelecionado?.nome}</p>
                <h2>Passo 2: Escolha uma data</h2>
                <input type="date" value={dataSelecionada} onChange={handleDateChange} style={{ padding: '10px', width: '100%', fontSize: '16px' }} disabled={isLoading} />
            </div>
          )}

          {etapa >= 3 && isLoading && <p style={{marginTop: '10px'}}>Carregando horários...</p>}
          {etapa === 3 && !isLoading && horariosDisponiveis.length > 0 && (
            <div style={{ marginTop: '20px' }}>
                <h2>Passo 3: Escolha um horário</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                    {horariosDisponiveis.map(h => (
                        <button key={h} onClick={() => handleSelectHorario(h)} style={{padding: '10px', cursor: 'pointer'}}>{h}</button>
                    ))}
                </div>
            </div>
          )}
          {etapa === 3 && !isLoading && horariosDisponiveis.length === 0 && dataSelecionada && (
            <p style={{marginTop: '10px'}}>Nenhum horário disponível para esta data. Por favor, escolha outro dia.</p>
          )}

          {etapa === 4 && (
            <div style={{ marginTop: '20px' }}>
                <h2>Passo 4: Confirme seus dados</h2>
                <p>Você está agendando <strong>{servicoSelecionado?.nome}</strong> para o dia <strong>{dataSelecionada}</strong> às <strong>{horarioSelecionado}</strong>.</p>
                <form onSubmit={handleAgendamentoSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input type="text" placeholder="Seu nome completo" value={nomeCliente} onChange={e => setNomeCliente(e.target.value)} required style={{padding: '10px'}} disabled={isLoading}/>
                    <input type="tel" placeholder="Seu WhatsApp (ex: 51912345678)" value={contatoCliente} onChange={e => setContatoCliente(e.target.value)} required style={{padding: '10px'}} disabled={isLoading}/>
                    <button type="submit" style={{padding: '15px', background: 'green', color: 'white', border: 'none', cursor: 'pointer', fontSize: '16px'}} disabled={isLoading}>
                        {isLoading ? 'Enviando...' : 'Confirmar Agendamento'}
                    </button>
                </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}