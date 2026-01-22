import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'outline';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
}

const baseStyles =
  'py-3 px-8 text-base rounded-lg cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-indigo-500 text-white border-none hover:bg-indigo-600',
  outline:
    'bg-transparent text-indigo-500 border-2 border-indigo-500 hover:bg-indigo-500 hover:text-white',
};

export function Button({
  children,
  variant = 'primary',
  type = 'button',
  className = '',
  ...props
}: ButtonProps): ReactNode {
  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${className}`.trim();

  return (
    <button type={type} className={combinedClassName} {...props}>
      {children}
    </button>
  );
}
