export interface Config {
  port: number;
  nodeEnv: string;
  s3: {
    bucket: string;
    folder: string;
    domain: string;
  };
  timeout: number;
}

function getEnv(name: string, defaultValue?: string): string {
  const value = process.env[name];
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value || defaultValue!;
}

const config: Config = {
  port: parseInt(process.env.PORT || '8999', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  s3: {
    bucket: getEnv('S3_BUCKET'),
    folder: getEnv('S3_FOLDER', 'vfs'),
    domain: getEnv('S3_DOMAIN', 'https://s3-eu-west-1.amazonaws.com'),
  },
  timeout: parseInt(process.env.TIMEOUT || '60000', 10),
};

export default config;
