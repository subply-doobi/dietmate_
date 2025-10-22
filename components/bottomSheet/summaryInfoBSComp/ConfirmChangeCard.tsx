import {
  setPChangeStep,
  setSummaryInfoPToAdd,
  setSummaryInfoPToRemove,
} from "@/features/reduxSlices/bottomSheetSlice";
import colors from "@/shared/colors";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { Col, Row, TextMain } from "@/shared/ui/styledComps";
import styled from "styled-components/native";
import {
  useCreateDietDetail,
  useDeleteDietDetail,
} from "@/shared/api/queries/diet";
import ProductRow from "./ProductRow";
import Icon from "@/shared/ui/Icon";

interface ConfirmChangeCardProps {
  dietNo: string;
}

const ConfirmChangeCard = ({ dietNo }: ConfirmChangeCardProps) => {
  // redux
  const dispatch = useAppDispatch();
  const selectedPMap = useAppSelector(
    (state) => state.bottomSheet.bsData.summaryInfo.selectedPMap
  );
  const decisions = useAppSelector(
    (state) => state.bottomSheet.bsData.summaryInfo.ctaDecisions
  );

  const selected = selectedPMap[dietNo];
  const pToRemove = selected?.pToRemove;
  const pToAdd = selected?.pToAdd;
  const decision = decisions[dietNo];

  // react-query
  const deleteDietDetailMutation = useDeleteDietDetail();
  const createDietDetailMutation = useCreateDietDetail();

  if (!pToRemove || !pToAdd || decision?.type !== "Change") return null;

  const targetPlatformNm = pToAdd.product.platformNm;

  // fn
  const initializeState = () => {
    dispatch(setSummaryInfoPToRemove(null));
    dispatch(setSummaryInfoPToAdd(null));
    dispatch(setPChangeStep("standBy"));
  };

  const handleConfirm = async () => {
    try {
      // 1. 기존 식품 삭제
      await deleteDietDetailMutation.mutateAsync({
        dietNo,
        productNo: pToRemove.product.productNo,
      });
      // 2. 새 식품 추가
      await createDietDetailMutation.mutateAsync({
        dietNo,
        food: pToAdd.product,
      });
      // 3. 상태 초기화
      initializeState();
    } catch (error) {
      console.error("Error changing diet detail:", error);
    }
  };

  const handleCancel = () => {
    dispatch(setSummaryInfoPToAdd(null));
    dispatch(setPChangeStep("showCandidates"));
  };

  return (
    <Card>
      <PlatformBadge>
        <PlatformText>{targetPlatformNm}</PlatformText>
      </PlatformBadge>

      <Col style={{ marginTop: 16 }}>
        <HeaderText>다음 식품으로 교체됩니다</HeaderText>
        <Col
          style={{
            marginTop: 12,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Icon
            name="chevronDown"
            iconSize={18}
            boxSize={24}
            color={colors.textSub}
          />
        </Col>
        <ProductRow product={pToAdd.product} showInfo={true} />
      </Col>

      <Row style={{ marginTop: 24, columnGap: 8 }}>
        <CtaButton onPress={handleCancel}>
          <CtaText>취소</CtaText>
        </CtaButton>
        <CtaButton onPress={handleConfirm} style={{ borderColor: colors.main }}>
          <CtaText>교체하기</CtaText>
        </CtaButton>
      </Row>
    </Card>
  );
};

export default ConfirmChangeCard;

const Card = styled.View`
  width: 100%;
  background-color: ${colors.blackOpacity50};
  padding: 24px 16px;
  border-radius: 16px;
  border-width: 1px;
  border-color: ${colors.main};
`;

const PlatformBadge = styled.View`
  align-self: flex-start;
  padding: 4px 8px;
  background-color: ${colors.blackOpacity30};
  border-radius: 4px;
`;

const PlatformText = styled(TextMain)`
  font-size: 12px;
  line-height: 16px;
  color: ${colors.green};
`;

const HeaderText = styled(TextMain)`
  font-size: 14px;
  line-height: 18px;
  color: ${colors.textSub};
`;

const CtaButton = styled.TouchableOpacity`
  flex-direction: row;
  flex: 1;
  height: 40px;
  border-radius: 4px;
  border-width: 0.5px;
  border-color: ${colors.line};
  justify-content: center;
  align-items: center;
`;

const CtaText = styled(TextMain)`
  font-size: 12px;
  line-height: 16px;
  color: ${colors.white};
`;
