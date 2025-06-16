import { ConnectionOptions } from 'bullmq';

export const redisConfig: ConnectionOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

export const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.example.com',
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@example.com',
    pass: process.env.EMAIL_PASS || 'your-email-password',
  },

};

export const ERC721Config = {
  contractAddress: process.env.CONTRACT_ADDRESS || '0x9E8B1666Eb68499E632b23e08F66Ead3DcD92089',
  privateKey: process.env.PRIVATE_KEY || 'ef9cdb1511f3821d0127cb0277009675ca68c9b0b39186d64e89e7fb9b2b3f28',
  rpcURL: process.env.RPC_URL || 'https://testnet-rpc.monad.xyz/'
};