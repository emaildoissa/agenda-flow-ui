// arquivo: src/app/cadastro/page.tsx
'use client';

import { useState } from 'react';

export default function CadastroPage() {
  // Estados para controlar o formulário e o feedback
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nomeSalao, setNomeSalao] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    const payload = {
      nome_salao: nomeSalao,
      email_proprietario: email,
      senha: senha,
      whatsapp_notificacao: whatsapp,
    };

    try {
      const response = await fetch('http://localhost:8080/saloes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        // Tenta ler uma mensagem de erro da API, se houver
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Não foi possível concluir o cadastro.');
      }

      setSuccess(true); // Ativa a tela de sucesso

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Se o cadastro foi bem-sucedido, mostra uma mensagem de sucesso
  if (success) {
    return (
      <main className="bg-slate-100 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8 text-center space-y-4">
          <h1 className="text-3xl font-bold text-green-600">Cadastro Realizado!</h1>
          <p className="text-gray-600">Seja bem-vindo(a)! Sua conta foi criada com sucesso. Em breve você poderá acessar sua dashboard.</p>
          {/* Futuramente, este botão levaria para o login ou para a dashboard */}
          <a href="#" className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
            Acessar Painel
          </a>
        </div>
      </main>
    );
  }

  // Formulário de cadastro
  return (
    <main className="bg-slate-100 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">Crie sua Conta</h1>
          <p className="text-gray-500 mt-2">Comece a automatizar seus agendamentos hoje mesmo.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Nome do Salão/Barbearia</label>
            <input type="text" value={nomeSalao} onChange={e => setNomeSalao(e.target.value)} required className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Seu Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Crie uma Senha</label>
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required minLength={6} className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition"/>
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-600">Nº de WhatsApp para Notificações</label>
            <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} required placeholder="51912345678" className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition"/>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          
          <button type="submit" disabled={isLoading} className="w-full p-4 bg-blue-600 text-white font-bold text-lg rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
            {isLoading ? 'Criando conta...' : 'Cadastrar'}
          </button>
        </form>
      </div>
    </main>
  );
}