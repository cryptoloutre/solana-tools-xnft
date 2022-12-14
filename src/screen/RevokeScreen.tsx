import { Metaplex, PublicKey } from "@metaplex-foundation/js";
import { AccountLayout, createRevokeInstruction } from "@solana/spl-token";
import { ENV, TokenInfo, TokenListProvider } from "@solana/spl-token-registry";
import { Transaction } from "@solana/web3.js";
import React, { useEffect, useState } from "react";
import {
  Button,
  View,
  Image,
  Text,
  Loading,
  useConnection,
  usePublicKey,
  Svg,
  Path,
} from "react-xnft";

export function RevokeScreen() {
  const publickey = usePublicKey();
  const connection = useConnection();
  const [delegates, setDelegates] = useState<any | null>(null);
  const [isFetched, setIsFetched] = useState<boolean>(false);
  const [isRevoking, setIsRevoking] = useState<boolean>(false);
  const [currentTx, setCurrentTx] = useState<number | null>(null);
  const [totalTx, setTotalTx] = useState<number | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  async function getDelegatedTokens() {
    const { value: splAccounts } =
      await window.xnft.connection.getTokenAccountsByOwner(publickey, {
        programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
      });
    const myDelegates = splAccounts
      .filter((m) => {
        const data = m.account.data;
        const info = AccountLayout.decode(data);
        const delegateOption = info.delegateOption;
        console.log(delegateOption);
        return delegateOption != 0;
      })
      .map((m) => {
        const tokenAccountaddress = m.pubkey;
        const data = m.account.data;
        const info = AccountLayout.decode(data);
        const mintAdddress = new PublicKey(info.mint).toBase58();
        return { tokenAccountaddress, mintAdddress };
      });
    setDelegates(myDelegates);
    setIsFetched(true);
    console.log("my delegates", myDelegates);
  }

  useEffect(() => {
    getDelegatedTokens();
  }, [publickey]);

  const toRevoke: any[] = [];

  const Revoke = async (toRevoke: any) => {
    try {
      if (toRevoke[0] != undefined) {
        setIsRevoking(true);
        setSuccess(false);
        setMessage("");
        const nbPerTx = 5;
        let nbTx: number;
        if (toRevoke.length % nbPerTx == 0) {
          nbTx = toRevoke.length / nbPerTx;
        } else {
          nbTx = Math.floor(toRevoke.length / nbPerTx) + 1;
        }
        setTotalTx(nbTx);

        for (let i = 0; i < nbTx; i++) {
          setCurrentTx(i + 1);
          let Tx = new Transaction();

          let bornSup: number;

          if (i == nbTx - 1) {
            bornSup = toRevoke.length;
          } else {
            bornSup = nbPerTx * (i + 1);
          }

          for (let j = nbPerTx * i; j < bornSup; j++) {
            const associatedAddress = new PublicKey(toRevoke[j]);

            const closeInstruction = await createRevokeInstruction(
              associatedAddress,
              publickey
            );
            Tx.add(closeInstruction);
          }

          if (currentTx == totalTx) {
            const signature = await window.xnft.solana.sendAndConfirm(
              Tx,
              null,
              { commitment: "finalized" }
            );
            console.log("confirmation", signature);
          } else {
            const signature = await window.xnft.solana.sendAndConfirm(
              Tx,
              null,
              { commitment: "processed" }
            );
            console.log("confirmation", signature);
          }
        }
        setIsRevoking(false);
        setSuccess(true);
        await getDelegatedTokens();
      } else {
        setMessage("Please choose at least one authority to revoke first!");
      }
    } catch (error) {
      await getDelegatedTokens();
      setIsRevoking(false);
      console.log(error);
    }
  };

  function SelectButton(props: { tokenAccount: any }) {
    const [isSelected, setIsSelected] = useState(false);
    console.log(props.tokenAccount);

    return (
      <View>
        {!isSelected ? (
          <Button
            style={{
              display: "flex",
              background: "green",
            }}
            onClick={() => {
              setIsSelected(true);
              toRevoke.push(props.tokenAccount);
            }}
          >
            Select
          </Button>
        ) : (
          <Button
            style={{
              display: "flex",
              background: "red",
            }}
            onClick={() => {
              setIsSelected(false);
              toRevoke.splice(toRevoke.indexOf(props.tokenAccount), 1);
            }}
          >
            Unselect
          </Button>
        )}
      </View>
    );
  }

  if (isFetched == false) {
    return <LoadingIndicator />;
  } else {
    if (delegates[0] == undefined) {
      return <NoEmptyAccount />;
    }
    return (
      <View style={{ backgroundColor: "#111827" }}>
        <View
          style={{
            marginRight: "20px",
            marginBottom: "38px",
          }}
        >
          <View
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {!isRevoking ? (
              <Button
                style={{
                  marginTop: "8px",
                }}
                onClick={() => Revoke(toRevoke)}
              >
                Revoke Selected Tokens
              </Button>
            ) : (
              <Button
                style={{
                  marginTop: "8px",
                }}
              >
                <Svg
                  tw="inline mr-3 w-4 h-4 text-white animate-spin"
                  width={25}
                  height={25}
                  viewBox="0 0 100 101"
                  fill="none"
                >
                  <Path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="#E5E7EB"
                  />
                  <Path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentColor"
                  />
                </Svg>
                Revoking...
              </Button>
            )}
          </View>
          {isRevoking && currentTx != null && totalTx != null && (
            <View
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: "12px",
                  lineHeight: "19.08px",
                }}
              >
                Please confirm Tx: {currentTx}/{totalTx}
              </Text>
            </View>
          )}
          {success && (
            <View
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: "12px",
                  lineHeight: "19.08px",
                  color: "green",
                }}
              >
                Successfully revoked!
              </Text>
            </View>
          )}
          {message != "" && (
            <View
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: "12px",
                  lineHeight: "19.08px",
                  color: "red",
                }}
              >
                {message}
              </Text>
            </View>
          )}
          <View
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {delegates.map((g) => {
              return (
                <View
                  style={{
                    background: "#1a253d",
                    marginLeft: "20px",
                    marginTop: "8px",
                    borderRadius: "6px",
                  }}
                >
                  <View
                    style={{
                      height: "100%",
                      borderRadius: "6px",
                      border: "2px solid",
                      borderColor: "grey",
                      width: "140px",
                    }}
                  >
                    {/* Bouton pour amener sur solscan ? */}

                    <TokenInfos mint={g.mintAdddress} connection={connection} />

                    <View
                      style={{
                        marginTop: "5px",
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                      }}
                    >
                      <SelectButton tokenAccount={g.tokenAccountaddress} />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  }
}

function TokenInfos(props: { mint: any; connection: any }) {
  const [hasURI, setHasURI] = useState<boolean>();
  const [tokenName, setTokenName] = useState("");
  const [uri, setURI] = useState("");
  const metaplex = new Metaplex(props.connection);

  useEffect(() => {
    async function getTokenInfos() {
      const mintPublickey = new PublicKey(props.mint);

      try {
        const nft = await metaplex
          .nfts()
          .findByMint({ mintAddress: mintPublickey });
        const name = nft.name;
        setTokenName(name);
        const logo = nft.json?.image;

        if (logo != undefined) {
          setHasURI(true);
          setURI(logo);
        } else {
          setHasURI(false);
        }
      } catch (error) {
        const err = (error as any)?.message;
        console.log(err);
        setHasURI(false);
      }
    }
    getTokenInfos();
  }, []);

  return (
    <View>
      {hasURI ? (
        <View>
          <View
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <Image
              src={uri}
              style={{
                marginTop: "5px",
                borderRadius: "6px",
                width: "120px",
                height: "120px",
              }}
            ></Image>
          </View>
          <Text
            style={{
              fontSize: "12px",
              lineHeight: "19.08px",
              marginLeft: "10px",
            }}
          >
            {tokenName}
          </Text>
        </View>
      ) : (
        <TokenInfosFromRegistry mint={props.mint} />
      )}
    </View>
  );
}

function TokenInfosFromRegistry(props: { mint: any }) {
  const [tokenMap, setTokenMap] = useState<Map<string, TokenInfo>>(new Map());
  useEffect(() => {
    new TokenListProvider().resolve().then((tokens) => {
      const tokenList = tokens.filterByChainId(ENV.MainnetBeta).getList();

      setTokenMap(
        tokenList.reduce((map, item) => {
          map.set(item.address, item);
          return map;
        }, new Map())
      );
    });
  }, [setTokenMap]);

  const token = tokenMap.get(props.mint);
  let tokenName = "";
  let src = "";
  if (!token || !token.logoURI) {
    src = "https://arweave.net/WCMNR4N-4zKmkVcxcO2WImlr2XBAlSWOOKBRHLOWXNA";
  } else {
    src = token.logoURI;
  }
  if (!token || !token.name) {
    tokenName = "Unknown token";
  } else {
    tokenName = token.name;
  }

  return (
    <View>
      <View
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Image
          src={src}
          style={{
            marginTop: "5px",
            borderRadius: "6px",
            width: "120px",
            height: "120px",
          }}
        ></Image>
      </View>
      <Text
        style={{
          fontSize: "12px",
          lineHeight: "19.08px",
          marginLeft: "10px",
        }}
      >
        {tokenName}
      </Text>
    </View>
  );
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

function NoEmptyAccount() {
  return (
    <View
      style={{
        height: "100%",
        backgroundColor: "#111827",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignContent: "center",
      }}
    >
      <Text
        style={{
          fontSize: "20px",
          lineHeight: "19.08px",
          fontWeight: "bold",
        }}
      >
        You haven't delegated token!
      </Text>
      ;
    </View>
  );
}