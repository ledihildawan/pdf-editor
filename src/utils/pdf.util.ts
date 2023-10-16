import { noop } from './helper.util';
import { readAsArrayBuffer } from './async-reader.util';

export async function save(pdfFile: any, objects: any, name: any) {
  const PDFLib: any = (window as any).PDFLib;
  const download: any = (window as any).download;
  const makeTextPDF: any = (window as any).makeTextPDF;

  let pdfDoc: any = null;

  try {
    pdfDoc = await PDFLib.PDFDocument.load(await readAsArrayBuffer(pdfFile));
  } catch (e) {
    console.log('Failed to load PDF.');
    throw e;
  }

  const pagesProcesses = pdfDoc
    .getPages()
    .map(async (page: any, pageIndex: number) => {
      const pageHeight = page.getHeight();
      const pageObjects = objects[pageIndex];
      const embedProcesses = pageObjects.map(
        async (object: any): Promise<any> => {
          if (object.type === 'image') {
            let { file, x, y, width, height } = object;
            let img: any = null;

            try {
              if (file.type === 'image/jpeg') {
                img = await pdfDoc.embedJpg(await readAsArrayBuffer(file));
              } else {
                img = await pdfDoc.embedPng(await readAsArrayBuffer(file));
              }
              return () =>
                page.drawImage(img, {
                  x,
                  y: pageHeight - y - height,
                  width,
                  height,
                });
            } catch (e) {
              console.log('Failed to embed image.', e);
              return noop;
            }
          } else if (object.type === 'text') {
            // let { x, y, lines, lineHeight, size, fontFamily, width } = object;
            // const height = size * lineHeight * lines.length;
            // const font = await fetchFont(fontFamily);
            // const [textPage] = await pdfDoc.embedPdf(
            //   await makeTextPDF({
            //     lines,
            //     fontSize: size,
            //     lineHeight,
            //     width,
            //     height,
            //     font: font.buffer || fontFamily, // built-in font family
            //     dy: font.correction(size, lineHeight),
            //   })
            // );
            // return () =>
            //   page.drawPage(textPage, {
            //     width,
            //     height,
            //     x,
            //     y: pageHeight - y - height,
            //   });
          } else if (object.type === 'drawing') {
            let { x, y, path, scale } = object;
            const {
              pushGraphicsState,
              setLineCap,
              popGraphicsState,
              setLineJoin,
              LineCapStyle,
              LineJoinStyle,
            } = PDFLib;
            return () => {
              page.pushOperators(
                pushGraphicsState(),
                setLineCap(LineCapStyle.Round),
                setLineJoin(LineJoinStyle.Round)
              );
              page.drawSvgPath(path, {
                borderWidth: 5,
                scale,
                x,
                y: pageHeight - y,
              });
              page.pushOperators(popGraphicsState());
            };
          }
        }
      );

      const drawProcesses = await Promise.all(embedProcesses);
      drawProcesses.forEach((p) => p());
    });

  await Promise.all(pagesProcesses);

  try {
    const pdfBytes = await pdfDoc.save();

    console.log(pdfBytes);

    download(pdfBytes, name, 'application/pdf');

    return pdfBytes;
  } catch (e) {
    console.log('Failed to save PDF.');
    throw e;
  }
}
