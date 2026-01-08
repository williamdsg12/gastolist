import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const options = [
    { value: 'light' as const, icon: Sun, label: 'Claro' },
    { value: 'dark' as const, icon: Moon, label: 'Escuro' },
    { value: 'system' as const, icon: Monitor, label: 'Sistema' },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg">
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = theme === option.value;
        
        return (
          <Button
            key={option.value}
            variant="ghost"
            size="sm"
            onClick={() => setTheme(option.value)}
            className={cn(
              "flex-1 gap-2 transition-all",
              isActive && "bg-card shadow-sm"
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="text-xs hidden sm:inline">{option.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
