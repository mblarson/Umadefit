export enum AppStep {
  UPLOAD_PHOTO = 'UPLOAD_PHOTO',
  SELECT_T_SHIRT = 'SELECT_T_SHIRT',
  SHOW_RESULT = 'SHOW_RESULT',
}

export interface TshirtItem {
  id: string;
  name: string;
  type: 'tshirt';
  mockupUrl: string; // For AI to understand color and silhouette
  flatArtUrl: string; // For AI to understand the print/design
}

export interface OtherClothingItem {
  id: string;
  name: string;
  type: 'pants' | 'shoes' | 'accessory';
  imageUrl: string; // General image URL for other items
}

export type ClothingItem = TshirtItem | OtherClothingItem;

export interface Outfit {
  tshirt?: TshirtItem; // Outfit's tshirt is now specifically TshirtItem
  pants?: OtherClothingItem;
  shoes?: OtherClothingItem;
  accessory?: OtherClothingItem;
}

export interface GeneratedImagePart {
  inlineData?: {
    mimeType: string;
    data: string;
  };
  text?: string;
}