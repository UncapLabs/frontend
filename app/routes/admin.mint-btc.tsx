import { GetTestBtc } from "~/components/get-test-btc";
import { SetTestPrice } from "~/components/set-test-price";

export default function MintBtc() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Admin Tools</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <GetTestBtc />
        <SetTestPrice />
      </div>
    </div>
  );
}
