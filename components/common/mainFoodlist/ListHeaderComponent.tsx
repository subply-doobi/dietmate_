import { Col, HorizontalSpace } from "@/shared/ui/styledComps";
import SortFilter from "./SortFilter";
import HorizontalFoodlist from "./HorizontalFoodlist";
import { useAppSelector } from "@/shared/hooks/reduxHooks";
import { SCREENWIDTH } from "@/shared/constants";
import { IProductData } from "@/shared/api/types/product";
import Animated from "react-native-reanimated";
import { useEffect, useState } from "react";

interface IListHeaderComponent {
  animatedStyle?: any;
}
const ListHeaderComponent = ({ animatedStyle }: IListHeaderComponent) => {
  const recentlyOpenedFoods = useAppSelector(
    (state) => state.filteredProduct.recentlyOpenedFoods
  );
  const likedFoods = useAppSelector(
    (state) => state.filteredProduct.likedFoods
  );
  const random3Foods = useAppSelector(
    (state) => state.filteredProduct.random3Foods
  );

  // useState
  const [foodlist, setFoodlist] = useState<IProductData[]>([]);
  // Combine the food lists for display without duplicates plus random ordering
  useEffect(() => {
    const rowFoods1 = [
      ...recentlyOpenedFoods,
      ...likedFoods,
      ...random3Foods,
    ].filter(
      (food, index, self) =>
        index === self.findIndex((f) => f.productNo === food.productNo)
    ) as unknown as IProductData[];
    // Shuffle the combined list
    rowFoods1.sort(() => Math.random() - 0.5);
    setFoodlist(rowFoods1);
  }, []);

  return (
    <Col style={{ marginTop: 24 }}>
      {foodlist.length > 0 && (
        <HorizontalFoodlist
          title="추천 식품"
          subTitle="좋아할 만한 식품을 추천해드려요"
          products={foodlist}
          itemSize={(SCREENWIDTH - 32 - 16) / 3}
        />
      )}
      <SortFilter />
    </Col>
  );
};

export default ListHeaderComponent;
