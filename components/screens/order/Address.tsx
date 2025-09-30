import { Alert } from "react-native";
import styled from "styled-components/native";
import {
  AccordionContentContainer,
  BtnCTA,
  Col,
  HorizontalLine,
  Row,
  TextMain,
  TextSub,
} from "@/shared/ui/styledComps";
import { ENTRANCE_TYPE } from "@/shared/constants";
import { useListAddress } from "@/shared/api/queries/address";
import {
  loadAddressData,
  setValue,
} from "@/features/reduxSlices/userInputSlice";
import { setselectedAddrIdx } from "@/features/reduxSlices/orderSlice";
import { IAddressData } from "@/shared/api/types/address";
import SquareInput from "@/shared/ui/SquareInput";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { useRouter } from "expo-router";
import Icon from "@/shared/ui/Icon";
import colors from "@/shared/colors";

const EntranceMethodContainer = () => {
  // redux
  const dispatch = useAppDispatch();
  const { entranceType, entranceNote } = useAppSelector(
    (state) => state.userInput
  );

  return (
    <>
      <ContentTitle style={{ marginTop: 64 }}>배송 참고사항</ContentTitle>
      <Col style={{ marginTop: 30 }} />
      {ENTRANCE_TYPE.map((e, i) => {
        return (
          <Row key={i} style={{ marginBottom: 20 }}>
            <EntranceCheckBox
              onPress={() =>
                dispatch(setValue({ name: "entranceType", value: e }))
              }
            >
              <Icon
                name={
                  entranceType.value === e ? "checkbox" : "checkboxUnchecked"
                }
                color={
                  entranceType.value === e ? colors.main : colors.lineLight
                }
                boxSize={24}
                iconSize={24}
              />
            </EntranceCheckBox>
            <EntranceCheckBoxText>{e}</EntranceCheckBoxText>
          </Row>
        );
      })}

      <SquareInput
        label="배송 참고사항"
        placeholder={"참고사항 예 3847*"}
        value={entranceNote.value}
        onChangeText={(v) =>
          dispatch(setValue({ name: "entranceNote", value: v }))
        }
        isActive={!!entranceNote.value}
        keyboardType="default"
        errMsg={entranceNote.errMsg}
      />
    </>
  );
};

const Address = () => {
  // redux
  const dispatch = useAppDispatch();
  const { selectedAddrIdx } = useAppSelector((state) => state.order);

  // react-query
  const { data: listAddressData } = useListAddress();

  // navigation
  const router = useRouter();

  // 배송지 수정 버튼 action
  const onAddrEditPress = (ads: IAddressData) => {
    dispatch(
      loadAddressData({
        addr1: ads.addr1 || "",
        addr2: ads.addr2 || "",
        zipCode: ads.zipCode || "",
      })
    );
    router.push({
      pathname: "/AddressEdit",
      params: {
        addrNo: ads.addrNo,
        addr1: ads.addr1,
        addr2: ads.addr2,
        zipCode: ads.zipCode,
      },
    });
  };

  // 배송지 추가 버튼 action
  const onAddrAddPress = () => {
    if (listAddressData && listAddressData?.length >= 5) {
      Alert.alert("주소는 5개 까지만 추가 가능합니다");
      return;
    }
    dispatch(
      loadAddressData({
        addr1: "",
        addr2: "",
        zipCode: "",
      })
    );
    router.push({ pathname: "/AddressEdit" });
  };

  return (
    <AccordionContentContainer>
      {/* 각 주소 리스트 */}
      {listAddressData?.map((ads, index: number) => (
        <Col style={{ width: "100%" }} key={index}>
          <AddressBox>
            <SelectContainer
              onPress={() => {
                dispatch(setselectedAddrIdx(index));
              }}
            >
              <Icon
                name={
                  selectedAddrIdx === index ? "checkbox" : "checkboxUnchecked"
                }
                color={
                  selectedAddrIdx === index ? colors.main : colors.lineLight
                }
                boxSize={24}
                iconSize={24}
              />
              <Col>
                <AddressBase>{ads.addr1}</AddressBase>
                <AddressDetail>{ads.addr2}</AddressDetail>
              </Col>
            </SelectContainer>

            {/* 배송지 수정 버튼 */}
            <EditBtn onPress={() => onAddrEditPress(ads)}>
              <Icon name="edit" color={colors.textSub} />
            </EditBtn>
          </AddressBox>
          <HorizontalLine style={{ marginTop: 16 }} />
        </Col>
      ))}

      {/* 배송지 추가 버튼 */}
      <AddressAddBtn
        btnStyle={listAddressData?.length === 0 ? "borderActive" : "border"}
        onPress={() => onAddrAddPress()}
      >
        <Row>
          <Icon
            name="plusSquare"
            color={
              listAddressData?.length === 0 ? colors.main : colors.inactive
            }
          />
          <AddressAddBtnText>배송지 추가</AddressAddBtnText>
        </Row>
      </AddressAddBtn>

      {/* 현관 출입방법 */}
      <EntranceMethodContainer />
    </AccordionContentContainer>
  );
};

export default Address;

const AddressBox = styled.View`
  flex-direction: row;
  width: 100%;
  height: 58px;
  padding-top: 24px;
`;

const SelectContainer = styled.TouchableOpacity`
  flex: 1;
  flex-direction: row;
  align-items: center;
`;

const AddressBase = styled(TextSub)`
  font-size: 14px;
  margin-left: 8px;
`;
const AddressDetail = styled(TextMain)`
  font-size: 16px;
  margin-left: 8px;
  margin-top: 2px;
`;

const EditBtn = styled.TouchableOpacity`
  height: 100%;
  justify-content: center;
  align-items: center;
`;

const AddressAddBtn = styled(BtnCTA)`
  height: 48px;
  margin-top: 16px;
`;
const AddressAddBtnText = styled(TextSub)`
  font-size: 14px;
  line-height: 20px;
  margin-left: 4px;
`;

const ContentTitle = styled(TextMain)`
  font-size: 18px;
  font-weight: bold;
`;

const EntranceCheckBoxText = styled(TextMain)`
  font-size: 14px;
  line-height: 20px;
  margin-left: 4px;
`;
const EntranceCheckBox = styled.TouchableOpacity``;
