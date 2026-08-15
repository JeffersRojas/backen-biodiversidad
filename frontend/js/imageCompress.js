class ImageCompressor {
  static async compressFile(file, maxWidth = 1280, maxHeight = 720, quality = 0.75) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) {
        reject(new Error('Archivo no válido'));
        return;
      }

      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => reject(new Error('Error al cargar imagen'));
        img.onload = () => {
          let { width, height } = img;
          const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          try {
            const webpData = canvas.toDataURL('image/webp', quality);
            resolve({
              dataUrl: webpData,
              sizeKB: Math.round((webpData.length * 0.75) / 1024),
              width,
              height,
              type: 'image/webp'
            });
          } catch (webpErr) {
            const jpegData = canvas.toDataURL('image/jpeg', quality);
            resolve({
              dataUrl: jpegData,
              sizeKB: Math.round((jpegData.length * 0.75) / 1024),
              width,
              height,
              type: 'image/jpeg'
            });
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  static async compressFromDataUrl(dataUrl, maxWidth = 1280, maxHeight = 720, quality = 0.75) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Error al cargar imagen'));
      img.onload = () => {
        let { width, height } = img;
        const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const webpData = canvas.toDataURL('image/webp', quality);
          resolve({
            dataUrl: webpData,
            sizeKB: Math.round((webpData.length * 0.75) / 1024),
            width,
            height,
            type: 'image/webp'
          });
        } catch (e) {
          const jpegData = canvas.toDataURL('image/jpeg', quality);
          resolve({
            dataUrl: jpegData,
            sizeKB: Math.round((jpegData.length * 0.75) / 1024),
            width,
            height,
            type: 'image/jpeg'
          });
        }
      };
      img.src = dataUrl;
    });
  }

  static dataUrlToFile(dataUrl, filename = 'image') {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/webp';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const ext = mime.includes('webp') ? 'webp' : (mime.includes('png') ? 'png' : 'jpg');
    return new File([u8arr], `${filename}.${ext}`, { type: mime });
  }
}
