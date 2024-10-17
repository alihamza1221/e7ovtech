"use client";
import Header from "@repo/components/Header";
import { useState, useEffect } from "react";
export default function Home() {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const handleAccountChanged = (newAccounts: any) =>
      setAccount(newAccounts.length > 0 ? newAccounts[0] : null);
    //@ts-expect-error
    if (window.ethereum) {
      //@ts-expect-error
      window.ethereum.on("accountsChanged", handleAccountChanged);
    }
    return () => {
      //@ts-expect-error
      window.ethereum?.removeListener("accountsChanged", handleAccountChanged);
    };
  });
  return (
    <>
      <Header setAccount={setAccount} />
    </>
  );
}
