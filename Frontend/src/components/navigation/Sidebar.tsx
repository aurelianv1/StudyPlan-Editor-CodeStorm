import Link from 'next/link';
import { Home, FileText, MessageSquare, Info } from 'lucide-react';

export default function Sidebar() {
    const menuItems = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Update Docs', href: '/updating-docs', icon: FileText },
        { name: 'AI Editing', href: '/ai-editing', icon: MessageSquare },
        { name: 'Help', href: '/help', icon: Info },
    ];

    return (
        <aside className="w-64 border-r border-zinc-800 bg-black h-screen sticky top-0 flex flex-col p-6">
            <div className="mb-10 text-white font-bold tracking-tighter text-xl">AI-ACADEMIC</div>
            <nav className="flex-1 space-y-1">
                {menuItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all text-sm font-medium"
                    >
                        <item.icon size={18} />
                        {item.name}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}