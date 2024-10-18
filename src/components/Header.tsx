import ConnectCryptoWallet from "./connect-wallet-btn";
import { Button } from "./ui/button";

export default function Header({
  setAccount,
  account,
}: {
  setAccount: React.Dispatch<React.SetStateAction<any>>;
  account: any;
}) {
  return (
    <>
      <header className="dark:bg-secondaryBlack inset-0 flex min-h-[100vh] w-full flex-col items-center justify-center bg-white bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:70px_70px]">
        <ConnectCryptoWallet setAccount={setAccount} account={account} />
        <div className="mx-auto w-container max-w-full px-5 py-[110px] text-center lg:py-[150px]">
          <h1 className="text-3xl font-heading md:text-4xl lg:text-5xl">
            E7OV Your AI powered Workspace
          </h1>
          <p className="my-12 mt-8 text-lg font-normal leading-relaxed md:text-xl lg:text-2xl lg:leading-relaxed">
            Get started with manging your Team and Tasks in minutes.
            <br /> Check the{" "}
            <a
              target="_blank"
              href="https://github.com/alihamza1221/Web3Hack.git"
              className="font-heading underline"
            >
              github repo
            </a>{" "}
            for more info.
          </p>
          <a href="/api/auth/signin">
            <Button
              size="lg"
              className="h-12 mr-3 text-base font-heading md:text-lg  "
            >
              Sign Up
            </Button>
          </a>
          <a href="/home">
            <Button
              size="lg"
              className="h-12 text-base font-heading md:text-lg "
            >
              Get started
            </Button>
          </a>
        </div>
      </header>
    </>
  );
}
