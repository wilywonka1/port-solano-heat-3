// Port Solano layout and tuning. Original city, characters and businesses.
export const ROAD_X=[-180,-120,-60,0,60,120,180];
export const ROAD_Z=[-160,-100,-40,20,80,140];
export const WORLD={minX:-230,maxX:230,minZ:-210,maxZ:330};
export const BEACH_Z=185, WATER_Z=225;
export const GARAGE_POS={x:84,z:44}; // Tito's lot, NE of 60/20 junction
export const HOTEL_POS={x:-72,z:-44};
export const MARINA_POS={x:130,z:255};
export const DOCKS_POS={x:150,z:275};
export const ROSA_POS={x:-9,z:25};
export const SPAWN={x:2,z:36,angle:0};
export const SHOP_NAMES=["Café Delgado","Marina Motors","Palmera Pharmacy","Tito's Garage","Solano Surf Co.","Golden Crust Bakery","Hotel Palmera","Solano Pawn","Iron Palm Gym","Noodle Tide","Book & Buoy","La Ola Tacos","Sunset Liquor","Palm Pharmacy","Vista Hotel","Coral Records","Tide Jewels","Mango Mart","Solano Bank","Pier Outfitters","Café Brisa","Marlin Freight","Sole Shoes","Bloom Florist","Net & Rod","Copa Bar","Dune Diner","Harbor Books","Sol Casino","Palm Laundry"];
export const CAR_COLORS=[0xc23b2e,0x2e6fc2,0xe8b13a,0x3aa655,0xd8d8dc,0x22242a,0x8e44ad,0xe67e22,0x16a3a3,0xf2f2f2];
export const RESPRAY=[{n:"Crimson",c:0xc23b2e},{n:"Ocean",c:0x2e6fc2},{n:"Taxi Gold",c:0xe8b13a},{n:"Palm Green",c:0x3aa655},{n:"Pearl",c:0xececf0},{n:"Midnight",c:0x22242a},{n:"Violet",c:0x8e44ad},{n:"Sunset",c:0xe67e22},{n:"Teal",c:0x16a3a3}];
export const CONCHES=[[-195,-175],[195,-175],[-195,155],[40,-185],[-110,95],[182,92],[15,200],[-160,200],[95,245],[-58,-98]];
export const CHECKPOINTS=[[130,230],[60,200],[0,185],[-60,140],[0,80],[60,20],[0,-40],[-30,-90]];
export function mulberry(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const dist2=(a,b)=>{const dx=a.x-b.x,dz=a.z-b.z;return Math.hypot(dx,dz)};
export const fmt$=n=>"$"+Math.round(n).toLocaleString("en-US");
