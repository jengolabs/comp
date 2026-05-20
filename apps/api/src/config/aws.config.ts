import { registerAs } from '@nestjs/config';
import { z } from 'zod';

// accessKeyId and secretAccessKey are optional: when running on EKS with IRSA
// the pod receives AWS_ROLE_ARN + AWS_WEB_IDENTITY_TOKEN_FILE and the AWS SDK
// picks up credentials automatically via the web identity credential provider.
const awsConfigSchema = z.object({
  region: z.string().default('us-east-1'),
  accessKeyId: z.string().optional(),
  secretAccessKey: z.string().optional(),
  bucketName: z.string().min(1, 'APP_AWS_BUCKET_NAME is required'),
  endpoint: z.string().optional(),
});

export type AwsConfig = z.infer<typeof awsConfigSchema>;

export const awsConfig = registerAs('aws', (): AwsConfig => {
  const config = {
    region: process.env.APP_AWS_REGION || 'us-east-1',
    accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID || undefined,
    secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY || undefined,
    bucketName: process.env.APP_AWS_BUCKET_NAME || '',
    endpoint: process.env.APP_AWS_ENDPOINT || undefined,
  };

  const result = awsConfigSchema.safeParse(config);

  if (!result.success) {
    throw new Error(
      `AWS configuration validation failed: ${result.error.issues
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ')}`,
    );
  }

  return result.data;
});
