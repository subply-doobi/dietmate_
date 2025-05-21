import { IOrderedProduct } from "../../../api/types/order";

export interface IFlattedOrderedProduct extends IOrderedProduct {
  qtyIdx: number;
  dietSeq: string;
}

export const flatOrderMenuWithQty = (
  order: IOrderedProduct[][] | undefined
) => {
  if (!order) return [];

  let flattedMenu: IFlattedOrderedProduct[][] = [];

  order.forEach((menu, menuIdx) => {
    const menuQty = parseInt(menu[0].qty, 10);
    for (let i = 0; i < menuQty; i++) {
      let newMenu: IFlattedOrderedProduct[] = [];
      for (let j = 0; j < menu.length; j++) {
        newMenu.push({ ...menu[j], qtyIdx: i, dietSeq: `끼니${menuIdx + 1}` });
      }
      flattedMenu.push(newMenu);
    }
  });
  return flattedMenu;
};
