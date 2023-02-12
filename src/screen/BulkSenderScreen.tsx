import {
  getHashedName,
  getNameAccountKey,
  getTwitterRegistry,
  NameRegistryState,
  getAllDomains,
  performReverseLookup,
  transferNameOwnership,
} from "@bonfida/spl-name-service";
import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import {
  SystemProgram,
  Transaction,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import React, { useEffect, useState } from "react";
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
import Papa from "papaparse";

export function BulkSenderScreen() {
  const [sendingType, setSendingType] = useState<string>("");

  return (
    <View style={{ height: "100%", backgroundColor: "#111827" }}>
      <View
        style={{
          marginBottom: "38px",
          height: "100%",
        }}
      >
        {sendingType == "" ? (
          <View
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <Button
              tw="hover:border-2 border-white"
              style={{
                marginTop: "35%",
                height: "50px",
                width: "90%",
              }}
              onClick={() => setSendingType("oneReceiver")}
            >
              Send different tokens to one receiver
            </Button>
            <Button
              tw="hover:border-2 border-white"
              style={{
                marginTop: "15px",
                height: "50px",
                width: "90%",
              }}
              onClick={() => setSendingType("oneToken")}
            >
              Send one token to different receivers
            </Button>
            <Button
              tw="hover:border-2 border-white"
              style={{
                marginTop: "15px",
                height: "50px",
                width: "90%",
              }}
              onClick={() => setSendingType("csv")}
            >
              Send using a CSV file
            </Button>
            <Button
              tw="hover:border-2 border-white"
              style={{
                marginTop: "15px",
                height: "50px",
                width: "90%",
              }}
              onClick={() => setSendingType("emergency")}
            >
              Emergency send
            </Button>
          </View>
        ) : (
          <Button
            style={{
              marginTop: "10px",
              marginLeft: "10px",
            }}
            onClick={() => setSendingType("")}
          >
            ← Back
          </Button>
        )}
        {sendingType == "oneReceiver" && <OneReceiver />}
        {sendingType == "oneToken" && <OneToken />}
        {sendingType == "csv" && <CSV />}
        {sendingType == "emergency" && <Emergency />}
      </View>
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

function OneReceiver() {
  const publickey = usePublicKey();
  const connection = useConnection();
  const [tokens, setTokens] = useState<any | null>();
  const [isFetched, setIsFetched] = useState<boolean>(false);
  const [receiver, setReceiver] = useState<string>("");
  const [amount1, setAmount1] = useState<string | undefined>();
  const [amount2, setAmount2] = useState<string | undefined>();
  const [amount3, setAmount3] = useState<string | undefined>();
  const [amount4, setAmount4] = useState<string | undefined>();
  const [amount5, setAmount5] = useState<string | undefined>();
  const [token1, setToken1] = useState<string>("");
  const [token2, setToken2] = useState<string>("");
  const [token3, setToken3] = useState<string>("");
  const [token4, setToken4] = useState<string>("");
  const [token5, setToken5] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  async function getUserTokens() {
    const _userTokens = [{ tokenMint: "", tokenName: "Select a token" }];
    const resp = await window.xnft.connection.customSplTokenAccounts(publickey);
    const tokensWithMetadata = resp.fts.fungibleTokenMetadata
      .filter((m) => {
        const tokenName = m?.account?.data?.name.replace(/\0/g, '');
        return m != null && tokenName != "";
      })
      .map((m) => {
        const tokenMint = m.account.mint;
        const tokenName = m.account.data.name.replace(/\0/g, '');
        return { tokenMint, tokenName };
      });
      console.log("tokens", tokensWithMetadata)
      const nftsWithMetadata = resp.nfts.nftTokenMetadata
      .filter((m) => {
        const tokenName = m?.account?.data?.name.replace(/\0/g, '');
        return tokenName != "";
      })
      .map((m) => {
        const tokenMint = m.account.mint;
        const tokenName = m.account.data.name.replace(/\0/g, '');
        return { tokenMint, tokenName };
      });
      if (nftsWithMetadata[0] != undefined) {
        for (let i = 0; i < nftsWithMetadata.length; i++) {
          tokensWithMetadata.push({
            tokenMint: nftsWithMetadata[i].tokenMint,
            tokenName: nftsWithMetadata[i].tokenName,
          });
        }
      }
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
          tokenName:
            allUserTokens[i].slice(0, 4) + "..." + allUserTokens[i].slice(-4),
        });
      }
    }
    tokensWithMetadata.push({
      tokenMint: "So11111111111111111111111111111111111111112",
      tokenName: "Solana",
    });
    const domains = await getAllDomains(connection, publickey);
    for (let i = 0; i < domains.length; i++) {
      const domainName = await performReverseLookup(
        connection,
        new PublicKey(domains[i])
      );
      tokensWithMetadata.push({
        tokenMint: domainName + ".sol",
        tokenName: domainName + ".sol",
      });
    }
    tokensWithMetadata.sort(function (a, b) {
      if (a.tokenName.toUpperCase() < b.tokenName.toUpperCase()) {
        return -1;
      }
      if (a.tokenName.toUpperCase() > b.tokenName.toUpperCase()) {
        return 1;
      }
      return 0;
    });
    const userTokens = _userTokens.concat(tokensWithMetadata);
    console.log("User tokens with info fetched", userTokens);
    setTokens(userTokens);
    setIsFetched(true);
  }

  useEffect(() => {
    getUserTokens();
  }, [publickey]);

  const sendToOneReceiver = async () => {
    try {
      const _Tokens = [token1, token2, token3, token4, token5];
      const _Amounts = [amount1, amount2, amount3, amount4, amount5];
      const Tokens: string[] = [];
      const Amounts: (string | undefined)[] = [];

      for (let i = 0; i < _Tokens.length; i++) {
        if (_Tokens[i] != "" && _Amounts[i] != undefined) {
          Tokens.push(_Tokens[i]);
          Amounts.push(_Amounts[i]);
        }
      }

      if (Tokens.length != 0) {
        setIsSending(true);
        setSuccess(false);
        setError("");
        let receiverPubkey: PublicKey;
        if (receiver.includes(".sol")) {
          const hashedName = await getHashedName(receiver.replace(".sol", ""));
          const nameAccountKey = await getNameAccountKey(
            hashedName,
            undefined,
            new PublicKey("58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx") // SOL TLD Authority
          );
          const owner = await NameRegistryState.retrieve(
            connection,
            nameAccountKey
          );
          receiverPubkey = owner.registry.owner;
        } else if (receiver.includes("@")) {
          const handle = receiver.replace("@", "");
          const registry = await getTwitterRegistry(connection, handle);
          receiverPubkey = registry.owner;
        } else {
          receiverPubkey = new PublicKey(receiver);
        }

        const Tx = new Transaction();
        for (let i = 0; i < Tokens.length; i++) {
          if (Tokens[i] == "So11111111111111111111111111111111111111112") {
            Tx.add(
              SystemProgram.transfer({
                fromPubkey: publickey,
                toPubkey: receiverPubkey,
                lamports: parseFloat(Amounts[i]!) * LAMPORTS_PER_SOL,
              })
            );
          } else if (Tokens[i].includes(".sol")) {
            const domain = Tokens[i].replace(".sol", "");
            const transferDomainIx = await transferNameOwnership(
              connection,
              domain,
              receiverPubkey,
              undefined,
              new PublicKey("58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx")
            );
            Tx.add(transferDomainIx);
          } else {
            const mint = new PublicKey(Tokens[i]);
            const destination_account = await getAssociatedTokenAddress(
              mint,
              receiverPubkey
            );
            const account = await connection.getAccountInfo(
              destination_account
            );

            if (account == null) {
              const createIx = createAssociatedTokenAccountInstruction(
                publickey,
                destination_account,
                receiverPubkey,
                mint
              );

              Tx.add(createIx);
            }
            const source_account = await getAssociatedTokenAddress(
              mint,
              publickey
            );
            const balanceResp = await connection.getTokenAccountBalance(
              source_account
            );
            const decimals = balanceResp.value.decimals;
            const TransferIx = createTransferInstruction(
              source_account,
              destination_account,
              publickey,
              parseFloat(Amounts[i]!) * 10 ** decimals
            );
            Tx.add(TransferIx);
          }
        }
        const signature = await window.xnft.solana.sendAndConfirm(Tx, null, {
          commitment: "finalized",
        });
        console.log("confirmation", signature);
        getUserTokens();
        setIsSending(false);
        setSuccess(true);
      } else {
        setError("Please select at least one token and enter an mount!");
      }
    } catch (error) {
      console.log(error);
      setIsSending(false);
      setSuccess(false);
      const err = (error as any)?.message;
      setError(err);
    }
  };

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
            <TextField
              placeholder="Receiver's address, .sol or @ Twitter"
              value={receiver}
              onChange={(e) => {
                setReceiver(e.target.value);
              }}
              style={{
                marginBottom: "15px",
                marginTop: "20px",
                width: "90%",
              }}
            />
            <View
              style={{
                padding: "3px",
                backgroundColor: "#27272a",
                borderRadius: "15px",
                marginBottom: "10px",
              }}
            >
              <Custom
                component={"select"}
                value={token1}
                onChange={(e) => setToken1(e.target.value)}
                tw="hover:cursor-pointer"
                style={{
                  marginLeft: "10px",
                  marginRight: "10px",
                  height: "40px",
                  borderRadius: "6px",
                  width: "150px",
                  backgroundColor: "#27272a",
                  color: "white",
                }}
              >
                {tokens.map((token) => (
                  <Custom
                    component={"option"}
                    value={token.tokenMint}
                    label={token.tokenName}
                  />
                ))}
              </Custom>
              <TextField
                placeholder="Amount"
                value={amount1}
                onChange={(e) => {
                  setAmount1(e.target.value);
                }}
                style={{
                  marginLeft: "10px",
                  width: "100px",
                  height: "40px",
                  textAlign: "end",
                  border: "none",
                }}
              />
            </View>
            <View
              style={{
                padding: "3px",
                backgroundColor: "#27272a",
                borderRadius: "15px",
                marginBottom: "10px",
              }}
            >
              <Custom
                component={"select"}
                value={token2}
                onChange={(e) => setToken2(e.target.value)}
                tw="hover:cursor-pointer"
                style={{
                  marginLeft: "10px",
                  marginRight: "10px",
                  height: "40px",
                  borderRadius: "6px",
                  width: "150px",
                  backgroundColor: "#27272a",
                  color: "white",
                }}
              >
                {tokens.map((token) => (
                  <Custom
                    component={"option"}
                    value={token.tokenMint}
                    label={token.tokenName}
                  />
                ))}
              </Custom>
              <TextField
                placeholder="Amount"
                value={amount2}
                onChange={(e) => {
                  setAmount2(e.target.value);
                }}
                style={{
                  marginLeft: "10px",
                  width: "100px",
                  height: "40px",
                  textAlign: "end",
                  border: "none",
                }}
              />
            </View>
            <View
              style={{
                padding: "3px",
                backgroundColor: "#27272a",
                borderRadius: "15px",
                marginBottom: "10px",
              }}
            >
              <Custom
                component={"select"}
                value={token3}
                onChange={(e) => setToken3(e.target.value)}
                tw="hover:cursor-pointer"
                style={{
                  marginLeft: "10px",
                  marginRight: "10px",
                  height: "40px",
                  borderRadius: "6px",
                  width: "150px",
                  backgroundColor: "#27272a",
                  color: "white",
                }}
              >
                {tokens.map((token) => (
                  <Custom
                    component={"option"}
                    value={token.tokenMint}
                    label={token.tokenName}
                  />
                ))}
              </Custom>
              <TextField
                placeholder="Amount"
                value={amount3}
                onChange={(e) => {
                  setAmount3(e.target.value);
                }}
                style={{
                  marginLeft: "10px",
                  width: "100px",
                  height: "40px",
                  textAlign: "end",
                  border: "none",
                }}
              />
            </View>
            <View
              style={{
                padding: "3px",
                backgroundColor: "#27272a",
                borderRadius: "15px",
                marginBottom: "10px",
              }}
            >
              <Custom
                component={"select"}
                value={token4}
                onChange={(e) => setToken4(e.target.value)}
                tw="hover:cursor-pointer"
                style={{
                  marginLeft: "10px",
                  marginRight: "10px",
                  height: "40px",
                  borderRadius: "6px",
                  width: "150px",
                  backgroundColor: "#27272a",
                  color: "white",
                }}
              >
                {tokens.map((token) => (
                  <Custom
                    component={"option"}
                    value={token.tokenMint}
                    label={token.tokenName}
                  />
                ))}
              </Custom>
              <TextField
                placeholder="Amount"
                value={amount4}
                onChange={(e) => {
                  setAmount4(e.target.value);
                }}
                style={{
                  marginLeft: "10px",
                  width: "100px",
                  height: "40px",
                  textAlign: "end",
                  border: "none",
                }}
              />
            </View>
            <View
              style={{
                padding: "3px",
                backgroundColor: "#27272a",
                borderRadius: "15px",
                marginBottom: "10px",
              }}
            >
              <Custom
                component={"select"}
                value={token5}
                onChange={(e) => setToken5(e.target.value)}
                tw="hover:cursor-pointer"
                style={{
                  marginLeft: "10px",
                  marginRight: "10px",
                  height: "40px",
                  borderRadius: "6px",
                  width: "150px",
                  backgroundColor: "#27272a",
                  color: "white",
                }}
              >
                {tokens.map((token) => (
                  <Custom
                    component={"option"}
                    value={token.tokenMint}
                    label={token.tokenName}
                  />
                ))}
              </Custom>
              <TextField
                placeholder="Amount"
                value={amount5}
                onChange={(e) => {
                  setAmount5(e.target.value);
                }}
                style={{
                  marginLeft: "10px",
                  width: "100px",
                  height: "40px",
                  textAlign: "end",
                  border: "none",
                }}
              />
            </View>
            {/* <Custom
              component={"select"}
              value={token6}
              onChange={(e) => setToken6(e.target.value)}
              style={{
                marginTop: "10px",
                marginLeft: "10px",
                marginRight: "10px",
                height: "40px",
                borderRadius: "6px",
                border: "2px solid",
                borderColor: "grey",
                width: "150px",
                backgroundColor: "grey",
                color: "white",
              }}
            >
              {tokens.map((token) => (
                <Custom
                  component={"option"}
                  value={token.tokenMint}
                  label={token.tokenName}
                />
              ))}
            </Custom>
            <TextField
              placeholder="Amount"
              value={amount6}
              onChange={(e) => {
                setAmount6(parseFloat(e.target.value));
              }}
              style={{
                marginTop: "10px",
                marginLeft: "10px",
                marginRight: "10px",
                width: "100px",
                height: "40px",
              }}
            />
            <Custom
              component={"select"}
              value={token7}
              onChange={(e) => setToken7(e.target.value)}
              style={{
                marginTop: "10px",
                marginLeft: "10px",
                marginRight: "10px",
                height: "40px",
                borderRadius: "6px",
                border: "2px solid",
                borderColor: "grey",
                width: "150px",
                backgroundColor: "grey",
                color: "white",
              }}
            >
              {tokens.map((token) => (
                <Custom
                  component={"option"}
                  value={token.tokenMint}
                  label={token.tokenName}
                />
              ))}
            </Custom>
            <TextField
              placeholder="Amount"
              value={amount7}
              onChange={(e) => {
                setAmount7(parseFloat(e.target.value));
              }}
              style={{
                marginTop: "10px",
                marginLeft: "10px",
                marginRight: "10px",
                width: "100px",
                height: "40px",
              }}
            />
            <Custom
              component={"select"}
              value={token8}
              onChange={(e) => setToken8(e.target.value)}
              style={{
                marginTop: "10px",
                marginLeft: "10px",
                marginRight: "10px",
                height: "40px",
                borderRadius: "6px",
                border: "2px solid",
                borderColor: "grey",
                width: "150px",
                backgroundColor: "grey",
                color: "white",
              }}
            >
              {tokens.map((token) => (
                <Custom
                  component={"option"}
                  value={token.tokenMint}
                  label={token.tokenName}
                />
              ))}
            </Custom>
            <TextField
              placeholder="Amount"
              value={amount8}
              onChange={(e) => {
                setAmount8(parseFloat(e.target.value));
              }}
              style={{
                marginTop: "10px",
                marginLeft: "10px",
                marginRight: "10px",
                width: "100px",
                height: "40px",
              }}
            />
            <Custom
              component={"select"}
              value={token9}
              onChange={(e) => setToken9(e.target.value)}
              style={{
                marginTop: "10px",
                marginLeft: "10px",
                marginRight: "10px",
                height: "40px",
                borderRadius: "6px",
                border: "2px solid",
                borderColor: "grey",
                width: "150px",
                backgroundColor: "grey",
                color: "white",
              }}
            >
              {tokens.map((token) => (
                <Custom
                  component={"option"}
                  value={token.tokenMint}
                  label={token.tokenName}
                />
              ))}
            </Custom>
            <TextField
              placeholder="Amount"
              value={amount9}
              onChange={(e) => {
                setAmount9(parseFloat(e.target.value));
              }}
              style={{
                marginTop: "10px",
                marginLeft: "10px",
                marginRight: "10px",
                width: "100px",
                height: "40px",
              }}
            />
            <Custom
              component={"select"}
              value={token10}
              onChange={(e) => setToken10(e.target.value)}
              style={{
                marginTop: "10px",
                marginLeft: "10px",
                marginRight: "10px",
                height: "40px",
                borderRadius: "6px",
                border: "2px solid",
                borderColor: "grey",
                width: "150px",
                backgroundColor: "grey",
                color: "white",
              }}
            >
              {tokens.map((token) => (
                <Custom
                  component={"option"}
                  value={token.tokenMint}
                  label={token.tokenName}
                />
              ))}
            </Custom>
            <TextField
              placeholder="Amount"
              value={amount10}
              onChange={(e) => {
                setAmount10(parseFloat(e.target.value));
              }}
              style={{
                marginTop: "10px",
                marginLeft: "10px",
                marginRight: "10px",
                width: "100px",
                height: "40px",
              }}
            />
          */}
          </View>
          <View
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {!isSending ? (
              <Button
                style={{
                  marginTop: "15px",
                  width: "100px",
                }}
                onClick={() => sendToOneReceiver()}
              >
                Send
              </Button>
            ) : (
              <Button
                style={{
                  marginTop: "15px",
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
                Sending...
              </Button>
            )}
          </View>
          {success && (
            <View
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                marginTop: "10px",
              }}
            >
              <Text
                style={{
                  fontSize: "12px",
                  lineHeight: "19.08px",
                  color: "green",
                }}
              >
                Successfully sent!
              </Text>
            </View>
          )}
          {error != "" && (
            <View
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                marginTop: "10px",
              }}
            >
              <Text
                style={{
                  fontSize: "12px",
                  lineHeight: "19.08px",
                  color: "red",
                }}
              >
                {error}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }
}

function OneToken() {
  const publickey = usePublicKey();
  const connection = useConnection();
  const [tokens, setTokens] = useState<any | null>();
  const [isFetched, setIsFetched] = useState<boolean>(false);
  const [token, setToken] = useState<string>("");
  const [receiverList, setReceiverList] = useState([
    { receiver: "", amount: "" },
    { receiver: "", amount: "" },
    { receiver: "", amount: "" },
    { receiver: "", amount: "" },
    { receiver: "", amount: "" },
  ]);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  async function getUserTokens() {
    const _userTokens = [{ tokenMint: "", tokenName: "Select a token" }];
    const resp = await window.xnft.connection.customSplTokenAccounts(publickey);
    const tokensWithMetadata = resp.fts.fungibleTokenMetadata
    .filter((m) => {
      const tokenName = m?.account?.data?.name.replace(/\0/g, '');
      return m != null && tokenName != "";
    })
    .map((m) => {
      const tokenMint = m.account.mint;
      const tokenName = m.account.data.name.replace(/\0/g, '');
      return { tokenMint, tokenName };
    });
    console.log("tokens", tokensWithMetadata)
    const nftsWithMetadata = resp.nfts.nftTokenMetadata
    .filter((m) => {
      const tokenName = m?.account?.data?.name.replace(/\0/g, '');
      return tokenName != "";
    })
    .map((m) => {
      const tokenMint = m.account.mint;
      const tokenName = m.account.data.name.replace(/\0/g, '');
      return { tokenMint, tokenName };
    });
    if (nftsWithMetadata[0] != undefined) {
      for (let i = 0; i < nftsWithMetadata.length; i++) {
        tokensWithMetadata.push({
          tokenMint: nftsWithMetadata[i].tokenMint,
          tokenName: nftsWithMetadata[i].tokenName,
        });
      }
    }
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
          tokenName:
            allUserTokens[i].slice(0, 4) + "..." + allUserTokens[i].slice(-4),
        });
      }
    }
    tokensWithMetadata.push({
      tokenMint: "So11111111111111111111111111111111111111112",
      tokenName: "Solana",
    });
    tokensWithMetadata.sort(function (a, b) {
      if (a.tokenName.toUpperCase() < b.tokenName.toUpperCase()) {
        return -1;
      }
      if (a.tokenName.toUpperCase() > b.tokenName.toUpperCase()) {
        return 1;
      }
      return 0;
    });
    const userTokens = _userTokens.concat(tokensWithMetadata);
    console.log("User tokens with info fetched", userTokens);
    setTokens(userTokens);
    setIsFetched(true);
  }

  useEffect(() => {
    getUserTokens();
  }, [publickey]);

  const handleReceiverChange = (e: any, index: any) => {
    const { name, value } = e.target;
    const list: any = [...receiverList];
    list[index][name] = value;
    setReceiverList(list);
  };

  const sendOneToken = async () => {
    try {
      const Receivers: any[] = [];
      for (let i = 0; i < receiverList.length; i++) {
        if (
          receiverList[i]["receiver"] != "" &&
          receiverList[i]["amount"] != ""
        ) {
          Receivers.push(receiverList[i]);
        }
      }

      if (Receivers.length != 0) {
        setIsSending(true);
        setSuccess(false);
        setError("");
        let Tx = new Transaction();
        for (let i = 0; i < Receivers.length; i++) {
          let receiverPubkey: PublicKey;
          if (Receivers[i]["receiver"].includes(".sol")) {
            const hashedName = await getHashedName(
              Receivers[i]["receiver"].replace(".sol", "")
            );
            const nameAccountKey = await getNameAccountKey(
              hashedName,
              undefined,
              new PublicKey("58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx") // SOL TLD Authority
            );
            const owner = await NameRegistryState.retrieve(
              connection,
              nameAccountKey
            );
            receiverPubkey = owner.registry.owner;
          } else if (Receivers[i]["receiver"].includes("@")) {
            const handle = Receivers[i]["receiver"].replace("@", "");
            const registry = await getTwitterRegistry(connection, handle);
            receiverPubkey = registry.owner;
          } else {
            receiverPubkey = new PublicKey(Receivers[i]["receiver"]);
          }

          if (token == "So11111111111111111111111111111111111111112") {
            Tx.add(
              SystemProgram.transfer({
                fromPubkey: publickey,
                toPubkey: receiverPubkey,
                lamports: Receivers[i]["amount"] * LAMPORTS_PER_SOL,
              })
            );
          } else {
            const mint = new PublicKey(token);
            const destination_account = await getAssociatedTokenAddress(
              mint,
              receiverPubkey
            );
            const account = await connection.getAccountInfo(
              destination_account
            );

            if (account == null) {
              const createIx = createAssociatedTokenAccountInstruction(
                publickey,
                destination_account,
                receiverPubkey,
                mint
              );

              Tx.add(createIx);
            }
            const source_account = await getAssociatedTokenAddress(
              mint,
              publickey
            );
            const balanceResp = await connection.getTokenAccountBalance(
              source_account
            );
            const decimals = balanceResp.value.decimals;
            const transferIx = createTransferInstruction(
              source_account,
              destination_account,
              publickey,
              parseFloat(Receivers[i]["amount"]) * 10 ** decimals
            );
            Tx.add(transferIx);
          }
        }
        const signature = await window.xnft.solana.sendAndConfirm(Tx, null, {
          commitment: "finalized",
        });
        console.log("confirmation", signature);
        getUserTokens();
        setIsSending(false);
        setSuccess(true);
      } else {
        setError("Please enter at least one receiver and one amount!");
      }
    } catch (error) {
      console.log(error);
      setIsSending(false);
      setSuccess(false);
      const err = (error as any)?.message;
      setError(err);
    }
  };

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
            <Custom
              component={"select"}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              tw="hover:cursor-pointer"
              style={{
                marginTop: "20px",
                marginBottom: "15px",
                marginLeft: "10px",
                marginRight: "10px",
                height: "40px",
                borderRadius: "6px",
                width: "150px",
                backgroundColor: "#27272a",
                color: "white",
              }}
            >
              {tokens.map((token) => (
                <Custom
                  component={"option"}
                  value={token.tokenMint}
                  label={token.tokenName}
                />
              ))}
            </Custom>
          </View>

          {receiverList.map((x, i) => {
            return (
              <View
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                <Custom
                  component={"input"}
                  name={"receiver"}
                  type="text"
                  placeholder="Receiver"
                  value={x.receiver}
                  onChange={(e) => handleReceiverChange(e, i)}
                  style={{
                    marginTop: "10px",
                    marginLeft: "10px",
                    marginRight: "10px",
                    width: "200px",
                    height: "40px",
                    color: "#D4D4D8",
                    backgroundColor: "#27272a",
                    paddingTop: "14px",
                    paddingBottom: "14px",
                    paddingRight: "16px",
                    paddingLeft: "16px",
                    borderRadius: "12px",
                  }}
                />
                <Custom
                  component={"input"}
                  name={"amount"}
                  type="text"
                  placeholder="Amount"
                  value={x.amount}
                  onChange={(e) => handleReceiverChange(e, i)}
                  style={{
                    marginTop: "10px",
                    marginLeft: "10px",
                    marginRight: "10px",
                    width: "100px",
                    height: "40px",
                    color: "#D4D4D8",
                    backgroundColor: "#27272a",
                    paddingTop: "14px",
                    paddingBottom: "14px",
                    paddingRight: "16px",
                    paddingLeft: "16px",
                    borderRadius: "12px",
                  }}
                />
                {/* <TextField
                  placeholder="Receiver"
                  value={x.receiver}
                  onChange={(e) => handleReceiverChange(e, i)}
                  style={{
                    marginTop: "10px",
                    marginLeft: "10px",
                    marginRight: "10px",
                    width: "100px",
                    height: "40px",
                  }}
                />
                <TextField
                  placeholder="Amount"
                  value={x.amount}
                  onChange={(e) => handleReceiverChange(e, i)}
                  style={{
                    marginTop: "10px",
                    marginLeft: "10px",
                    marginRight: "10px",
                    width: "100px",
                    height: "40px",
                  }}
                /> */}
              </View>
            );
          })}
          <View
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {!isSending ? (
              <Button
                style={{
                  marginTop: "15px",
                  width: "100px",
                }}
                onClick={() => sendOneToken()}
              >
                Send
              </Button>
            ) : (
              <Button
                style={{
                  marginTop: "15px",
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
                Sending...
              </Button>
            )}
          </View>
          {success && (
            <View
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                marginTop: "10px",
              }}
            >
              <Text
                style={{
                  fontSize: "12px",
                  lineHeight: "19.08px",
                  color: "green",
                }}
              >
                Successfully sent!
              </Text>
            </View>
          )}
          {error != "" && (
            <View
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                marginTop: "10px",
              }}
            >
              <Text
                style={{
                  fontSize: "12px",
                  lineHeight: "19.08px",
                  color: "red",
                }}
              >
                {error}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }
}

function Emergency() {
  const publickey = usePublicKey();
  const connection = useConnection();
  const [tokens, setTokens] = useState<any | null>();
  const [receiver, setReceiver] = useState<string>("");
  const [isFetched, setIsFetched] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [currentTx, setCurrentTx] = useState<number | null>(null);
  const [totalTx, setTotalTx] = useState<number | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  async function getUserTokens() {
    const { value: splAccounts } =
      await window.xnft.connection.getParsedTokenAccountsByOwner(publickey, {
        programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
      });
    const userTokens = splAccounts
      .filter((m) => {
        const amount = m.account?.data?.parsed?.info?.tokenAmount?.uiAmount;
        return amount != 0;
      })
      .map((m) => {
        const mintAdddress = m.account?.data?.parsed?.info?.mint;
        return mintAdddress;
      });
    const domains = await getAllDomains(connection, publickey);
    for (let i = 0; i < domains.length; i++) {
      const domainName = await performReverseLookup(
        connection,
        new PublicKey(domains[i])
      );
      userTokens.push(domainName + ".sol");
    }
    userTokens.push("So11111111111111111111111111111111111111112");
    console.log("User tokens with info fetched", userTokens);
    setTokens(userTokens);
    setIsFetched(true);
  }

  useEffect(() => {
    getUserTokens();
  }, [publickey]);

  const send = async () => {
    try {
      setIsSending(true);
      setSuccess(false);
      setError("");

      let receiverPubkey: PublicKey;
      if (receiver.includes(".sol")) {
        const hashedName = await getHashedName(receiver.replace(".sol", ""));
        const nameAccountKey = await getNameAccountKey(
          hashedName,
          undefined,
          new PublicKey("58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx") // SOL TLD Authority
        );
        const owner = await NameRegistryState.retrieve(
          connection,
          nameAccountKey
        );
        receiverPubkey = owner.registry.owner;
      } else if (receiver.includes("@")) {
        const handle = receiver.replace("@", "");
        const registry = await getTwitterRegistry(connection, handle);
        receiverPubkey = registry.owner;
      } else {
        receiverPubkey = new PublicKey(receiver);
      }

      const nbTransferPerTx = 5;

      let nbTx: number;

      if (tokens.length % nbTransferPerTx == 0) {
        nbTx = tokens.length / nbTransferPerTx;
      } else {
        nbTx = Math.floor(tokens.length / nbTransferPerTx) + 1;
      }
      setTotalTx(nbTx);

      for (let i = 0; i < nbTx; i++) {
        let Tx = new Transaction();

        let bornSup: number;

        if (i == nbTx - 1) {
          bornSup = tokens.length;
        } else {
          bornSup = nbTransferPerTx * (i + 1);
        }

        setCurrentTx(i + 1);
        for (let j = nbTransferPerTx * i; j < bornSup; j++) {
          if (tokens[j] == "So11111111111111111111111111111111111111112") {
            const SOLBalance = await connection.getBalance(publickey);
            Tx.add(
              SystemProgram.transfer({
                fromPubkey: publickey,
                toPubkey: receiverPubkey,
                lamports:
                  SOLBalance - (0.00001 + 0.00203928) * LAMPORTS_PER_SOL,
              })
            );
          } else if (tokens[j].includes(".sol")) {
            const domain = tokens[j].replace(".sol", "");
            const transferDomainIx = await transferNameOwnership(
              connection,
              domain,
              receiverPubkey,
              undefined,
              new PublicKey("58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx")
            );
            Tx.add(transferDomainIx);
          } else {
            const mint = new PublicKey(tokens[j]);
            const destination_account = await getAssociatedTokenAddress(
              mint,
              receiverPubkey
            );
            const account = await connection.getAccountInfo(
              destination_account
            );

            if (account == null) {
              const createIx = createAssociatedTokenAccountInstruction(
                publickey,
                destination_account,
                receiverPubkey,
                mint
              );

              Tx.add(createIx);
            }
            const source_account = await getAssociatedTokenAddress(
              mint,
              publickey
            );
            const balanceResp = await connection.getTokenAccountBalance(
              source_account
            );
            const balance = balanceResp.value.uiAmount;
            const decimals = balanceResp.value.decimals;
            const TransferIx = createTransferInstruction(
              source_account,
              destination_account,
              publickey,
              balance! * 10 ** decimals
            );
            Tx.add(TransferIx);
          }
        }
        if (currentTx == totalTx) {
          const signature = await window.xnft.solana.sendAndConfirm(Tx, null, {
            commitment: "finalized",
          });
          console.log("confirmation", signature);
        } else {
          const signature = await window.xnft.solana.sendAndConfirm(Tx, null, {
            commitment: "processed",
          });
          console.log("confirmation", signature);
        }
      }
      setSuccess(true);
      setIsSending(false);
    } catch (error) {
      console.log(error);
      setIsSending(false);
      setSuccess(false);
      const err = (error as any)?.message;
      setError(err);
    }
  };

  if (isFetched == false) {
    return <LoadingIndicator />;
  } else {
    return (
      <View style={{ height: "100%", backgroundColor: "#111827" }}>
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
            <TextField
              placeholder="Receiver's address, .sol or @ Twitter"
              value={receiver}
              onChange={(e) => {
                setReceiver(e.target.value);
              }}
              style={{
                marginBottom: "15px",
                marginTop: "20px",
                width: "90%",
              }}
            />
            {!isSending ? (
              <Button
                style={{
                  marginTop: "15px",
                  width: "100px",
                }}
                onClick={() => send()}
              >
                Send
              </Button>
            ) : (
              <Button
                style={{
                  marginTop: "15px",
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
                Sending...
              </Button>
            )}
          </View>
          {isSending && currentTx != null && totalTx != null && (
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
                marginTop: "10px",
              }}
            >
              <Text
                style={{
                  fontSize: "12px",
                  lineHeight: "19.08px",
                  color: "green",
                }}
              >
                Successfully sent!
              </Text>
            </View>
          )}
          {error != "" && (
            <View
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                marginTop: "10px",
              }}
            >
              <Text
                style={{
                  fontSize: "12px",
                  lineHeight: "19.08px",
                  color: "red",
                }}
              >
                {error}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }
}

function CSV() {
  const publickey = usePublicKey();
  const connection = useConnection();
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isUploaded, setIsUploaded] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [currentTx, setCurrentTx] = useState<number | null>(null);
  const [totalTx, setTotalTx] = useState<number | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleFileChange = async (event: any) => {
    setError("");
    setSuccess(false);
    const csvFile = event.target.files[0];
    const fileName = csvFile["name"];
    setFileName(fileName);
    const fileType = csvFile["type"];

    if (fileType != "text/csv") {
      setError("It is not a CSV file!");
    } else {
      setIsUploaded(true);
      Papa.parse(event.target.files[0], {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
          const rowsArray: any = [];

          // Iterating data to get column name
          results.data.map((d: any) => {
            rowsArray.push(Object.keys(d));
          });

          // Parsed Data Response in array format
          // @ts-ignore
          setCsvData(results.data);

          // get the headers of the CSV file
          setCsvHeaders(rowsArray[0]);
        },
      });
    }
  };

  const send = async () => {
    try {
      if (csvData.length != 0) {
        setIsSending(true);
        setSuccess(false);
        setError("");

        const nbTransferPerTx = 5;
        let nbTx: number;
        if (csvData.length % nbTransferPerTx == 0) {
          nbTx = csvData.length / nbTransferPerTx;
        } else {
          nbTx = Math.floor(csvData.length / nbTransferPerTx) + 1;
        }
        setTotalTx(nbTx);

        for (let i = 0; i < nbTx; i++) {
          let Tx = new Transaction();

          let bornSup: number;

          if (i == nbTx - 1) {
            bornSup = csvData.length;
          } else {
            bornSup = nbTransferPerTx * (i + 1);
          }

          setCurrentTx(i + 1);
          for (let j = nbTransferPerTx * i; j < bornSup; j++) {
            const receiver = csvData[j][csvHeaders[0]];
            let receiverPubkey: PublicKey;
            if (receiver.includes(".sol")) {
              const hashedName = await getHashedName(
                receiver.replace(".sol", "")
              );
              const nameAccountKey = await getNameAccountKey(
                hashedName,
                undefined,
                new PublicKey("58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx") // SOL TLD Authority
              );
              const owner = await NameRegistryState.retrieve(
                connection,
                nameAccountKey
              );
              receiverPubkey = owner.registry.owner;
            } else if (receiver.includes("@")) {
              const handle = receiver.replace("@", "");
              const registry = await getTwitterRegistry(connection, handle);
              receiverPubkey = registry.owner;
            } else {
              receiverPubkey = new PublicKey(receiver);
            }

            const token = csvData[j][csvHeaders[1]];
            const amount = parseFloat(csvData[j][csvHeaders[2]]);

            if (token == "So11111111111111111111111111111111111111112") {
              Tx.add(
                SystemProgram.transfer({
                  fromPubkey: publickey,
                  toPubkey: receiverPubkey,
                  lamports: amount * LAMPORTS_PER_SOL,
                })
              );
            } else if (token.includes(".sol")) {
              const transferDomainIx = await transferNameOwnership(
                connection,
                token.replace(".sol", ""),
                receiverPubkey,
                undefined,
                new PublicKey("58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx") // SOL TLD Authority
              );

              Tx.add(transferDomainIx);
            } else {
              const mint = new PublicKey(token);
              const destination_account = await getAssociatedTokenAddress(
                mint,
                receiverPubkey
              );
              const account = await connection.getAccountInfo(
                destination_account
              );

              if (account == null) {
                const createIx = createAssociatedTokenAccountInstruction(
                  publickey,
                  destination_account,
                  receiverPubkey,
                  mint
                );

                Tx.add(createIx);
              }
              const source_account = await getAssociatedTokenAddress(
                mint,
                publickey
              );
              const balanceResp = await connection.getTokenAccountBalance(
                source_account
              );
              const decimals = balanceResp.value.decimals;
              const TransferIx = createTransferInstruction(
                source_account,
                destination_account,
                publickey,
                amount * 10 ** decimals
              );
              Tx.add(TransferIx);
            }
          }
          if (currentTx == totalTx) {
            const signature = await window.xnft.solana.sendAndConfirm(
              Tx,
              null,
              {
                commitment: "finalized",
              }
            );
            console.log("confirmation", signature);
          } else {
            const signature = await window.xnft.solana.sendAndConfirm(
              Tx,
              null,
              {
                commitment: "processed",
              }
            );
            console.log("confirmation", signature);
          }
        }
        setSuccess(true);
        setIsSending(false);
      } else {
        setError("The CSV file is empty");
      }
    } catch (error) {
      console.log(error);
      setIsSending(false);
      setSuccess(false);
      const err = (error as any)?.message;
      setError(err);
    }
  };
  return (
    <View>
      <View
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontSize: "16px",
            lineHeight: "19.08px",
            marginTop: "20px",
          }}
        >
          The file has to respect the following order:
        </Text>
        <Text
          style={{
            fontSize: "16px",
            lineHeight: "19.08px",
            marginTop: "10px",
          }}
        >
          receiver's address, token address, amount
        </Text>
        <Custom
          component={"label"}
          htmlFor="file"
          tw="hover:border-2 border-white hover:cursor-pointer"
          style={{
            marginTop: "35%",
            paddingTop: "10px",
            paddingBottom: "10px",
            paddingRight: "15px",
            paddingLeft: "15px",
            backgroundColor: "rgb(39, 39, 42)",
            borderRadius: "12px",
            color: "white",
          }}
        >
          Select file
          <Custom
            component={"input"}
            id={"file"}
            name={"file"}
            type={"file"}
            accept={".csv"}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </Custom>
      </View>
      <View
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {isUploaded && (
          <Text
            style={{
              fontSize: "12px",
              lineHeight: "19.08px",
              marginTop: "10px",
            }}
          >
            {fileName} selected!
          </Text>
        )}
      </View>
      {isUploaded && !isSending && (
        <View
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Button
            onClick={() => send()}
            style={{
              marginTop: "10px",
            }}
          >
            Send
          </Button>
        </View>
      )}
      {isSending && (
        <View
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Button
            style={{
              marginTop: "10px",
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
            Sending...
          </Button>
        </View>
      )}
      {isSending && currentTx != null && totalTx != null && (
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
      {error != "" && (
        <View
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            marginTop: "10px",
          }}
        >
          <Text
            style={{
              fontSize: "12px",
              lineHeight: "19.08px",
              color: "red",
            }}
          >
            {error}
          </Text>
        </View>
      )}
      {success && (
        <View
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            marginTop: "10px",
          }}
        >
          <Text
            style={{
              fontSize: "12px",
              lineHeight: "19.08px",
              color: "green",
            }}
          >
            Successfully sent!
          </Text>
        </View>
      )}
    </View>
  );
}
