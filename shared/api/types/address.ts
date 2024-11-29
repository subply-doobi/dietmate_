export interface IAddressData {
  addrNo: string;
  zipCode: string;
  addr1: string;
  addr2: string;
  companyCd: string;
  userId: string;
  useYn: string;
}

export interface IAddressCreate {
  zipCode: string;
  addr1: string;
  addr2: string;
}

export interface IAddressUpdate {
  addrNo: string;
  zipCode: string;
  addr1: string;
  addr2: string;
}
