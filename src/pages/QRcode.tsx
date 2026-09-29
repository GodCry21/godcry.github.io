import React, { useEffect, useState } from 'react';

export default function QRcode() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // Po odscrollování více než 300 px QR schováme
      setIsVisible(window.scrollY < 300);
    };

    // Nastaví správný stav i při prvním načtení stránky
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div
      className={`
        fixed bottom-6 left-6 z-50
        font-sans text-gray-800
        flex flex-col items-end
        pointer-events-none

        transition-all duration-500 ease-in-out

        ${
          isVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-6 pointer-events-none'
        }
      `}
    >
      <div className="w-40 bg-white p-3 rounded-2xl text-sm">
        <h3>
          Pokud nás chcete obdarovat finančním darem, můžete k tomu využít
          následující QR kód.
        </h3>

        <img
          src="./qr_code.webp"
          alt="QR kód pro finanční dar"
        />
      </div>
    </div>
  );
}