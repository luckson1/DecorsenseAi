import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Redis } from '@upstash/redis';
import { env } from '@/env.mjs';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function appendNewToName(name: string) {
  let insertPos = name.indexOf('.');
  let newName = name
    .substring(0, insertPos)
    .concat('-new', name.substring(insertPos));
  return newName;
}

function forceDownload(blobUrl: string, filename: string) {
  let a: any = document.createElement('a');
  a.download = filename;
  a.href = blobUrl;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function downloadPhoto(url: string, filename: string) {
  fetch(url, {
    headers: new Headers({
      Origin: location.origin,
    }),
    mode: 'cors',
  })
    .then((response) => response.blob())
    .then((blob) => {
      let blobUrl = window.URL.createObjectURL(blob);
      forceDownload(blobUrl, filename);
    })
    .catch((e) => console.error(e));
}

export type themeType =
  | 'Modern'
  | 'Traditional'
  | 'Contemporary'
  | 'Farmhouse'
  | 'Rustic'
  |"MidCentury"
  |"Mediterranean"
  |"Industrial"
  |"Scandinavian"

export type roomType =
  'living_room'
  | 'dining_room'
  | 'bedroom'
  | 'bathroom'
  | 'office'
  | 'gaming_room';

export const themes:{url:string ,theme:themeType}[] = [
{ url: "https://res.cloudinary.com/dhciks96e/image/upload/v1690236152/%E3%83%AA%E3%83%92%E3%82%99%E3%83%B3%E3%82%AF%E3%82%99%E3%81%AB%E5%88%A5%E3%82%B9%E3%82%BF%E3%82%A4%E3%83%AB%E3%82%BD%E3%83%95%E3%82%A1%E3%82%92%E7%B5%84%E3%81%BF%E5%90%88%E3%82%8F%E3%81%9B%E3%82%8B%E5%8A%9B%E3%82%92_gm5cqn.jpg", theme:'Modern'},
 {theme: 'Contemporary', url: "https://res.cloudinary.com/dhciks96e/image/upload/v1690238010/Creating_a_Tropical_Living_Room_Design__Tips_and_Ideas_zzo75n.jpg"},
 { theme:'Farmhouse', url:"https://res.cloudinary.com/dhciks96e/image/upload/v1690239345/23_Beautiful_Farmhouse_Kitchen_Design_Ideas_1_hmcgja.jpg" },
  {theme:'Rustic', url: "https://res.cloudinary.com/dhciks96e/image/upload/v1690237931/50_aesthetic_small_living_room_decor_ideas_-_Dream_Africa_wewejk.jpg"},
 { theme: 'Traditional', url: "https://res.cloudinary.com/dhciks96e/image/upload/v1690238673/Two_pairs___4_panels_white_linen_pleated_curtain_panels_27W_X_90L_pinch_pleats_cp0p1i.jpg"},
 {theme:"Mediterranean", url:"https://res.cloudinary.com/dhciks96e/image/upload/v1690239713/Living_Room_Montenegro_Stone_House_Renovation_Vision_Board_ngglev.jpg" },
 {theme: "MidCentury", url: "https://res.cloudinary.com/dhciks96e/image/upload/v1690239632/Week_of_February_22_2021_-_Sight_Unseen_asfytg.png"},
 {theme:"Industrial", url: "https://res.cloudinary.com/dhciks96e/image/upload/v1690236661/The_Top_74_Industrial_Living_Room_Ideas_-_Trendey_rxnnrm.jpg"},
 {theme: "Scandinavian", url: "https://res.cloudinary.com/dhciks96e/image/upload/v1690236524/Superb_living_room_design_w0toqj.jpg"},
 
];
export const rooms: roomType[] = [
  'living_room',
  'dining_room',
  'office',
  'bedroom',
  'bathroom',
  'gaming_room',

];

export const redis =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : undefined;

  
