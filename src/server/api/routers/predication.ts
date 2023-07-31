import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { S3 } from "aws-sdk";
import { env } from "@/env.mjs";
import Replicate from "replicate";
import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";

const replicate = new Replicate({
  auth: env.REPLICATE_API_KEY,
});

const roomSchema = z.object({
  key: z.string(),
  room: z.enum([
    "living_room",
    "dining_room",
    "bedroom",
    "bathroom",
    "office",
    "gaming_room",
  ]),
  theme: z.enum([
    "Modern",
    "Traditional",
    "Contemporary",
    "Farmhouse",
    "Rustic",
    "MidCentury",
    "Mediterranean",
    "Industrial",
    "Scandinavian",
  ]),
});
const s3 = new S3({
  apiVersion: "2006-03-01",
  accessKeyId: env.ACCESS_KEY,
  secretAccessKey: env.SECRET_KEY,
  region: env.REGION,
  signatureVersion: "v4",
});
export const predictionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(roomSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const promptData = await ctx.prisma.prompt.create({
        data: {
          imageKey: input.key,
          room: input.room,
          theme: input.theme,
          userId,
        },
      });
      const imageUrl = await s3.getSignedUrlPromise("getObject", {
        Bucket: env.BUCKET_NAME,
        Key: input.key,
      });
      const image = z.string().url().parse(imageUrl);
      try {
        // POST request to Replicate to start the image restoration generation process
        let prediction = await replicate.predictions.create({
          version:
            "854e8727697a057c525cdb45ab037f64ecca770a1769cc52287c2e56472a247b",

          input: {
            image,
            prompt:
              input.room === "gaming_room"
                ? "a room for gaming with gaming computers, gaming consoles, and gaming chairs"
                : `a ${input.theme.toLowerCase()} ${input.room.toLowerCase()}`,
            a_prompt:
              "best quality, intricate detail, award winning design, daylight, extremely detailed, photo from Pinterest, photo from Houzz, interior, cinematic photo, ultra-detailed, ultra-realistic, award-winning, high definition, hyperealistic, ",
            n_prompt:
              "longbody, lens blur, apartment photography, luxury market, photorealistic, 8K, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, poorly drawn hands, poorly drawn feet, poorly drawn face, out of frame, extra limbs, disfigured, deformed, body out of frame, bad anatomy, watermark, signature, cut off, low contrast, underexposed, overexposed, bad art, beginner, amateur, distorted face",
          },
        });

        // Use the Body property directly on the putObject method

        prediction = await replicate.wait(prediction, { max_attempts: 10 });
        if (prediction.error)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Prediction failed",
          });
        if (prediction.status !== "succeeded")
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Prediction failed",
          });
        const predictedImageUrl = z.string().url().parse(prediction.output);
        const response = await fetch(predictedImageUrl);
        const imageArrayBuffer = await response.arrayBuffer();
        const Key = nanoid();
        const params: S3.PutObjectRequest = {
          Bucket: env.BUCKET_NAME,
          Key,
          Body: Buffer.from(imageArrayBuffer),
        };

        await s3.putObject(params).promise();
        const imageData = await ctx.prisma.prediction.create({
          data: {
            userId,
            imageKey: Key,
            promptId: promptData.id,
            predictedImageUrl,
          },
          select: {
            id: true,
            predictedImageUrl: true,
            prompt: {
              select: {
                room: true,
                theme: true,
              },
            },
          },
        });
        const predictedImage = {
          id: imageData.id,
          url: predictedImageUrl,
          room: imageData.prompt.room,
          theme: imageData.prompt.theme,
        };
        return predictedImage;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Prediction failed",
        });
      }
    }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const images = await ctx.prisma.prediction.findMany({
      include: {
        prompt: {
          select: {
            room: true,
            theme: true,
          },
        },
      },
    });
    const imagesWithUrl = await Promise.all(
      images.map(async (image) => ({
        id: image.id,
        predictedImageUrl: await s3.getSignedUrlPromise("getObject", {
          Bucket: env.BUCKET_NAME,
          Key: image.imageKey,
        }),
        theme: image.prompt.theme,
        room: image.prompt.room,
      }))
    );

    return imagesWithUrl;
  }),
});
