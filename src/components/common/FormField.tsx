import { cloneElement, isValidElement } from 'react';
import type { ReactNode, ReactElement } from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  children: ReactElement<{
    id?: string;
    'aria-describedby'?: string;
    'aria-invalid'?: boolean;
    'aria-required'?: boolean;
  }>;
  error?: string;
  required?: boolean;
}

export function FormField({
  label,
  name,
  children,
  error,
  required = false,
}: FormFieldProps): ReactNode {
  const errorId = `${name}-error`;

  const childProps: {
    id: string;
    'aria-describedby'?: string;
    'aria-invalid'?: boolean;
    'aria-required'?: boolean;
  } = {
    id: name,
  };

  if (error) {
    childProps['aria-describedby'] = errorId;
    childProps['aria-invalid'] = true;
  }

  if (required) {
    childProps['aria-required'] = true;
  }

  const enhancedChild = isValidElement(children)
    ? cloneElement(children, childProps)
    : children;

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {enhancedChild}
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
