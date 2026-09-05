import { InputHTMLAttributes, FC, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const Input: FC<InputProps> = ({
  label,
  error,
  icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="input-group">
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      <div style={{ position: 'relative', width: '100%' }}>
        {icon && (
          <div style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center'
          }}>
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`input-field ${className}`}
          style={{ paddingLeft: icon ? '40px' : '14px' }}
          {...props}
        />
      </div>
      {error && <span style={{ color: 'var(--accent-danger)', fontSize: '0.8rem', marginTop: '2px' }}>{error}</span>}
    </div>
  );
};
