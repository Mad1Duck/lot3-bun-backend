
import { catchAsync } from "@/utils/catchAsync";
import { htmlToImage } from "@/utils/generateImage";
import fs from 'fs';
import path from "path";
import { pinata } from "@/bin/pinata";
import moment from "moment";

const templatePath = path.join(__dirname, '..', '..', '..', 'public', 'template', 'template.html');

const outputPath = path.join(__dirname, '..', '..', '..', 'public', 'output.png');

export const generateImage = catchAsync(async (c) => {
  const { ticketNumber } = await c.req.parseBody();
  const parseTicketNumber = JSON.parse(ticketNumber as string);

  // generate image
  const imagePath = await htmlToImage(templatePath, outputPath, {
    ticketNumber: parseTicketNumber,
    enrollDate: moment().format('YYYY-MM-DD'),
  });

  const imageBuffer = fs.readFileSync(imagePath);
  const base64String = imageBuffer.toString('base64');

  const upload = await pinata.upload.public.base64(base64String);

  fs.unlinkSync(imagePath);

  const metadata = {
    imageCID: upload.cid,
    ticketNumber: parseTicketNumber,
  };

  const uploadedMetadata = await pinata.upload.public.json(metadata);

  return c.json({ cid: uploadedMetadata.cid });
});

export const metadataByCid = catchAsync(async (c) => {
  const { cid } = c.req.param();

  const response = await pinata.files.public.get(cid) as any;
  const buffer = await response?.arrayBuffer();
  const jsonString = Buffer.from(buffer).toString('utf-8');
  const data = JSON.parse(jsonString);
});

