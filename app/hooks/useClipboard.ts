import { useState } from 'react';

export function useClipboard() {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2s
      return true;
    } catch (err) {
      return false;
    }
  };

  return { isCopied, copyToClipboard };
}

/* Usage
import { useClipboard } from "@/hooks/useClipboard";
import { useToast } from "@/components/ui/ToastProvider";

export function CopyButton({ text }: { text: string }) {
  const { copyToClipboard } = useClipboard();
  const { showToast } = useToast();

  const handleCopy = () => {
    copyToClipboard(text);
    showToast("Texto copiado", "success");
  };

  return <button onClick={handleCopy}>Copy</button>;
}*/
