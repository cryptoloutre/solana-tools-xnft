import React from "react";
import ReactXnft, { Stack } from "react-xnft";
import { HomeScreen } from "./screen/HomeScreen";
import { BurnNFTScreen } from "./screen/BurnNFTScreen";
import { BurnSPLScreen } from "./screen/BurnSPLScreen";
import { RevokeScreen } from "./screen/RevokeScreen";
import { CloseAccountScreen } from "./screen/CloseAccountScreen";
import { SPLCreatorScreen } from "./screen/SPLCreatorScreen";
import { SUATMMScreen } from "./screen/SUATMMScreen";
import { BulkSenderScreen } from "./screen/BulkSenderScreen";

//
// On connection to the host environment, warm the cache.
//
ReactXnft.events.on("connect", () => {
  // no-op
});

export function App() {
  return (
    <Stack.Navigator
      initialRoute={{ name: "home" }}
      options={({ route }) => {
        switch (route.name) {
          case "home":
            return {
              title: "Solana Tools",
            };
          case "burnNFT":
            return {
              title: "Burn NFT",
            };
          case "burnSPL":
            return {
              title: "Burn SPL",
            };
          case "closeAccount":
            return {
              title: "Close Account",
            };
          case "revoke":
            return {
              title: "Revoke Authority",
            };
          case "splCreator":
            return {
              title: "SPL Token Creator",
            };
          case "bulksender":
            return {
              title: "Bulk Sender",
            };
          case "suatmm":
            return {
              title: "SUATMM",
            };
          default:
            throw new Error("unknown route");
        }
      }}
      style={{}}
    >
      <Stack.Screen name={"home"} component={() => <HomeScreen />} />
      <Stack.Screen name={"burnNFT"} component={() => <BurnNFTScreen />} />
      <Stack.Screen name={"burnSPL"} component={() => <BurnSPLScreen />} />
      <Stack.Screen name={"closeAccount"} component={() => <CloseAccountScreen />}/>
      <Stack.Screen name={"revoke"} component={() => <RevokeScreen />} />
      <Stack.Screen name={"splCreator"} component={() => <SPLCreatorScreen />}/>
      <Stack.Screen name={"bulksender"} component={() => <BulkSenderScreen />}/>
      <Stack.Screen name={"suatmm"} component={() => <SUATMMScreen />} />
    </Stack.Navigator>
  );
}
