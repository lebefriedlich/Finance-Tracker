import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Plus, X, Trash2, Edit2, Smartphone } from 'lucide-react';

export default function AppVersions({ appVersions }: any) {
    const [isOpen, setIsOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, put, processing, reset, errors, clearErrors } = useForm({
        version: '',
        build_number: '',
        is_force_update: false,
        description: '',
        download_url: '',
    });

    const openModal = (version: any = null) => {
        clearErrors();
        if (version) {
            setEditingId(version.id);
            setData({
                version: version.version,
                build_number: version.build_number,
                is_force_update: version.is_force_update,
                description: version.description || '',
                download_url: version.download_url || '',
            });
        } else {
            setEditingId(null);
            reset();
        }
        setIsOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            put(route('admin.app-versions.update', editingId), {
                onSuccess: () => {
                    reset();
                    setIsOpen(false);
                },
            });
        } else {
            post(route('admin.app-versions.store'), {
                onSuccess: () => {
                    reset();
                    setIsOpen(false);
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus versi ini?')) {
            router.delete(route('admin.app-versions.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="App Versions - Admin" />

            <div className="pb-10">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-bgray-900 dark:text-white">Versi Aplikasi</h2>
                        <p className="text-bgray-500 mt-1">Kelola versi aplikasi mobile untuk pengguna.</p>
                    </div>
                    <button onClick={() => openModal()} className="px-6 py-3 bg-success-300 hover:bg-success-400 text-white rounded-xl font-bold shadow-lg shadow-success-300/20 transition-all text-sm flex items-center justify-center gap-2">
                        <Plus className="w-5 h-5" /> Tambah Versi
                    </button>
                </div>

                <div className="rounded-2xl bg-white dark:bg-darkblack-600 shadow-md border border-bgray-100 dark:border-darkblack-400 overflow-hidden">
                    <div className="p-6 md:p-8 flex items-center justify-between border-b border-bgray-100 dark:border-darkblack-400">
                        <h3 className="text-lg font-bold text-bgray-900 dark:text-white flex items-center gap-2">
                            <Smartphone className="w-5 h-5 text-success-300" />
                            Daftar Versi Aplikasi
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-bgray-500 dark:text-bgray-400 uppercase bg-bgray-50 dark:bg-darkblack-500 border-b border-bgray-100 dark:border-darkblack-400">
                                <tr>
                                    <th className="px-6 py-5 font-bold">Versi</th>
                                    <th className="px-6 py-5 font-bold">Build Number</th>
                                    <th className="px-6 py-5 font-bold">Link Download</th>
                                    <th className="px-6 py-5 font-bold">Force Update</th>
                                    <th className="px-6 py-5 font-bold text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-bgray-100 dark:divide-darkblack-400">
                                {appVersions.data.map((v: any) => (
                                    <tr key={v.id} className="hover:bg-bgray-50 dark:hover:bg-darkblack-500 transition-colors">
                                        <td className="px-6 py-5 font-bold text-bgray-900 dark:text-white">{v.version}</td>
                                        <td className="px-6 py-5 text-bgray-600 dark:text-bgray-400 font-medium">{v.build_number}</td>
                                        <td className="px-6 py-5 text-bgray-600 dark:text-bgray-400 font-medium">
                                            {v.download_url ? (
                                                <a href={v.download_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Download</a>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span
                                                className={`px-3 py-1 text-[10px] font-bold rounded-md uppercase ${v.is_force_update
                                                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300'
                                                        : 'bg-bgray-100 text-bgray-600 dark:bg-darkblack-400 dark:text-bgray-300'
                                                    }`}
                                            >
                                                {v.is_force_update ? 'Ya' : 'Tidak'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openModal(v)} className="p-2 text-bgray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(v.id)} className="p-2 text-bgray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="px-6 md:px-8 py-5 border-t border-bgray-100 dark:border-darkblack-400 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-sm text-bgray-500 font-medium">Menampilkan {appVersions.from || 0} ke {appVersions.to || 0} dari {appVersions.total}</span>
                        <div className="flex gap-2">
                            {appVersions.prev_page_url && <button onClick={() => router.get(appVersions.prev_page_url)} className="px-4 py-2 text-sm font-bold border border-bgray-200 dark:border-darkblack-400 rounded-lg hover:bg-bgray-50 dark:hover:bg-darkblack-500 text-bgray-700 dark:text-bgray-300 transition-colors">Sebelumnya</button>}
                            {appVersions.next_page_url && <button onClick={() => router.get(appVersions.next_page_url)} className="px-4 py-2 text-sm font-bold border border-bgray-200 dark:border-darkblack-400 rounded-lg hover:bg-bgray-50 dark:hover:bg-darkblack-500 text-bgray-700 dark:text-bgray-300 transition-colors">Selanjutnya</button>}
                        </div>
                    </div>
                </div>
            </div>

            <Transition show={isOpen}>
                <Dialog className="relative z-50" onClose={() => setIsOpen(false)}>
                    <TransitionChild enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                    </TransitionChild>
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <TransitionChild enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <DialogPanel className="w-full max-w-md bg-white dark:bg-darkblack-600 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-bgray-100 dark:border-darkblack-400">
                                <div className="flex items-center justify-between p-6 md:p-8 border-b border-bgray-100 dark:border-darkblack-400">
                                    <DialogTitle className="text-xl font-bold text-bgray-900 dark:text-white">{editingId ? 'Edit Versi' : 'Tambah Versi'}</DialogTitle>
                                    <button onClick={() => setIsOpen(false)} className="text-bgray-400 hover:text-bgray-900 dark:hover:text-white transition-colors bg-bgray-50 dark:bg-darkblack-500 p-2 rounded-full"><X className="w-5 h-5" /></button>
                                </div>
                                <form onSubmit={submit} className="p-6 md:p-8 space-y-5 overflow-y-auto">
                                    <div>
                                        <label className="block text-sm font-bold text-bgray-900 dark:text-white mb-2">Versi (contoh: 1.0.0)</label>
                                        <input type="text" required value={data.version} onChange={e => setData('version', e.target.value)} className="w-full rounded-xl border border-bgray-200 dark:border-darkblack-400 bg-white dark:bg-darkblack-500 text-bgray-900 dark:text-white shadow-sm focus:border-success-300 focus:ring-1 focus:ring-success-300 min-h-[50px] px-4 font-medium placeholder:text-bgray-400" placeholder="1.0.0" />
                                        {errors.version && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.version}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-bgray-900 dark:text-white mb-2">Build Number</label>
                                        <input type="number" required value={data.build_number} onChange={e => setData('build_number', e.target.value)} className="w-full rounded-xl border border-bgray-200 dark:border-darkblack-400 bg-white dark:bg-darkblack-500 text-bgray-900 dark:text-white shadow-sm focus:border-success-300 focus:ring-1 focus:ring-success-300 min-h-[50px] px-4 font-medium placeholder:text-bgray-400" placeholder="1" />
                                        {errors.build_number && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.build_number}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-bgray-900 dark:text-white mb-2">Deskripsi (Catatan Rilis)</label>
                                        <textarea value={data.description} onChange={e => setData('description', e.target.value)} className="w-full rounded-xl border border-bgray-200 dark:border-darkblack-400 bg-white dark:bg-darkblack-500 text-bgray-900 dark:text-white shadow-sm focus:border-success-300 focus:ring-1 focus:ring-success-300 px-4 py-3 font-medium placeholder:text-bgray-400" rows={3} placeholder="Fitur baru dan perbaikan bug..."></textarea>
                                        {errors.description && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.description}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-bgray-900 dark:text-white mb-2">Link Download (opsional)</label>
                                        <input type="url" value={data.download_url} onChange={e => setData('download_url', e.target.value)} className="w-full rounded-xl border border-bgray-200 dark:border-darkblack-400 bg-white dark:bg-darkblack-500 text-bgray-900 dark:text-white shadow-sm focus:border-success-300 focus:ring-1 focus:ring-success-300 min-h-[50px] px-4 font-medium placeholder:text-bgray-400" placeholder="https://..." />
                                        {errors.download_url && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.download_url}</p>}
                                    </div>
                                    <div className="flex items-center pt-2">
                                        <input type="checkbox" id="is_force_update" checked={data.is_force_update} onChange={e => setData('is_force_update', e.target.checked)} className="rounded-md border-bgray-300 text-success-300 shadow-sm focus:ring-success-300 w-5 h-5 cursor-pointer" />
                                        <label htmlFor="is_force_update" className="ml-3 block text-sm font-bold text-bgray-900 dark:text-white cursor-pointer">
                                            Wajib Update (Force Update)
                                        </label>
                                    </div>
                                    <div className="pt-6">
                                        <button type="submit" disabled={processing} className="w-full bg-success-300 text-white py-4 rounded-xl font-bold hover:bg-success-400 min-h-[50px] transition-all shadow-lg shadow-success-300/20 disabled:opacity-70">
                                            Simpan Versi
                                        </button>
                                    </div>
                                </form>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </Dialog>
            </Transition>
        </AuthenticatedLayout>
    );
}
