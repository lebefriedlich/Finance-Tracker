import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        // Auto-check "Remember Me" if running as a PWA (standalone mode)
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
            setData('remember', true);
        }
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="bg-white dark:bg-darkblack-500 min-h-screen relative font-sans">
            <Head title="Log in" />
            
            {/* Theme Toggle Button */}
            <div className="absolute top-4 right-4 lg:top-6 lg:right-6 z-50">
                <button
                    onClick={() => {
                        const isDark = document.documentElement.classList.toggle('dark');
                        localStorage.theme = isDark ? 'dark' : 'light';
                    }}
                    className="p-2 rounded-full bg-bgray-100 hover:bg-bgray-200 dark:bg-darkblack-500 dark:hover:bg-darkblack-400 transition-colors flex items-center justify-center shadow-sm border border-bgray-200 dark:border-darkblack-400"
                >
                    <svg className="w-5 h-5 text-bgray-900 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                </button>
            </div>

            <div className="flex flex-col lg:flex-row justify-between min-h-screen">
                {/* Left Form Side */}
                <div className="flex-1 lg:w-1/2 px-5 xl:pl-12 py-10 flex flex-col justify-center items-center text-left">
                    <div className="w-full max-w-[450px]">
                        <header className="mb-10 text-center">
                            <h2 className="text-bgray-900 dark:text-white text-4xl font-bold mb-2 text-center">Selamat Datang Di FinTrack</h2>
                            <p className="text-base font-medium text-bgray-600 dark:text-bgray-50 text-center">Masuk akun Anda untuk melanjutkan</p>
                        </header>

                        {status && <div className="mb-4 text-sm font-medium text-success-300 text-center">{status}</div>}

                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label className="block font-bold text-bgray-900 dark:text-white mb-2 text-left">Alamat Email</label>
                                <input 
                                    type="email" 
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="text-bgray-800 text-lg border border-bgray-300 dark:border-darkblack-400 dark:bg-darkblack-500 dark:text-white h-14 w-full focus:border-success-300 focus:ring-1 focus:ring-success-300 rounded-lg px-4 py-3.5 placeholder:text-bgray-500"
                                    placeholder="Masukkan email Anda" 
                                    required 
                                />
                                {errors.email && <span className="text-rose-500 text-sm mt-1 block">{errors.email}</span>}
                            </div>

                            <div>
                                <label className="block font-bold text-bgray-900 dark:text-white mb-2 text-left">Kata Sandi</label>
                                <div className="relative">
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="text-bgray-800 text-lg border border-bgray-300 dark:border-darkblack-400 dark:bg-darkblack-500 dark:text-white h-14 w-full focus:border-success-300 focus:ring-1 focus:ring-success-300 rounded-lg px-4 py-3.5 pr-12 placeholder:text-bgray-500"
                                        placeholder="••••••••" 
                                        required 
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-bgray-500 hover:text-bgray-700 dark:text-bgray-400 dark:hover:text-bgray-200 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.password && <span className="text-rose-500 text-sm mt-1 block">{errors.password}</span>}
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="rounded border-bgray-300 dark:border-darkblack-400 text-success-300 focus:ring-success-300 dark:bg-darkblack-500 w-5 h-5"
                                    />
                                    <span className="text-sm font-medium text-bgray-700 dark:text-bgray-300">Ingat Saya</span>
                                </label>
                            </div>

                            <button 
                                type="submit" 
                                disabled={processing}
                                className="w-full py-4 mt-8 flex items-center justify-center gap-2.5 text-white font-bold bg-success-300 hover:bg-success-400 transition-all rounded-lg shadow-lg shadow-success-300/20 disabled:opacity-75 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Memproses...' : 'Masuk'}
                            </button>
                        </form>

                        <footer className="mt-10 text-center text-bgray-600 dark:text-bgray-400 text-sm font-medium">
                            © {new Date().getFullYear()} FinTrack. Hak Cipta Dilindungi.
                        </footer>
                    </div>
                </div>

                {/* Right Illustration Side */}
                <div className="lg:w-1/2 hidden lg:flex bg-[#F6FAFF] dark:bg-darkblack-600 p-20 relative flex-col justify-center items-center">
                    <div className="max-w-md text-center">
                        <img src="/signin.svg" alt="Illustration" className="mb-10 mx-auto" />
                        <h3 className="text-bgray-900 dark:text-white font-semibold text-4xl mb-4">Cepat, Mudah, dan Efisien</h3>
                        <p className="text-bgray-600 dark:text-bgray-50 text-sm font-medium">
                            FinTrack membantu Anda mengelola keuangan, melacak pengeluaran, dan mengatur anggaran Anda hanya dengan beberapa klik.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
