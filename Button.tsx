import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'font-bold rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950 uppercase tracking-wider text-sm';
  
  const sizeStyles = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-4 text-sm',
    lg: 'px-8 py-5 text-base',
  };

  const variantStyles = {
    primary: 'bg-gradient-to-r from-yellow-500 to-orange-600 text-black hover:from-yellow-400 hover:to-orange-500 focus:ring-yellow-500 shadow-lg shadow-orange-900/20 active:scale-95',
    secondary: 'bg-gray-800 text-gray-200 hover:bg-gray-700 focus:ring-gray-600 border border-white/5',
    outline: 'border-2 border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 focus:ring-yellow-500',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;