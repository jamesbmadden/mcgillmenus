/**
 * This is a series of functions that provide the infrastructure for loading the dining hall menus by making use of 
 * puppeteer to load the website, grab the text content of the PDF files, and output it.
 */
import puppeteer from 'puppeteer';
import getTextFromPdf from './pdf';

/**
 * The structure of data that loadMenus will return
 */
interface Menu {
  dinner: string[],
  breakfast?: string[],
  lunch?: string[],
  soup?: string[],
  sandwich?: string[],
  shawarma?: string[]
}

/**
 * Create an instance of puppeteer to grab all the menus and return their content
 * @returns 
 */
export default async function loadMenus () {

  // load a browser instance
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const nrh = await loadMenuText(page, 'nrh');

  // make sure to shut down the browser
  await browser.close();

  return parseMenuText(nrh, 'nrh');

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
  return getTextFromPdf(Buffer.from(await pdf.arrayBuffer()));
 
}


export function parseMenuText (text: string, res: string): Menu[] {

  switch (res) {
    case 'nrh': return parseNrhMenuText(text);

    default: return [];
  }

}

/**
 * Take the text loaded from the pdf, and parse it into a format understood by the templating
 * @param text 
 */
export function parseNrhMenuText (text: string): Menu[] {

  // run for monday through friday
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const menus = days.map((day, i) => {
    // if today is saturday, ignore it, it's just here for consistent behaviour
    if (day === 'SATURDAY') return;
    // split to look just at this section
    const thisDayText = text.split(day)[1].split(days[i+ 1])[0];

    // let's grab dinner
    const dinners = thisDayText.split("DINNER")[1]
      .split("SPECIALS")[0]
      .split("L E G E N D")[0]
      .split("forGRILL ITEMS SANDWICHES")[0]
      // finally, split into the individual items
      .split(/(?<=[a-z])(?=[A-Z])/);

    return { dinners };
  });
  
  return menus;

}