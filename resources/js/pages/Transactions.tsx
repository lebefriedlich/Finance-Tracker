import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Plus, X, Trash2, Receipt, Edit2 } from 'lucide-react';

export default function Transactions({ transactions, categories, filters }: any) {
    const [isOpen, setIsOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    
    const { data, setData, post, put, processing, reset, errors, clearErrors } = useForm({
        category_id: '',
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        amount: '',
        description: '',
    });

    const formatRp = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
    const formatDate = (dateStr: string) => new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(dateStr));

    const openCreateModal = () => {
        reset();
        clearErrors();
        setEditingId(null);
        setIsOpen(true);
    };

    const openEditModal = (tx: any) => {
        clearErrors();
        setData({
            category_id: tx.category_id,
            date: tx.date,
            type: tx.type,
            amount: tx.amount,
            description: tx.description || '',
        });
        setEditingId(tx.id);
        setIsOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            put(route('transactions.update', editingId), {
                onSuccess: () => {
                    reset();
                    setIsOpen(false);
                    setEditingId(null);
                },
            });
        } else {
            post(route('transactions.store'), {
                onSuccess: () => {
                    reset();
                    setIsOpen(false);
                },
            });
        }
    };

    const confirmDelete = (id: number) => setDeleteId(id);

    const handleDelete = () => {
        if (deleteId) {
            router.delete(route('transactions.destroy', deleteId), {
                onSuccess: () => setDeleteId(null),
            });
        }
    };

    const [filterStart, setFilterStart] = useState(filters.start_date || '');
    const [filterEnd, setFilterEnd] = useState(filters.end_date || '');

    const applyDateFilter = () => {
        router.get(route('transactions.index'), {
            month: filters.month,
            start_date: filterStart,
            end_date: filterEnd,
        }, { preserveState: true });
    };

    const handleExport = () => {
        const params = new URLSearchParams();
        if (filters.start_date) params.append('start_date', filters.start_date);
        if (filters.end_date) params.append('end_date', filters.end_date);
        if (!filters.start_date && !filters.end_date && filters.month) params.append('month', filters.month);
        
        window.location.href = route('transactions.export') + '?' + params.toString();
    };

    const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        router.get(route('transactions.index'), { month: e.target.value, start_date: '', end_date: '' }, { preserveState: true });
    };

    const filteredCategories = (categories || []).filter((c: any) => c.type === data.type);

    const [showCustomDate, setShowCustomDate] = useState(!!filters.start_date || !!filters.end_date);

    return (
        <AuthenticatedLayout header="Keuangan">
            <Head title="Keuangan" />

            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    {!showCustomDate ? (
                        <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm backdrop-blur-sm">
                            <input type="month" value={filters.month} onChange={handleMonthChange} className="px-4 py-2 border-0 bg-transparent focus:ring-0 text-sm font-bold text-gray-700 dark:text-gray-200" />
                            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700"></div>
                            <button onClick={() => setShowCustomDate(true)} className="px-3 py-2 text-xs font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                                Filter Khusus
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-wrap items-center gap-2 bg-white/50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm backdrop-blur-sm">
                            <input type="date" value={filterStart} onChange={e => setFilterStart(e.target.value)} className="px-3 py-2 border-0 bg-transparent focus:ring-0 text-sm font-semibold text-gray-700 dark:text-gray-200" />
                            <span className="text-gray-400">-</span>
                            <input type="date" value={filterEnd} onChange={e => setFilterEnd(e.target.value)} className="px-3 py-2 border-0 bg-transparent focus:ring-0 text-sm font-semibold text-gray-700 dark:text-gray-200" />
                            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 ml-1"></div>
                            <button onClick={applyDateFilter} className="px-4 py-2 ml-1 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors shadow-sm">
                                Terapkan
                            </button>
                            <button onClick={() => { setShowCustomDate(false); handleMonthChange({target:{value: filters.month}} as any); }} className="px-3 py-2 text-xs font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                                Batal
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
                    <button onClick={handleExport} className="flex-1 md:flex-none justify-center flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-full hover:bg-emerald-700 font-semibold shadow-md transition-all">
                        Export Excel
                    </button>
                    <button onClick={openCreateModal} className="flex-1 md:flex-none justify-center flex items-center gap-2 bg-gray-900 dark:bg-emerald-500 text-white dark:text-gray-900 px-5 py-2.5 rounded-full hover:bg-gray-800 dark:hover:bg-emerald-400 font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                        <Plus className="w-4 h-4" /> Tambah
                    </button>
                </div>
            </div>

            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-white/50 dark:border-gray-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-700/50">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Tanggal</th>
                                <th className="px-6 py-4 font-semibold">Kategori</th>
                                <th className="px-6 py-4 font-semibold">Deskripsi</th>
                                <th className="px-6 py-4 font-semibold text-right">Jumlah</th>
                                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                            {transactions.data.length > 0 ? transactions.data.map((tx: any) => (
                                <tr key={tx.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400 font-medium">{formatDate(tx.date)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${tx.type === 'income' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'}`}>
                                            {tx.category.name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium">{tx.description || <span className="text-gray-300 dark:text-gray-600 italic">Tidak ada deskripsi</span>}</td>
                                    <td className={`px-6 py-4 text-right font-extrabold tracking-tight ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-gray-100'}`}>
                                        {tx.type === 'income' ? '+' : '-'}{formatRp(tx.amount)}
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        <button onClick={() => openEditModal(tx)} className="text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 p-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => confirmDelete(tx.id)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                                            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                                                <Receipt className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                                            </div>
                                            <p className="text-sm font-medium">Tidak ada transaksi bulan ini.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/30 dark:bg-gray-800/30 flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Menampilkan <span className="font-semibold text-gray-700 dark:text-gray-300">{transactions.from || 0}</span> hingga <span className="font-semibold text-gray-700 dark:text-gray-300">{transactions.to || 0}</span> dari <span className="font-semibold text-gray-700 dark:text-gray-300">{transactions.total}</span></span>
                    <div className="flex gap-2">
                        {transactions.prev_page_url && <button onClick={() => router.get(transactions.prev_page_url)} className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-colors">Sebelumnya</button>}
                        {transactions.next_page_url && <button onClick={() => router.get(transactions.next_page_url)} className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-colors">Selanjutnya</button>}
                    </div>
                </div>
            </div>

            {/* Slide-over Form using Headless UI */}
            <Transition show={isOpen}>
                <Dialog className="relative z-50" onClose={() => setIsOpen(false)}>
                    <TransitionChild enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-gray-900/40 dark:bg-gray-900/80 backdrop-blur-sm" />
                    </TransitionChild>
                    <div className="fixed inset-0 overflow-hidden">
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                                <TransitionChild enter="transform transition ease-in-out duration-500 sm:duration-700" enterFrom="translate-x-full" enterTo="translate-x-0" leave="transform transition ease-in-out duration-500 sm:duration-700" leaveFrom="translate-x-0" leaveTo="translate-x-full">
                                    <DialogPanel className="pointer-events-auto w-screen max-w-md h-full bg-white dark:bg-gray-900 dark:text-gray-100 shadow-2xl flex flex-col">
                                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                                            <DialogTitle className="text-xl font-extrabold tracking-tight dark:text-white">{editingId ? 'Edit Transaksi' : 'Transaksi Baru'}</DialogTitle>
                                            <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                                        </div>
                                        <form onSubmit={submit} className="flex-1 overflow-y-auto p-6 space-y-6">
                                            <div>
                                                <label className="block text-sm font-semibold mb-2 dark:text-gray-200">Tipe</label>
                                                <div className="flex rounded-xl p-1 bg-gray-100/80 dark:bg-gray-800 shadow-inner">
                                                    <button type="button" onClick={() => setData('type', 'expense')} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${data.type === 'expense' ? 'bg-white dark:bg-gray-700 text-rose-600 dark:text-rose-400 shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>Pengeluaran</button>
                                                    <button type="button" onClick={() => setData('type', 'income')} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${data.type === 'income' ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>Pemasukan</button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold mb-2 dark:text-gray-200">Kategori</label>
                                                <select required value={data.category_id} onChange={e => setData('category_id', e.target.value)} className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500 px-4 py-3 min-h-[48px]">
                                                    <option value="" disabled>Pilih Kategori</option>
                                                    {filteredCategories.map((c: any) => (
                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                    ))}
                                                </select>
                                                {errors.category_id && <p className="text-red-500 text-xs mt-1 font-medium">{errors.category_id}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold mb-2 dark:text-gray-200">Tanggal</label>
                                                <input type="date" required value={data.date} onChange={e => setData('date', e.target.value)} className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500 px-4 py-3 min-h-[48px]" />
                                                {errors.date && <p className="text-red-500 text-xs mt-1 font-medium">{errors.date}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold mb-2 dark:text-gray-200">Jumlah (Rp)</label>
                                                <input type="text" required value={data.amount ? new Intl.NumberFormat('id-ID').format(Number(data.amount)) : ''} onChange={e => setData('amount', e.target.value.replace(/\D/g, ''))} className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500 px-4 py-3 min-h-[48px] text-lg font-bold" placeholder="0" />
                                                {errors.amount && <p className="text-red-500 text-xs mt-1 font-medium">{errors.amount}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold mb-2 dark:text-gray-200">Deskripsi</label>
                                                <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows={3} className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500 px-4 py-3" placeholder="Catatan opsional"></textarea>
                                                {errors.description && <p className="text-red-500 text-xs mt-1 font-medium">{errors.description}</p>}
                                            </div>
                                            <div className="pt-6">
                                                <button type="submit" disabled={processing} className="w-full bg-gray-900 dark:bg-emerald-500 text-white dark:text-gray-900 py-3.5 rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex justify-center items-center gap-2">
                                                    {processing ? 'Menyimpan...' : 'Simpan Transaksi'}
                                                </button>
                                            </div>
                                        </form>
                                    </DialogPanel>
                                </TransitionChild>
                            </div>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {deleteId !== null && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-500/75 dark:bg-gray-900/80 backdrop-blur-sm" onClick={() => setDeleteId(null)}></div>
                    <div className="relative bg-white dark:bg-darkblack-600 rounded-xl shadow-2xl p-6 w-full max-w-sm border border-gray-100 dark:border-darkblack-400">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Hapus Transaksi?</h2>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Tindakan ini tidak dapat dibatalkan.</p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-darkblack-500 dark:hover:bg-darkblack-400 rounded-lg transition-colors">Batal</button>
                            <button onClick={handleDelete} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-md shadow-red-500/20">Hapus</button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
