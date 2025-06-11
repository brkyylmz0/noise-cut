import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="tr">
      <Head>
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9543225982689860"
     crossorigin="anonymous"></script>
        {/* SEO meta etiketleri */}
        <meta charSet="UTF-8" />
        <meta name="google-adsense-account" content="ca-pub-9543225982689860"></meta>
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
        <link rel="icon" href="/favicon.ico" />
        <title>Ses Dosyası Sessiz Kısımları Kırpma | Online Araç</title>
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXX');
          `,
        }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
