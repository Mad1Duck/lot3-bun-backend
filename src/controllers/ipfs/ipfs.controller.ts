
import { catchAsync } from "@/utils/catchAsync";
import { htmlToImage } from "@/utils/generateImage";
import fs from 'fs';
import path from "path";
import { pinata } from "@/bin/pinata";
import moment from "moment";
import { hashNumberArray } from "@/utils/randomNumber";

const templatePath = (templateName?: string) => path.join(__dirname, '..', '..', '..', 'public', 'template', `${templateName || 'template1'}.html`);
const outputPath = path.join(__dirname, '..', '..', '..', 'public', 'output.png');

export const generateImage = catchAsync(async (c) => {
  const { ticketNumber, startDate, endDate, template, eventName } = await c.req.parseBody();
  const parseTicketNumber = JSON.parse(ticketNumber as string);

  const baseData = {
    id: hashNumberArray(parseTicketNumber),
    eventName: eventName as string || "",
    ticketNumber: parseTicketNumber,
    enrollDate: moment().format('YYYY-MM-DD'),
    startDate: startDate as string || "",
    endDate: endDate as string || ""
  };

  // generate image
  const imagePath = await htmlToImage(templatePath(template as string), outputPath, baseData);

  const imageBuffer = fs.readFileSync(imagePath);
  const base64String = imageBuffer.toString('base64');

  const upload = await pinata.upload.public.base64(base64String);

  fs.unlinkSync(imagePath);

  const metadata = {
    ...baseData,
    imageCID: upload.cid,
    ticketNumber: parseTicketNumber,
  };

  const uploadedMetadata = await pinata.upload.public.json(metadata);

  return c.json({ cid: uploadedMetadata.cid });
});

export const metadataByCid = catchAsync(async (c) => {
  const { cid } = c.req.param();

  const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
  const data = await response.json();

  return c.json({ data });
});

