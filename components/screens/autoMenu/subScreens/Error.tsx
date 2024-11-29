import { Col, HorizontalSpace } from "@/shared/ui/styledComps";
import CtaButton from "@/shared/ui/CtaButton";
import { IAutoMenuSubPages } from "@/shared/utils/screens/autoMenu/contentByPages";

interface IError {
  setProgress: React.Dispatch<React.SetStateAction<IAutoMenuSubPages[]>>;
}
const Error = ({ setProgress }: IError) => {
  return (
    <Col style={{ justifyContent: "center", marginTop: 64 }}>
      <CtaButton
        btnStyle="active"
        btnText="자동구성 재시도"
        onPress={() => setProgress((v) => [...v.slice(0, v.length - 1)])}
      />
      <HorizontalSpace height={24} />
      <CtaButton
        btnStyle="border"
        btnText="처음으로"
        onPress={() => setProgress((v) => [v[0]])}
      />
    </Col>
  );
};

export default Error;
