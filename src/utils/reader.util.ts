import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

GlobalWorkerOptions.workerSrc =
  '//unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.js';

export function readAsArrayBuffer(file: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;

    reader.readAsArrayBuffer(file);
  });
}

export function readAsImage(src: any): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = reject;

    if (src instanceof Blob) {
      const url = window.URL.createObjectURL(src);

      img.src = url;
    } else {
      img.src = src;
    }
  });
}

export function readAsDataURL(file: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}

export async function readAsPDF(file: any) {
  const blob = new Blob([file]);
  const url = window.URL.createObjectURL(blob);

  return getDocument(url).promise;
}
