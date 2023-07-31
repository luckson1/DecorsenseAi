import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import {
  type roomType,
  type themeType,
  rooms,
  themes,
  cn,
  downloadPhoto,
} from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CaretSortIcon } from "@radix-ui/react-icons";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { CheckIcon, LucideDownload, MoveRight, Trash } from "lucide-react";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorMessage } from "@hookform/error-message";
import ToolTipComponent from "@/components/tooltip_component";
import ResizablePanel from "@/components/ResizablePanel";

import { UploadCloud } from "lucide-react";

import { useDropzone } from "react-dropzone";
import type {
  ControllerRenderProps,
  Noop,
  UseFormResetField,
} from "react-hook-form";
import axios from "axios";
import { api } from "@/utils/api";
import type { Room, Theme } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import LoadingSVG from "@/components/loading_svg";

export interface MediaData extends Blob {
  name: string;
}

const roomSchema = z.object({
  room: z
    .enum([
      "living_room",
      "dining_room",
      "bedroom",
      "bathroom",
      "office",
      "gaming_room",
    ])
    .refine(
      (val) =>
        val === "dining_room" ||
        "bedroom" ||
        "bathroom" ||
        "office" ||
        "gamin_room",
      {
        message: "You have to select at least one room item.",
      }
    ),
  themes: z
    .array(
      z.enum([
        "Modern",
        "Traditional",
        "Contemporary",
        "Farmhouse",
        "Rustic",
        "MidCentury",
        "Mediterranean",
        "Industrial",
        "Scandinavian",
      ])
    )
    .refine((value) => value.some((theme) => theme), {
      message: "You have to select at least one theme.",
    }),
  images: z.array(
    z.object({
      name: z.string().nonempty(),
      path: z.string().nonempty(),

      size: z.number().max(10000000),
      type: z.string().regex(/^image\/.+$/),
    })
  ),
});
type RoomValues = z.infer<typeof roomSchema>;
const imageSchema = z.array(
  z.object({
    name: z.string().nonempty(),
    path: z.string().nonempty(),

    size: z.number().max(10000000),
    type: z.string().regex(/^image\/.+$/),
  })
);
type Images = z.infer<typeof imageSchema>;
const Dropzone = ({
  field,
  onBlur,
  images,
  resetField,
}: {
  onBlur: Noop;
  field: ControllerRenderProps<RoomValues, "images">;
  images: Images;
  resetField: UseFormResetField<{
    key: string;
    room: Room;
    themes: Theme[];
    images: Images;
  }>;
}) => {
  const [files, setFiles] = useState<(MediaData & { preview: string })[]>([]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles: MediaData[]) => {
      field.onChange(acceptedFiles);
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        )
      );
    },
  });

  const thumbs = files.map((file) => (
    <div
      className="border-base-300 border-box mb-2 mr-2 inline-flex h-full w-full rounded border-2 p-1"
      key={file.name}
    >
      <div className="relative flex h-full w-full overflow-hidden">
        <Image
          alt="room"
          src={file.preview}
          className="block h-full w-auto"
          // Revoke data uri after image is loaded
          onLoad={() => {
            URL.revokeObjectURL(file.preview);
          }}
          fill
        />
      </div>
    </div>
  ));

  useEffect(() => {
    // Make sure to revokex the data uris to avoid memory leaks, will run on unmount
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [files]);
  return (
    <section className=" item-center   border-[hsl(var(--bc) / var(--tw-border-opacity))]   bg-base-100 flex h-[20rem]  w-full max-w-xs flex-col rounded-md border-2 border-dashed px-2 py-4 ">
      <div
        {...getRootProps({ className: "dropzone" })}
        className="cursor-pointer"
      >
        <input {...getInputProps({ onBlur })} />
        <div className="flex w-full flex-row items-center justify-center gap-3 align-baseline">
          {!images && (
            <>
              {isDragActive ? (
                <p className="text-green-500">Drop them here!</p>
              ) : (
                <Button size={"lg"} className="flex space-x-2" type="button">
                  {" "}
                  <UploadCloud className="text-xl" />{" "}
                  <p>Click to select an Image</p>
                </Button>
              )}
            </>
          )}
          {images && (
            <ToolTipComponent content="Change image">
              <Trash
                className="h-6 w-6 cursor-pointer"
                onClick={() => resetField("images")}
              />
            </ToolTipComponent>
          )}
        </div>
      </div>
      <aside className="relative m-2 flex h-full w-full flex-row flex-wrap">
        {thumbs}
      </aside>
    </section>
  );
};

export default function DreamPage() {
  const { status } = useSession();
  const isLoading = status === "loading";
  const isUnAuthenticated = status === "unauthenticated";
  const router = useRouter();
  useEffect(() => {
    if (isUnAuthenticated) {
      router.replace("/auth");
    }
  });

  const restoredImages = useRef<
    { theme: themeType; url: string; id: string }[]
  >([]);
  console.log(restoredImages);
  const [loading, setLoading] = useState<boolean>(false);

  const {
    setValue,
    formState: { errors },
    handleSubmit,
    resetField,
    control,
    watch,
  } = useForm<RoomValues>({
    resolver: zodResolver(roomSchema),
  });

  const roomThemes = watch("themes");
  const images = watch("images");

  const uploadToS3 = async () => {
    if (!images) {
      return null;
    }

    const { data }: { data: { uploadUrl: string; key: string } } =
      await axios.get(`/api/aws/upload_image`);

    const { uploadUrl, key } = data;

    await axios.put(uploadUrl, images[0]);

    return key;
  };

  const { mutate: generate, isLoading: isCreationLoading } =
    api.prediction.create.useMutation({
      onSuccess(image) {
        restoredImages.current.push(image);
      },
    });

  async function generatePhotos({
    themes,
    room,
  }: {
    themes: themeType[];
    room: roomType;
  }) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    setLoading(true);

    await Promise.all(
      themes.map(async (theme) => {
        const key = await uploadToS3();
        const validatedKey = z.string().parse(key);
        generate({ theme, key: validatedKey, room });

        setTimeout(() => {
          setLoading(false);
        }, 1300);
      })
    );
  }
  const onSubmit = async (data: RoomValues) => {
    await generatePhotos(data);
  };
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center py-2">
      <main className="mb-8 mt-4 flex w-full flex-1 flex-col items-center justify-center px-4 text-center sm:mb-0">
        <ResizablePanel>
          <AnimatePresence mode="wait">
            <motion.div className="mt-4 flex  w-full flex-col justify-between lg:flex-row">
              <form
                className="flex w-full flex-col items-center justify-center p-5 lg:w-1/3"
                onSubmit={handleSubmit((data) => onSubmit(data))}
              >
                {isLoading ? (
                  <Card className="my-4 w-full">
                    <CardContent className="w-full">
                      <Skeleton className="h-80 w-full" />
                    </CardContent>
                  </Card>
                ) : (
                  <div className="flex w-full max-w-sm flex-col space-y-4">
                    <Label className="my-2 w-full max-w-xs text-start">
                      Upload a picture of your home
                    </Label>
                    <Controller
                      name="images"
                      control={control}
                      render={({ field }) => (
                        <Dropzone
                          field={field}
                          onBlur={field.onBlur}
                          resetField={resetField}
                          images={images}
                        />
                      )}
                    />
                    <ErrorMessage
                      errors={errors}
                      name="imageUrl"
                      as="h5"
                      className="text-red-600"
                    />
                  </div>
                )}

                {isLoading ? (
                  <Card className="my-4 w-full">
                    <CardContent className="w-full">
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ) : (
                  <div className="flex w-full max-w-sm flex-col space-y-4">
                    <Label className="my-2 w-full max-w-xs text-start">
                      select type room{" "}
                    </Label>
                    <Controller
                      name="room"
                      control={control}
                      render={({ field }) => (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              size={"lg"}
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full max-w-xs justify-between",
                                field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? field.value
                                    .replace(/_/g, " ")
                                    .replace(/^\w/, (match) =>
                                      match.toUpperCase()
                                    )
                                : "Select room theme"}
                              <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput
                                placeholder="Search framework..."
                                className="h-9"
                              />
                              <CommandEmpty>No Rooms </CommandEmpty>
                              <CommandGroup>
                                {rooms.map((room) => (
                                  <CommandItem
                                    value={room}
                                    key={room}
                                    // @ts-expect-error because value is string but it should be room type
                                    onSelect={(value: roomType) => {
                                      setValue("room", value);
                                    }}
                                  >
                                    {room}
                                    <CheckIcon
                                      className={cn(
                                        "ml-auto h-4 w-4",
                                        room.toLocaleLowerCase() === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      )}
                    />
                    <ErrorMessage
                      errors={errors}
                      name="room"
                      as="h5"
                      className="text-red-600"
                    />
                  </div>
                )}
                {isLoading ? (
                  <Card className="my-4 w-full">
                    <CardContent className="w-full">
                      <Skeleton className="h-[500px] w-full" />
                    </CardContent>
                  </Card>
                ) : (
                  <div className="mt-4 flex w-full max-w-sm flex-col space-y-4">
                    <Label className="my-2 w-full max-w-xs text-start">
                      Select Design theme (maximum of 4)
                    </Label>

                    <div className="grid h-fit w-full grid-cols-3">
                      {themes.map((t) => (
                        <div className="relative mb-4" key={t.theme}>
                          <label htmlFor={t.theme} className="cursor-pointer">
                            <Image
                              src={t.url}
                              alt={t.theme}
                              width={90}
                              height={90}
                              className="h-24 w-24 rounded-md"
                            />
                            <div className="mt-2 w-full text-start text-xs">
                              {t.theme}
                            </div>
                          </label>

                          <Controller
                            name="themes"
                            control={control}
                            render={({ field }) => (
                              <Checkbox
                                id={t.theme}
                                checked={field.value?.includes(t.theme)}
                                className="absolute right-10 top-3"
                                onCheckedChange={(checked) => {
                                  if (Array.isArray(field.value)) {
                                    const maxAllowedSelections = 4;

                                    if (checked) {
                                      if (
                                        field.value.length <
                                        maxAllowedSelections
                                      ) {
                                        field.onChange([
                                          ...field.value,
                                          t.theme,
                                        ]);
                                      }
                                    } else {
                                      field.onChange(
                                        field.value.filter(
                                          (value) => value !== t.theme
                                        )
                                      );
                                    }
                                  } else {
                                    field.onChange(checked ? [t.theme] : []);
                                  }
                                }}
                              />
                            )}
                          />
                          <ErrorMessage
                            errors={errors}
                            name="themes"
                            as="h5"
                            className="text-red-600"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex w-full justify-start">
                  <Button
                    className="mt-5 w-full max-w-xs"
                    size={"lg"}
                    role="submit"
                  >
                    {loading || isCreationLoading ? (
                      <>
                        <LoadingSVG /> Loading
                      </>
                    ) : (
                      " Get Ideas"
                    )}
                  </Button>
                </div>
              </form>
              <div className="w-full space-y-4 lg:w-2/3">
                <h1 className="font-display mx-auto mb-5 max-w-4xl text-4xl font-bold  tracking-normal sm:text-6xl">
                  Generate your <span className="text-blue-600">dream</span>{" "}
                  room
                </h1>
                {/* <p>  <span>Uploading a photo <MoveRight /></span> <span>2. Specify the room</span> <span>3. Select room themes</span> <span>4. Click Submit</span></p> */}
                <div className="flex w-full flex-row space-x-3">
                  <p>Uploading a photo</p>
                  <MoveRight className="h-6 w-6" />
                  <p>Specify the room</p>
                  <MoveRight className="h-6 w-6" />
                  <p> Select room themes</p>
                  <MoveRight className="h-6 w-6" />
                  <p>Click submit button</p>
                </div>
                <div className="grid w-full grid-cols-1 items-start justify-center p-5  md:grid-cols-2">
                  {!roomThemes && restoredImages.current.length <= 0 && (
                    <Card className="mt-7 h-72 w-full max-w-[22rem] ">
                      <CardContent className="flex h-full w-full flex-col items-center justify-center">
                        <Image
                          src="/room.png"
                          alt="room"
                          width={50}
                          height={50}
                        />
                        <p className="text-lg font-medium tracking-widest">
                          No Theme selected
                        </p>
                      </CardContent>
                    </Card>
                  )}
                  {roomThemes &&
                    restoredImages.current.length <= 0 &&
                    roomThemes.map((theme) => (
                      <Card
                        className="mt-7 h-72 w-full max-w-[22rem] "
                        key={theme}
                      >
                        <CardContent className="flex h-full w-full flex-col items-center justify-center">
                          {isCreationLoading ? (
                            <LoadingSVG />
                          ) : (
                            <Image
                              src="/room.png"
                              alt="room"
                              width={50}
                              height={50}
                            />
                          )}
                          <p className="text-lg font-medium tracking-widest">
                            {theme}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  {restoredImages.current.length > 0 &&
                    !isCreationLoading &&
                    restoredImages.current.map((restoredImage) => (
                      <div
                        key={restoredImage.theme}
                        className="flex w-full flex-col space-y-4"
                      >
                        <Card
                          className="mt-7 h-72 w-full max-w-[22rem] "
                          key={restoredImage.id}
                        >
                          <CardContent className="relative flex h-full w-full flex-col items-center justify-center">
                            <Image
                              src={restoredImage.url}
                              alt="room"
                              fill
                              className="rounded-lg"
                            />
                            <ToolTipComponent content="download image">
                              <div className=" absolute top-5 inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                                <LucideDownload
                                  onClick={() =>
                                    downloadPhoto(
                                      restoredImage.url,
                                      restoredImage.id
                                    )
                                  }
                                />
                              </div>
                            </ToolTipComponent>
                          </CardContent>
                        </Card>
                        <p className="text-lg font-medium tracking-widest">
                          {restoredImage.theme}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </ResizablePanel>
      </main>
      {/* <Footer /> */}
    </div>
  );
}
