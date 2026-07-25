import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function Dashboard({ stats, budgetProgress, expenseChart, recentTransactions, filters }: any) {
    const { user } = usePage().props.auth;
    const formatRp = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
    const formatDate = (dateStr: string) => new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(dateStr));

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />
            
            <div className="pb-10">
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-bgray-900 dark:text-white">Selamat datang kembali, {user.name}!</h2>
                        <p className="text-bgray-500 mt-1">Inilah ringkasan keuangan Anda bulan ini.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {/* Stats Cards modeled perfectly after InvoVite's x-stats-card */}
                    
                    <div className="rounded-2xl bg-white p-6 dark:bg-darkblack-600 shadow-md border border-bgray-100 dark:border-darkblack-400">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-success-50 text-success-300 dark:bg-success-300/10 flex items-center justify-center">
                                <Wallet className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-bgray-500 uppercase tracking-wider">Total Saldo</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <h3 className="text-3xl font-bold text-bgray-900 dark:text-white leading-none">{formatRp(stats.totalBalance)}</h3>
                        </div>
                    </div>
                    
                    <div className="rounded-2xl bg-white p-6 dark:bg-darkblack-600 shadow-md border border-bgray-100 dark:border-darkblack-400">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-success-50 text-success-300 dark:bg-success-300/10 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-bgray-500 uppercase tracking-wider">Pemasukan</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <h3 className="text-3xl font-bold text-bgray-900 dark:text-white leading-none">{formatRp(stats.monthlyIncome)}</h3>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white p-6 dark:bg-darkblack-600 shadow-md border border-bgray-100 dark:border-darkblack-400">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-success-50 text-success-300 dark:bg-success-300/10 flex items-center justify-center">
                                <TrendingDown className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-bgray-500 uppercase tracking-wider">Pengeluaran</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <h3 className="text-3xl font-bold text-bgray-900 dark:text-white leading-none">{formatRp(stats.monthlyExpense)}</h3>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white p-6 dark:bg-darkblack-600 shadow-md border border-bgray-100 dark:border-darkblack-400">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-success-50 text-success-300 dark:bg-success-300/10 flex items-center justify-center">
                                <Activity className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-bgray-500 uppercase tracking-wider">Arus Kas</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <h3 className="text-3xl font-bold text-bgray-900 dark:text-white leading-none">{formatRp(stats.monthlyCashflow)}</h3>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                    {/* Budget Progress (Mimicking InvoVite's Event Status) */}
                    <div className="rounded-2xl bg-white dark:bg-darkblack-600 p-8 shadow-md border border-bgray-100 dark:border-darkblack-400">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                            <h4 className="text-lg font-bold text-bgray-900 dark:text-white">Progres Anggaran</h4>
                            <span className="px-3 py-1 rounded-full bg-success-50 text-success-500 dark:bg-success-500/10 dark:text-success-400 text-xs font-bold uppercase whitespace-nowrap">{filters.month}</span>
                        </div>
                        
                        <div className="space-y-6">
                            {budgetProgress.length > 0 ? budgetProgress.map((bp: any) => {
                                const pct = bp.budget > 0 ? Math.min(100, (bp.spent / bp.budget) * 100) : 0;
                                return (
                                    <div key={bp.id}>
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="font-bold text-bgray-900 dark:text-white text-sm truncate pr-2">{bp.name}</p>
                                            <span className={`whitespace-nowrap px-2 py-1 rounded text-[10px] font-bold uppercase ${bp.status === 'over' ? 'bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400' : 'bg-success-50 text-success-500 dark:bg-success-500/10 dark:text-success-400'}`}>
                                                {bp.status === 'over' ? 'Melebihi Anggaran' : 'Aman'}
                                            </span>
                                        </div>
                                        <div className="w-full bg-bgray-100 dark:bg-darkblack-500 rounded-full h-1.5">
                                            <div className={`${bp.status === 'over' ? 'bg-rose-500' : 'bg-success-300'} h-1.5 rounded-full`} style={{ width: `${pct}%` }}></div>
                                        </div>
                                        <div className="flex justify-between mt-1">
                                            <p className="text-[10px] text-bgray-500">{pct.toFixed(1)}% Terpakai</p>
                                            <p className="text-[10px] text-bgray-500">{formatRp(bp.spent)} / {formatRp(bp.budget)}</p>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <p className="text-center text-bgray-400 italic py-10">Belum ada anggaran bulan ini.</p>
                            )}
                        </div>
                    </div>

                    {/* Expense Chart */}
                    <div className="rounded-2xl bg-white dark:bg-darkblack-600 p-8 shadow-md border border-bgray-100 dark:border-darkblack-400 flex flex-col">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                            <h4 className="text-lg font-bold text-bgray-900 dark:text-white">Pengeluaran</h4>
                            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-500 text-xs font-bold uppercase tracking-wider">Kategori</span>
                        </div>
                        <div className="flex-1 min-h-[250px] relative">
                            {expenseChart.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={expenseChart} dataKey="amount" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={2} stroke="none">
                                            {expenseChart.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            formatter={(value: number) => formatRp(value)}
                                            contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', backgroundColor: '#fff', color: '#1a1d21' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="absolute inset-0 flex items-center justify-center text-bgray-400 italic text-sm">Tidak ada pengeluaran bulan ini.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Transactions (Mimicking InvoVite's Recent Checkins) */}
                <div className="rounded-2xl bg-white dark:bg-darkblack-600 p-8 shadow-md border border-bgray-100 dark:border-darkblack-400 mb-10">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="text-lg font-bold text-bgray-900 dark:text-white">Transaksi Terbaru</h4>
                        <span className="px-3 py-1 rounded-full bg-success-50 text-success-500 dark:bg-success-500/10 dark:text-success-400 text-xs font-bold uppercase whitespace-nowrap">Histori</span>
                    </div>

                    <div className="space-y-6">
                        {recentTransactions.length > 0 ? recentTransactions.map((tx: any) => (
                            <div key={tx.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-xl bg-bgray-50 dark:bg-darkblack-500 gap-4">
                                <div className="flex items-center gap-5">
                                    <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-success-50/50 text-success-500' : 'bg-rose-50/50 text-rose-500'}`}>
                                        {tx.type === 'income' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg text-bgray-900 dark:text-white">{tx.category.name}</p>
                                        <p className="text-sm text-bgray-500 mt-1">{tx.description || 'Tidak ada deskripsi'}</p>
                                    </div>
                                </div>
                                <div className="sm:text-right">
                                    <p className="text-sm text-bgray-500 font-medium mb-1">{formatDate(tx.date)}</p>
                                    <p className={`font-bold text-xl ${tx.type === 'income' ? 'text-success-500' : 'text-bgray-900 dark:text-white'}`}>
                                        {tx.type === 'income' ? '+' : '-'}{formatRp(tx.amount)}
                                    </p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center text-bgray-400 italic py-10">Belum ada transaksi terbaru.</p>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
