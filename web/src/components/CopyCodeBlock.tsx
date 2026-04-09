import { useState } from 'react';

type Props = {
  label: string;
  code: string;
  id?: string;
};

export function CopyCodeBlock({ label, code, id }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="code-block" id={id}>
      <div className="code-block-header">
        <div className="code-label">{label}</div>
        <button type="button" className="btn-copy-code" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}
