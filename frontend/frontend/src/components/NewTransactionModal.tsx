import { useState, useEffect, type FormEvent } from 'react';
import { api } from '../services/api';

interface Category {
    id: string;
    name: string;
    type: number; // 0 = Income, 1 = Expense
}

interface Account {
    id: string;
    name: string;
}

interface NewTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function NewTransactionModal({ isOpen, onClose, onSuccess }: NewTransactionModalProps) {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<number>(1); // 0 = Receita, 1 = Despesa
    const [dueDate, setDueDate] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [accountId, setAccountId] = useState('');
    const [isPaid, setIsPaid] = useState(false);

    const [categories, setCategories] = useState<Category[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            Promise.all([
                api.get<Category[]>('/categories'),
                api.get<Account[]>('/accounts')
            ]).then(([catRes, accRes]) => {
                setCategories(catRes.data);
                setAccounts(accRes.data);

                // Define os valores padrão iniciais baseados no tipo atual
                const defaultCat = catRes.data.find(c => c.type === type);
                if (defaultCat) setCategoryId(defaultCat.id);
                if (accRes.data.length > 0) setAccountId(accRes.data[0].id);
            }).catch((err) => console.error('Erro ao carregar selects:', err));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const filteredCategories = categories.filter((c) => c.type === type);

    // Função para alterar o tipo e auto-selecionar a primeira categoria compatível
    function handleTypeChange(newType: number) {
        setType(newType);
        const matchingCat = categories.find((c) => c.type === newType);
        setCategoryId(matchingCat ? matchingCat.id : '');
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();

        // Garante que se categoryId for string vazia, tenta pegar do primeiro item filtrado
        const selectedCategoryId = categoryId || (filteredCategories[0] ? filteredCategories[0].id : '');

        if (!selectedCategoryId) {
            alert('Por favor, selecione uma categoria.');
            return;
        }

        if (!accountId) {
            alert('Por favor, selecione uma conta.');
            return;
        }

        setLoading(true);

        // Garante que a data enviada tem formato ISO completo aceito pelo C#
        const formattedDate = dueDate
            ? new Date(`${dueDate}T12:00:00.000Z`).toISOString()
            : new Date().toISOString();


        try {
            await api.post('/transactions', {
                description,
                amount: Number(amount),
                type,
                Date: formattedDate,
                categoryId: selectedCategoryId,
                accountId,
                isPaid
            });

            // Limpar campos
            setDescription('');
            setAmount('');
            setDueDate('');
            setIsPaid(false);

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Erro ao cadastrar transação:', error);
            alert('Erro ao salvar transação. Verifique os dados fornecidos.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-6">
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <h2 className="text-xl font-bold text-white">Nova Transação</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white text-lg font-semibold"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Seletor do Tipo (Receita vs Despesa) */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => handleTypeChange(0)}
                            className={`py-2.5 rounded-xl text-sm font-semibold border transition ${type === 0
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                                }`}
                        >
                            Receita
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTypeChange(1)}
                            className={`py-2.5 rounded-xl text-sm font-semibold border transition ${type === 1
                                ? 'bg-red-500/20 border-red-500 text-red-400'
                                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                                }`}
                        >
                            Despesa
                        </button>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                            Descrição
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Ex: Assinatura de Software, Salário..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                                Valor (R$)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                                Vencimento
                            </label>
                            <input
                                type="date"
                                required
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                                Categoria
                            </label>
                            <select
                                value={categoryId || (filteredCategories[0]?.id ?? '')}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm"
                            >
                                {filteredCategories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                                Conta / Caixa
                            </label>
                            <select
                                value={accountId}
                                onChange={(e) => setAccountId(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm"
                            >
                                {accounts.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        {a.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                        <input
                            type="checkbox"
                            id="isPaid"
                            checked={isPaid}
                            onChange={(e) => setIsPaid(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                        />
                        <label htmlFor="isPaid" className="text-sm text-slate-300">
                            Marcar como {type === 0 ? 'Recebido' : 'Pago'}
                        </label>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-5 py-2 rounded-xl text-sm transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                        >
                            {loading ? 'Salvando...' : 'Salvar Transação'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}