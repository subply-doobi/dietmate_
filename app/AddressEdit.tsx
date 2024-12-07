// RN, expo
import { useEffect, useState } from "react";
import { ScrollView, Modal, SafeAreaView } from "react-native";

// 3rd
import styled from "styled-components/native";
import Postcode from "@actbase/react-daum-postcode";
import { OnCompleteParams } from "@actbase/react-daum-postcode/lib/types";

// doobi
import { setselectedAddrIdx } from "@/features/reduxSlices/orderSlice";
import { icons } from "@/shared/iconSource";
import { SCREENWIDTH } from "@/shared/constants";
import {
  AlertContentContainer,
  BtnCTA,
  BtnText,
  Container,
  HorizontalSpace,
  InputHeaderText,
  Row,
  StickyFooter,
  TextMain,
  TextSub,
} from "@/shared/ui/styledComps";
import colors from "@/shared/colors";

import DAlert from "@/shared/ui/DAlert";
import { useCreateAddress, useListAddress } from "@/shared/api/queries/address";
import {
  useDeleteAddress,
  useUpdateAddress,
} from "@/shared/api/queries/address";

import { setAddrBase, setValue } from "@/features/reduxSlices/userInputSlice";
import DTextInput from "@/shared/ui/DTextInput";
import { openModal, closeModal } from "@/features/reduxSlices/modalSlice";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";

const renderDeleteAlertContent = () => (
  <AlertContentContainer>
    <AlertText>해당 배송지를</AlertText>
    <AlertText>삭제하시겠어요?</AlertText>
  </AlertContentContainer>
);

const AddressEdit = () => {
  // redux
  const dispatch = useAppDispatch();
  const { selectedAddrIdx } = useAppSelector((state) => state.order);
  const { addr1, addr2, zipCode } = useAppSelector((state) => state.userInput);
  const addressDeleteAlert = useAppSelector(
    (state) => state.modal.modal.addressDeleteAlert
  );

  // navigation
  const { setOptions } = useNavigation();
  const router = useRouter();
  const params = useLocalSearchParams();

  //react-query
  const createAddressMutation = useCreateAddress();
  const updateAddressMutation = useUpdateAddress();
  const deleteAddressMutation = useDeleteAddress();
  const { data: listAddressData } = useListAddress();

  // useState
  const [postModalVisible, setPostModalVisible] = useState(false);

  // etc
  const addrNo = params.addrNo ?? params.addrNo;
  const addrIdx = listAddressData?.findIndex((v) => v.addrNo === addrNo);
  const isUpdate = !!params.addrNo;
  const hasAddrValue = !!addr1.value && !!zipCode.value;
  const ctaBtnText = !hasAddrValue
    ? "주소를 입력해주세요"
    : addr2.value === ""
    ? "상세주소를 입력해주세요"
    : "확인";

  // 주소 update or create
  const onConfirmBtnPress = () => {
    if (!addr1.value || !zipCode.value) return;
    if (isUpdate) {
      // addressUpdate
      updateAddressMutation.mutate({
        addrNo: params.addrNo as string,
        zipCode: zipCode.value,
        addr1: addr1.value,
        addr2: addr2.value,
      });
      router.push({ pathname: "/Order" });
      return;
    }
    // addressCreate
    createAddressMutation.mutate({
      zipCode: zipCode.value,
      addr1: addr1.value,
      addr2: addr2.value,
    });
    dispatch(setselectedAddrIdx(listAddressData ? listAddressData.length : 0));
    router.push({ pathname: "/Order" });
  };

  // 우편번호 검색 후 주소 선택
  const onPostCodeSelected = (data: OnCompleteParams) => {
    dispatch(
      setAddrBase({
        addr1: data.roadAddress,
        zipCode: String(data.zonecode),
      })
    );
    setPostModalVisible(false);
  };

  // 주소 삭제
  const onDeleteAlertConfirm = () => {
    const nextAddrIdx =
      addrIdx === undefined || selectedAddrIdx === 0
        ? 0
        : selectedAddrIdx < addrIdx
        ? selectedAddrIdx
        : selectedAddrIdx - 1;

    deleteAddressMutation.mutate(addrNo as string);
    dispatch(setselectedAddrIdx(nextAddrIdx));
    router.push({ pathname: "/Order" });
  };

  // useEffect
  useEffect(() => {
    setOptions({
      headerTitle: isUpdate ? "배송지 변경" : "배송지 추가",
    });
  }, [params]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
        <Container>
          {hasAddrValue && (
            <>
              {/* 기본주소 */}
              <Row style={{ marginTop: 24, justifyContent: "space-between" }}>
                <PostalCode>우편번호: {zipCode.value}</PostalCode>
                {isUpdate && (
                  <AddressDeleteBtn
                    onPress={() =>
                      dispatch(openModal({ name: "addressDeleteAlert" }))
                    }
                  >
                    <AddressDeleteIcon source={icons.cancelRound_24} />
                  </AddressDeleteBtn>
                )}
              </Row>
              <AddressBase>{addr1.value}</AddressBase>
              <HorizontalSpace height={24} />

              {/* 상세주소 */}
              <DTextInput
                headerText="상세주소"
                placeholder={"상세주소"}
                value={addr2.value}
                onChangeText={(v) =>
                  dispatch(setValue({ name: "addr2", value: v }))
                }
                isActive={!!addr2.value}
                isValid={addr2.isValid}
                keyboardType="default"
              />
            </>
          )}

          {/* 주소찾기 modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={postModalVisible}
            onRequestClose={() => setPostModalVisible(!postModalVisible)}
            style={{
              flex: 1,
              margin: 0,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ModalBackground>
              <ModalOutside onPress={() => setPostModalVisible(false)} />
              {/* daum-post-code */}
              <Postcode
                style={{ width: SCREENWIDTH - 32, height: 410 }}
                jsOptions={{ animation: true, hideMapBtn: false }}
                onSelected={(data) => onPostCodeSelected(data)}
                onError={() => console.error("오류")}
              />
            </ModalBackground>
          </Modal>

          {/* 주소 delete 알럿 */}
          <DAlert
            alertShow={addressDeleteAlert.isOpen}
            onCancel={() =>
              dispatch(closeModal({ name: "addressDeleteAlert" }))
            }
            onConfirm={() => onDeleteAlertConfirm()}
            NoOfBtn={2}
            renderContent={renderDeleteAlertContent}
            confirmLabel={"삭제"}
          />
        </Container>
      </ScrollView>

      {/* 1. 주소추가,변경 | 2. 확인 버튼 */}
      <BtnBox>
        <AddressEditBtn
          btnStyle="border"
          onPress={() => setPostModalVisible(true)}
        >
          <BtnText style={{ color: colors.textSub, fontSize: 16 }}>
            {hasAddrValue ? "주소 전체변경" : " + 주소 추가"}
          </BtnText>
        </AddressEditBtn>
        <AddressConfirmBtn
          btnStyle={ctaBtnText === "확인" ? "activated" : "inactivated"}
          disabled={ctaBtnText !== "확인"}
          onPress={() => onConfirmBtnPress()}
        >
          <BtnText>{ctaBtnText}</BtnText>
        </AddressConfirmBtn>
      </BtnBox>
    </SafeAreaView>
  );
};

export default AddressEdit;

const PostalCode = styled(TextSub)`
  font-size: 16px;
`;

const AddressDeleteBtn = styled.TouchableOpacity`
  width: 24px;
  height: 24px;
`;

const AddressDeleteIcon = styled.Image`
  width: 24px;
  height: 24px;
`;

const AddressBase = styled(TextMain)`
  font-size: 20px;
  margin-top: 16px;
`;

const AddressEditBtn = styled(BtnCTA)`
  height: 48px;
`;
const AddressConfirmBtn = styled(BtnCTA)`
  margin-top: 8px;
  margin-bottom: 8px;
`;

const AlertText = styled(TextMain)`
  font-size: 16px;
  line-height: 20px;
  align-self: center;
`;
const ModalBackground = styled.View`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #000000a6;
`;

const ModalOutside = styled.Pressable`
  width: 100%;
  height: 100%;
  position: absolute;
`;

const BtnBox = styled(StickyFooter)``;
