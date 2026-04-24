"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, MessageSquare, Info } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Update Docs', href: '/updating-docs', icon: FileText },
    { name: 'AI Editing', href: '/ai-editing', icon: MessageSquare },
    { name: 'Help', href: '/help', icon: Info },
  ];

  return (
    <aside className="w-64 border-r border-zinc-800 bg-black h-screen sticky top-0 flex flex-col p-6">
      <div className="mb-10 flex items-center gap-2 px-3">
        <div className="w-6 h-6 bg-purple-600 rounded-md"></div>
        <span className="text-white font-bold tracking-tighter text-xl uppercase">Academic</span>
      </div>
      
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                isActive 
                ? "bg-zinc-900 text-white shadow-sm ring-1 ring-zinc-800" 
                : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50"
              }`}
            >
              <item.icon size={18} className={isActive ? "text-purple-500" : ""} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}