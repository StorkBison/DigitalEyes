import { TokenAccount } from "../models";
import { useAccountsContext } from "./../contexts/accounts";

export function useUserAccounts() {
  const context = useAccountsContext();
  return { 
    userAccounts: context.userAccounts as TokenAccount[],
    listedMintsFromEscrow: context.listedMintsFromEscrow,
    mintsInWalletUnlisted: context.mintsInWalletUnlisted,
    listedMintsFromDirectSell: context.listedMintsFromDirectSell,
    listedMintsFromDutch: context.listedMintsFromDutch,
    setListedMintsFromEscrow: context.setListedMintsFromEscrow,
    setMintsInWalletUnlisted: context.setMintsInWalletUnlisted,
    setListedMintsFromDirectSell: context.setListedMintsFromDirectSell,
    setListedMintsFromDutch: context.setListedMintsFromDutch,
  };
}
