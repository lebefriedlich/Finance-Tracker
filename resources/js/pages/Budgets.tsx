import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Plus, X, Trash2, Wallet, Edit2, Search } from 'lucide-react';

export default function Budgets({ budgets, categories, filters }: any) {
    const [isOpen, setIsOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    
    const { data, setData, post, put, processing, reset, errors, clearErrors } = useForm({
        category_id: '',
        month: filters.month || new Date().toISOString().slice(0, 7),
        amount: '',
    });

    const formatRp = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);

    const openCreateModal = () => {
        reset();
        clearErrors();
        setEditingId(null);
        setIsOpen(true);
    };

    const openEditModal = (b: any) => {
        clearErrors();
        setData({
            category_id: b.category_id,
            month: b.month,
            amount: b.amount,
        });
        setEditingId(b.id);
        setIsOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            put(route('budgets.update', editingId), {
                onSuccess: () => {
                    reset();
                    setIsOpen(false);
                    setEditingId(null);
                },
            });
        } else {
            post(route('budgets.store'), {
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
            router.delete(route('budgets.destroy', deleteId), {
                onSuccess: () => setDeleteId(null),
            });
        }
    };

    const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        router.get(route('budgets.index'), { month: e.target.value }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout header="Anggaran">
            <Head title="Anggaran" />

            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 max-w-4xl mx-auto">
                <div className="relative group w-full sm:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                        <Search className="w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                    </div>
                    <input type="text" placeholder="Cari anggaran..." defaultValue={filters.search} onKeyDown={e => e.key === 'Enter' && router.get(route('budgets.index'), { ...filters, search: e.currentTarget.value }, { preserveState: true })} className="pl-10 pr-4 py-2 w-full border border-gray-200 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 rounded-2xl focus:border-emerald-500 focus:ring-emerald-500 text-sm shadow-sm transition-all dark:text-white backdrop-blur-sm" />
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto ml-auto">
                    <input type="month" value={filters.month} onChange={handleMonthChange} className="px-4 py-2.5 min-h-[44px] rounded-xl border-gray-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-800/80 dark:border-gray-700/50 dark:text-white backdrop-blur-sm font-semibold text-sm" />
                    <button onClick={openCreateModal} className="flex items-center gap-2 bg-gray-900 dark:bg-emerald-500 text-white dark:text-gray-900 px-5 py-2.5 rounded-full hover:bg-gray-800 dark:hover:bg-emerald-400 font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                        <Plus className="w-4 h-4" /> Tambah
                    </button>
                </div>
            </div>

            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-white/50 dark:border-gray-700/50 overflow-hidden max-w-4xl mx-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-700/50">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Kategori</th>
                            <th className="px-6 py-4 font-semibold text-right">Jumlah</th>
                            <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                        {(budgets || []).map((b: any) => (
                            <tr key={b.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-200">{b.category.name}</td>
                                <td className="px-6 py-4 text-right font-extrabold tracking-tight text-gray-900 dark:text-gray-100">{formatRp(b.amount)}</td>
                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                    <button onClick={() => openEditModal(b)} className="text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 p-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => confirmDelete(b.id)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {budgets.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                                            <Wallet className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                                        </div>
                                        <p className="text-sm font-medium">Tidak ada anggaran bulan ini.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

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
                                            <DialogTitle className="text-xl font-extrabold tracking-tight dark:text-white">{editingId ? 'Edit Anggaran' : 'Anggaran Baru'}</DialogTitle>
                                            <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                                        </div>
                                        <form onSubmit={submit} className="flex-1 overflow-y-auto p-6 space-y-6">
                                            <div>
                                                <label className="block text-sm font-semibold mb-2 dark:text-gray-200">Kategori (Khusus Pengeluaran)</label>
                                                <select required value={data.category_id} onChange={e => setData('category_id', e.target.value)} className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500 px-4 py-3 min-h-[48px]">
                                                    <option value="" disabled>Pilih Kategori</option>
                                                    {categories.map((c: any) => (
                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                    ))}
                                                </select>
                                                {errors.category_id && <p className="text-red-500 text-xs mt-1 font-medium">{errors.category_id}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold mb-2 dark:text-gray-200">Bulan</label>
                                                <input type="month" required value={data.month} onChange={e => setData('month', e.target.value)} className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500 px-4 py-3 min-h-[48px]" />
                                                {errors.month && <p className="text-red-500 text-xs mt-1 font-medium">{errors.month}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold mb-2 dark:text-gray-200">Jumlah (Rp)</label>
                                                <input type="text" required value={data.amount ? new Intl.NumberFormat('id-ID').format(Number(data.amount)) : ''} onChange={e => setData('amount', e.target.value.replace(/\D/g, ''))} className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500 px-4 py-3 min-h-[48px] text-lg font-bold" placeholder="0" />
                                                {errors.amount && <p className="text-red-500 text-xs mt-1 font-medium">{errors.amount}</p>}
                                            </div>
                                            <div className="pt-6">
                                                <button type="submit" disabled={processing} className="w-full bg-gray-900 dark:bg-emerald-500 text-white dark:text-gray-900 py-3.5 rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex justify-center items-center gap-2">
                                                    {processing ? 'Menyimpan...' : 'Simpan Anggaran'}
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
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Hapus Anggaran?</h2>
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
