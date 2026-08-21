import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';

export function Header() {
    const { user, logout } = useAuth();

    // Estado local para priorizar a busca em tempo real da API /Subscriptions/status
    const [isPro, setIsPro] = useState<boolean>(
        user?.plan === 'PRO' || user?.isPro === true
    );

    useEffect(() => {
        let isMounted = true;

        // Busca o status atualizado no backend sem gerar avisos no ESLint
        const loadStatus = async () => {
            try {
                const response = await api.get('/Subscriptions/status');
                if (isMounted) {
                    setIsPro(!!response.data.isPro);
                }
            } catch (error) {
                console.error('Erro ao buscar status do plano no Header:', error);
            }
        };

        loadStatus();

        // Escuta o disparo de upgrade vindo do Subscription.tsx
        const handleUpgradeEvent = () => {
            loadStatus();
        };

        window.addEventListener('subscriptionUpdated', handleUpgradeEvent);

        return () => {
            isMounted = false;
            window.removeEventListener('subscriptionUpdated', handleUpgradeEvent);
        };
    }, []);

    return (
        <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between text-slate-100">
            <div className="flex items-center gap-3">
                {/* Nome da Empresa */}
                <span className="text-xs font-semibold px-2.5 py-1 bg-slate-800 text-slate-200 border border-slate-700 rounded-full">
                    {user?.companyName || 'Empresa'}
                </span>

                {/* Badge dinâmica do Plano + Link para /subscription */}
                <Link
                    to="/subscription"
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-all ${isPro
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800 hover:bg-emerald-900'
                            : 'bg-amber-950 text-amber-400 border-amber-800 hover:bg-amber-900'
                        }`}
                >
                    {isPro ? 'Plano PRO' : 'Plano FREE • Upgrade'}
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="text-sm font-semibold text-slate-200">{user?.fullName}</p>
                    <p className="text-xs text-slate-400">{user?.email}</p>
                </div>

                <button
                    onClick={logout}
                    className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-950/50 rounded-lg transition-colors border border-slate-800 hover:border-red-900"
                >
                    Sair
                </button>
            </div>
        </header>
    );
}