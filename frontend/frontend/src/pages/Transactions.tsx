import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { NewTransactionModal } from '../components/NewTransactionModal';

interface Transaction {
    id: string;
    description: string;
    amount: number;
    type: number; // 0 = Receita, 1 = Despesa
    date: string;
    isPaid: boolean;
    categoryName: string;
    accountName: string;
}

export function Transactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    async function fetchTransactions() {
        try {
            const response = await api.get<Transaction[]>('/transactions');
            setTransactions(response.data);
        } catch (error) {
            console.error('Erro ao buscar transações:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        let isMounted = true;

        api.get<Transaction[]>('/transactions')
            .then((response) => {
                if (isMounted) {
                    setTransactions(response.data);
                }
            })
            .catch((error) => {
                console.error('Erro ao buscar transações:', error);
            })
            .finally(() => {
                if (isMounted) {
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    async function handleDelete(id: string) {
        if (!confirm('Tem certeza que deseja excluir esta transação?')) return;

        try {
            await api.delete(`/Transactions/${id}`);
            setTransactions((prev) => prev.filter((t) => t.id !== id));
        } catch (error) {
            console.error('Erro ao excluir transação:', error);
            alert('Erro ao excluir lançamento.');
        }
    }

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('pt-BR').format(date);
    };

    return (
        <div className="space-y-6">
            {/* Topo com Título e Botão de Ação */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Transações</h1>
                    <p className="text-slate-400 text-sm mt-1">Gerencie todos os seus lançamentos financeiros.</p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition shadow-lg shadow-emerald-500/20 self-start sm:self-auto"
                >
                    + Nova Transação
                </button>
            </div>

            {/* Tabela de Transações */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                {loading ? (
                    <div className="p-8 text-center text-slate-400 text-sm">Carregando transações...</div>
                ) : transactions.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 text-sm">
                        Nenhuma transação cadastrada até o momento.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider bg-slate-950/50">
                                    <th className="py-4 px-6">Descrição</th>
                                    <th className="py-4 px-6">Valor</th>
                                    <th className="py-4 px-6">Vencimento</th>
                                    <th className="py-4 px-6">Categoria</th>
                                    <th className="py-4 px-6">Conta</th>
                                    <th className="py-4 px-6">Status</th>
                                    <th className="py-4 px-6 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-sm">
                                {transactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-800/30 transition">
                                        <td className="py-4 px-6 font-medium text-white">{t.description}</td>
                                        <td
                                            className={`py-4 px-6 font-bold ${t.type === 0 ? 'text-emerald-400' : 'text-red-400'
                                                }`}
                                        >
                                            {t.type === 0 ? '+' : '-'} {formatCurrency(t.amount)}
                                        </td>
                                        <td className="py-4 px-6 text-slate-300">{formatDate(t.date)}</td>
                                        <td className="py-4 px-6 text-slate-400">{t.categoryName || '-'}</td>
                                        <td className="py-4 px-6 text-slate-400">{t.accountName || '-'}</td>
                                        <td className="py-4 px-6">
                                            <span
                                                className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full border ${t.isPaid
                                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                    }`}
                                            >
                                                {t.isPaid ? 'Concluído' : 'Pendente'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                onClick={() => handleDelete(t.id)}
                                                className="text-slate-500 hover:text-red-400 text-xs font-semibold transition"
                                            >
                                                Excluir
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal de Cadastro */}
            <NewTransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchTransactions}
            />
        </div>
    );
}