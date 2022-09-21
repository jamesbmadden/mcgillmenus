/**
 * This is a series of functions that provide the infrastructure for loading the dining hall menus by making use of 
 * puppeteer to load the website, grab the text content of the PDF files, and output it.
 */
import puppeteer from 'puppeteer';
import getTextFromPdf from './pdf';

export default async function loadMenus () {

  // load a browser instance
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const nrh = await loadMenuText(page, 'nrh');

  // make sure to shut down the browser
  await browser.close();

  return nrh;

}

/**
 * Open the pdf for the dining hall's menu, and copy all the text for further processing
 * 
 * @param res The code included in the url for the dining hall we're looking at
 * @returns A promise resolving to the text content of the pdf
 */
export async function loadMenuText (page: puppeteer.Page, res: string): Promise<string> {
 
   // navigate to the webstie
   await page.goto('https://www.mcgill.ca/foodservices/locations/dining-hall-menus');
 
   // grab the href attribute for the button so we can fetch that pdf
   const url = await page.$eval(`.button--outline[href*=${res}]`, element => element.getAttribute('href'));


   // if url is null, throw
   if (url === null) throw "Couldn't get the URL for " + res;
 
   // download the pdf using the node fetch api
   // @ts-ignore
   const pdf = await (await fetch(new URL("https:" + url))).blob();

   // use pdfjs to read the text
 
   // return the image to the user
   return getTextFromPdf(Buffer.from(await pdf.arrayBuffer()));
 
 }