

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

import {  type roomType, type themeType, rooms, themes, cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import {CheckIcon,  MoveRight, Trash } from "lucide-react";
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
import type { ControllerRenderProps, Noop,} from "react-hook-form";
import axios from "axios";
import { api } from "@/utils/api";

export interface MediaData extends Blob {
  name:string
}

const roomSchema=z.object({key:z.string(), room:z.enum([  'living_room'
, 'dining_room'
, 'bedroom'
, 'bathroom'
, 'office'
, 'gaming_room']).refine((val)=> val===  'dining_room'
||'bedroom'
||'bathroom'
||'office'
||'gamin_room', {
  message: "You have to select at least one room item.",
}),
themes: z.array(z.enum([   'Modern'
, 'Traditional'
, 'Contemporary'
, 'Farmhouse'
, 'Rustic'
,"MidCentury"
,"Mediterranean"
,"Industrial"
,"Scandinavian"])).refine((value) => value.some((theme) => theme), {
  message: "You have to select at least one theme.",
}),
images: z.array(z.object({
  name: z.string().nonempty(),
  path: z.string().nonempty(),

    size: z.number().max(10000000),
    type: z.string().regex(/^image\/.+$/)

})),
})
type RoomValues=z.infer<typeof roomSchema>
const imageSchema=z.array(z.object({
  name: z.string().nonempty(),
  path: z.string().nonempty(),

    size: z.number().max(10000000),
    type: z.string().regex(/^image\/.+$/)

}))
type Images=z.infer<typeof imageSchema>
const Dropzone=({ field, onBlur, }: {
  onBlur: Noop,
  field: ControllerRenderProps<RoomValues, 'images'>
}) => {
  const [files, setFiles] = useState<((MediaData ) & { preview: string, })[]>([]);
  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    accept: {
      'image/*': []
    },
    maxFiles: 1,
    onDrop: (acceptedFiles: MediaData[] ) => {
   
      field.onChange(acceptedFiles);
      setFiles(acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      
      })));
    }
  });
  
  const thumbs = files.map(file => (
    <div className='inline-flex border-2 border-base-300 rounded mb-2 mr-2 w-full  p-1 border-box' key={file.name}>
      <div className='flex overflow-hidden '>
        <img
        alt="pet"
          src={file.preview}

         className='block w-auto h-full'
          // Revoke data uri after image is loaded
          onLoad={() => { URL.revokeObjectURL(file.preview) }}
        />
      </div>
    </div>
  ));

  useEffect(() => {
    // Make sure to revokex the data uris to avoid memory leaks, will run on unmount
    return () => files.forEach(file => URL.revokeObjectURL(file.preview));
  }, [files]);
    return (
        <section className=" item-center   flex max-w-xs h-fit my-5  w-full flex-col rounded-md  border-2 border-dashed border-[hsl(var(--bc) / var(--tw-border-opacity))] bg-base-100 py-4 px-2 ">
        <div

          {...getRootProps({ className: "dropzone" })}
          className="cursor-pointer  "
        >

<input {...getInputProps({ onBlur })} />
          <div className="flex w-full flex-row items-center justify-center gap-3 align-baseline">
        
          
             { isDragActive? <p className="text-green-500">Drop them here!</p>: <Button size={'lg'} className="space-x-2 flex" type="button">     <UploadCloud className="text-xl" /> <p>Click to select an Image</p></Button>}
       
          </div>
        </div>
        <aside className="mt-2 flex flex-row flex-wrap h-fit w-full  md:mt-6">
    
   
         {thumbs}
        </aside>
      </section>
    );
};




export default function DreamPage() {
  const [restoredImages, setRestoredImages] = useState<{theme:themeType, url:string, id:string}[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

const {setValue, formState: {errors}, handleSubmit, control, watch}=useForm<RoomValues>({
  resolver: zodResolver(roomSchema),
})

const roomThemes=watch('themes')


  const uploadToS3 =async (images: Images)=> {
    if (!images) {
      return null;
    }
    
    // loop through files and create a file entry in db, then create s3 signed url using file id
   
      const { data }: { data: { uploadUrl: string; key: string } } =
        await axios.get(
          `/api/aws/uploadImage`
        );
    
      const { uploadUrl, key } = data;

      await axios.put(uploadUrl, images[0]);
    return key
  }
const {mutate:generate}=api.prediction.create.useMutation({
  onSuccess(image) {
    restoredImages? setRestoredImages([...restoredImages, image]): setRestoredImages([image])
  },
})
async function generatePhotos({ themes, room, images}:{ themes: themeType[], room: roomType, images: Images}) {
  await new Promise((resolve) => setTimeout(resolve, 200));
  setLoading(true)

await Promise.all(
   themes.map(async(theme)=> {
  
    setLoading(true);
const key= await  uploadToS3(images)
const validatedKey=z.string().parse(key)
generate({theme, key:validatedKey, room})
         
 
    setTimeout(() => {
      setLoading(false);
    }, 1300);
   })
  )
}
const onSubmit=async(data: RoomValues)=> {
  await generatePhotos(data)
}
  return (
    
    <div className="flex max-w-7xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-4 sm:mb-0 mb-8">
  
        <ResizablePanel>
          <AnimatePresence mode="wait">
            <motion.div className="flex justify-between  w-full lg:flex-row flex-col mt-4">
          
                <form className="w-full flex justify-center flex-col items-center lg:w-1/3 p-5" onSubmit={handleSubmit((data)=> onSubmit(data))}>
               
                <div className="space-y-4 w-full max-w-sm flex flex-col">
            
              <Label className="w-full max-w-xs text-start">Upload a picture of your home</Label>
              <Controller
          name='images'
          
          control={control}

          render={({field})=> (
            
              <Dropzone field={field} onBlur={field.onBlur} />
            )}
          />
            <ErrorMessage
                  errors={errors}
                  name='imageUrl'
                  as="h5"
                  className="text-red-600"
                />
            
      
                  </div>
            
                  <div className="space-y-4 w-full max-w-sm flex flex-col">
                  
                
              <Label className="w-full max-w-xs text-start">Room type</Label>
          <Controller
          name="room"
          
          control={control}

          render={({field})=> (
            <Popover>
            <PopoverTrigger asChild>
            
                <Button
                size={'lg'}
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-full max-w-xs justify-between",
                    field.value && "text-muted-foreground"
                  )}
                >
                  {field.value
                    ? field.value.replace(/_/g, ' ').replace(/^\w/, (match) => match.toUpperCase())
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
                      onSelect={(value:roomType) => {
                  setValue('room', value)
                      }
                    }
                    >
                      {room}
                      <CheckIcon
                        className={cn(
                          "ml-auto h-4 w-4",
                         room.toLocaleLowerCase()===field.value
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
          )}/>
             <ErrorMessage
                  errors={errors}
                  name='room'
                  as="h5"
                  className="text-red-600"
                />
             
        
                  </div>
                  <div className="space-y-4 w-full max-w-sm flex flex-col mt-4">
                  <Label className="w-full max-w-xs text-start">Select Design theme (maximum of 4)</Label>
             
                    <div className="w-full h-fit grid grid-cols-3">
                    {themes.map((t) => (
  <div className="mb-4 relative" key={t.theme}>
    <label htmlFor={t.theme} className="cursor-pointer">
      <Image src={t.url} alt={t.theme} width={90} height={90} className="w-24 h-24 rounded-md" />
      <div className="w-full text-xs text-start mt-2">{t.theme}</div>
    </label>

    <Controller
      name="themes"
      control={control}
      render={({ field }) => (
        <Checkbox
          id={t.theme}
          checked={field.value?.includes(t.theme)}
          className="absolute top-3 right-10"
          onCheckedChange={(checked) => {
            if (Array.isArray(field.value)) {
              const maxAllowedSelections = 4;

              if (checked) {
                if (field.value.length < maxAllowedSelections) {
                  field.onChange([...field.value, t.theme]);
                }
              } else {
                field.onChange(field.value.filter((value) => value !== t.theme));
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
                  name='themes'
                  as="h5"
                  className="text-red-600"
                />
  </div>
))}


                      </div>
             
                    
                  </div>
              <div className="w-full flex justify-start"> 
         
            <Button className="mt-5 w-full max-w-xs" size={'lg'} role="submit" >
                   {loading? "Loading....": " Get Ideas"}
                  </Button>
                  
        
            
              </div>
               
                </form>
                <div className="w-full lg:w-2/3 space-y-4">
                <h1 className="mx-auto max-w-4xl font-display text-4xl font-bold tracking-normal  sm:text-6xl mb-5">
          Generate your <span className="text-blue-600">dream</span> room
        </h1>
        {/* <p>  <span>Uploading a photo <MoveRight /></span> <span>2. Specify the room</span> <span>3. Select room themes</span> <span>4. Click Submit</span></p> */}
        <div className="w-full flex flex-row space-x-3">
          <p>Uploading a photo</p>
          <MoveRight className="w-6 h-6" />
          <p>Specify the room</p>
          <MoveRight className="w-6 h-6" />
          <p> Select room themes</p>
          <MoveRight className="w-6 h-6" />
          <p>Click submit button</p>
        </div>
           <div className="w-full grid grid-cols-1 md:grid-cols-2 justify-center items-start  p-5">
       
{!roomThemes && !restoredImages &&
  <Card className="h-72 w-full max-w-[22rem] mt-7 " >
    <CardContent className="w-full h-full flex justify-center items-center flex-col">
     <Image src='/room.png' alt="room" width={50} height={50}/>
     <p className="tracking-widest font-medium text-lg">No Theme selected</p>
    </CardContent>
  </Card>
}
{roomThemes && !restoredImages &&
roomThemes.map(theme=> (
  <Card className="h-72 w-full max-w-[22rem] mt-7 " key={theme} >
  <CardContent className="w-full h-full flex flex-col justify-center items-center">
   <Image src='/room.png' alt="room" width={50} height={50}/>
   <p className="tracking-widest font-medium text-lg">{theme}</p>
  </CardContent>
</Card>
))
}
{restoredImages ?
restoredImages.map(restoredImage=> (
<div key={restoredImage.theme} className="w-full flex flex-col space-y-4">

<Card className="h-72 w-full max-w-[22rem] mt-7 " key={restoredImage.id} >
  <CardContent className="w-full h-full flex flex-col justify-center items-center relative">
   <Image src={restoredImage.url} alt="room"  fill className="rounded-lg"/>
 
  </CardContent>
</Card>
<p className="tracking-widest font-medium text-lg">{restoredImage.theme}</p>
</div>
)) : null
}
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
