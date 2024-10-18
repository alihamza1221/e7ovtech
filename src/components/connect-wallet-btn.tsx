"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Wallet } from "lucide-react";
import { depositFund, requestAccount } from "@repo/utils/contractServices";
import { useToast } from "../../@/hooks/use-toast";

export default function ConnectCryptoWallet({
  setAccount,
  account,
}: {
  account: any;
  setAccount: React.Dispatch<React.SetStateAction<any>>;
}) {
  const { toast } = useToast();
  const [isWalletConnected, setIsWalletConnected] = useState(!!account);
  const depositValue = "0.0038";

  const handleDeposit = async () => {
    try {
      await depositFund(depositValue);
      toast({
        title: "Funded Successfully",
        description: "Your wallet has been funded.",
      });
    } catch (error: any) {
      toast({ title: error?.reason, description: error?.message });
    }
  };

  const onWalletClick = async () => {
    setIsWalletConnected(true);
    const fetchCurAccount = async () => {
      const account = await requestAccount();
      setAccount(account);
    };
    await fetchCurAccount();
    toast({
      title: "Wallet Connected",
      description: "Your wallet is now connected.",
    });
  };

  useEffect(() => {
    console.log("isWalletConnected...", isWalletConnected);
  }, [isWalletConnected]);

  return (
    <div className="top-2 right-2 fixed">
      {!isWalletConnected ? (
        <Button onClick={() => onWalletClick()}>
          <Wallet className="mr-2 h-4 w-4" />
          {"Connect Wallet"}
        </Button>
      ) : (
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Wallet className="mr-2 h-4 w-4" />
              {"Fund Project"}
            </Button>
          </DialogTrigger>
          <DialogDescription></DialogDescription>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Wallet Funding</DialogTitle>
            </DialogHeader>
            {isWalletConnected ? (
              <div className="py-4">
                <p className="mb-4">Wallet Address: {account}</p>
                <Button onClick={() => handleDeposit()} className="w-full">
                  Fund (~10 USDT)
                </Button>
              </div>
            ) : (
              <p>Please connect your wallet first.</p>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
