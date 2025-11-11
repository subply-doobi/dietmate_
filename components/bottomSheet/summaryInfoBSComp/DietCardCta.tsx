import {
  plusQty,
  setSummaryInfoPToRemove,
  snapBS,
} from "@/features/reduxSlices/bottomSheetSlice";
import { scrollCarouselTo } from "@/features/reduxSlices/formulaSlice";
import { useListDietTotalObj } from "@/shared/api/queries/diet";
import colors from "@/shared/colors";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { TextMain } from "@/shared/ui/styledComps";
import { useRouter } from "expo-router";
import styled from "styled-components/native";

const DietCardCta = ({ dietNo }: { dietNo: string }) => {
  // navigation
  const router = useRouter();

  // redux
  const dispatch = useAppDispatch();
  const decisions = useAppSelector(
    (state) => state.bottomSheet.bsData.summaryInfo.ctaDecisions
  );
  const selectedPMap = useAppSelector(
    (state) => state.bottomSheet.bsData.summaryInfo.selectedPMap
  );
  const qtyChangedDietNoArr = useAppSelector(
    (state) => state.bottomSheet.bsData.summaryInfo.changedDietNoArr
  );

  // react-query
  const { data: dTOData } = useListDietTotalObj();

  const decision = decisions?.[dietNo];
  const selected = selectedPMap[dietNo];
  const pToRemove = selected?.pToRemove;

  const ctaType = decision?.type;
  if (!ctaType || ctaType === "None") return null;

  const ctaDisabled = !!pToRemove || qtyChangedDietNoArr.length > 0;
  if (ctaDisabled) return null;

  const switchPlan =
    (decision?.type === "Change" && decision?.switchPlan) || {};
  const pToRemoveTarget = Object.values(switchPlan).sort(
    (a, b) => parseInt(a.remove.price) - parseInt(b.remove.price)
  )[0]?.remove;

  // fn
  const onPress = () => {
    switch (ctaType) {
      case "AddProduct":
        const menuIdx = Object.keys(dTOData || {}).indexOf(dietNo);
        dispatch(
          snapBS({
            index: 0,
            bsNm: "summaryInfo",
            from: "DietCard.tsx",
          })
        );
        setTimeout(() => {
          dispatch(scrollCarouselTo({ index: menuIdx, from: "DietCard.tsx" }));
        }, 300);
        break;

      case "Change":
        dispatch(setSummaryInfoPToRemove({ dietNo, product: pToRemoveTarget }));
        break;

      case "AddQty":
        const req = decision?.requiredQty ?? 0;
        for (let i = 0; i < req; i++) {
          dispatch(plusQty({ dietNo }));
        }
        break;

      case "AddTargetSellerProduct":
        const targetSeller = decision?.targetPlatforms?.[0];
        router.push({
          pathname: "/AutoAdd",
          params: {
            menu: JSON.stringify([]),
            initialSortFilter: JSON.stringify({ platformNm: [targetSeller] }),
          },
        });
        break;
      default:
        break;
    }
  };

  // etc
  const ctaText = decision?.ctaBtnText;

  return (
    <CtaButton onPress={onPress} disabled={ctaDisabled}>
      <CtaText>{ctaText}</CtaText>
    </CtaButton>
  );
};

export default DietCardCta;

const CtaButton = styled.TouchableOpacity`
  width: 100%;
  height: 40px;
  border-radius: 4px;
  border-width: 0.5px;
  border-color: ${colors.line};
  flex-direction: row;
  margin-top: 40px;
  justify-content: center;
  align-items: center;
`;
const CtaText = styled(TextMain)`
  font-size: 12px;
  line-height: 16px;
  color: ${colors.white};
`;
