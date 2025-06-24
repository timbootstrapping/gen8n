'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Info, ExternalLink } from 'lucide-react';

interface KeyValidationInputProps {
  label: string;
  placeholder: string;
  provider: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  onValidation: (isValid: boolean) => void;
}

const providerInfo = {
  anthropic: {
    url: 'https://console.anthropic.com/account/keys',
    pattern: /^sk-ant-/
  },
  openai: {
    url: 'https://platform.openai.com/api-keys',
    pattern: /^sk-/
  },
  openrouter: {
    url: 'https://openrouter.ai/keys',
    pattern: /^sk-or-/
  },
  google: {
    url: 'https://makersuite.google.com/app/apikey',
    pattern: /^AIza/
  }
};

export default function KeyValidationInput({
  label,
  placeholder,
  provider,
  required = false,
  value,
  onChange,
  onValidation
}: KeyValidationInputProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const validateKey = async (key: string) => {
    if (!key) {
      setIsValid(null);
      onValidation(false);
      return;
    }

    const info = providerInfo[provider as keyof typeof providerInfo];
    if (!info?.pattern.test(key)) {
      setIsValid(false);
      onValidation(false);
      return;
    }

    setIsValidating(true);
    
    // Simulate API validation with timeout
    setTimeout(() => {
      const valid = key.length > 10; // Simple validation for demo
      setIsValid(valid);
      onValidation(valid);
      setIsValidating(false);
    }, 1000);
  };

  const handleBlur = () => {
    if (value) {
      validateKey(value);
    }
  };

  const getStatusIcon = () => {
    if (isValidating) {
      return <div className="animate-spin w-4 h-4 border-2 border-highlight border-t-transparent rounded-full" />;
    }
    if (isValid === true) {
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
    if (isValid === false) {
      return <XCircle className="w-4 h-4 text-red-400" />;
    }
    return null;
  };

  const info = providerInfo[provider as keyof typeof providerInfo];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">
          {label} {provider === 'anthropic' ? '(Recommended)' : required ? '(Required)' : ''}
        </label>
        {info && (
          <a
            href={info.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-highlight hover:text-highlight/80 transition-colors"
            title="Get your API key"
          >
            <Info size={12} />
            <ExternalLink size={10} />
          </a>
        )}
      </div>
      <div className="relative">
        <input
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          className="w-full bg-transparent border border-border rounded-2xl px-4 py-2 pr-10 input-hover focus:border-highlight outline-none"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {getStatusIcon()}
        </div>
      </div>
      {isValid === false && (
        <p className="text-xs text-red-400">Invalid API key format or key not working</p>
      )}
    </div>
  );
} 