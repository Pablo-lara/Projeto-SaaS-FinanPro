import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { NewAccountModal } from '../components/NewAccountModal';

interface Account {
    id: string;
    name: string;
    initialBalance: number;
    currentBalance?: number;
    balance: number;
}

export function Accounts() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    function fetchAccounts() {
        let isMounted = true;

        api.get<Account[]>('/accounts')
            .then((response) => {
                if (isMounted) setAccounts(response.data);
            })
            .catch((error) => console.error('Erro ao carregar contas:', error))
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }

    useEffect(() => {
        fetchAccounts();
    }, []);

    async function handleDelete(id: string) {
        if (!confirm('Deseja realmente excluir esta conta?')) return;

        try {
            await api.delete(`/accounts/${id}`);
            setAccounts((prev) => prev.filter((a) => a.id !== id));
        } catch (error) {
            console.error('Erro ao excluir conta:', error);
            alert('Não foi possível excluir a conta.');
        }
    }

    const formatCurrency = (val?: number) => {
        const numericValue = Number(val);
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
            .format(isNaN(numericValue) ? 0 : numericValue);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Contas & Caixas</h1>
                    <p className="text-slate-400 text-sm mt-1">Gerencie suas contas bancárias e carteiras.</p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition shadow-lg shadow-emerald-500/20 self-start sm:self-auto"
                >
                    + Nova Conta
                </button>
            </div>

            {loading ? (
                <div className="p-8 text-center text-slate-400 text-sm">Carregando contas...</div>
            ) : accounts.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-sm">
                    Nenhuma conta cadastrada. Clique em "+ Nova Conta" para começar.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {accounts.map((acc) => (
                        <div
                            key={acc.id}
                            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-bold text-white">{acc.name}</h3>
                                    <button
                                        onClick={() => handleDelete(acc.id)}
                                        className="text-xs text-slate-500 hover:text-red-400 transition"
                                    >
                                        Excluir
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    Saldo inicial: {formatCurrency(acc.initialBalance)}
                                </p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-800/80">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Saldo Atual
                                </p>
                                <p className="text-2xl font-extrabold text-emerald-400 mt-1">
                                    {formatCurrency(acc.balance)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <NewAccountModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchAccounts}
            />
        </div>
    );
}