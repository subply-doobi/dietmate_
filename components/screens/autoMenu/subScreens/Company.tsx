import styled from "styled-components/native";
import DDropdown from "@/shared/ui/DDropdown";
import { HorizontalSpace } from "@/shared/ui/styledComps";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { setWantedCompany } from "@/features/reduxSlices/autoMenuSlice";

const Company = () => {
  // redux
  const dispatch = useAppDispatch();
  const { platformDDItems } = useAppSelector((state) => state.common);
  const wantedCompany = useAppSelector((state) => state.autoMenu.wantedCompany);
  return (
    <Box>
      <HorizontalSpace height={64} />
      <DDropdown
        placeholder="식품사"
        value={wantedCompany}
        setValue={(v) => {
          dispatch(setWantedCompany(v));
        }}
        items={platformDDItems}
      />
    </Box>
  );
};

export default Company;

const Box = styled.View``;
