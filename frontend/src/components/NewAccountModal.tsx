import { useState, type FormEvent } from 'react';
import { api } from '../services/api';

interface NewAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function NewAccountModal({ isOpen, onClose, onSuccess }: NewAccountModalProps) {
    const [name, setName] = useState('');
    const [initialBalance, setInitialBalance] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/accounts', {
                name,
                initialBalance: Number(initialBalance) || 0,
            });

            setName('');
            setInitialBalance('');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Erro ao cadastrar conta:', error);
            alert('Erro ao cadastrar conta. Verifique os dados fornecidos.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-6">
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <h2 className="text-xl font-bold text-white">Nova Conta / Caixa</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-lg font-semibold">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                            Nome da Conta / Banco
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Ex: Itaú, Nubank, Caixinha..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                            Saldo Inicial (R$)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            placeholder="0.00"
                            value={initialBalance}
                            onChange={(e) => setInitialBalance(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                        />
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
                            {loading ? 'Salvando...' : 'Salvar Conta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}