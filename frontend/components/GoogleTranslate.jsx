'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function GoogleTranslate() {
  useEffect(() => {
    // Define the callback function globally so the script can find it
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { pageLanguage: 'np' },
        'google_translate_element'
      );
    };
  }, []);

  return (
    <Script
      src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
      strategy="afterInteractive"
    />
  );
}

