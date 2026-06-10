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
  const adHtml = `
    <html>
      <body style="margin:0; padding:0; display:flex; justify-content:center; align-items:center;">
        <script type="text/javascript">
          atOptions = {
            'key' : 'b4af71e52314f97d8cae6b05b7315210',
            'format' : 'iframe',
            'height' : 60,
            'width' : 468,
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://www.highperformanceformat.com/b4af71e52314f97d8cae6b05b7315210/invoke.js"></script>
      </body>
    </html>
  `;

  return (
    <div className="flex justify-center my-4 overflow-hidden min-h-[60px] w-full">
      <iframe
        title="Advertisement"
        srcDoc={adHtml}
        width="468"
        height="60"
        frameBorder="0"
        scrolling="no"
        className="max-w-full"
      ></iframe>
    </div>
  );
};
