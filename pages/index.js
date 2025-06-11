import { useRef, useState } from "react";

export default function Home() {
  const [audioUrl, setAudioUrl] = useState(null);
  const [processedUrl, setProcessedUrl] = useState(null);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setProcessedUrl(null);
  };

  const handleProcess = async () => {
    if (!audioRef.current) return;
    setProgress(0.01);
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
    for (let idx = 0; idx < segments.length; idx++) {
      const [start, end] = segments[idx];
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
      setProgress((idx + 1) / segments.length);
    }
    setProgress(1);
    // WAV dosyası olarak export et
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
  };

  return (
    <div className="layout-root">
      <header className="ad-header">
  <div className="ad-box">
    <span className="ad-title">Reklam</span>
    {/* Google AdSense örneği */}
    <ins className="adsbygoogle"
      style={{ display: 'block', textAlign: 'center' }}
      data-ad-client="ca-pub-9543225982689860"
      data-ad-slot="1234567890"
      data-ad-format="auto"
      data-full-width-responsive="true"></ins>
  </div>
</header>
      <div className="layout-center">
        <aside className="ad-side ad-left">
  <div className="ad-box">
    <span className="ad-title">Reklam</span>
    <ins className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client="ca-pub-9543225982689860"
      data-ad-slot="1234567891"
      data-ad-format="rectangle"
      data-full-width-responsive="true"></ins>
  </div>
</aside>
        <main className="main-center">
          <div className="card">
            <h2 className="title">🔊 Ses Dosyası Yükle & Kırp</h2>
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
              <>
                <button className="process-btn" onClick={handleProcess}>
                  Sessiz Kısımları Kırp
                </button>
                <button className="reset-btn" onClick={() => {
                  setAudioUrl(null);
                  setProcessedUrl(null);
                  setProgress(0);
                  if (audioRef.current) audioRef.current.src = "";
                }}>
                  Sıfırla
                </button>
                {progress > 0 && progress < 1 && (
                  <div className="progress-bar-wrap">
                    <div className="progress-bar" style={{width: `${Math.round(progress*100)}%`}} />
                    <span className="progress-label">Kırpılıyor... %{Math.round(progress*100)}</span>
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
          </div>
        </main>
        <aside className="ad-side ad-right">
  <div className="ad-box">
    <span className="ad-title">Reklam</span>
    <ins className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client="ca-pub-9543225982689860"
      data-ad-slot="1234567892"
      data-ad-format="rectangle"
      data-full-width-responsive="true"></ins>
  </div>
</aside>
      </div>
      <footer className="ad-footer">
  <div className="ad-box">
    <span className="ad-title">Reklam</span>
    <ins className="adsbygoogle"
      style={{ display: 'block', textAlign: 'center' }}
      data-ad-client="ca-pub-9543225982689860"
      data-ad-slot="1234567893"
      data-ad-format="auto"
      data-full-width-responsive="true"></ins>
  </div>
</footer>
      <style jsx>{`
        .layout-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, #f7fafc 0%, #e3e8ee 100%);
        }
        .ad-header {
          height: 120px;
          background: #fffbe0;
          color: #b45309;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          font-weight: 600;
          border-bottom: 2px solid #fde68a;
        }
        .layout-center {
          display: flex;
          flex: 1;
          min-height: 0;
        }
        .ad-side {
          width: 300px;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          font-size: 1.05rem;
          font-weight: 500;
          border-left: 1px solid #e5e7eb;
          border-right: 1px solid #e5e7eb;
        }
        .ad-left {
          border-left: none;
        }
        .ad-right {
          border-right: none;
        }
        .main-center {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 0;
        }
        .ad-footer {
        
          height: 90px;
          background: #fffbe0;
          color: #b45309;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.05rem;
          font-weight: 600;
          border-top: 2px solid #fde68a;
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
        .progress-bar-wrap {
          width: 100%;
          margin: 14px 0 0 0;
          background: #f1f5f9;
          border-radius: 6px;
          position: relative;
          height: 28px;
          display: flex;
          align-items: center;
        }
        .progress-bar {
          background: linear-gradient(90deg, #6366f1 0%, #22d3ee 100%);
          height: 100%;
          border-radius: 6px;
          transition: width 0.2s;
        }
        .progress-label {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          font-size: 1rem;
          color: #334155;
          font-weight: 600;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
