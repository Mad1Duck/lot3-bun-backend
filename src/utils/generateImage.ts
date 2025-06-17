import puppeteer, { Browser } from "puppeteer";
import fs from "fs";
import path from "path";
import { isArray } from "lodash";

export interface Metadata {
  ticketNumber: number[],
  enrollDate: string,
}

let browser: Browser;
export async function htmlToImage(templatePath: string, outputPath = "output.png", metadata: Metadata) {
  try {
    const dir = path.dirname(outputPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Folder created: ${dir}`);
    }

    let template = fs.readFileSync(templatePath, "utf8");

    // Penggantian metadata umum
    for (const [key, value] of Object.entries(metadata)) {
      const regex = new RegExp(`{{${key}}}`, "g");
      // Gunakan Array.isArray dari JavaScript bawaan
      template = template.replace(regex, Array.isArray(value) ? value.join("") : String(value));
    }

    // Penggantian ticketNumber spesifik
    if (metadata.ticketNumber && Array.isArray(metadata.ticketNumber)) {
      metadata.ticketNumber.map((value: any, index: number) => {
        const regex = new RegExp(`{{num${index}}}`, "g");
        template = template.replace(regex, String(value));
      });
    }


    browser = await puppeteer.launch({
      headless: true, // Gunakan 'new' jika Puppeteer v22+
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage', // Seringkali membantu di lingkungan Docker/minimal RAM
        '--disable-gpu' // Untuk lingkungan tanpa GPU fisik
      ],
      // executablePath: '/usr/bin/google-chrome' // Opsional: jika Chrome tidak ditemukan otomatis
    });

    const page = await browser.newPage();

    await page.setViewport({ width: 400, height: 200 });

    await page.setContent(template, { waitUntil: "networkidle0" }); // networkidle0 cukup baik

    // Tambahkan timeout untuk mencegah hang jika selector tidak ditemukan
    await page.waitForSelector('#ticket', { timeout: 10000 });
    const ticketElement = await page.$('#ticket');

    if (ticketElement) { // Pastikan elemen ditemukan sebelum screenshot
      await ticketElement.screenshot({ path: outputPath });
      console.log(`File created at: ${outputPath}`);
      return outputPath;
    } else {
      throw new Error("Element #ticket not found on the page.");
    }

  } catch (error) {
    console.error("Error during convertHtmlToImage:", error);
    // Lebih detail untuk debugging
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw error;
  } finally {
    // Pastikan browser ditutup bahkan jika ada error
    if (browser) {
      await browser.close();
    }
  }
}
export async function svgManipulator(
  templatePath: string,
  outputPath = "output/output.png",
  metadata: Metadata
) {
  try {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Folder created: ${dir}`);
    }

    let template = fs.readFileSync(templatePath, "utf8");

    for (const [key, value] of Object.entries(metadata)) {
      const regex = new RegExp(`{{${key}}}`, "g");
      template = template.replace(regex, isArray(value) ? value.join("") : String(value));
    }

    if (Array.isArray(metadata.ticketNumber)) {
      metadata.ticketNumber.forEach((value, index) => {
        const regex = new RegExp(`{{num${index}}}`, "g");
        template = template.replace(regex, String(value));
      });
    }

    const browser = await puppeteer.launch({
      headless: "shell",
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 400, height: 200 });

    await page.setContent(template, { waitUntil: "networkidle0" });
    await page.waitForSelector('#ticket');

    const ticketElement = await page.$('#ticket');
    if (!ticketElement) {
      throw new Error('Ticket element not found in template');
    }
    await ticketElement.screenshot({ path: outputPath as any });

    await browser.close();

    console.log(`File created at: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error("Error during convertHtmlToImage:", error);
    throw error;
  }
}

