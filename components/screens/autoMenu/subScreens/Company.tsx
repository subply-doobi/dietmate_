import styled from "styled-components/native";
import DDropdown from "@/shared/ui/DDropdown";
import { HorizontalSpace } from "@/shared/ui/styledComps";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { setAMSettingProgress } from "@/features/reduxSlices/autoMenuSlice";
import { Platform } from "react-native";
import { BOTTOM_INDICATOR_IOS } from "@/shared/constants";
import CtaButton from "@/shared/ui/CtaButton";
import { setFormulaProgress } from "@/features/reduxSlices/formulaSlice";
import { getAutoMenuData, saveAutoMenuData } from "@/shared/utils/asyncStorage";
import { usePathname } from "expo-router";
import { useEffect, useState } from "react";

const Company = () => {
  // navigation
  const pathname = usePathname();

  // redux
  const dispatch = useAppDispatch();
  const progress = useAppSelector((state) => state.formula.formulaProgress);
  const amSettingProgress = useAppSelector(
    (state) => state.autoMenu.settingProgress
  );
  const { platformDDItems } = useAppSelector((state) => state.common);
  // local state for wantedCompany
  const [wantedCompany, setWantedCompany] = useState("");
  // Load from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      const data = await getAutoMenuData();
      if (data?.wantedCompany) setWantedCompany(data.wantedCompany);
    })();
  }, []);

  const insetBottom = Platform.OS === "ios" ? BOTTOM_INDICATOR_IOS : 0;
  return (
    <Container>
      <Box>
        <HorizontalSpace height={64} />
        <DDropdown
          placeholder="식품사"
          value={wantedCompany}
          setValue={async (v) => {
            setWantedCompany(v);
            // await saveAutoMenuData({ wantedCompany: v });
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
        onPress={async () => {
          // dispatch(setFormulaProgress(progress.concat("AMPrice")));
          pathname.includes("Formula")
            ? dispatch(setFormulaProgress(progress.concat("AMPrice")))
            : dispatch(
                setAMSettingProgress(amSettingProgress.concat("AMPrice"))
              );
          await saveAutoMenuData({ wantedCompany });
        }}
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
