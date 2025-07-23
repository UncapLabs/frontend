import { Contract, RpcProvider } from "starknet";
import { PRICE_FEED_ABI } from "~/lib/contracts";
import { getCollateralAddresses } from "~/lib/contracts/constants";

export const getBitcoinprice = async () => {
  const myProvider = new RpcProvider({
    nodeUrl: process.env.NODE_URL,
  });

  // Use UBTC price feed as default (both UBTC and GBTC track Bitcoin price)
  const addresses = getCollateralAddresses("UBTC");
  const PriceFeedContract = new Contract(
    PRICE_FEED_ABI,
    addresses.priceFeed,
    myProvider
  );

  const price = await PriceFeedContract.fetch_price();

  return price;
};
