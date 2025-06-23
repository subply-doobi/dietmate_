import { useAppSelector } from "@/shared/hooks/reduxHooks";
import { Col } from "@/shared/ui/styledComps";
import HorizontalFoodlist from "./HorizontalFoodlist";
import { SCREENWIDTH } from "@/shared/constants";
import { IProductData } from "@/shared/api/types/product";

const ListFooterComponent = () => {
  const recentlyOrderedFoods = useAppSelector(
    (state) => state.filteredProduct.recentlyOrderedFoods
  );

  const row2Foods = [...recentlyOrderedFoods] as unknown as IProductData[];

  return (
    <Col style={{ marginTop: 40 }}>
      {recentlyOrderedFoods.length > 0 && (
        <HorizontalFoodlist
          title="최근 주문한 식품"
          subTitle="최근에 주문한 식품을 확인해보세요"
          products={row2Foods}
          itemSize={(SCREENWIDTH - 32 - 24) / 4}
          paddingHorizontal={0}
        />
      )}
    </Col>
  );
};

export default ListFooterComponent;
