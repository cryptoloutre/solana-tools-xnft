import { bundlrStorage, BundlrStorageDriver, Metaplex, MetaplexFile, PublicKey, toMetaplexFileFromBrowser, toMetaplexFileFromJson } from "@metaplex-foundation/js";
import {
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  getMinimumBalanceForRentExemptMint,
  MintLayout,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import React, { useState } from "react";
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
} from "react-xnft";
import {
  PROGRAM_ID,
  DataV2,
  createCreateMetadataAccountV2Instruction,
} from "@metaplex-foundation/mpl-token-metadata";
import html2canvas from "html2canvas";

export function SUATMMScreen() {
  const publickey = usePublicKey();
  const connection = useConnection();
  const [userMessage, setUserMessage] = useState<string>("");
  const [recipient, setRecipient] = useState<string>("");
  const [textSize, setTextSize] = useState<string>("16px");
  const [lineHeight, setLineHeight] = useState<string>("16px");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const metaplex = Metaplex.make(connection).use(
    bundlrStorage({
      address: "https://devnet.bundlr.network",
      providerUrl: "https://api.devnet.solana.com",
      timeout: 60000,
    })
  );
  const createAndSendNFT = async () => {
    try {
      setIsSending(true);
      console.log(metaplex.identity().secretKey)
      const canvas = await html2canvas(document.getElementById("canvas")!);
      const NFTImage = canvas.toDataURL("image/png");
      const metadata = {
        name: "SUATM²",
        description: "You receive a new message! Check it! (Made with https://solanatools.vercel.app/)",
        image: NFTImage,
        external_url: "https://solanatools.vercel.app/"
      }
      // const blockHash = await connection.getLatestBlockhash();
      // const Tx = uri.toTransaction({
      //   blockhash: blockHash.blockhash,
      //   lastValidBlockHeight: blockHash.lastValidBlockHeight,
      // });
      // const signature = await window.xnft.solana.sendAndConfirm(Tx);
      // console.log(signature);
    } catch (error) {
      console.log(error);
    }
  };

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
            placeholder="Your message"
            multiline={true}
            value={userMessage}
            onChange={(e) => {
              setUserMessage(e.target.value);
            }}
            style={{
              marginBottom: "10px",
              marginTop: "5px",
              width: "90%",
            }}
          />
          <TextField
            placeholder="Recipient's address"
            value={recipient}
            onChange={(e) => {
              setRecipient(e.target.value);
            }}
            style={{
              marginBottom: "10px",
              width: "90%",
            }}
          />
          <Text
            style={{
              fontSize: "16px",
              lineHeight: "19.08px",
              marginTop: "20px",
              marginRight: "5px",
            }}
          >
            Text size
          </Text>
          <TextField
            value={textSize}
            onChange={(e) => {
              setTextSize(e.target.value);
            }}
            style={{
              marginBottom: "10px",
              width: "75px",
              marginRight: "5px",
            }}
          />
          <Text
            style={{
              fontSize: "16px",
              lineHeight: "19.08px",
              marginTop: "20px",
              marginRight: "5px",
            }}
          >
            Line Height
          </Text>
          <TextField
            value={lineHeight}
            onChange={(e) => {
              setLineHeight(e.target.value);
            }}
            style={{
              marginBottom: "10px",
              width: "75px",
            }}
          />
          <Custom
            component={"div"}
            id="canvas"
            style={{
              height: "250px",
              width: "250px",
              marginBottom: "10px",
              backgroundColor: "#FF0000",
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
              borderRadius: "10px",
              border: "2px solid",
              borderColor: "white",
            }}
          >
            <Text
              style={{
                fontSize: textSize,
                lineHeight: lineHeight,
                fontWeight: "bolder",
                marginTop: "10px",
                height: "230px",
                width: "230px",
              }}
            >
              {userMessage}
            </Text>
          </Custom>
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
                marginBottom: "10px",
              }}
              onClick={() => createAndSendNFT()}
            >
              Send
            </Button>
          ) : (
            <Button
              style={{
                marginBottom: "10px",
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
      </View>
    </View>
  );
}
function getUploadPriceForFile(file: MetaplexFile) {
  throw new Error("Function not implemented.");
}

