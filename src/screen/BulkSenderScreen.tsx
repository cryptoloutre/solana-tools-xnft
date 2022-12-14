import {
  Keypair,
  SystemProgram,
  Transaction,
  PublicKey,
} from "@solana/web3.js";
import React, { Children, useEffect, useState } from "react";
import {
  Button,
  View,
  Text,
  useConnection,
  usePublicKey,
  TextField,
  Svg,
  Path,
  Custom,
  Loading,
} from "react-xnft";

export function BulkSenderScreen() {
  const publickey = usePublicKey();
  const connection = useConnection();
  const [tokens, setTokens] = useState<any | null>();
  const [isFetched, setIsFetched] = useState<boolean>(false);
  const [recipient, setRecipient] = useState<string>("");
  const [textSize, setTextSize] = useState<string>("16px");
  const [lineHeight, setLineHeight] = useState<string>("16px");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  async function getUserTokens() {
    const resp = await window.xnft.connection.customSplTokenAccounts(publickey);
    const tokensWithMetadata = resp.tokenMetadata
      .filter((m) => {
        const tokenName = m?.account?.data?.name;
        return m != null && tokenName != "";
      })
      .map((m) => {
        const tokenMint = m.account.mint;
        const tokenName = m.account.data.name;
        return { tokenMint, tokenName };
      });

    const { value: splAccounts } =
      await window.xnft.connection.getParsedTokenAccountsByOwner(publickey, {
        programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
      });
    const allUserTokens = splAccounts
      .filter((m) => {
        const amount = m.account?.data?.parsed?.info?.tokenAmount?.uiAmount;
        return amount != 0;
      })
      .map((m) => {
        const mintAdddress = m.account?.data?.parsed?.info?.mint;
        return mintAdddress;
      });
    for (let i = 0; i < allUserTokens.length; i++) {
      let compteur = 0;
      for (let j = 0; j < tokensWithMetadata.length; j++) {
        if (allUserTokens[i] != tokensWithMetadata[j]["tokenMint"]) {
          compteur += 1;
        }
      }
      if (compteur == tokensWithMetadata.length) {
        tokensWithMetadata.push({
          tokenMint: allUserTokens[i],
          tokenName: allUserTokens[i],
        });
      }
    }
    tokensWithMetadata.push({
      tokenMint: "So11111111111111111111111111111111111111112",
      tokenName: "Solana",
    });
    console.log("User tokens with info fetched", tokensWithMetadata);
    setTokens(tokensWithMetadata);
    setIsFetched(true);
  }

  useEffect(() => {
    getUserTokens();
  }, [publickey]);

  if (isFetched == false) {
    return <LoadingIndicator />;
  } else {
    return (
      <View style={{ backgroundColor: "#111827" }}>
        <View
          style={{
            marginBottom: "38px",
            height: "100%",
          }}
        >
          <View
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <View>
              <Custom
                component="select"
                style={{
                  marginTop: "10px",
                  height: "40px",
                  borderRadius: "6px",
                  border: "2px solid",
                  borderColor: "grey",
                  width: "250px",
                  backgroundColor: "grey",
                  color: "white",
                }}
              >
                {tokens.map((token) => {
                  return (
                    <Custom component="option" value={token.tokenMint}>
                      {token.tokenName.toString()}
                    </Custom>
                  );
                })}
              </Custom>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

function LoadingIndicator() {
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: "100%",
        backgroundColor: "#111827",
      }}
    >
      <Loading
        style={{ display: "block", marginLeft: "auto", marginRight: "auto" }}
      />
    </View>
  );
}

function Option(token) {
  const name = token.token.tokenName;
  const mint = token.token.tokenMint;
  return (
    <Custom component="option" value={mint}>
      {name}
    </Custom>
  );
}
