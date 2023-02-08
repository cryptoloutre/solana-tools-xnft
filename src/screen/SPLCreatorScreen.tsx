import { PublicKey } from "@metaplex-foundation/js";
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
} from "react-xnft";
import {
  PROGRAM_ID,
  DataV2,
  createCreateMetadataAccountV2Instruction,
} from "@metaplex-foundation/mpl-token-metadata";

export function SPLCreatorScreen() {
  const publickey = usePublicKey();
  const connection = useConnection();
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [quantity, setQuantity] = useState<number | undefined>();
  const [decimals, setDecimals] = useState<number | undefined>();
  const [metadataURL, setMetadataURL] = useState("");
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const CreateToken = async () => {
    try {
      if (quantity != undefined && decimals != undefined) {
        setMessage("");
        setIsCreating(true);
        setSuccess(false);
        const mint_rent = await getMinimumBalanceForRentExemptMint(connection);
        const mint_account = Keypair.generate();
        const [metadataPDA] = await PublicKey.findProgramAddress(
          [
            Buffer.from("metadata"),
            PROGRAM_ID.toBuffer(),
            mint_account.publicKey.toBuffer(),
          ],
          PROGRAM_ID
        );
        const tokenMetadata: DataV2 = {
          name: tokenName,
          symbol: tokenSymbol,
          uri: metadataURL,
          sellerFeeBasisPoints: 0,
          creators: null,
          collection: null,
          uses: null,
        };
        const args = {
          data: tokenMetadata,
          isMutable: true,
        };
        const createMintAccountInstruction = SystemProgram.createAccount({
          fromPubkey: publickey,
          newAccountPubkey: mint_account.publicKey,
          space: MintLayout.span,
          lamports: mint_rent,
          programId: TOKEN_PROGRAM_ID,
        });
        const InitMint = createInitializeMintInstruction(
          mint_account.publicKey,
          decimals,
          publickey,
          null
        );
        const associatedTokenAccount = await getAssociatedTokenAddress(
          mint_account.publicKey,
          publickey
        );
        const createATAInstruction = createAssociatedTokenAccountInstruction(
          publickey,
          associatedTokenAccount,
          publickey,
          mint_account.publicKey
        );

        const mintInstruction = createMintToInstruction(
          mint_account.publicKey,
          associatedTokenAccount,
          publickey,
          quantity * 10 ** decimals
        );

        const MetadataInstruction = createCreateMetadataAccountV2Instruction(
          {
            metadata: metadataPDA,
            mint: mint_account.publicKey,
            mintAuthority: publickey,
            payer: publickey,
            updateAuthority: publickey,
          },
          {
            createMetadataAccountArgsV2: args,
          }
        );
        const createAccountTransaction = new Transaction().add(
          createMintAccountInstruction,
          InitMint,
          createATAInstruction,
          mintInstruction,
          MetadataInstruction
        );
        const signTx = await window.xnft.solana.signTransaction(
          createAccountTransaction
        );
        const signature = await window.xnft.solana.sendAndConfirm(
          signTx,
          [mint_account],
          { commitment: "processed" }
        );
        console.log(signature);
        setIsCreating(false);
        setSuccess(true);
      } else {
        setMessage("Please enter the quantity and decimals!");
      }
    } catch (error) {
      console.log(error);
      setIsCreating(false);
    }
  };

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
            placeholder="Name of the token"
            value={tokenName}
            onChange={(e) => {
              setTokenName(e.target.value);
            }}
            style={{
              marginBottom: "20px",
              marginTop: "20px",
              width: "90%",
            }}
          />
          <TextField
            placeholder="Symbol of the token"
            value={tokenSymbol}
            onChange={(e) => {
              setTokenSymbol(e.target.value);
            }}
            style={{
              marginBottom: "20px",
              width: "90%",
            }}
          />
          <TextField
            placeholder="Number of token to mint"
            value={quantity}
            onChange={(e) => {
              setQuantity(parseInt(e.target.value));
            }}
            style={{
              marginBottom: "20px",
              width: "90%",
            }}
          />
          <TextField
            placeholder="Token's decimals"
            value={decimals}
            onChange={(e) => {
              setDecimals(parseInt(e.target.value));
            }}
            style={{
              marginBottom: "20px",
              width: "90%",
            }}
          />
          <TextField
            placeholder="Metadata URL"
            value={metadataURL}
            onChange={(e) => {
              setMetadataURL(e.target.value);
            }}
            style={{
              marginBottom: "20px",
              width: "90%",
            }}
          />
          {!isCreating ? (
            <Button
              style={{
                marginTop: "10px",
                marginBottom: "10px",
              }}
              onClick={() => CreateToken()}
            >
              Create token
            </Button>
          ) : (
            <Button
              style={{
                marginTop: "10px",
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
              Creating...
            </Button>
          )}
        </View>
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
              Successfully created!
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
      </View>
    </View>
  );
}
