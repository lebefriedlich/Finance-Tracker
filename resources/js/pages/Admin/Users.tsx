import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Plus, X, Trash2, Edit2, Users as UsersIcon } from 'lucide-react';

export default function Users({ users }: any) {
    const [isOpen, setIsOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    
    const { data, setData, post, put, processing, reset, errors, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'user',
        is_active: true,
    });

    const openModal = (user: any = null) => {
        clearErrors();
        if (user) {
            setEditingId(user.id);
            setData({
                name: user.name,
                email: user.email,
                password: '',
                role: user.role,
                is_active: user.is_active,
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
            put(route('admin.users.update', editingId), {
                onSuccess: () => {
                    reset();
                    setIsOpen(false);
                },
            });
        } else {
            post(route('admin.users.store'), {
                onSuccess: () => {
                    reset();
                    setIsOpen(false);
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this user?')) {
            router.delete(route('admin.users.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Users - Admin" />

            <div className="pb-10">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-bgray-900 dark:text-white">Manajemen Pengguna</h2>
                        <p className="text-bgray-500 mt-1">Kelola akses dan akun pengguna di sistem.</p>
                    </div>
                    <button onClick={() => openModal()} className="px-6 py-3 bg-success-300 hover:bg-success-400 text-white rounded-xl font-bold shadow-lg shadow-success-300/20 transition-all text-sm flex items-center justify-center gap-2">
                        <Plus className="w-5 h-5" /> Tambah Pengguna
                    </button>
                </div>

                <div className="rounded-2xl bg-white dark:bg-darkblack-600 shadow-md border border-bgray-100 dark:border-darkblack-400 overflow-hidden">
                    <div className="p-6 md:p-8 flex items-center justify-between border-b border-bgray-100 dark:border-darkblack-400">
                        <h3 className="text-lg font-bold text-bgray-900 dark:text-white flex items-center gap-2">
                            <UsersIcon className="w-5 h-5 text-success-300" />
                            Daftar Pengguna
                        </h3>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-bgray-500 dark:text-bgray-400 uppercase bg-bgray-50 dark:bg-darkblack-500 border-b border-bgray-100 dark:border-darkblack-400">
                                <tr>
                                    <th className="px-6 py-5 font-bold">Nama</th>
                                    <th className="px-6 py-5 font-bold">Email</th>
                                    <th className="px-6 py-5 font-bold">Peran</th>
                                    <th className="px-6 py-5 font-bold">Status</th>
                                    <th className="px-6 py-5 font-bold text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-bgray-100 dark:divide-darkblack-400">
                                {users.data.map((u: any) => (
                                    <tr key={u.id} className="hover:bg-bgray-50 dark:hover:bg-darkblack-500 transition-colors">
                                        <td className="px-6 py-5 font-bold text-bgray-900 dark:text-white">{u.name}</td>
                                        <td className="px-6 py-5 text-bgray-600 dark:text-bgray-400 font-medium">{u.email}</td>
                                        <td className="px-6 py-5">
                                            <span className={`px-3 py-1 text-[10px] font-bold rounded-md uppercase ${u.role === 'owner' ? 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400' : 'bg-bgray-100 text-bgray-600 dark:bg-darkblack-400 dark:text-bgray-300'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-3 py-1 text-[10px] font-bold rounded-md uppercase ${u.is_active ? 'bg-success-50 text-success-500' : 'bg-rose-50 text-rose-500'}`}>
                                                {u.is_active ? 'Aktif' : 'Tidak Aktif'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openModal(u)} className="p-2 text-bgray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(u.id)} className="p-2 text-bgray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors">
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
                        <span className="text-sm text-bgray-500 font-medium">Menampilkan {users.from || 0} ke {users.to || 0} dari {users.total}</span>
                        <div className="flex gap-2">
                            {users.prev_page_url && <button onClick={() => router.get(users.prev_page_url)} className="px-4 py-2 text-sm font-bold border border-bgray-200 dark:border-darkblack-400 rounded-lg hover:bg-bgray-50 dark:hover:bg-darkblack-500 text-bgray-700 dark:text-bgray-300 transition-colors">Sebelumnya</button>}
                            {users.next_page_url && <button onClick={() => router.get(users.next_page_url)} className="px-4 py-2 text-sm font-bold border border-bgray-200 dark:border-darkblack-400 rounded-lg hover:bg-bgray-50 dark:hover:bg-darkblack-500 text-bgray-700 dark:text-bgray-300 transition-colors">Selanjutnya</button>}
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
                                    <DialogTitle className="text-xl font-bold text-bgray-900 dark:text-white">{editingId ? 'Edit Pengguna' : 'Tambah Pengguna'}</DialogTitle>
                                    <button onClick={() => setIsOpen(false)} className="text-bgray-400 hover:text-bgray-900 dark:hover:text-white transition-colors bg-bgray-50 dark:bg-darkblack-500 p-2 rounded-full"><X className="w-5 h-5" /></button>
                                </div>
                                <form onSubmit={submit} className="p-6 md:p-8 space-y-5 overflow-y-auto">
                                    <div>
                                        <label className="block text-sm font-bold text-bgray-900 dark:text-white mb-2">Nama</label>
                                        <input type="text" required value={data.name} onChange={e => setData('name', e.target.value)} className="w-full rounded-xl border border-bgray-200 dark:border-darkblack-400 bg-white dark:bg-darkblack-500 text-bgray-900 dark:text-white shadow-sm focus:border-success-300 focus:ring-1 focus:ring-success-300 min-h-[50px] px-4 font-medium placeholder:text-bgray-400" placeholder="Masukkan nama" />
                                        {errors.name && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-bgray-900 dark:text-white mb-2">Email</label>
                                        <input type="email" required value={data.email} onChange={e => setData('email', e.target.value)} className="w-full rounded-xl border border-bgray-200 dark:border-darkblack-400 bg-white dark:bg-darkblack-500 text-bgray-900 dark:text-white shadow-sm focus:border-success-300 focus:ring-1 focus:ring-success-300 min-h-[50px] px-4 font-medium placeholder:text-bgray-400" placeholder="nama@email.com" />
                                        {errors.email && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-bgray-900 dark:text-white mb-2">{editingId ? 'Kata Sandi (Kosongkan jika tidak ingin mengubah)' : 'Kata Sandi'}</label>
                                        <input type={editingId ? "password" : "text"} required={!editingId} value={data.password} onChange={e => setData('password', e.target.value)} className="w-full rounded-xl border border-bgray-200 dark:border-darkblack-400 bg-white dark:bg-darkblack-500 text-bgray-900 dark:text-white shadow-sm focus:border-success-300 focus:ring-1 focus:ring-success-300 min-h-[50px] px-4 font-medium placeholder:text-bgray-400" placeholder="••••••••" />
                                        {errors.password && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.password}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-bgray-900 dark:text-white mb-2">Peran</label>
                                        <select required value={data.role} onChange={e => setData('role', e.target.value)} className="w-full rounded-xl border border-bgray-200 dark:border-darkblack-400 bg-white dark:bg-darkblack-500 text-bgray-900 dark:text-white shadow-sm focus:border-success-300 focus:ring-1 focus:ring-success-300 min-h-[50px] px-4 font-medium">
                                            <option value="user">User</option>
                                            <option value="owner">Owner</option>
                                        </select>
                                        {errors.role && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.role}</p>}
                                    </div>
                                    <div className="flex items-center pt-2">
                                        <input type="checkbox" id="is_active" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="rounded-md border-bgray-300 text-success-300 shadow-sm focus:ring-success-300 w-5 h-5 cursor-pointer" />
                                        <label htmlFor="is_active" className="ml-3 block text-sm font-bold text-bgray-900 dark:text-white cursor-pointer">
                                            Status Akun Aktif
                                        </label>
                                    </div>
                                    <div className="pt-6">
                                        <button type="submit" disabled={processing} className="w-full bg-success-300 text-white py-4 rounded-xl font-bold hover:bg-success-400 min-h-[50px] transition-all shadow-lg shadow-success-300/20 disabled:opacity-70">
                                            Simpan Pengguna
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
