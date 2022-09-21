import PDFJS from 'pdfjs-dist';

export default async function getTextFromPdf (source: Buffer): Promise<string> {

  // load the pdf file from the source provided
  const pdf = await PDFJS.getDocument(source).promise;

  // all the pages have to be loaded and then their text grabbed
  // Basically, wait for all the promises loading the pages to be resolved.
  const pages = await Promise.all(Array.from({ length: pdf.numPages }, (_, i) => pdf.getPage(i + 1)));

  // loop over all the pages and grab their text content
  const pageText = await Promise.all(pages.map(page => page.getTextContent()));

  // finally, we can join all of the text together and return it. 
  // Because pageText is made up of TextContents, not actually just strings, we need to map stuff out
  // @ts-ignore
  return pageText.map(({ items }) => items.map(({ str }) => str).join("")).join("");

}