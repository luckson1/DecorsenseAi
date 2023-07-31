import ToolTipComponent from "@/components/tooltip_component";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, rooms, themes, downloadPhoto } from "@/lib/utils";
import { api } from "@/utils/api";
import type { Room, Theme } from "@prisma/client";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { CheckIcon, LucideDownload } from "lucide-react";
import Image from "next/image";
import React, { useMemo, useState } from "react";
export function ImagesRender({
  restoredImages,
}: {
  restoredImages:
    | {
        room: Room;
        id: string;
        theme: Theme;
        predictedImageUrl: string;
      }[]
    | undefined;
}) {
  const [roomType, setRoomType] = useState<Room | undefined>();
  const [themeType, setThemeType] = useState<Theme | undefined>();

  const images = useMemo(() => {
    if (roomType && themeType) {
      return restoredImages
        ?.filter((image) => image.room === roomType)
        .filter((image) => image.theme === themeType);
    }

    if (roomType && !themeType) {
      return restoredImages?.filter((image) => image.room === roomType);
    }

    if (themeType && !roomType) {
      return restoredImages?.filter((image) => image.theme === themeType);
    } else {
      return restoredImages;
    }
  }, [restoredImages, roomType, themeType]);

  return (
    <div className="flex w-full  flex-col  justify-between space-x-8 ">
      <div className="mx-auto flex  w-full flex-row items-center justify-center  p-5">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              size={"lg"}
              variant="outline"
              role="combobox"
              className={cn(
                "mx-3 w-full max-w-xs justify-between md:mx-5",
                roomType && "text-muted-foreground"
              )}
            >
              {roomType
                ? roomType
                    .replace(/_/g, " ")
                    .replace(/^\w/, (match) => match.toUpperCase())
                : "Filter by room"}
              <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Filter by room..." className="h-9" />
              <CommandEmpty>No Rooms </CommandEmpty>
              <CommandGroup>
                {rooms.map((room) => (
                  <CommandItem
                    value={room}
                    key={room}
                    // @ts-expect-error  value type
                    onSelect={(value: Room) => {
                      setRoomType(value);
                    }}
                  >
                    {room}
                    <CheckIcon
                      className={cn(
                        "ml-auto h-4 w-4",
                        room.toLocaleLowerCase() === roomType
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
        <Popover>
          <PopoverTrigger asChild>
            <Button
              size={"lg"}
              variant="outline"
              role="combobox"
              className={cn(
                "mx-3 w-full max-w-xs justify-between md:mx-5",
                themeType && "text-muted-foreground"
              )}
            >
              {themeType
                ? themeType
                    .replace(/_/g, " ")
                    .replace(/^\w/, (match) => match.toUpperCase())
                : "Filter by theme"}
              <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search themes..." className="h-9" />
              <CommandEmpty>No Themes </CommandEmpty>
              <CommandGroup>
                {themes.map((theme) => (
                  <CommandItem
                    value={theme.theme}
                    key={theme.theme}
                    onSelect={(value) => {
                  
                      setThemeType(
                            // @ts-expect-error  for type of value
                        value.replace(/^\w/, (match) => match.toUpperCase())
                      );
                      console.log(themeType);
                    }}
                  >
                    {theme.theme}
                    <CheckIcon
                      className={cn(
                        "ml-auto h-4 w-4",
                        theme.theme === themeType ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="w-full  space-y-4">
        <div className="grid w-full grid-cols-1 items-start justify-center p-5 md:grid-cols-2  lg:grid-cols-3">
          {images
            ? images.map((image) => (
                <div
                  key={image.id}
                  className="flex w-full flex-col space-x-4 space-y-4"
                >
                  <Card className="mt-7 h-64 w-full max-w-xs " key={image.id}>
                    <CardContent className="relative flex h-full w-full flex-col items-center justify-center">
                      <Image
                        src={image.predictedImageUrl}
                        alt="room"
                        fill
                        className="rounded-lg"
                      />
                      <ToolTipComponent content="download image">
                        <div className=" absolute top-5 inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                          <LucideDownload
                            onClick={() =>
                              downloadPhoto(image.predictedImageUrl, image.id)
                            }
                          />
                        </div>
                      </ToolTipComponent>
                    </CardContent>
                  </Card>
                  <p className="text-lg font-medium tracking-widest">
                    {image.theme}
                  </p>
                </div>
              ))
            : null}
        </div>
      </div>
    </div>
  );
}

export default function MyDesigns() {
  const { data: restoredImages } = api.prediction.getAll.useQuery();

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center py-2">
      <main className="mb-8 mt-4 flex w-full flex-1 flex-col items-center justify-center px-4 text-center sm:mb-0">
        <h1 className="s font-display  mx-auto mb-5 w-full text-4xl font-bold  tracking-normal sm:text-6xl">
          Your <span className="text-blue-600">Designs</span>
        </h1>

        <ImagesRender restoredImages={restoredImages} />
      </main>
      {/* <Footer /> */}
    </div>
  );
}
