import { ISortFilter } from "@/features/reduxSlices/sortFilterSlice";

export const checkisFiltered = (
  filter: ISortFilter["filter"],
  filterId: number
) => {
  // 카테고리
  if (filterId === 0) return filter.category.length > 0;

  // 가격
  if (filterId === 2) return filter.price.length > 0;

  // 영양성분
  return Object.values(filter.nutrition).some((value) => value.length > 0);
};
