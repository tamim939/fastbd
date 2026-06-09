import React, { useEffect } from 'react';

export const PopunderAd: React.FC = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://pl29693490.effectivecpmnetwork.com/1c/21/1a/1c211a76f000bbd2f3bbe2b7d695896e.js';
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
    script.src = 'https://pl29693495.effectivecpmnetwork.com/8e/60/b2/8e60b2310585cb3ae7dd6084ee06d251.js';
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
          'key' : 'b4af71e52314f97d8cae6b05b7315210',
          'format' : 'iframe',
          'height' : 60,
          'width' : 468,
          'params' : {}
        };
      `;
      container.appendChild(atOptionsScript);

      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = 'https://www.highperformanceformat.com/b4af71e52314f97d8cae6b05b7315210/invoke.js';
      container.appendChild(invokeScript);
    }
  }, []);

  return <div id="adsterra-banner" className="flex justify-center my-4 overflow-hidden"></div>;
};
