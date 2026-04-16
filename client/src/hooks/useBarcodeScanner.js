import { useEffect, useState } from 'react';

export const useBarcodeScanner = (onScan) => {
  const [barcode, setBarcode] = useState('');

  useEffect(() => {
    let timeout;
    const handleKeyDown = (e) => {
      // If the scanner hits Enter and we have a barcode, trigger the scan!
      if (e.key === 'Enter' && barcode.length > 2) {
        onScan(barcode);
        setBarcode('');
        return;
      }
      
      // If it's a normal character, add it to our string
      if (e.key.length === 1) {
        setBarcode(prev => prev + e.key);
        
        // Humans type slowly. Scanners type instantly.
        // If 50ms pass without a keystroke, it was probably a human typing, so clear the string.
        clearTimeout(timeout);
        timeout = setTimeout(() => setBarcode(''), 50); 
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeout);
    };
  }, [barcode, onScan]);
};