'use client'

import { useAuth } from '../auth/AuthProvider'

export default function Topbar() {
  const { logout } = useAuth()

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        {/* Placeholder for gym logo */}
        <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary font-bold">
          G
        </div>
        <span className="font-semibold text-lg">Gimnasio Delta</span>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border-2 border-primary">
            {/* Avatar placeholder */}
            <img src="https://api.dicebear.com/9.x/avataaars/svg?seed=Admin" alt="Admin" className="w-full h-full object-cover"/>
          </div>
          <button 
            onClick={() => logout()}
            className="text-xs font-medium text-slate-500 hover:text-red-500 transition ml-2"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}
