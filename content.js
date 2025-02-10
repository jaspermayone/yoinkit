(() => {
  const existingOverlay = document.querySelector('.media-extractor-overlay');
  if (existingOverlay) {
    existingOverlay.remove();
    return;
  }

  const images = Array.from(document.getElementsByTagName('img'));
  const videos = Array.from(document.getElementsByTagName('video'));
  const videoSources = Array.from(document.getElementsByTagName('source'));
  const iframes = Array.from(document.getElementsByTagName('iframe'));
  const audioElements = Array.from(document.getElementsByTagName('audio'));

  const container = document.createElement('div');
  container.className = 'media-extractor-overlay';
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.9);
    overflow: auto;
    padding: 20px;
    z-index: 999999;
  `;

  const grid = document.createElement('div');
  grid.style.cssText = `
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  `;

  const createDownloadButton = (url, type) => {
    const btn = document.createElement('button');
    btn.textContent = 'Download';
    btn.style.cssText = `
      background: #4CAF50;
      color: white;
      padding: 5px 10px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      width: 100%;
      margin-top: 5px;
    `;

    btn.onclick = async () => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = url.split('/').pop() || `media.${type}`;
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
      } catch (error) {
        console.error('Failed to download:', error);
      }
    };
    return btn;
  };

  // Process images
  images.forEach(img => {
    if (img.src && !img.src.startsWith('data:')) {
      const wrapper = document.createElement('div');
      wrapper.style.cssText = `
        background: white;
        padding: 10px;
        border-radius: 4px;
      `;

      const clone = document.createElement('img');
      clone.src = img.src;
      clone.style.width = '100%';

      const info = document.createElement('div');
      info.style.cssText = 'margin: 10px 0; font-size: 12px;';
      info.innerHTML = `
        <div>Type: Image</div>
        <div>Size: ${img.naturalWidth}×${img.naturalHeight}</div>
        <div style="word-break: break-all;">URL: ${img.src}</div>
      `;

      wrapper.append(clone, info, createDownloadButton(img.src, 'jpg'));
      grid.appendChild(wrapper);
    }
  });

  // Process videos and video sources
  const processedUrls = new Set();

  [...videos, ...videoSources].forEach(video => {
    const url = video.src || video.currentSrc;
    if (url && !processedUrls.has(url) && !url.startsWith('data:')) {
      processedUrls.add(url);

      const wrapper = document.createElement('div');
      wrapper.style.cssText = `
        background: white;
        padding: 10px;
        border-radius: 4px;
      `;

      const videoEl = document.createElement('video');
      videoEl.src = url;
      videoEl.controls = true;
      videoEl.style.width = '100%';

      const info = document.createElement('div');
      info.style.cssText = 'margin: 10px 0; font-size: 12px;';
      info.innerHTML = `
        <div>Type: Video</div>
        <div style="word-break: break-all;">URL: ${url}</div>
      `;

      wrapper.append(videoEl, info, createDownloadButton(url, 'mp4'));
      grid.appendChild(wrapper);
    }
  });

  // Process audio elements
  audioElements.forEach(audio => {
    if (audio.src && !audio.src.startsWith('data:')) {
      const wrapper = document.createElement('div');
      wrapper.style.cssText = `
        background: white;
        padding: 10px;
        border-radius: 4px;
      `;

      const audioEl = document.createElement('audio');
      audioEl.src = audio.src;
      audioEl.controls = true;
      audioEl.style.width = '100%';

      const info = document.createElement('div');
      info.style.cssText = 'margin: 10px 0; font-size: 12px;';
      info.innerHTML = `
        <div>Type: Audio</div>
        <div style="word-break: break-all;">URL: ${audio.src}</div>
      `;

      wrapper.append(audioEl, info, createDownloadButton(audio.src, 'mp3'));
      grid.appendChild(wrapper);
    }
  });

  // Process iframes
  iframes.forEach(iframe => {
    if (iframe.src && !iframe.src.startsWith('data:')) {
      const wrapper = document.createElement('div');
      wrapper.style.cssText = `
        background: white;
        padding: 10px;
        border-radius: 4px;
      `;

      const info = document.createElement('div');
      info.style.cssText = 'margin: 10px 0; font-size: 12px;';
      info.innerHTML = `
        <div>Type: Embedded Content</div>
        <div style="word-break: break-all;">URL: ${iframe.src}</div>
      `;

      const embedPreview = document.createElement('iframe');
      embedPreview.src = iframe.src;
      embedPreview.style.width = '100%';
      embedPreview.style.height = '150px';
      embedPreview.style.border = 'none';

      wrapper.append(embedPreview, info);
      grid.appendChild(wrapper);
    }
  });

  container.appendChild(grid);

  // Add stats at the top
  const stats = document.createElement('div');
  stats.style.cssText = `
    color: white;
    margin-bottom: 20px;
    font-size: 16px;
  `;
  stats.innerHTML = `
    Found:
    ${images.length} images,
    ${videos.length + videoSources.length} videos,
    ${audioElements.length} audio files,
    ${iframes.length} embedded content
  `;
  container.insertBefore(stats, grid);

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    z-index: 9999999;
  `;
  closeBtn.onclick = () => container.remove();
  container.appendChild(closeBtn);
  document.body.appendChild(container);
})();