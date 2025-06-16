import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { isArray } from "lodash";

export interface metadata {
  ticketNumber: number[],
  enrollDate: string,
}

export async function htmlToImage(templatePath: string, outputPath = "output.png", metadata: metadata) {
  try {
    const dir = path.dirname(outputPath);


    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Folder created: ${dir}`);
    }

    let template = fs.readFileSync(templatePath, "utf8");

    for (const [key, value] of Object.entries(metadata)) {
      const regex = new RegExp(`{{${key}}}`, "g");
      template = template.replace(regex, isArray(value) ? value.join("") : value);
    }

    metadata.ticketNumber.map((value, index) => {
      const regex = new RegExp(`{{num${index}}}`, "g");
      template = template.replace(regex, String(value));
    });

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    await page.setViewport({ width: 400, height: 200 });

    await page.setContent(template, { waitUntil: "networkidle0" });
    await page.waitForSelector('#ticket');
    const ticketElement = await page.$('#ticket');
    await ticketElement?.screenshot({ path: outputPath as `${string}.png` });

    await browser.close();

    console.log(`File created at: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error("Error during convertHtmlToImage:", error);
    throw error;
  }
}

export async function svgManipulator(
  templatePath: string,
  outputPath = "output/output.png",
  metadata: metadata
) {
  try {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Folder created: ${dir}`);
    }

    // Load template
    let template = fs.readFileSync(templatePath, "utf8");

    // Replace metadata placeholders {{key}}
    for (const [key, value] of Object.entries(metadata)) {
      const regex = new RegExp(`{{${key}}}`, "g");
      template = template.replace(regex, isArray(value) ? value.join("") : String(value));
    }

    // Replace ticketNumber placeholders {{num0}}, {{num1}}, ...
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

    // Load template content as page HTML
    await page.setContent(template, { waitUntil: "networkidle0" });
    await page.waitForSelector('#ticket');

    // Screenshot #ticket element only
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

