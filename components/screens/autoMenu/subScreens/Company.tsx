import React, { SetStateAction } from "react";
import styled from "styled-components/native";
import DDropdown from "@/shared/ui/DDropdown";
import { HorizontalSpace } from "@/shared/ui/styledComps";
import { useAppSelector } from "@/shared/hooks/reduxHooks";

const Company = ({
  wantedCompany,
  setWantedCompany,
}: {
  wantedCompany: string;
  setWantedCompany: React.Dispatch<SetStateAction<string>>;
}) => {
  // redux
  const { platformDDItems } = useAppSelector((state) => state.common);
  return (
    <Box>
      <HorizontalSpace height={64} />
      <DDropdown
        placeholder="식품사"
        value={wantedCompany}
        setValue={setWantedCompany}
        items={platformDDItems}
      />
    </Box>
  );
};

export default Company;

const Box = styled.View``;
