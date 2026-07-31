import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Plus, X, Trash2, Tags, Search } from 'lucide-react';

export default function Categories({ categories, filters = {} }: any) {
    const [isOpen, setIsOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        type: 'expense',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('categories.store'), {
            onSuccess: () => {
                reset();
                setIsOpen(false);
            },
        });
    };

    const confirmDelete = (id: number) => setDeleteId(id);

    const handleDelete = () => {
        if (deleteId) {
            router.delete(route('categories.destroy', deleteId), {
                onSuccess: () => setDeleteId(null),
            });
        }
    };

    return (
        <AuthenticatedLayout header="Kategori">
            <Head title="Kategori" />

            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 max-w-4xl mx-auto">
                <div className="relative group w-full sm:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                        <Search className="w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                    </div>
                    <input type="text" placeholder="Cari kategori..." defaultValue={filters.search} onKeyDown={e => e.key === 'Enter' && router.get(route('categories.index'), { search: e.currentTarget.value }, { preserveState: true })} className="pl-10 pr-4 py-2 w-full border border-gray-200 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 rounded-2xl focus:border-emerald-500 focus:ring-emerald-500 text-sm shadow-sm transition-all dark:text-white backdrop-blur-sm" />
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto ml-auto">
                    <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 bg-gray-900 dark:bg-emerald-500 text-white dark:text-gray-900 px-5 py-2.5 rounded-full hover:bg-gray-800 dark:hover:bg-emerald-400 font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                        <Plus className="w-4 h-4" /> Tambah Kategori
                    </button>
                </div>
            </div>

            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-white/50 dark:border-gray-700/50 overflow-hidden max-w-4xl mx-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-700/50">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Nama</th>
                            <th className="px-6 py-4 font-semibold">Tipe</th>
                            <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                        {categories.map((c: any) => (
                            <tr key={c.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-200">{c.name}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 text-xs font-bold rounded-md ${c.type === 'income' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'}`}>
                                        {c.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => confirmDelete(c.id)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {categories.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                                            <Tags className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                                        </div>
                                        <p className="text-sm font-medium">Tidak ada kategori.</p>
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
                                            <DialogTitle className="text-xl font-extrabold tracking-tight dark:text-white">Kategori Baru</DialogTitle>
                                            <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                                        </div>
                                        <form onSubmit={submit} className="flex-1 overflow-y-auto p-6 space-y-6">
                                            <div>
                                                <label className="block text-sm font-semibold mb-2 dark:text-gray-200">Nama</label>
                                                <input type="text" required value={data.name} onChange={e => setData('name', e.target.value)} className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500 px-4 py-3 min-h-[48px]" placeholder="mis. Makanan & Minuman" />
                                                {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold mb-2 dark:text-gray-200">Tipe</label>
                                                <div className="flex rounded-xl p-1 bg-gray-100/80 dark:bg-gray-800 shadow-inner">
                                                    <button type="button" onClick={() => setData('type', 'expense')} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${data.type === 'expense' ? 'bg-white dark:bg-gray-700 text-rose-600 dark:text-rose-400 shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>Pengeluaran</button>
                                                    <button type="button" onClick={() => setData('type', 'income')} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${data.type === 'income' ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>Pemasukan</button>
                                                </div>
                                            </div>
                                            <div className="pt-6">
                                                <button type="submit" disabled={processing} className="w-full bg-gray-900 dark:bg-emerald-500 text-white dark:text-gray-900 py-3.5 rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex justify-center items-center gap-2">
                                                    {processing ? 'Menyimpan...' : 'Simpan Kategori'}
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
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Hapus Kategori?</h2>
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
