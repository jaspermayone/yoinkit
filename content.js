(() => {
  // Helper function to get appropriate file extension
  const getFileExtension = (contentType, fallbackType) => {
    // Map of content types to file extensions
    const extensionMap = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/svg+xml': 'svg',
      'video/mp4': 'mp4',
      'video/webm': 'webm',
      'video/ogg': 'ogv',
      'audio/mpeg': 'mp3',
      'audio/ogg': 'ogg',
      'audio/wav': 'wav',
      'audio/webm': 'webm'
    };
    
    // Try to get extension from content type
    if (contentType && extensionMap[contentType]) {
      return extensionMap[contentType];
    }
    
    // Fall back to the type parameter or generic extension
    return fallbackType || 'bin';
  };

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

  // Create modern UI container
  const container = document.createElement('div');
  container.className = 'media-extractor-overlay';
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(15, 23, 42, 0.95);
    overflow: auto;
    padding: 20px;
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #e2e8f0;
  `;

  const grid = document.createElement('div');
  grid.style.cssText = `
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
    max-width: 1200px;
    margin: 0 auto;
  `;

  const createDownloadButton = (url, type) => {
    const btn = document.createElement('button');
    btn.textContent = 'Download';
    btn.style.cssText = `
      background: #3b82f6;
      color: white;
      padding: 8px 12px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      width: 100%;
      margin-top: 8px;
      font-weight: 500;
      font-size: 14px;
      transition: background 0.2s ease;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    `;
    
    btn.onmouseover = () => {
      btn.style.background = '#2563eb';
    };
    
    btn.onmouseout = () => {
      btn.style.background = '#3b82f6';
    };

    btn.onclick = async () => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        
        // Better filename handling
        let filename = url.split('/').pop().split('?')[0] || `media`;
        
        // Ensure proper file extension based on content type
        const contentType = blob.type;
        const fileExt = getFileExtension(contentType, type);
        
        // If filename doesn't already have the correct extension, add it
        if (!filename.toLowerCase().endsWith(`.${fileExt.toLowerCase()}`)) {
          filename = `${filename}.${fileExt}`;
        }
        
        // Limit filename length to something reasonable
        if (filename.length > 50) {
          filename = filename.substring(0, 46) + '.' + fileExt;
        }
        
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
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
        background: rgba(255, 255, 255, 0.05);
        padding: 16px;
        border-radius: 8px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      `;
      
      wrapper.onmouseover = () => {
        wrapper.style.transform = 'translateY(-2px)';
        wrapper.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
      };
      
      wrapper.onmouseout = () => {
        wrapper.style.transform = 'translateY(0)';
        wrapper.style.boxShadow = 'none';
      };

      const clone = document.createElement('img');
      clone.src = img.src;
      clone.style.width = '100%';
      clone.style.borderRadius = '4px';
      clone.style.objectFit = 'cover';
      clone.style.height = '180px';

      const info = document.createElement('div');
      info.style.cssText = 'margin: 12px 0; font-size: 13px; color: #e2e8f0;';
      info.innerHTML = `
        <div style="margin-bottom: 5px; font-weight: 500; color: #f8fafc;">📷 Image · ${img.naturalWidth}×${img.naturalHeight}</div>
        <div style="opacity: 0.7; font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${img.src}</div>
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
        background: rgba(255, 255, 255, 0.05);
        padding: 16px;
        border-radius: 8px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      `;
      
      wrapper.onmouseover = () => {
        wrapper.style.transform = 'translateY(-2px)';
        wrapper.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
      };
      
      wrapper.onmouseout = () => {
        wrapper.style.transform = 'translateY(0)';
        wrapper.style.boxShadow = 'none';
      };

      const videoEl = document.createElement('video');
      videoEl.src = url;
      videoEl.controls = true;
      videoEl.style.width = '100%';
      videoEl.style.borderRadius = '4px';
      videoEl.style.background = '#000';

      const info = document.createElement('div');
      info.style.cssText = 'margin: 12px 0; font-size: 13px; color: #e2e8f0;';
      info.innerHTML = `
        <div style="margin-bottom: 5px; font-weight: 500; color: #f8fafc;">🎬 Video</div>
        <div style="opacity: 0.7; font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${url}</div>
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
        background: rgba(255, 255, 255, 0.05);
        padding: 16px;
        border-radius: 8px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      `;
      
      wrapper.onmouseover = () => {
        wrapper.style.transform = 'translateY(-2px)';
        wrapper.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
      };
      
      wrapper.onmouseout = () => {
        wrapper.style.transform = 'translateY(0)';
        wrapper.style.boxShadow = 'none';
      };

      // Audio visualization placeholder
      const visualPlaceholder = document.createElement('div');
      visualPlaceholder.style.cssText = `
        background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
        height: 80px;
        border-radius: 4px;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      
      visualPlaceholder.innerHTML = `<div style="color: white; font-size: 24px;">🎵</div>`;

      const audioEl = document.createElement('audio');
      audioEl.src = audio.src;
      audioEl.controls = true;
      audioEl.style.width = '100%';
      audioEl.style.marginTop = '8px';

      const info = document.createElement('div');
      info.style.cssText = 'margin: 12px 0; font-size: 13px; color: #e2e8f0;';
      info.innerHTML = `
        <div style="margin-bottom: 5px; font-weight: 500; color: #f8fafc;">🎵 Audio</div>
        <div style="opacity: 0.7; font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${audio.src}</div>
      `;

      wrapper.append(visualPlaceholder, audioEl, info, createDownloadButton(audio.src, 'mp3'));
      grid.appendChild(wrapper);
    }
  });

  // Process iframes
  iframes.forEach(iframe => {
    if (iframe.src && !iframe.src.startsWith('data:')) {
      const wrapper = document.createElement('div');
      wrapper.style.cssText = `
        background: rgba(255, 255, 255, 0.05);
        padding: 16px;
        border-radius: 8px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      `;
      
      wrapper.onmouseover = () => {
        wrapper.style.transform = 'translateY(-2px)';
        wrapper.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
      };
      
      wrapper.onmouseout = () => {
        wrapper.style.transform = 'translateY(0)';
        wrapper.style.boxShadow = 'none';
      };

      const info = document.createElement('div');
      info.style.cssText = 'margin: 12px 0; font-size: 13px; color: #e2e8f0;';
      info.innerHTML = `
        <div style="margin-bottom: 5px; font-weight: 500; color: #f8fafc;">🔗 Embedded Content</div>
        <div style="opacity: 0.7; font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${iframe.src}</div>
      `;

      const embedPreview = document.createElement('iframe');
      embedPreview.src = iframe.src;
      embedPreview.style.width = '100%';
      embedPreview.style.height = '180px';
      embedPreview.style.border = 'none';
      embedPreview.style.borderRadius = '4px';
      embedPreview.style.background = '#0f172a';

      wrapper.append(embedPreview, info);
      grid.appendChild(wrapper);
    }
  });

  container.appendChild(grid);

  // Add header with stats and title
  const header = document.createElement('header');
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    max-width: 1200px;
    margin: 0 auto 24px auto;
  `;
  
  // Title
  const title = document.createElement('div');
  title.style.cssText = `
    font-size: 20px;
    font-weight: 600;
    color: #f8fafc;
  `;
  title.innerHTML = `YoinkIt Media Extractor`;
  
  // Stats
  const stats = document.createElement('div');
  stats.style.cssText = `
    color: #94a3b8;
    font-size: 14px;
    display: flex;
    gap: 16px;
  `;
  
  const totalItems = images.length + videos.length + videoSources.length + audioElements.length + iframes.length;
  
  stats.innerHTML = `
    <div>📷 ${images.length}</div>
    <div>🎬 ${videos.length + videoSources.length}</div>
    <div>🎵 ${audioElements.length}</div>
    <div>🔗 ${iframes.length}</div>
    <div style="color: #f8fafc; font-weight: 500;">${totalItems} Total</div>
  `;
  
  header.appendChild(title);
  header.appendChild(stats);
  container.insertBefore(header, grid);

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
  closeBtn.style.cssText = `
    position: fixed;
    top: 16px;
    right: 16px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 9999999;
    transition: background-color 0.2s ease;
  `;
  
  closeBtn.onmouseover = () => {
    closeBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
  };
  
  closeBtn.onmouseout = () => {
    closeBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
  };
  closeBtn.onclick = () => container.remove();
  container.appendChild(closeBtn);
  document.body.appendChild(container);
})();