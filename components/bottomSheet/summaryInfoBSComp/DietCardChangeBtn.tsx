import {
  setPChangeStep,
  setSummaryInfoPToRemove,
} from "@/features/reduxSlices/bottomSheetSlice";
import colors from "@/shared/colors";
import { ENV, SERVICE_PRICE_PER_PRODUCT } from "@/shared/constants";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import {
  Col,
  HorizontalLine,
  HorizontalSpace,
  Row,
  TextMain,
  TextSub,
} from "@/shared/ui/styledComps";
import { Image } from "react-native";
import styled from "styled-components/native";
import Icon from "@/shared/ui/Icon";
import { setSummaryInfoPToAdd } from "@/features/reduxSlices/bottomSheetSlice";
import { FlatList } from "react-native-gesture-handler";
import {
  useCreateDietDetail,
  useDeleteDietDetail,
} from "@/shared/api/queries/diet";
import ProductRow from "./ProductRow";
import React, { useEffect, useRef } from "react";

const DietCardChangeBtn = ({ dietNo }: { dietNo: string }) => {
  // redux
  const dispatch = useAppDispatch();
  const decisions = useAppSelector(
    (state) => state.bottomSheet.bsData.summaryInfo.ctaDecisions
  );
  const selectedPMap = useAppSelector(
    (state) => state.bottomSheet.bsData.summaryInfo.selectedPMap
  );
  const pChangeStep = useAppSelector(
    (state) => state.bottomSheet.bsData.summaryInfo.pChangeStep
  );
  const decision = decisions[dietNo];
  const selected = selectedPMap[dietNo];
  const pToRemove = selected?.pToRemove;
  const pToAdd = selected?.pToAdd;

  if (decision?.type !== "Change" || !pToRemove) return null;
  const plan = decision.switchPlan;
  const planForSelected = plan[pToRemove.product.productNo];
  if (!planForSelected) return null;

  // react-query
  const deleteDietDetailMutation = useDeleteDietDetail();
  const createDietDetailMutation = useCreateDietDetail();

  // step
  // 0. hide : 버튼 비노출
  // 1. standBy : 교체 가능한 식품 보기 버튼
  // 2. showCandidates : hlist노출, 버튼은 비활성 (btnText: 교체할 식품을 선택해주세요)
  // 3. confirm : 교체하기 | 취소 버튼 노출

  const isReadyToChange = !!pToRemove && !!pToAdd;
  const confirmedStep =
    plan[pToRemove.product.productNo] === undefined ||
    plan[pToRemove.product.productNo].addCandidates.length === 0
      ? "hide"
      : pChangeStep === "standBy"
      ? "standBy"
      : pChangeStep === "showCandidates" && !isReadyToChange
      ? "showCandidates"
      : "confirm";

  const targetPlatform =
    decision.switchPlan[pToRemove.product.productNo]?.platforms || [];

  const targetPlatformText = `${targetPlatform.join(", ")}`;

  const btnText =
    confirmedStep === "hide"
      ? ""
      : confirmedStep === "standBy"
      ? "교체 가능한 식품 보기"
      : confirmedStep === "showCandidates"
      ? "교체할 식품을 선택해주세요"
      : "교체하기";

  // fn
  const initializeState = () => {
    dispatch(setSummaryInfoPToRemove(null));
    dispatch(setPChangeStep("standBy"));
  };

  const onPress = async () => {
    if (confirmedStep === "hide") return;

    if (confirmedStep === "standBy") {
      dispatch(setPChangeStep("showCandidates"));
      return;
    }

    if (confirmedStep === "showCandidates") {
      return;
    }

    if (confirmedStep === "confirm") {
      // 교체 처리
      if (!pToAdd) return;
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
    }
  };

  console.log(
    "addCandidates",
    plan[pToRemove.product.productNo]?.addCandidates.length
  );

  // preserve horizontal scroll position across hide/show
  const listRef = useRef<FlatList>(null);
  const lastOffsetRef = useRef(0);

  useEffect(() => {
    if (confirmedStep === "showCandidates" && lastOffsetRef.current > 0) {
      // Use a short timeout to ensure FlatList is fully mounted
      console.log("scrollTo last offset:", lastOffsetRef.current);
      const timer = setTimeout(() => {
        listRef.current?.scrollToOffset({
          offset: lastOffsetRef.current,
          animated: true,
        });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [confirmedStep]);

  return (
    <Col>
      {/* candidate list */}
      {confirmedStep === "showCandidates" && (
        <Col style={{ marginTop: 16 }}>
          <HorizontalLine lineColor={colors.line} />
          <HorizontalSpace height={40} />
          <TargetPlatformText>
            "{pToRemove.product.productNm}"와(과) 영양이 비슷한 {"\n"}
            <TargetPlatformText style={{ color: colors.green }}>
              "{targetPlatformText}"
            </TargetPlatformText>{" "}
            식품들 입니다
          </TargetPlatformText>
          <FlatList
            ref={listRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ marginTop: 16 }}
            data={plan[pToRemove.product.productNo]?.addCandidates || []}
            keyExtractor={(item) => item.productNo}
            onScroll={(e) => {
              lastOffsetRef.current = e.nativeEvent.contentOffset.x;
            }}
            scrollEventThrottle={16}
            renderItem={({ item: cand }) => {
              const selected = pToAdd?.product?.productNo === cand.productNo;
              const priceWithService =
                (Number(cand.price) || 0) + SERVICE_PRICE_PER_PRODUCT;
              return (
                <CandidateCard
                  activeOpacity={0.8}
                  onPress={() =>
                    dispatch(
                      setSummaryInfoPToAdd({
                        dietNo,
                        product: cand,
                      })
                    )
                  }
                >
                  <ThumbBox>
                    {cand.mainAttUrl ? (
                      <Thumb
                        source={{ uri: `${ENV.BASE_URL}${cand.mainAttUrl}` }}
                      />
                    ) : (
                      <ThumbPlaceholder />
                    )}
                    {selected && (
                      <SelectedOverlay>
                        <Icon
                          name="checkbox"
                          iconSize={16}
                          boxSize={18}
                          style={{ position: "absolute", top: 0, right: 0 }}
                          color={colors.green}
                        />
                      </SelectedOverlay>
                    )}
                  </ThumbBox>
                  <NmPrice>
                    <NmText numberOfLines={2} ellipsizeMode="tail">
                      {cand.productNm}
                    </NmText>
                    <PriceText>{priceWithService.toLocaleString()}원</PriceText>
                  </NmPrice>
                </CandidateCard>
              );
            }}
          />
        </Col>
      )}
      {/* changeBtn - only show for standBy and showCandidates */}
      {confirmedStep !== "confirm" && (
        <Row
          style={{
            marginTop: confirmedStep === "showCandidates" ? 40 : 24,
            columnGap: 8,
          }}
        >
          <CtaButton
            onPress={onPress}
            style={{
              borderColor: colors.line,
            }}
          >
            <CtaText
              disabled={
                confirmedStep === "hide" || confirmedStep === "showCandidates"
              }
            >
              {btnText}
            </CtaText>
          </CtaButton>
        </Row>
      )}
    </Col>
  );
};

export default DietCardChangeBtn;

const TargetPlatformText = styled(TextMain)`
  font-size: 12px;
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
const CtaText = styled(TextMain)<{ disabled?: boolean }>`
  font-size: 12px;
  line-height: 16px;
  color: ${({ disabled }) => (disabled ? colors.textSub : colors.white)};
`;

const CandidateCard = styled.TouchableOpacity`
  width: 64px;
  height: 120px;
  margin-right: 12px;
  align-items: center;
`;

const ThumbBox = styled.View`
  width: 64px;
  height: 64px;
  border-radius: 4px;
  background-color: ${colors.inactive};
  overflow: hidden;
  position: relative;
`;

const Thumb = styled(Image)`
  width: 64px;
  height: 64px;
`;

const ThumbPlaceholder = styled.View`
  width: 64px;
  height: 64px;
  border-radius: 4px;
  background-color: #d9d9d9;
`;

const SelectedOverlay = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: ${colors.blackOpacity70};
  align-items: center;
  justify-content: center;
`;

const NmPrice = styled.View`
  width: 64px;
  padding: 0 2px;
  margin-top: 4px;
  align-items: center;
`;

const NmText = styled(TextMain)`
  font-size: 12px;
  color: ${colors.textSub};
`;

const PriceText = styled(TextSub)`
  font-size: 12px;
  color: ${colors.textSub};
`;
