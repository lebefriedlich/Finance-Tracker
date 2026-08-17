import { Link, usePage, router } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState, useEffect } from 'react';
import { LayoutDashboard, Receipt, Tags, Wallet, LogOut, Moon, Sun, Plus, User as UserIcon, CreditCard } from 'lucide-react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Authenticated({ header, children }: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;
    const [profileOpen, setProfileOpen] = useState(false);
    
    const toggleDark = () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.theme = isDark ? 'dark' : 'light';
    };

    const navs = user.role === 'owner'
        ? [
            { name: 'Daftar Pengguna', href: route('admin.users.index'), icon: UserIcon, active: route().current('admin.users.*') }
        ]
        : [
            { name: 'Dashboard', href: route('dashboard'), icon: LayoutDashboard, active: route().current('dashboard') },
            { name: 'Keuangan', href: route('transactions.index'), icon: Receipt, active: route().current('transactions.*') },
            { name: 'Rekening', href: route('accounts.index'), icon: CreditCard, active: route().current('accounts.*') },
            { name: 'Kategori', href: route('categories.index'), icon: Tags, active: route().current('categories.*') },
            { name: 'Anggaran', href: route('budgets.index'), icon: Wallet, active: route().current('budgets.*') },
        ];

    return (
        <div className="layout-wrapper active w-full bg-bgray-50 dark:bg-darkblack-500 font-sans text-bgray-900 dark:text-white">
            <div className="relative flex w-full">
                
                {/* Desktop Sidebar (Matches 308px width) */}
                <aside className="sidebar-wrapper fixed top-0 z-30 hidden h-full w-[308px] bg-white border-r border-bgray-200 dark:border-darkblack-400 dark:bg-darkblack-600 shadow-sm xl:block">
                    <div className="sidebar-header relative z-30 flex h-[108px] w-full items-center border-b border-bgray-200 pl-[50px] dark:border-darkblack-400">
                        <Link href={user.role === 'owner' ? route('admin.users.index') : route('dashboard')}>
                            <ApplicationLogo className="w-7 h-7" />
                        </Link>
                    </div>
                    
                    <div className="sidebar-body overflow-style-none relative z-30 h-[calc(100vh-108px)] w-full overflow-y-auto pb-[200px] pl-[48px] pt-[14px]">
                        <div className="nav-wrapper mb-[36px] pr-[50px]">
                            <div className="item-wrapper mb-5">
                                <h4 className="border-b border-bgray-200 text-sm font-medium leading-7 text-bgray-700 dark:border-darkblack-400 dark:text-bgray-50 mb-2.5">
                                    Menu Utama
                                </h4>
                                <ul className="mt-2.5 space-y-1">
                                    {navs.map((n) => (
                                        <li key={n.name} className="item py-[11px]">
                                            <Link href={n.href} className="flex items-center justify-between group">
                                                <div className="flex items-center space-x-3">
                                                    <span className={`item-ico flex items-center justify-center w-6 h-6 transition-colors ${n.active ? 'text-success-300' : 'text-bgray-900 dark:text-bgray-50 group-hover:text-success-300'}`}>
                                                        <n.icon className="w-5 h-5" strokeWidth={n.active ? 2.5 : 2} />
                                                    </span>
                                                    <span className={`item-text text-lg font-medium leading-none transition-colors ${n.active ? 'text-success-300' : 'text-bgray-900 dark:text-white group-hover:text-success-300'}`}>
                                                        {n.name}
                                                    </span>
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Body Wrapper */}
                <div className="body-wrapper flex-1 overflow-x-hidden min-h-screen dark:bg-darkblack-500 xl:ml-[308px]">
                    
                    {/* Desktop Topbar (Matches 108px height) */}
                    <header className="header-wrapper fixed z-30 hidden w-full xl:block" style={{ width: 'calc(100% - 308px)' }}>
                        <div className="relative flex h-[108px] w-full items-center justify-between bg-white border-b border-bgray-200 dark:border-darkblack-400 px-10 dark:bg-darkblack-600 shadow-sm 2xl:px-[76px]">
                            <div className="text-xl font-bold text-bgray-900 dark:text-white">
                                {header}
                            </div>
                            
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={toggleDark}
                                    className="themeToggleBtn p-2 rounded-full bg-bgray-100 hover:bg-bgray-200 dark:bg-darkblack-500 dark:hover:bg-darkblack-400 transition-colors flex items-center justify-center shadow-sm border border-bgray-200 dark:border-darkblack-400"
                                >
                                    <Moon className="w-5 h-5 hidden dark:block text-white" />
                                    <Sun className="w-5 h-5 block dark:hidden text-bgray-900" />
                                </button>

                                {/* Profile Dropdown */}
                                <div className="relative">
                                    <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center focus:outline-none">
                                        <img 
                                            className="h-10 w-10 rounded-full object-cover border border-bgray-200 dark:border-darkblack-400 bg-success-50"
                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&color=10b981&background=ecfdf5`} 
                                            alt={user.name} 
                                        />
                                    </button>
                                    
                                    {profileOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)}></div>
                                            <div className="absolute right-0 mt-2 bg-white dark:bg-darkblack-600 rounded-md shadow-lg py-2 border border-bgray-200 dark:border-darkblack-400 z-50 min-w-[200px]">
                                                <div className="px-5 py-3 border-b border-bgray-200 dark:border-darkblack-400">
                                                    <p className="text-base font-bold text-bgray-900 dark:text-white truncate">{user.name}</p>
                                                    <p className="text-sm font-medium text-bgray-500 dark:text-bgray-400 truncate">{user.email}</p>
                                                </div>
                                                <Link href={route('profile.edit')} className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-bgray-700 hover:bg-bgray-100 dark:text-white dark:hover:bg-darkblack-500 transition-colors">
                                                    <UserIcon className="w-4 h-4" /> Edit Profil
                                                </Link>
                                                <Link href={route('logout')} method="post" as="button" className="flex items-center gap-3 w-full text-left px-5 py-3 text-sm font-medium text-rose-500 hover:bg-bgray-100 dark:hover:bg-darkblack-500 transition-colors">
                                                    <LogOut className="w-4 h-4" /> Keluar
                                                </Link>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Mobile Header (80px height) */}
                    <header className="mobile-wrapper fixed block w-full z-40 xl:hidden">
                        <div className="flex h-[80px] w-full items-center justify-between bg-white border-b border-bgray-200 dark:border-darkblack-400 shadow-sm dark:bg-darkblack-600 px-4">
                            <Link href={user.role === 'owner' ? route('admin.users.index') : route('dashboard')}>
                                <ApplicationLogo className="w-6 h-6" />
                            </Link>
                            
                            <div className="flex items-center space-x-3">
                                <button onClick={toggleDark} className="themeToggleBtn p-2 rounded-full bg-bgray-100 dark:bg-darkblack-500 shadow-sm border border-bgray-200 dark:border-darkblack-400">
                                    <Moon className="w-4 h-4 hidden dark:block text-white" />
                                    <Sun className="w-4 h-4 block dark:hidden text-bgray-900" />
                                </button>
                                
                                <div className="relative">
                                    <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center focus:outline-none">
                                        <img 
                                            className="h-9 w-9 rounded-full object-cover border border-bgray-200 dark:border-darkblack-400 bg-success-50"
                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&color=10b981&background=ecfdf5`} 
                                            alt={user.name} 
                                        />
                                    </button>
                                    
                                    {profileOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)}></div>
                                            <div className="absolute right-0 mt-2 bg-white dark:bg-darkblack-600 rounded-md shadow-lg py-2 border border-bgray-200 dark:border-darkblack-400 z-50 min-w-[200px]">
                                                <div className="px-5 py-3 border-b border-bgray-200 dark:border-darkblack-400">
                                                    <p className="text-base font-bold text-bgray-900 dark:text-white truncate">{user.name}</p>
                                                </div>
                                                <Link href={route('profile.edit')} className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-bgray-700 hover:bg-bgray-100 dark:text-white dark:hover:bg-darkblack-500 transition-colors">
                                                    <UserIcon className="w-4 h-4" /> Edit Profil
                                                </Link>
                                                <Link href={route('logout')} method="post" as="button" className="flex items-center gap-3 w-full text-left px-5 py-3 text-sm font-medium text-rose-500 hover:bg-bgray-50 dark:hover:bg-darkblack-500 transition-colors">
                                                    <LogOut className="w-4 h-4" /> Keluar
                                                </Link>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Main Content Area (Matches pt-100px/156px and px-6/px-12 padding) */}
                    <main className="w-full px-6 pb-[100px] pt-[100px] xl:pt-[140px] xl:px-12 xl:pb-12">
                        {children}
                    </main>


                    {/* Mobile Bottom Nav */}
                    <div className="xl:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-darkblack-600 border-t border-bgray-200 dark:border-darkblack-400 flex justify-around items-center h-16 z-50 px-2 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        {navs.map(n => (
                            <Link key={n.name} href={n.href} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${n.active ? 'text-success-300' : 'text-bgray-400 hover:text-bgray-600 dark:hover:text-bgray-300'}`}>
                                <div className={`p-1.5 rounded-full transition-all duration-300 ${n.active ? 'bg-success-50 dark:bg-success-300/10' : ''}`}>
                                    <n.icon className={`w-5 h-5 ${n.active ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                                </div>
                                <span className="text-[10px] font-bold">{n.name}</span>
                            </Link>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
}
