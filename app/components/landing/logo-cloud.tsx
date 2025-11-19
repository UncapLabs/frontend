import { clsx } from "clsx";

export function LogoCloud({
  className,
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={clsx(
        className,
        "flex justify-between max-sm:mx-auto max-sm:max-w-md max-sm:flex-wrap max-sm:justify-evenly max-sm:gap-x-4 max-sm:gap-y-4"
      )}
    >
      <img
        alt="Starknet"
        src="starknet.png"
        className="h-9 max-sm:mx-auto sm:h-8 lg:h-12"
      />
      <img
        alt="Wrapped Bitcoin"
        src="wbtc.webp"
        className="h-9 max-sm:mx-auto sm:h-8 lg:h-12"
      />
      <img
        alt="Lombard Bitcoin"
        src="xlbtc.svg"
        className="h-9 max-sm:mx-auto sm:h-8 lg:h-12"
      />
      <img
        alt="Uncap Finance"
        src="uncap.png"
        className="h-9 max-sm:mx-auto sm:h-8 lg:h-12"
      />
      <img
        alt="USDU"
        src="usdu.png"
        className="h-9 max-sm:mx-auto sm:h-8 lg:h-12"
      />
    </div>
  );
}
