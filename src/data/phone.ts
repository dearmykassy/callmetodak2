import phoneProfileJson from "./phone-profile.json";

export type TodakiPhoneProfile = {
  schemaVersion: "callme-todaki-phone-profile/v1";
  profileId: string;
  digits: string;
  display: string;
  href: `tel:${string}`;
  schema: `+82-${string}`;
};

export const TODAKI_PHONE = phoneProfileJson as TodakiPhoneProfile;
