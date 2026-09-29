import { GAS_ENDPOINT } from '@/config';
import React, { useState } from 'react';
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";

export default function ContactForm() {
  const [isOpen, setIsOpen] = useState(false); // Stav pro otevření/zavření okna
  const [formData, setFormData] = useState({
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: 'info', text: 'Odesílám a zapisuji...' });

    const googleAppScriptUrl = GAS_ENDPOINT;

    fetch(googleAppScriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: "contact",
        ...formData
      }),
    })
      .then(() => {
        setStatus({ type: 'success', text: 'Zpráva uložena a e-mail odeslán!' });
        setFormData({ email: '', subject: '', message: '' });
        
        // Volitelné: Zavřít okno automaticky po 3 sekundách od úspěšného odeslání
        setTimeout(() => {
          setIsOpen(false);
          setStatus({ type: '', text: '' });
        }, 3000);
      })
      .catch((err) => {
        console.error('Chyba při odesílání:', err);
        setStatus({ type: 'error', text: 'Něco se nepovedlo. Zkuste to znovu.' });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    // Celý widget držíme zafixovaný v pravém dolním rohu obrazovky
    <div className="fixed bottom-6 right-6 z-50 font-sans text-gray-800 flex flex-col items-end pointer-events-none">
      
      {/* 1. SAMOTNÉ FORMULÁŘOVÉ OKNO */}
      <div className={`w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-primary mb-4 overflow-hidden transition-all duration-300 transform origin-bottom-right ${ /* 👈 PŘIDÁNO z-0 */
        isOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
      }`}>


        
        {/* Hlavička okna */}
        <div className="bg-[#f0cc9f] p-4 text-[#1f2a1c] flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg m-0">Máte dotaz?</h3>
            <p className="text-xs m-0">Odpovíme vám na e-mail</p>
          </div>
          {/* Tlačítko pro zavření (Křížek) */}
          <button 
            onClick={() => setIsOpen(false)} 
            className="text-white hover:text-gray-200 text-xl font-bold p-1 cursor-pointer focus:outline-none"
            aria-label="Zavřít"
          >
            ✕
          </button>
        </div>

        {/* Tělo formuláře */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              E-mailová adresa
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="jmeno@priklad.cz"
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm box-border outline-none transition-colors focus:border-[#f0cc9f] disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>

          <div>
            <label className="block mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Předmět
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              placeholder="Zajímá mě..."
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm box-border outline-none transition-colors focus:border-[#f0cc9f] disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>

          <div>
            <label className="block mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Vaše zpráva
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Napište text zprávy..."
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm box-border outline-none transition-colors focus:border-[#f0cc9f] resize-y disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 text-[#1f2a1c] font-bold rounded-lg text-sm transition-colors duration-200 shadow-md ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[#f0cc9f] hover:bg-[#f0cc9f]/80 cursor-pointer'
            }`}
          >
            {loading ? 'Odesílání...' : 'Odeslat zprávu'}
          </button>
        </form>

        {/* Stavová zpráva */}
        {status.text && (
          <div className={`mx-5 mb-5 p-3 rounded-lg text-xs font-medium text-center ${
            status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            status.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-[#f0cc9f]/20 text-[#f0cc9f] border border-[#f0cc9f]/50'
          }`}>
            {status.text}
          </div>
        )}
      </div>

      {/* 2. PLOVOUCÍ KULATÉ TLAČÍTKO */}
<button
  onClick={() => setIsOpen(!isOpen)}
  className={`h-14 rounded-full flex items-center justify-center text-[#1f2a1c] shadow-xl cursor-pointer focus:outline-none 
      overflow-hidden pointer-events-auto transition-[width,background-color] ease-in-out hover:scale-110 duration-500 z-10 relative ${ /* 👈 PŘIDÁNO z-10 relative */
        isOpen 
          ? 'bg-gray-700 w-14' 
          : 'bg-[#f0cc9f] hover:bg-[#f0cc9f]/80 w-44'
      }
    `}
  title={isOpen ? 'Zavřít formulář' : 'Máte dotaz?'}
>

        {/* STAV 1: Křížek (Přidán z-10 a stav invisible, když je zavřeno, aby nepřekážel) */}
        <span className={`absolute inset-0 flex items-center justify-center transition-all duration-500 z-10 ${
          isOpen 
            ? 'opacity-100 scale-100 rotate-0 visible' 
            : 'opacity-0 scale-50 -rotate-90 invisible'
        }`}>
          <svg 
            xmlns="http://w3.org" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={2.5} 
            stroke="white" 
            className="w-6 h-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </span>

        {/* STAV 2: Obálka + Text (Přidán stav z-0 a invisible, když je otevřeno, aby neblokoval křížek) */}
        <div className={`flex items-center justify-center gap-1 px-4 transition-all duration-300 z-0 ${
          isOpen 
            ? 'opacity-0 scale-95 pointer-events-none invisible' 
            : 'opacity-100 scale-100 visible'
        }`}>
          <IoChatbubbleEllipsesOutline className="scale-150 shrink-0" />
          <span className="text-sm font-medium tracking-wide whitespace-nowrap pl-1">Máte dotaz?</span>
        </div>
      </button>


    </div>
  );
}
