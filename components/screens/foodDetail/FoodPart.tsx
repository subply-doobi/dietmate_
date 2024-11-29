import {Image} from 'react-native';
import styled from 'styled-components/native';

// react-query
import {useListProductDetail} from '../../../shared/api/queries/product';
import {
  IProductData,
  IProductDetailData,
} from '../../../shared/api/types/product';
import {useEffect, useState} from 'react';
import {SCREENWIDTH} from '../../../shared/constants';
import {ActivityIndicator} from 'react-native';
import colors from '../../../shared/colors';
import {TextSub} from '../../../shared/ui/styledComps';
import {icons} from '../../../shared/iconSource';

interface IImageData {
  imageLink: string;
  width: number;
  height: number;
  result: string;
}

const useGetImageSize = async (
  productDetailData: IProductDetailData[],
  setImageData: React.Dispatch<React.SetStateAction<IImageData[]>>,
) => {
  let imageData: IImageData[] = [];

  for (const item of productDetailData) {
    await new Promise<void>((resolve, reject) => {
      Image.getSize(
        item.imageLink,
        (width, height) => {
          const modWidth = SCREENWIDTH - 32;
          const modHeight = height * (modWidth / width);
          imageData = [
            ...imageData,
            {
              imageLink: item.imageLink,
              width: modWidth,
              height: modHeight,
              result: 'success',
            },
          ];
          resolve();
        },
        error => {
          console.error('getSize error', error);
          imageData = [
            ...imageData,
            {
              imageLink: item.imageLink,
              width: SCREENWIDTH - 32,
              height: 24,
              result: 'error',
            },
          ];
          resolve();
        },
      );
    });
  }
  setImageData(imageData);
};
interface IFoodPart {
  productData: IProductData;
}
const FoodPart = ({productData}: IFoodPart) => {
  // react-query
  const {data: productDetailData} = useListProductDetail(
    productData?.productNo,
  );
  // useState
  const [imageData, setImageData] = useState<
    {imageLink: string; width: number; height: number; result: string}[]
  >([]);
  const [imgLoading, setImgLoading] = useState(true);

  // useEffect
  useEffect(() => {
    if (!productDetailData) return;
    useGetImageSize(productDetailData, setImageData);
    setImgLoading(false);
  }, [productDetailData]);

  return (
    <>
      {imgLoading && <ActivityIndicator color={colors.black} />}
      {imageData?.map((item, index) =>
        item.result === 'success' ? (
          <DetailImage
            key={index}
            style={{width: item.width, height: item.height}}
            source={{uri: item.imageLink}}
            onError={() => console.log('DetailImage onError')}
          />
        ) : (
          <ErrorBox>
            <ImageErrorIcon source={icons.cancelRound_24} />
            <ImageErrorMsg>이미지를 불러올 수 없습니다</ImageErrorMsg>
          </ErrorBox>
        ),
      )}
    </>
  );
};

export default FoodPart;

const ErrorBox = styled.View`
  width: 100%;
  height: 32px;
  align-self: center;
  background-color: ${colors.backgroundLight};

  border-width: 1px;
  border-color: ${colors.lineLight};
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const ImageErrorIcon = styled.Image`
  width: 18px;
  height: 18px;
  margin-right: 8px;
`;

const ImageErrorMsg = styled(TextSub)`
  font-size: 12px;
  text-align: center;
  border-radius: 4px;
`;

const DetailImage = styled.Image`
  width: 100%;
`;
