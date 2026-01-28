import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
    const router = useRouter();

    const menuItems = [
        { name: 'Dashboard', path: '/' },
        { name: 'Dispositivos', path: '/devices' },
        { name: 'Políticas', path: '/policies' },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-blue-600">EMM Admin</h1>
                </div>
                <nav className="mt-6">
                    <ul>
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <Link href={item.path} className={`block px-6 py-3 hover:bg-gray-50 ${router.pathname === item.path ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : 'text-gray-600'}`}>
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
}
