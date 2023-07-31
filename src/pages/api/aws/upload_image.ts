import type { NextApiRequest, NextApiResponse } from "next";
import S3 from "aws-sdk/clients/s3";
import { env } from "@/env.mjs";
import { getServerAuthSession } from "@/server/auth";
import { nanoid } from "nanoid";
// import { Ratelimit } from "@upstash/ratelimit";
// import { headers } from "next/headers";
// import { redis } from "@/lib/utils";

const s3 = new S3({
  apiVersion: "2006-03-01",
  accessKeyId: env.ACCESS_KEY,
  secretAccessKey: env.SECRET_KEY,
  region: env.REGION,
  signatureVersion: "v4",
});

// const ratelimit = redis
//   ? new Ratelimit({
//       redis: redis,
//       limiter: Ratelimit.fixedWindow(100, "1440 m"),
//       analytics: true,
//     })
//   : undefined;
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  //  // Rate Limiter Code
  //  if (ratelimit) {
  //   const headersList = headers();
  //   const ipIdentifier = headersList.get("x-real-ip");

  //   const result = await ratelimit.limit(ipIdentifier ?? "");

  //   if (!result.success) {
  //     return new Response(
  //       "Too many uploads in 1 day. Please try again in a 24 hours.",
  //       {
  //         status: 429,
  //         headers: {
  //           "X-RateLimit-Limit": result.limit,
  //           "X-RateLimit-Remaining": result.remaining,
  //         } as unknown as  Headers
  //       }
  //     );
  //   }
  // }

  try {
    console.log("uploading...");
    const session = await getServerAuthSession({ req, res });
    const userId = session?.user?.id;

    // make entries to image table for the product images

    if (userId) {
      const Key = nanoid();

      const s3Params = {
        Bucket: env.BUCKET_NAME,
        Key,
        Expires: 60,
      };

      const uploadUrl = await s3.getSignedUrlPromise("putObject", s3Params);

      res.status(200).json({
        uploadUrl,
        key: Key,
      });
    }
    return;
  } catch (error) {
    console.log(error);
  }
}
