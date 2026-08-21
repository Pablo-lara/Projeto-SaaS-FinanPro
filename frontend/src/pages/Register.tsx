import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';

export function Register() {
    const [fullName, setFullName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setError('');
            await register({ fullName, companyName, email, password });
            navigate('/');
        } catch {
            setError('Erro ao criar conta. Verifique os dados fornecidos.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 relative z-10 backdrop-blur-xl">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold text-xl mb-3 border border-emerald-500/20">
                        F$
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Criar Conta no FinanPro</h1>
                    <p className="text-slate-400 text-sm mt-1">Comece com o plano FREE e escale sua empresa</p>
                </div>

                {error && (
                    <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Seu Nome</label>
                        <input
                            type="text"
                            required
                            placeholder="Nome Completo"
                            className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Nome da Empresa (Tenant)</label>
                        <input
                            type="text"
                            required
                            placeholder="Ex: Minha Empresa Ltda"
                            className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">E-mail</label>
                        <input
                            type="email"
                            required
                            placeholder="seu@email.com"
                            className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Senha</label>
                        <input
                            type="password"
                            required
                            placeholder="Mínimo 6 caracteres"
                            className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.99] text-sm mt-4"
                    >
                        Cadastrar Empresa
                    </button>
                </form>

                <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
                    <p className="text-sm text-slate-400">
                        Já possui uma conta?{' '}
                        <Link to="/login" className="text-emerald-400 font-medium hover:text-emerald-300 transition-colors">
                            Fazer Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}