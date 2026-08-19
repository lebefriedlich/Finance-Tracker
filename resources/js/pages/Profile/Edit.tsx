import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({
    mustVerifyEmail,
    status,
    latestAppVersion,
}: PageProps<{
    mustVerifyEmail: boolean;
    status?: string;
    latestAppVersion?: any;
}>) {
    return (
        <AuthenticatedLayout header="Profil">
            <Head title="Profil" />

            <div className="space-y-6">
                <div className="rounded-2xl border border-white/50 bg-white/70 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl sm:p-8 dark:border-gray-700/50 dark:bg-gray-800/70 dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="max-w-xl"
                    />
                </div>

                <div className="rounded-2xl border border-white/50 bg-white/70 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl sm:p-8 dark:border-gray-700/50 dark:bg-gray-800/70 dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
                    <UpdatePasswordForm className="max-w-xl" />
                </div>

                {latestAppVersion && latestAppVersion.download_url && (
                    <div className="rounded-2xl border border-white/50 bg-white/70 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl sm:p-8 dark:border-gray-700/50 dark:bg-gray-800/70 dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
                        <section className="max-w-xl">
                            <header>
                                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                    Unduh Aplikasi
                                </h2>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    Unduh versi terbaru dari aplikasi Finance
                                    Tracker (Versi {latestAppVersion.version}).
                                </p>
                            </header>

                            <div className="mt-6">
                                <a
                                    href={latestAppVersion.download_url}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center rounded-xl border border-transparent bg-indigo-600 px-4 py-2 text-xs font-semibold tracking-widest text-white uppercase shadow-sm shadow-indigo-500/30 transition duration-150 ease-in-out hover:bg-indigo-700 focus:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none active:bg-indigo-900 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus:bg-indigo-400 dark:focus:ring-offset-gray-800 dark:active:bg-indigo-300"
                                >
                                    <svg
                                        className="mr-2 h-4 w-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                        />
                                    </svg>
                                    Download App
                                </a>
                            </div>
                        </section>
                    </div>
                )}

                <div className="rounded-2xl border border-white/50 bg-white/70 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl sm:p-8 dark:border-gray-700/50 dark:bg-gray-800/70 dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
                    <DeleteUserForm className="max-w-xl" />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
