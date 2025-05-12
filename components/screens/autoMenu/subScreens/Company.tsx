import styled from "styled-components/native";
import DDropdown from "@/shared/ui/DDropdown";
import { HorizontalSpace } from "@/shared/ui/styledComps";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { setWantedCompany } from "@/features/reduxSlices/autoMenuSlice";
import { Platform } from "react-native";
import { BOTTOM_INDICATOR_IOS } from "@/shared/constants";
import CtaButton from "@/shared/ui/CtaButton";
import { setFormulaProgress } from "@/features/reduxSlices/commonSlice";

const Company = () => {
  // redux
  const dispatch = useAppDispatch();
  const progress = useAppSelector((state) => state.common.formulaProgress);
  const { platformDDItems } = useAppSelector((state) => state.common);
  const wantedCompany = useAppSelector((state) => state.autoMenu.wantedCompany);

  const insetBottom = Platform.OS === "ios" ? BOTTOM_INDICATOR_IOS : 0;
  return (
    <Container>
      <Box>
        <HorizontalSpace height={64} />
        <DDropdown
          placeholder="식품사"
          value={wantedCompany}
          setValue={(v) => {
            dispatch(setWantedCompany(v));
          }}
          items={platformDDItems}
          style={{ width: "90%", alignSelf: "center" }}
        />
      </Box>
      <CtaButton
        btnStyle={"active"}
        style={{ position: "absolute", bottom: insetBottom + 8 }}
        btnText="다음"
        // onPress={() => setProgress((v) => [...v, "AMPrice"])}
        onPress={() => dispatch(setFormulaProgress(progress.concat("AMPrice")))}
      />
    </Container>
  );
};

export default Company;

const Container = styled.View`
  flex: 1;
  padding-left: 16px;
  padding-right: 16px;
`;

const Box = styled.View``;
