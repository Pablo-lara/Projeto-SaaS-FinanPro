import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface CategorySummary {
    categoryName: string;
    totalAmount: number;
}

interface DashboardOverview {
    currentBalance: number;
    totalIncome: number;
    totalExpenses: number;
    expensesByCategory: CategorySummary[];
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export function Dashboard() {
    const [data, setData] = useState<DashboardOverview | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadDashboardData() {
            try {
                const response = await api.get<DashboardOverview>('/Dashboard/overview');
                setData(response.data);
            } catch (error) {
                console.error('Erro ao carregar dados do dashboard:', error);
            } finally {
                setLoading(false);
            }
        }

        loadDashboardData();
    }, []);

    if (loading) {
        return <div className="text-slate-400 text-sm">Carregando indicadores...</div>;
    }

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className="space-y-8">
            {/* Banner de Boas-Vindas */}
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Visão Geral</h1>
                <p className="text-slate-400 text-sm mt-1">Acompanhe o desempenho financeiro em tempo real.</p>
            </div>

            {/* Grid de Cards FinanPro */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card Saldo Geral */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Saldo Consolidado</p>
                    <h2 className="text-3xl font-extrabold text-white mt-2">
                        {formatCurrency(data?.currentBalance || 0)}
                    </h2>
                    <span className="inline-block mt-3 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Contas Ativas
                    </span>
                </div>

                {/* Card Receitas */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Receitas no Mês</p>
                    <h2 className="text-3xl font-extrabold text-emerald-400 mt-2">
                        {formatCurrency(data?.totalIncome || 0)}
                    </h2>
                    <span className="inline-block mt-3 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Entradas
                    </span>
                </div>

                {/* Card Despesas */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Despesas no Mês</p>
                    <h2 className="text-3xl font-extrabold text-red-400 mt-2">
                        {formatCurrency(data?.totalExpenses || 0)}
                    </h2>
                    <span className="inline-block mt-3 px-2.5 py-1 text-xs font-medium rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                        Saídas
                    </span>
                </div>
            </div>

            {/* Gráfico de Despesas por Categoria */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-4">Despesas por Categoria</h3>
                {data?.expensesByCategory && data.expensesByCategory.length > 0 ? (
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.expensesByCategory}
                                    dataKey="totalAmount"
                                    nameKey="categoryName"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                >
                                    {data.expensesByCategory.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => formatCurrency(Number(value ?? 0))}
                                    contentStyle={{
                                        backgroundColor: '#0F172A',
                                        borderColor: '#334155',
                                        borderRadius: '12px',
                                        color: '#FFF',
                                    }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <p className="text-sm text-slate-500 py-12 text-center">Nenhuma despesa registrada no período atual.</p>
                )}
            </div>
        </div>
    );
}