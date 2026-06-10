/**
 * Shipping office pickup locations per wilaya.
 * Key = wilaya code (string), Value = array of commune name slugs that have an office.
 * Wilayas with no office entries show an Arabic unavailability message.
 */

export interface StopDeskCommune {
  /** Unique key within the wilaya, used as DB primary key component */
  key: string;
  /** Display name in French (as typed by admin) */
  nameFr: string;
  /** Display name in Arabic */
  nameAr: string;
}

export interface StopDeskWilaya {
  /** Wilaya code matching algeria-data.json */
  wilayaCode: string;
  communes: StopDeskCommune[];
}

/** Raw office pickup data per wilaya */
export const STOP_DESK_DATA: StopDeskWilaya[] = [
  {
    wilayaCode: "1",
    communes: [{ key: "adrar", nameFr: "Adrar", nameAr: "أدرار" }],
  },
  {
    wilayaCode: "2",
    communes: [
      { key: "chlef", nameFr: "Chlef", nameAr: "الشلف" },
      { key: "tenes", nameFr: "Ténès", nameAr: "تنس" },
    ],
  },
  {
    wilayaCode: "3",
    communes: [{ key: "laghouat", nameFr: "Laghouat", nameAr: "الأغواط" }],
  },
  {
    wilayaCode: "4",
    communes: [
      { key: "ain_fekroune", nameFr: "Ain Fekroune", nameAr: "عين فكرون" },
      { key: "oum_el_bouaghi", nameFr: "Oum El Bouaghi", nameAr: "أم البواقي" },
      { key: "ain_el_beida", nameFr: "Ain El Beida", nameAr: "عين البيضاء" },
    ],
  },
  {
    wilayaCode: "5",
    communes: [{ key: "batna", nameFr: "Batna", nameAr: "باتنة" }],
  },
  {
    wilayaCode: "6",
    communes: [
      { key: "bejaia", nameFr: "Béjaïa", nameAr: "بجاية" },
      { key: "kherrata", nameFr: "Kherrata", nameAr: "خراطة" },
      { key: "akbou", nameFr: "Akbou", nameAr: "أقبو" },
    ],
  },
  {
    wilayaCode: "7",
    communes: [{ key: "biskra", nameFr: "Biskra", nameAr: "بسكرة" }],
  },
  {
    wilayaCode: "8",
    communes: [{ key: "bechar", nameFr: "Béchar", nameAr: "بشار" }],
  },
  {
    wilayaCode: "9",
    communes: [
      { key: "blida", nameFr: "Blida", nameAr: "البليدة" },
      { key: "beni_merad", nameFr: "Beni Merad", nameAr: "بني مراد" },
      { key: "boufarik", nameFr: "Boufarik", nameAr: "بوفاريك" },
      { key: "ouled_yaich", nameFr: "Ouled Yaïch", nameAr: "أولاد يعيش" },
      { key: "bouinan", nameFr: "Bouinan", nameAr: "بوينان" },
      { key: "bougara", nameFr: "Bougara", nameAr: "بوقرة" },
      { key: "mouzaia", nameFr: "Mouzaia", nameAr: "موزاية" },
    ],
  },
  {
    wilayaCode: "10",
    communes: [{ key: "bouira", nameFr: "Bouira", nameAr: "البويرة" }],
  },
  {
    wilayaCode: "11",
    communes: [{ key: "tamanrasset", nameFr: "Tamanrasset", nameAr: "تمنراست" }],
  },
  {
    wilayaCode: "12",
    communes: [{ key: "tebessa", nameFr: "Tébessa", nameAr: "تبسة" }],
  },
  {
    wilayaCode: "13",
    communes: [
      { key: "tlemcen", nameFr: "Tlemcen", nameAr: "تلمسان" },
      { key: "sebdou", nameFr: "Sebdou", nameAr: "سبدو" },
    ],
  },
  {
    wilayaCode: "14",
    communes: [{ key: "tiaret", nameFr: "Tiaret", nameAr: "تيارت" }],
  },
  {
    wilayaCode: "15",
    communes: [{ key: "tizi_ouzou", nameFr: "Tizi Ouzou", nameAr: "تيزي وزو" }],
  },
  {
    wilayaCode: "16",
    communes: [
      { key: "bab_el_oued", nameFr: "Bab El Oued", nameAr: "باب الواد" },
      { key: "bab_ezzouar", nameFr: "Bab Ezzouar", nameAr: "باب الزوار" },
      { key: "bir_touta", nameFr: "Bir Touta", nameAr: "بئر توتة" },
      { key: "cheraga", nameFr: "Chéraga", nameAr: "شراقة" },
      { key: "djasr_kasentina", nameFr: "Djasr Kasentina", nameAr: "جسر قسنطينة" },
      { key: "kouba", nameFr: "Kouba", nameAr: "القبة" },
      { key: "reghaia", nameFr: "Réghaïa", nameAr: "الرغاية" },
      { key: "les_eucalypyus", nameFr: "Les Eucalyptus", nameAr: "الكاليتوس" },
      { key: "birkhadem", nameFr: "Birkhadem", nameAr: "بئر خادم" },
      { key: "hydra", nameFr: "Hydra", nameAr: "حيدرة" },
      { key: "ouled_fayet", nameFr: "Ouled Fayet", nameAr: "أولاد فايت" },
      { key: "el_jomhoria", nameFr: "El Jomhoria", nameAr: "الجمهورية" },
      { key: "baraki", nameFr: "Baraki", nameAr: "براقي" },
    ],
  },
  {
    wilayaCode: "17",
    communes: [
      { key: "djelfa", nameFr: "Djelfa", nameAr: "الجلفة" },
      { key: "taher", nameFr: "Taher", nameAr: "الطاهر" },
    ],
  },
  {
    wilayaCode: "18",
    communes: [{ key: "jijel", nameFr: "Jijel", nameAr: "جيجل" }],
  },
  {
    wilayaCode: "19",
    communes: [
      { key: "setif", nameFr: "Sétif", nameAr: "سطيف" },
      { key: "el_eulma", nameFr: "El Eulma", nameAr: "العلمة" },
    ],
  },
  {
    wilayaCode: "20",
    communes: [{ key: "saida", nameFr: "Saïda", nameAr: "سعيدة" }],
  },
  {
    wilayaCode: "21",
    communes: [
      { key: "skikda", nameFr: "Skikda", nameAr: "سكيكدة" },
      { key: "al_arrouch", nameFr: "El Arrouch", nameAr: "العروش" },
    ],
  },
  {
    wilayaCode: "22",
    communes: [{ key: "sidi_bel_abbes", nameFr: "Sidi Bel Abbès", nameAr: "سيدي بلعباس" }],
  },
  {
    wilayaCode: "23",
    communes: [
      { key: "annaba", nameFr: "Annaba", nameAr: "عنابة" },
      { key: "el_bouni", nameFr: "El Bouni", nameAr: "البوني" },
    ],
  },
  {
    wilayaCode: "24",
    communes: [{ key: "guelma", nameFr: "Guelma", nameAr: "قالمة" }],
  },
  {
    wilayaCode: "25",
    communes: [
      { key: "constantine", nameFr: "Constantine", nameAr: "قسنطينة" },
      { key: "el_khroub", nameFr: "El Khroub", nameAr: "الخروب" },
    ],
  },
  {
    wilayaCode: "26",
    communes: [{ key: "medea", nameFr: "Médéa", nameAr: "المدية" }],
  },
  {
    wilayaCode: "27",
    communes: [
      { key: "mostaganem", nameFr: "Mostaganem", nameAr: "مستغانم" },
      { key: "mazagran", nameFr: "Mazagran", nameAr: "مازاغران" },
    ],
  },
  {
    wilayaCode: "28",
    communes: [{ key: "msila", nameFr: "M'Sila", nameAr: "المسيلة" }],
  },
  {
    wilayaCode: "29",
    communes: [
      { key: "mascara", nameFr: "Mascara", nameAr: "معسكر" },
      { key: "sig", nameFr: "Sig", nameAr: "سيق" },
    ],
  },
  {
    wilayaCode: "30",
    communes: [{ key: "ouargla", nameFr: "Ouargla", nameAr: "ورقلة" }],
  },
  {
    wilayaCode: "31",
    communes: [
      { key: "oran", nameFr: "Oran", nameAr: "وهران" },
      { key: "sidi_chami", nameFr: "Sidi Chami", nameAr: "سيدي الشامي" },
      { key: "bir_el_djir", nameFr: "Bir El Djir", nameAr: "بئر الجير" },
    ],
  },
  {
    wilayaCode: "32",
    communes: [{ key: "el_bayadh", nameFr: "El Bayadh", nameAr: "البيض" }],
  },
  {
    wilayaCode: "33",
    communes: [{ key: "illizi", nameFr: "Illizi", nameAr: "إليزي" }],
  },
  {
    wilayaCode: "34",
    communes: [{ key: "bordj_bou_arreridj", nameFr: "Bordj Bou Arréridj", nameAr: "برج بوعريريج" }],
  },
  {
    wilayaCode: "35",
    communes: [
      { key: "boumerdes", nameFr: "Boumerdès", nameAr: "بومرداس" },
      { key: "bordj_menaiel", nameFr: "Bordj Ménaïel", nameAr: "برج منايل" },
    ],
  },
  {
    wilayaCode: "36",
    communes: [{ key: "el_tarf", nameFr: "El Tarf", nameAr: "الطارف" }],
  },
  {
    wilayaCode: "37",
    communes: [{ key: "tindouf", nameFr: "Tindouf", nameAr: "تندوف" }],
  },
  {
    wilayaCode: "38",
    communes: [{ key: "tissemsilt", nameFr: "Tissemsilt", nameAr: "تيسمسيلت" }],
  },
  {
    wilayaCode: "39",
    communes: [{ key: "el_oued", nameFr: "El Oued", nameAr: "الوادي" }],
  },
  {
    wilayaCode: "40",
    communes: [{ key: "khenchela", nameFr: "Khenchela", nameAr: "خنشلة" }],
  },
  {
    wilayaCode: "41",
    communes: [{ key: "souk_ahras", nameFr: "Souk Ahras", nameAr: "سوق أهراس" }],
  },
  {
    wilayaCode: "42",
    communes: [
      { key: "tipaza", nameFr: "Tipaza", nameAr: "تيبازة" },
      { key: "kolea", nameFr: "Koléa", nameAr: "قليعة" },
    ],
  },
  {
    wilayaCode: "43",
    communes: [{ key: "mila", nameFr: "Mila", nameAr: "ميلة" }],
  },
  {
    wilayaCode: "44",
    communes: [
      { key: "ain_defla", nameFr: "Aïn Defla", nameAr: "عين الدفلى" },
      { key: "khemis_miliana", nameFr: "Khemis Miliana", nameAr: "خميس مليانة" },
    ],
  },
  {
    wilayaCode: "45",
    communes: [{ key: "mechria", nameFr: "Mechria", nameAr: "مشرية" }],
  },
  {
    wilayaCode: "46",
    communes: [{ key: "ain_temouchent", nameFr: "Aïn Témouchent", nameAr: "عين تموشنت" }],
  },
  {
    wilayaCode: "47",
    communes: [{ key: "ghardaia", nameFr: "Ghardaïa", nameAr: "غرداية" }],
  },
  {
    wilayaCode: "48",
    communes: [{ key: "relizane", nameFr: "Relizane", nameAr: "غليزان" }],
  },
  {
    wilayaCode: "49",
    communes: [{ key: "timimoun", nameFr: "Timimoun", nameAr: "تيميمون" }],
  },
  // 50 - المنيعة: none
  {
    wilayaCode: "51",
    communes: [{ key: "ouled_djellal", nameFr: "Ouled Djellal", nameAr: "أولاد جلال" }],
  },
  // 52 - برج باجي مختار: none (user typed "52beni abbes" — likely meant wilaya 53)
  {
    wilayaCode: "53",
    communes: [{ key: "in_salah", nameFr: "In Salah", nameAr: "عين صالح" }],
  },
  // 54 - تيميمون (old): none
  {
    wilayaCode: "55",
    communes: [{ key: "touggourt", nameFr: "Touggourt", nameAr: "تقرت" }],
  },
  // 56 - جانت: none
  // 57 - عين صالح: none
  {
    wilayaCode: "58",
    communes: [{ key: "el_meniaa", nameFr: "El Ménéa", nameAr: "المنيعة" }],
  },
  // 59 - آفلو: none
  {
    wilayaCode: "60",
    communes: [{ key: "barika", nameFr: "Barika", nameAr: "بريكة" }],
  },
  // 61 - القنطرة: none
  // 62 - بئر العاتر: none
  // 63 - العريشة: none
  {
    wilayaCode: "64",
    communes: [{ key: "ksar_chellala", nameFr: "Ksar Chellala", nameAr: "قصر الشلالة" }],
  },
  {
    wilayaCode: "65",
    communes: [{ key: "ain_ouessara", nameFr: "Aïn Ouessara", nameAr: "عين وسارة" }],
  },
  // 66 - مسعد: none
  // 67 - قصر البخاري: none
  {
    wilayaCode: "68",
    communes: [{ key: "bou_saada", nameFr: "Bou Saâda", nameAr: "بوسعادة" }],
  },
  // 69 - الأبيض سيدي الشيخ: none
];

/** Map of wilayaCode → StopDeskWilaya for O(1) lookup */
export const STOP_DESK_MAP = new Map<string, StopDeskWilaya>(
  STOP_DESK_DATA.map((w) => [w.wilayaCode, w])
);

/**
 * Get office pickup locations for a given wilaya code.
 * Returns empty array if the wilaya has no office.
 */
export function getStopDeskCommunes(wilayaCode: string): StopDeskCommune[] {
  return STOP_DESK_MAP.get(wilayaCode)?.communes ?? [];
}

/** Returns true if a wilaya has at least one office */
export function wilayaHasStopDesk(wilayaCode: string): boolean {
  return getStopDeskCommunes(wilayaCode).length > 0;
}

/** All wilaya codes that have office coverage */
export const WILAYAS_WITH_STOP_DESK = new Set(STOP_DESK_DATA.map((w) => w.wilayaCode));
