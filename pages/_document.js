import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="tr">
      <Head>
        {/* Gerekli SEO meta etiketleri */}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9543225982689860"
         crossorigin="anonymous"></script>
         <meta name="google-adsense-account" content="ca-pub-9543225982689860"></meta>
        <meta charSet="UTF-8" />
        <meta name="google-site-verification" content="tLu7KLvTnZXspaVDEwe_JC4DZMVxLrvUlKQ1ixoS-Pc" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Online ses dosyası sessiz kısımları kırpma aracı. Hızlı, ücretsiz ve reklama uygun web uygulaması." />
        <meta name="keywords" content="ses kırpma, audio trim, sessiz kısımları kaldır, mp3 kırp, wav, online, ücretsiz, web, silence remover, silence cutter" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Audio Silence Cutter" />
        <meta property="og:title" content="Ses Dosyası Sessiz Kısımları Kırpma" />
        <meta property="og:description" content="Online ses dosyası sessiz kısımları kırpma aracı. Hızlı, ücretsiz ve reklama uygun web uygulaması." />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="tr_TR" />
        <meta property="og:url" content="https://ornek-site.com" />
        <meta property="og:image" content="/logo.png" />
        <link rel="icon" href="/favicon.png" />
        {/* Google için ek SEO */}
        <meta name="google-site-verification" content="GOOGLE_VERIFICATION_KODUNUZ" />
        <title>Ses Dosyası Sessiz Kısımları Kırpma | Online Araç</title>
      </Head>
      <body>
        
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
