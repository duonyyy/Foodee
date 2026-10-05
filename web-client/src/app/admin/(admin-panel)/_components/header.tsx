import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

export interface HeaderAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  disabled?: boolean;
}

interface HeaderProps {
  title: string;
  description?: string;
  actions?: HeaderAction[];
  badge?: ReactNode;
  children?: ReactNode;
}

const Header: React.FC<HeaderProps> = ({
  title,
  description,
  actions,
  badge,
  children,
}) => (
  <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-border/60">
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-2.5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>
      {description && (
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      )}
    </div>

    {(actions || children) && (
      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
        {actions?.map((action, index) => (
          <Button
            key={index}
            variant={action.variant === 'secondary' || action.variant === 'outline' ? 'outline' : 'default'}
            size="sm"
            onClick={action.onClick}
            disabled={action.disabled}
            className="flex items-center gap-2 min-h-10 px-4 font-semibold shadow-2xs"
          >
            {action.icon}
            <span>{action.label}</span>
          </Button>
        ))}
        {children}
      </div>
    )}
  </header>
);

export default Header;