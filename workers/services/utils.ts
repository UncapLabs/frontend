import { Contract, RpcProvider } from "starknet";
import { PRICE_FEED_BTC } from "~/lib/contracts/constants";
import { PRICE_FEED_ABI } from "~/lib/contracts/abis/price-feed";

export const getBitcoinprice = async () => {
  const myProvider = new RpcProvider({
    nodeUrl: process.env.NODE_URL,
  });

  const PriceFeedContract = new Contract(
    PRICE_FEED_ABI,
    PRICE_FEED_BTC,
    myProvider
  );

  const price = await PriceFeedContract.fetch_price();

  return price;
};
