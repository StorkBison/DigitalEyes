

export type GetLaunchPadProjectInfoParams = {
  projectName: string;
};

export type LaunchPadInfo = {
      Uuid : string;
      Name : string;
      State :  number;
      Creator : string;
      AssetsUrl : string;
      ThumbnailUrl : string;
      BannerUrl? : string;
      IsEndorsed?: boolean;
      IsFeatured?: boolean;
      Discord? : string;
      Twitter?: string;
      Website?: string;
      Description?: string;
      CandyMachineKey?: string;
      WhitelistEnabled?: boolean,
      PresaleEnabled?: boolean,
      DiscountEnabled?: boolean,
      DiscountPrice?:number,
      CandyMachineConfig: {
        price : number;
        number : number;
        gatekeeper: {
          gatekeeperNetwork? :  string;
          expireOnUse? : boolean;
        } | undefined;
        solTreasuryAccount : string;
        goLiveDate : string;
        endSettings : {
          endSettingType : {
            date? : boolean;
            amount? : boolean;
          }
          value : string | number ;
        };
        whitelistMintSettings : {
          mode : {
            burnEveryTime? : boolean;
            neverBurn? : boolean;
          }
          mint? : string;
          presale? : boolean
          discountPrice? : number
        } | undefined;
        hiddenSettings : {
          name? : string
          uri? : string;
          hash? : string;
        } | undefined;
        storage  : string;
        noRetainAuthority : boolean;
        noMutable : boolean;
      };

};
