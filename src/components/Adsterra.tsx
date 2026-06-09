import React, { useEffect } from 'react';

export const PopunderAd: React.FC = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://pl29643981.effectivecpmnetwork.com/14/be/50/14be508055d2633b584e81cbfa6c7ba3.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      // Typically popunder scripts are hard to "remove" cleanly, but we add it to body once
    };
  }, []);
  return null;
};

export const SocialBarAd: React.FC = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://pl29644139.effectivecpmnetwork.com/42/68/d0/4268d09a821b96a77aaa9ba2879dedc2.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);
  return null;
};

export const BannerAd: React.FC = () => {
  useEffect(() => {
    const container = document.getElementById('adsterra-banner');
    if (container && container.childNodes.length === 0) {
      const atOptionsScript = document.createElement('script');
      atOptionsScript.type = 'text/javascript';
      atOptionsScript.innerHTML = `
        atOptions = {
          'key' : 'f4e1d50b2abb189aa2df615906b360ff',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
      `;
      container.appendChild(atOptionsScript);

      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = 'https://www.highperformanceformat.com/f4e1d50b2abb189aa2df615906b360ff/invoke.js';
      container.appendChild(invokeScript);
    }
  }, []);

  return <div id="adsterra-banner" className="flex justify-center my-4 overflow-hidden"></div>;
};
