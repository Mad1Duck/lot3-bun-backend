import { ipfs, ipfsHost } from "@/bin/ipfs";
import { catchAsync } from "@/utils/catchAsync";
import { htmlToImage } from "@/utils/generateImage";
import fs from 'fs';
import path from "path";
import { ethers } from 'ethers';
import { ERC721Config } from '@/bin/config';
import abi from "@/bin/abi/LotteryTicket.json";
import { pinata } from "@/bin/pinata";
import moment from "moment";


const templatePath = path.join(__dirname, '..', '..', '..', 'public', 'template', 'template.html');

const outputPath = path.join(__dirname, '..', '..', '..', 'public', 'output.png');

export const generateImage = catchAsync(async (c) => {
  const { ticketNumber } = await c.req.parseBody();
  const parseTicketNumber = JSON.parse(ticketNumber as string);

  // generate image
  console.log("-----startConvert-----");

  const imagePath = await htmlToImage(templatePath, outputPath, {
    ticketNumber: parseTicketNumber,
    enrollDate: moment().format('YYYY-MM-DD'),
  });
  console.log(imagePath, '-----imagePath-----');

  console.log("-----buffer-----");
  const imageBuffer = fs.readFileSync(imagePath);
  console.log("-----base64-----");
  const base64String = imageBuffer.toString('base64');
  console.log("-----endConvert-----");

  // uplaod image ipfs
  console.log("-----startPinata-----");
  const upload = await pinata.upload.public.base64(base64String);
  console.log("-----endPinata-----");

  fs.unlinkSync(imagePath);

  // upload ipfs metadata
  const metadata = {
    imageCID: upload.cid,
    ticketNumber: parseTicketNumber,
  };

  const uploadedMetadata = await ipfs.add(JSON.stringify(metadata));



  return c.json({ cid: uploadedMetadata.path });

  return c.body(imageBuffer, 200, {
    'Content-Type': 'image/png',
    'Content-Disposition': 'inline; filename="result.png"'
  });
});

export const mintTicket = catchAsync(async (c) => {
  const resultPath = await htmlToImage(templatePath, outputPath, {
    ticketNumber: [7, 14, 21, 28, 35, 42],
    enrollDate: moment().format('YYYY-MM-DD'),
  });
  const imageBuffer = fs.readFileSync(resultPath);
  // const fileStream = fs.createReadStream(resultPath);
  const base64String = imageBuffer.toString('base64');
  const upload = await pinata.upload.public.base64(base64String);

  // upload metadata ke IPFS
  // const result = await ipfs.add(imageBuffer);
  // const imageUri = `${result.path}`;
  fs.unlinkSync(resultPath);


  // mint nft
  // const provider = new ethers.JsonRpcProvider(ERC721Config.rpcURL);
  // const wallet = new ethers.Wallet(ERC721Config.privateKey, provider);
  // const contract = new ethers.Contract(ERC721Config.contractAddress, abi, wallet);

  const startDate = Math.floor(Date.now() / 1000);
  const endDate = startDate + 86400;

  // const tx = await contract.mintTicket(9999, imageUri, startDate, endDate);
  // await tx.wait();
  // const texHash = tx.hash;
  // return c.json({ imageUri: `${ipfsHost}/${imageUri}`, texHash });
  return c.json({ upload, });
});