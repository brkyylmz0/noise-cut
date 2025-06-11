import { useRef, useState, useEffect } from "react";

export default function Home() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const scriptId = "adsbygoogle-js";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.async = true;
      script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9543225982689860";
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (window.adsbygoogle && document.querySelector(".adsbygoogle")) {
      try {
        window.adsbygoogle.push({});
      } catch (e) {}
    }
  });
  const [audioUrl, setAudioUrl] = useState(null);
  const [processedUrl, setProcessedUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const audioRef = useRef();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setProcessedUrl(null);
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    try {
      if (!audioRef.current) return;
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      // Sessiz kısımları bul ve çıkar
      const threshold = 0.02;
      const minSilenceDuration = 0.3; // saniye
      const sampleRate = audioBuffer.sampleRate;
      const channelData = audioBuffer.getChannelData(0);
      let segments = [];
      let segmentStart = null;
      let silenceStart = null;
      for (let i = 0; i < channelData.length; i++) {
        if (Math.abs(channelData[i]) > threshold) {
          if (segmentStart === null) segmentStart = i;
          silenceStart = null;
        } else {
          if (segmentStart !== null && silenceStart === null) {
            silenceStart = i;
          }
          if (
            segmentStart !== null &&
            silenceStart !== null &&
            (i - silenceStart) / sampleRate > minSilenceDuration
          ) {
            segments.push([segmentStart, silenceStart]);
            segmentStart = null;
            silenceStart = null;
          }
        }
      }
      if (segmentStart !== null) {
        segments.push([segmentStart, channelData.length]);
      }
      // Segmentleri birleştir
      const totalLength = segments.reduce(
        (sum, [start, end]) => sum + (end - start),
        0
      );
      const resultBuffer = audioCtx.createBuffer(
        1,
        totalLength,
        sampleRate
      );
      let offset = 0;
      const resultData = resultBuffer.getChannelData(0);
      const fadeDuration = Math.floor(sampleRate * 0.005); // 5 ms fade
      segments.forEach(([start, end]) => {
        const segLen = end - start;
        const seg = channelData.slice(start, end);
        // Fade in
        for (let i = 0; i < Math.min(fadeDuration, segLen); i++) {
          seg[i] *= i / fadeDuration;
        }
        // Fade out
        for (let i = 0; i < Math.min(fadeDuration, segLen); i++) {
          seg[segLen - 1 - i] *= i / fadeDuration;
        }
        resultData.set(seg, offset);
        offset += segLen;
      });
      // WAV dosyası olarak export et
      function encodeWAV(buffer) {
        const length = buffer.length * 2 + 44;
        const arrayBuffer = new ArrayBuffer(length);
        const view = new DataView(arrayBuffer);
        function writeString(view, offset, string) {
          for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
          }
        }
        let offset = 0;
        writeString(view, offset, "RIFF"); offset += 4;
        view.setUint32(offset, 36 + buffer.length * 2, true); offset += 4;
        writeString(view, offset, "WAVE"); offset += 4;
        writeString(view, offset, "fmt "); offset += 4;
        view.setUint32(offset, 16, true); offset += 4;
        view.setUint16(offset, 1, true); offset += 2;
        view.setUint16(offset, 1, true); offset += 2;
        view.setUint32(offset, sampleRate, true); offset += 4;
        view.setUint32(offset, sampleRate * 2, true); offset += 4;
        view.setUint16(offset, 2, true); offset += 2;
        view.setUint16(offset, 16, true); offset += 2;
        writeString(view, offset, "data"); offset += 4;
        view.setUint32(offset, buffer.length * 2, true); offset += 4;
        for (let i = 0; i < buffer.length; i++, offset += 2) {
          let s = Math.max(-1, Math.min(1, buffer[i]));
          view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }
        return new Blob([arrayBuffer], { type: "audio/wav" });
      }
      const wavBlob = encodeWAV(resultData);
      setProcessedUrl(URL.createObjectURL(wavBlob));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="main-container">
      <div className="card">
        <h2 className="title">🔊 Ses Dosyası Yükle & Kırp</h2>
        {/* ENİ GENİŞ AdSense Reklamı */}
        <div style={{margin:'0 0 18px 0', width:'100%'}}>
          <ins className="adsbygoogle"
            style={{display:'block'}}
            data-ad-client="ca-pub-9543225982689860"
            data-ad-slot="7162891258"
            data-ad-format="auto"
            data-full-width-responsive="true"
          ></ins>
        </div>
        <p className="app-desc">
          Bu uygulama, ses dosyalarındaki sessiz kısımları otomatik olarak tespit edip kırpar. Dosyanı yükle, işleme başla ve temizlenmiş ses dosyanı hemen indir!
        </p>
        <label className="file-label">
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="file-input"
          />
          <span>Dosya Seç</span>
        </label>
        {audioUrl && (
          <div className="audio-section">
            <audio ref={audioRef} src={audioUrl} controls className="audio-player" />
          </div>
        )}
        {audioUrl && (
          <div style={{marginBottom:18, marginTop:8}}>
            {/* Google AdSense Reklamı */}
            <ins className="adsbygoogle"
              style={{display:'block'}}
              data-ad-client="ca-pub-9543225982689860"
              data-ad-slot="3032074556"
              data-ad-format="auto"
              data-full-width-responsive="true"
            ></ins>
          </div>
        )}
        {audioUrl && (
          <>
            <button className="process-btn" onClick={handleProcess} disabled={isProcessing}>
              {isProcessing ? "İşleniyor..." : "Sessiz Kısımları Kırp"}
            </button>
            <button className="reset-btn" onClick={() => {
              setAudioUrl(null);
              setProcessedUrl(null);
              if (audioRef.current) audioRef.current.src = "";
            }} disabled={isProcessing}>
              Sıfırla
            </button>
            {isProcessing && (
              <div className="progress-bar-wrapper">
                <div className="progress-bar">
                  <div className="progress-bar-inner"></div>
                </div>
                <span style={{display:'block',textAlign:'center',color:'#6366f1',marginTop:8,fontWeight:500}}>Ses işleniyor...</span>
              </div>
            )}
          </>
        )}
        {processedUrl && (
          <div className="audio-section">
            <h4>Kırpılmış Ses</h4>
            <audio src={processedUrl} controls className="audio-player" />
            <a href={processedUrl} download="trimmed.wav" className="download-link">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" style={{marginRight:4}}><path fill="currentColor" d="M12 16a1 1 0 0 1-1-1V5a1 1 0 1 1 2 0v10a1 1 0 0 1-1 1Zm4.71-3.71a1 1 0 0 0-1.42 1.42l3.3 3.3a1 1 0 0 1-.71 1.7H6.12a1 1 0 0 1-.7-1.7l3.29-3.3a1 1 0 0 0-1.41-1.42l-3.3 3.3A3 3 0 0 0 6.12 21h11.76a3 3 0 0 0 2.12-5.12l-3.29-3.3Z"/></svg>
              İndir
            </a>
          </div>
        )}
        {/* Dikey Google AdSense Reklamı */}
        <div style={{margin:'32px 0 0 0', width:'100%'}}>
          <ins className="adsbygoogle"
            style={{display:'block'}}
            data-ad-client="ca-pub-9543225982689860"
            data-ad-slot="3742505087"
            data-ad-format="auto"
            data-full-width-responsive="true"
          ></ins>
        </div>
        {/* Autorelaxed Google AdSense Reklamı */}
        <div style={{margin:'18px 0 0 0', width:'100%'}}>
          <ins className="adsbygoogle"
            style={{display:'block'}}
            data-ad-format="autorelaxed"
            data-ad-client="ca-pub-9543225982689860"
            data-ad-slot="1040320121"
          ></ins>
        </div>
      </div>
      <style jsx>{`
        .main-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f7fafc 0%, #e3e8ee 100%);
        }
        .card {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
          padding: 36px 32px 30px 32px;
          max-width: 420px;
          width: 100%;
        }
        .title {
          color: #1e293b;
          font-size: 1.7rem;
          text-align: center;
          margin-bottom: 28px;
          font-weight: 700;
        }
        .file-label {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f1f5f9;
          border-radius: 8px;
          padding: 14px 0;
          cursor: pointer;
          font-weight: 500;
          color: #475569;
          margin-bottom: 20px;
          border: 2px dashed #cbd5e1;
          transition: border 0.2s;
        }
        .file-label:hover {
          border: 2px solid #6366f1;
        }
        .file-input {
          display: none;
        }
        .audio-section {
          margin-bottom: 18px;
          text-align: center;
        }
        .audio-player {
          width: 100%;
          margin-top: 8px;
        }
        .process-btn {
          width: 100%;
          padding: 14px 0;
          background: linear-gradient(90deg, #6366f1 20%, #0ea5e9 100%);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 1.09rem;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 18px;
          box-shadow: 0 2px 8px 0 rgba(14, 165, 233, 0.08);
          transition: background 0.2s;
        }
        .process-btn:hover {
          background: linear-gradient(90deg, #0ea5e9 20%, #6366f1 100%);
        }
        .download-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-top: 14px;
          padding: 12px 28px;
          background: linear-gradient(90deg, #22d3ee 0%, #6366f1 100%);
          color: #fff;
          font-weight: 600;
          border-radius: 999px;
          font-size: 1.08rem;
          text-decoration: none;
          border: none;
          box-shadow: 0 2px 8px 0 rgba(34,211,238,0.13);
          transition: background 0.2s, transform 0.15s;
          gap: 8px;
          cursor: pointer;
        }
        .download-link:hover {
          background: linear-gradient(90deg, #6366f1 0%, #22d3ee 100%);
          transform: translateY(-2px) scale(1.04);
          color: #fff;
          text-decoration: none;
        }
        .reset-btn {
          width: 100%;
          padding: 10px 0;
          background: #f87171;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 1.02rem;
          font-weight: 500;
          cursor: pointer;
          margin-bottom: 8px;
          margin-top: -8px;
          box-shadow: 0 1px 4px 0 rgba(248,113,113,0.10);
          transition: background 0.2s;
        }
        .reset-btn:hover {
          background: #dc2626;
        }
        .app-desc {
          margin: 0 0 18px 0;
          color: #374151;
          background: #f1f5f9;
          padding: 12px 18px;
          border-radius: 8px;
          font-size: 1.05rem;
          text-align: center;
          box-shadow: 0 1px 8px 0 rgba(0,0,0,0.03);
        }
        .progress-bar-wrapper {
          width: 100%;
          margin: 18px 0 0 0;
        }
        .progress-bar {
          width: 100%;
          height: 10px;
          background: #e0e7ff;
          border-radius: 6px;
          overflow: hidden;
          box-shadow: 0 1px 4px 0 rgba(99,102,241,0.07);
        }
        .progress-bar-inner {
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, #6366f1 20%, #0ea5e9 100%);
          animation: progressBarAnim 1.1s linear infinite;
        }
        @keyframes progressBarAnim {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
