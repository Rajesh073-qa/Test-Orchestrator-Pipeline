'use client';

import * as React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10" />;
  }

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <button
        onClick={() => setTheme('light')}
        className={cn(
          "w-8 h-8 flex items-center justify-center rounded-lg transition-all",
          theme === 'light' ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
        )}
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={cn(
          "w-8 h-8 flex items-center justify-center rounded-lg transition-all",
          theme === 'dark' ? "bg-slate-800 text-primary shadow-sm" : "text-slate-500 hover:text-slate-300"
        )}
      >
        <Moon className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={cn(
          "w-8 h-8 flex items-center justify-center rounded-lg transition-all",
          theme === 'system' ? "bg-white dark:bg-slate-800 text-primary shadow-sm" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
        )}
      >
        <Monitor className="w-4 h-4" />
      </button>
    </div>
  );
}
