import algeriaData from "./algeria-data.json";

export interface Commune {
  id: string;
  postCode: string;
  nameAr: string;
  nameFr: string;
}

export interface Wilaya {
  code: string;
  nameAr: string;
  nameFr: string;
  communes: Commune[];
}

export const WILAYAS = algeriaData as Wilaya[];

export function getWilayaByCode(code: string) {
  return WILAYAS.find((wilaya) => wilaya.code === code);
}

export function getCommuneById(wilayaCode: string, communeId: string) {
  return getWilayaByCode(wilayaCode)?.communes.find(
    (commune) => commune.id === communeId
  );
}
