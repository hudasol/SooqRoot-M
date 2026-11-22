import { Languages } from 'lucide-react';
import { Segmented } from './ui';
import { useLang, Lang } from '../lib/i18n';

/** English and Arabic switch for the screens that support both. */
export function LangToggle({ className = '' }: { className?: string }) {
  const { lang, setLang } = useLang();
  return (
    <Segmented<Lang>
      value={lang}
      onChange={setLang}
      className={className}
      options={[
        { value: 'en', label: 'EN', icon: <Languages size={12} /> },
        { value: 'ar', label: 'عربي' },
      ]}
    />
  );
}
