import { Contract, RpcProvider } from "starknet";
import { PRICE_FEED_ABI } from "~/lib/contracts";
import { PRICE_FEED_ADDRESS } from "~/lib/contracts/constants";

export const getBitcoinprice = async () => {
  const myProvider = new RpcProvider({
    nodeUrl: process.env.NODE_URL,
  });

  const PriceFeedContract = new Contract(
    PRICE_FEED_ABI,
    PRICE_FEED_ADDRESS,
    myProvider
  );

  const price = await PriceFeedContract.fetch_price();

  return price;
};
