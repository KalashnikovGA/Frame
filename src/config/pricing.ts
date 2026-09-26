export type Species = "birch" | "oak" | "walnut";
export type Size = 8 | 10 | 13;

export const SPECIES: { id: Species; name: string; genitive: string; color: string }[] = [
  { id: "birch", name: "Берёза", genitive: "берёзы", color: "#E6D3B3" },
  { id: "oak", name: "Дуб", genitive: "дуба", color: "#C49A6C" },
  { id: "walnut", name: "Орех", genitive: "ореха", color: "#5C3B28" },
];

export const SIZES: { id: Size; label: string; screen: string; outer: string; weight: string }[] = [
  { id: 8, label: "8″", screen: "16 × 12 см", outer: "19 × 15 см", weight: "≈ 0,6 кг" },
  { id: 10, label: "10″", screen: "20 × 15 см", outer: "23 × 18 см", weight: "≈ 0,8 кг" },
  { id: 13, label: "13″", screen: "26 × 20 см", outer: "30 × 23 см", weight: "≈ 1,2 кг" },
];

/**
 * Предзаказные цены, ₽. Ориентировочные — могут измениться к старту производства.
 * 13″ орех — предварительная оценка, уточнить.
 */
export const PRICES: Record<Size, Record<Species, number>> = {
  8: { birch: 12900, oak: 12900, walnut: 12900 },
  10: { birch: 14900, oak: 14900, walnut: 18900 },
  13: { birch: 24900, oak: 24900, walnut: 28900 },
};

export const PRICE_NOTE = "Цена предзаказа";

export const DEFAULT_MODEL: { species: Species; size: Size } = { species: "birch", size: 10 };

export function getPrice(size: Size, species: Species) {
  return PRICES[size][species];
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value).replace(/ | /g, " ") + " ₽";
}

export function minPrice() {
  return Math.min(...Object.values(PRICES).flatMap((p) => Object.values(p)));
}

export function speciesName(id: Species) {
  return SPECIES.find((s) => s.id === id)!.name;
}

export function modelLabel(size: Size, species: Species) {
  return `${size}″ · ${speciesName(species).toLowerCase()}`;
}
