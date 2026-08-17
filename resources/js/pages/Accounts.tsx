import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    Dialog,
    DialogPanel,
    DialogTitle,
    Transition,
    TransitionChild,
} from '@headlessui/react';
import { Plus, Pencil, Trash2, X, Wallet } from 'lucide-react';

interface Account {
    id: number;
    name: string;
    type: 'cash' | 'bank' | 'e-wallet';
    balance: number;
}

export default function Accounts({ accounts }: { accounts: Account[] }) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm({
        name: '',
        type: 'cash',
        balance: 0,
    });

    const formatCurrency = (num: number) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(num);

    const openAdd = () => {
        reset();
        clearErrors();
        setEditingAccount(null);
        setIsAddOpen(true);
    };

    const openEdit = (account: Account) => {
        clearErrors();
        setData({
            name: account.name,
            type: account.type,
            balance: account.balance,
        });
        setEditingAccount(account);
        setIsAddOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingAccount) {
            put(route('accounts.update', editingAccount.id), {
                onSuccess: () => {
                    setIsAddOpen(false);
                },
            });
        } else {
            post(route('accounts.store'), {
                onSuccess: () => {
                    setIsAddOpen(false);
                    reset();
                },
            });
        }
    };

    const confirmDelete = (id: number) => setDeleteId(id);

    const handleDelete = () => {
        if (deleteId) {
            destroy(route('accounts.destroy', deleteId), {
                onSuccess: () => setDeleteId(null),
            });
        }
    };

    return (
        <AuthenticatedLayout header="Rekening & Dompet">
            <Head title="Rekening & Dompet" />

            <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <h2 className="text-xl leading-tight font-semibold text-gray-800 dark:text-gray-200">
                    Daftar Rekening
                </h2>
                <button
                    onClick={openAdd}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-gray-900 px-5 py-2.5 font-semibold text-white shadow-md transition-all hover:bg-gray-800 sm:w-auto dark:bg-emerald-500 dark:text-gray-900 dark:hover:bg-emerald-400"
                >
                    <Plus className="h-4 w-4" /> Tambah
                </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white/70 shadow-sm backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/70">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead className="border-b border-gray-100 bg-gray-50/50 text-xs tracking-wider text-gray-400 uppercase dark:border-gray-700/50 dark:bg-gray-800/30 dark:text-gray-500">
                            <tr>
                                <th className="px-6 py-4 font-semibold">
                                    Nama Rekening
                                </th>
                                <th className="px-6 py-4 font-semibold">
                                    Tipe
                                </th>
                                <th className="px-6 py-4 text-right font-semibold">
                                    Saldo Saat Ini
                                </th>
                                <th className="px-6 py-4 text-right font-semibold">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                            {accounts.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-16 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800/50">
                                                <Wallet className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                                            </div>
                                            <p className="text-sm font-medium">
                                                Belum ada rekening/dompet.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                accounts.map((account) => (
                                    <tr
                                        key={account.id}
                                        className="group transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                                    >
                                        <td className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-200">
                                            {account.name}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-500 capitalize dark:text-gray-400">
                                            <span className="rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-700">
                                                {account.type.replace('-', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
                                            {formatCurrency(account.balance)}
                                        </td>
                                        <td className="flex justify-end gap-2 px-6 py-4 text-right">
                                            <button
                                                onClick={() =>
                                                    openEdit(account)
                                                }
                                                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-emerald-50 hover:text-emerald-500 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    confirmDelete(account.id)
                                                }
                                                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Slide-over Form using Headless UI */}
            <Transition show={isAddOpen}>
                <Dialog
                    className="relative z-50"
                    onClose={() => setIsAddOpen(false)}
                >
                    <TransitionChild
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm dark:bg-gray-900/80" />
                    </TransitionChild>
                    <div className="fixed inset-0 overflow-hidden">
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                                <TransitionChild
                                    enter="transform transition ease-in-out duration-500 sm:duration-700"
                                    enterFrom="translate-x-full"
                                    enterTo="translate-x-0"
                                    leave="transform transition ease-in-out duration-500 sm:duration-700"
                                    leaveFrom="translate-x-0"
                                    leaveTo="translate-x-full"
                                >
                                    <DialogPanel className="pointer-events-auto flex h-full w-screen max-w-md flex-col bg-white shadow-2xl dark:bg-gray-900 dark:text-gray-100">
                                        <div className="flex items-center justify-between border-b border-gray-100 p-6 dark:border-gray-800">
                                            <DialogTitle className="text-xl font-extrabold tracking-tight dark:text-white">
                                                {editingAccount
                                                    ? 'Edit Rekening'
                                                    : 'Tambah Rekening'}
                                            </DialogTitle>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setIsAddOpen(false)
                                                }
                                                className="rounded-full bg-gray-50 p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>
                                        <form
                                            onSubmit={handleSubmit}
                                            className="flex-1 space-y-6 overflow-y-auto p-6"
                                        >
                                            <div>
                                                <label className="mb-2 block text-sm font-semibold dark:text-gray-200">
                                                    Nama Rekening
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={data.name}
                                                    onChange={(e) =>
                                                        setData(
                                                            'name',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="min-h-[48px] w-full rounded-xl border-gray-200 px-4 py-3 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                                    placeholder="Misal: Cash, BCA, Gopay"
                                                />
                                                {errors.name && (
                                                    <p className="mt-1 text-xs font-medium text-red-500">
                                                        {errors.name}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-semibold dark:text-gray-200">
                                                    Tipe
                                                </label>
                                                <select
                                                    required
                                                    value={data.type}
                                                    onChange={(e) =>
                                                        setData(
                                                            'type',
                                                            e.target
                                                                .value as any,
                                                        )
                                                    }
                                                    className="min-h-[48px] w-full rounded-xl border-gray-200 px-4 py-3 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                                >
                                                    <option value="cash">
                                                        Tunai (Cash)
                                                    </option>
                                                    <option value="bank">
                                                        Bank
                                                    </option>
                                                    <option value="e-wallet">
                                                        E-Wallet
                                                    </option>
                                                </select>
                                                {errors.type && (
                                                    <p className="mt-1 text-xs font-medium text-red-500">
                                                        {errors.type}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-semibold dark:text-gray-200">
                                                    Saldo Awal
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={
                                                        data.balance
                                                            ? new Intl.NumberFormat(
                                                                  'id-ID',
                                                              ).format(
                                                                  Number(
                                                                      data.balance,
                                                                  ),
                                                              )
                                                            : ''
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            'balance',
                                                            parseFloat(
                                                                e.target.value.replace(
                                                                    /\D/g,
                                                                    '',
                                                                ) || '0',
                                                            ),
                                                        )
                                                    }
                                                    className="min-h-[48px] w-full rounded-xl border-gray-200 px-4 py-3 text-lg font-bold shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                                    placeholder="0"
                                                />
                                                {errors.balance && (
                                                    <p className="mt-1 text-xs font-medium text-red-500">
                                                        {errors.balance}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="pt-6">
                                                <button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3.5 font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 dark:bg-emerald-500 dark:text-gray-900"
                                                >
                                                    {processing
                                                        ? 'Menyimpan...'
                                                        : 'Simpan Rekening'}
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

            {/* Delete Confirmation Modal */}
            {deleteId !== null && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-gray-500/75 backdrop-blur-sm dark:bg-gray-900/80"
                        onClick={() => setDeleteId(null)}
                    ></div>
                    <div className="relative w-full max-w-sm rounded-xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-darkblack-400 dark:bg-darkblack-600">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            Hapus Rekening?
                        </h2>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Data rekening akan dihapus (transaksi yang terkait
                            dengan rekening ini mungkin akan terpengaruh atau
                            kembali tanpa rekening). Tindakan ini tidak dapat
                            dibatalkan.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 dark:bg-darkblack-500 dark:text-gray-300 dark:hover:bg-darkblack-400"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDelete}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-red-500/20 transition-colors hover:bg-red-700"
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
