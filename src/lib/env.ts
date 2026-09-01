import { z } from 'zod';

const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (value === '' ? undefined : value), schema.optional());

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  RESEND_API_KEY: optional(z.string().min(1)),
  CONTACT_FROM_EMAIL: optional(z.string().email()),
  CONTACT_TO_EMAIL: optional(z.string().email()),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: optional(z.string().url()),
});

const parsedServer = serverSchema.safeParse(process.env);
const parsedClient = clientSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

if (!parsedServer.success) {
  throw new Error(
    `Invalid server environment:\n${JSON.stringify(
      z.treeifyError(parsedServer.error),
      null,
      2,
    )}`,
  );
}

if (!parsedClient.success) {
  throw new Error(
    `Invalid public environment:\n${JSON.stringify(
      z.treeifyError(parsedClient.error),
      null,
      2,
    )}`,
  );
}

export const env = { ...parsedServer.data, ...parsedClient.data };

export const emailConfig =
  env.RESEND_API_KEY && env.CONTACT_FROM_EMAIL && env.CONTACT_TO_EMAIL
    ? {
        apiKey: env.RESEND_API_KEY,
        from: env.CONTACT_FROM_EMAIL,
        to: env.CONTACT_TO_EMAIL,
      }
    : null;
