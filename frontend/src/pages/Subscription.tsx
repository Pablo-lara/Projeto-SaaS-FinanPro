import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { api } from '../services/api';

interface PlanLimits {
    isPro: boolean;
    currentTransactionsCount: number;
    maxFreeTransactions: number;
}

export function Subscription() {
    const [loading, setLoading] = useState(false);
    const [limits, setLimits] = useState<PlanLimits>({
        isPro: false,
        currentTransactionsCount: 0,
        maxFreeTransactions: 5,
    });

    const [tenantId, setTenantId] = useState<string | null>(null);

    useEffect(() => {
        async function loadTenantStatus() {
            try {
                const response = await api.get('/Subscriptions/status');
                setLimits(response.data);

                if (response.data.tenantId) {
                    setTenantId(response.data.tenantId);
                }
            } catch (error) {
                console.error('Erro ao carregar status da assinatura', error);
            }
        }
        loadTenantStatus();
    }, []);

    async function handleSimulateUpgrade() {
        setLoading(true);

        // 1. Tenta usar o tenantId que veio da API /Subscriptions/status (Opção B)
        let tenantIdToUse = tenantId || '';

        // 2. Se não encontrou no estado, busca do JWT via localStorage (Opção A)
        if (!tenantIdToUse) {
            const rawToken =
                localStorage.getItem('token') ||
                localStorage.getItem('@FinanPro:token') ||
                localStorage.getItem('token_auth');

            if (!rawToken) {
                alert('Token não encontrado no navegador. Faça login novamente.');
                setLoading(false);
                return;
            }

            try {
                const decoded = jwtDecode<Record<string, unknown>>(rawToken);
                tenantIdToUse = (decoded.tenantId ||
                    decoded.TenantId ||
                    decoded.primarygroupsid ||
                    decoded.sub) as string;

                console.log('Tenant ID extraído do JWT:', tenantIdToUse);
            } catch (err) {
                console.error('Erro ao decodificar token:', err);
                alert('Erro ao ler dados da sessão.');
                setLoading(false);
                return;
            }
        }

        if (!tenantIdToUse) {
            alert('Não foi possível identificar o ID do Tenant no seu login.');
            setLoading(false);
            return;
        }

        // 3. Envia a requisição para o endpoint de Webhook
        try {
            await api.post(
                '/Webhook/payment',
                {
                    tenantId: tenantIdToUse,
                    eventType: 'payment_intent.succeeded',
                    planName: 'PRO',
                    status: 'PRO',
                },
                {
                    headers: {
                        'X-Webhook-Secret': 'finanpro_webhook_secret_2026',
                    },
                }
            );

            alert('Upgrade realizado com sucesso! Seu status agora é PRO.');
            setLimits((prev) => ({ ...prev, isPro: true }));
            window.dispatchEvent(new Event('subscriptionUpdated'));
            window.location.reload();
        } catch (error) {
            console.error('Falha ao processar o webhook de upgrade', error);
            alert('Erro ao simular upgrade.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-100">Plano e Assinatura</h1>
                <p className="text-slate-400">Gerencie seu plano atual e limites da plataforma.</p>
            </div>

            {!limits.isPro && (
                <div className="bg-amber-950/40 border border-amber-800 p-4 rounded-lg">
                    <p className="text-sm font-medium text-amber-300">
                        Você está no <strong>Plano FREE</strong>.
                    </p>
                    <p className="text-xs text-amber-400 mt-1">
                        Uso atual: {limits.currentTransactionsCount} de {limits.maxFreeTransactions} transações permitidas.
                    </p>
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
                {/* Card FREE */}
                <div className={`border rounded-xl p-6 bg-slate-900 ${!limits.isPro ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-800'}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-slate-100">Plano FREE</h2>
                        {!limits.isPro && <span className="bg-blue-950 text-blue-400 border border-blue-800 text-xs px-2 py-1 rounded">Atual</span>}
                    </div>
                    <p className="text-2xl font-bold mb-4 text-slate-100">R$ 0 <span className="text-sm font-normal text-slate-400">/mês</span></p>
                    <ul className="text-sm space-y-2 text-slate-300 mb-6">
                        <li>✓ Até 5 transações registradas</li>
                        <li>✓ 1 Conta bancária</li>
                        <li>✓ Relatórios básicos</li>
                    </ul>
                </div>

                {/* Card PRO */}
                <div className={`border rounded-xl p-6 bg-slate-900 ${limits.isPro ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-800'}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-slate-100">Plano PRO</h2>
                        {limits.isPro && <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs px-2 py-1 rounded">Ativo</span>}
                    </div>
                    <p className="text-2xl font-bold mb-4 text-slate-100">R$ 29,90 <span className="text-sm font-normal text-slate-400">/mês</span></p>
                    <ul className="text-sm space-y-2 text-slate-300 mb-6">
                        <li>✓ Transações ilimitadas</li>
                        <li>✓ Contas bancárias ilimitadas</li>
                        <li>✓ Dashboard completo com categorias</li>
                    </ul>

                    <button
                        onClick={handleSimulateUpgrade}
                        disabled={loading || limits.isPro}
                        className={`w-full py-2 px-4 rounded-lg text-white font-medium transition ${limits.isPro
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                                : 'bg-emerald-600 hover:bg-emerald-700'
                            }`}
                    >
                        {loading ? 'Processando...' : limits.isPro ? 'Plano Ativo' : 'Simular Upgrade para PRO'}
                    </button>
                </div>
            </div>
        </div>
    );
}