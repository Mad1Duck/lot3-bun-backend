import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { isArray } from "lodash";

export interface Metadata {
  ticketNumber: number[],
  enrollDate: string,
}

async function safeBrowserClose(browser: any, timeout = 5000) {
  if (!browser) return;
  await Promise.race([
    browser.close(),
    new Promise((_, reject) => setTimeout(() => reject(new Error('browser.close() timeout')), timeout)),
  ]);
}

export async function htmlToImage(templatePath: string, outputPath = "output.png", metadata: Metadata) {
  let browser;
  try {
    // Baca template file HTML
    let template = fs.readFileSync(templatePath, "utf8");

    // Replace metadata {{key}}
    for (const [key, value] of Object.entries(metadata)) {
      const regex = new RegExp(`{{${key}}}`, "g");
      template = template.replace(regex, isArray(value) ? value.join("") : value);
    }

    // Replace {{num0}}, {{num1}}, dst kalau ada ticketNumber array
    if (metadata.ticketNumber) {
      metadata.ticketNumber.forEach((value: any, index: any) => {
        const regex = new RegExp(`{{num${index}}}`, "g");
        template = template.replace(regex, String(value));
      });
    }

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 800, height: 600 });

    // Masukkan HTML hasil replace ke page
    await page.setContent(template, { waitUntil: 'networkidle0' });

    // Tunggu elemen #ticket muncul
    await page.waitForSelector('#ticket', { timeout: 5000 });

    const ticketElement = await page.$('#ticket');
    if (!ticketElement) {
      throw new Error("Element #ticket not found.");
    }

    const boundingBox = await ticketElement.boundingBox();
    console.log("BoundingBox:", boundingBox);
    if (!boundingBox) {
      throw new Error("#ticket element invisible / no bounding box.");
    }

    // Pastikan folder output ada
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Screenshot element
    await ticketElement.screenshot({ path: outputPath as `${string}.png` });

    console.log(`Screenshot saved at: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error("Error in htmlToImage:", error);
    throw error;
  } finally {
    if (browser) {
      try {
        const pages = await browser.pages();
        await Promise.all(pages.map((page) => page.close()));

        await Promise.race([
          browser.close(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout saat menutup browser')), 5000)
          ),
        ]);
      } catch (error) {
        console.error("Error saat menutup browser:", error);
      }
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

