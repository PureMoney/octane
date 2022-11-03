import { sendAndConfirmRawTransaction, Transaction } from "@solana/web3.js";
import type { NextApiRequest, NextApiResponse } from "next";
import base58 from "bs58";
import { ENV_SECRET_KEYPAIR, cors, rateLimit, connection, cache, config } from "../../../src";
import { core, createAccountIfTokenFeePaid } from "@solana/octane-core";

// Endpoint to create associated token account with transaction fees and account initialization fees paid by SPL tokens
export default async function (request: NextApiRequest, response: NextApiResponse) {
  await cors(request, response);
  await rateLimit(request, response);

  // Deserialize a base58 wire-encoded transaction from the request
  const serialized = request.body?.transaction;
  if (typeof serialized !== "string") {
    response.status(400).send({ status: "error", message: "request should contain transaction" });
    return;
  }

  let transaction: Transaction;
  try {
    transaction = Transaction.from(base58.decode(serialized));
  } catch (e) {
    response.status(400).send({ status: "error", message: "can't decode transaction" });
    return;
  }

  try {
    const { signature } = await createAccountIfTokenFeePaid(
      connection,
      transaction,
      ENV_SECRET_KEYPAIR,
      config.maxSignatures,
      config.lamportsPerSignature,
      config.endpoints.createAssociatedTokenAccount.tokens.map((token) => core.TokenFee.fromSerializable(token)),
      cache
    );

    // if (config.returnSignature !== undefined) {
    //     if (!await isReturnedSignatureAllowed(
    //         request,
    //         config.returnSignature as ReturnSignatureConfigField
    //     )) {
    //         response.status(400).send({ status: 'error', message: 'anti-spam check failed' });
    //         return;
    //     }
    //     response.status(200).send({ status: 'ok', signature });
    //     return;
    // }

    transaction.addSignature(ENV_SECRET_KEYPAIR.publicKey, Buffer.from(base58.decode(signature)));

    await sendAndConfirmRawTransaction(connection, transaction.serialize(), { commitment: "confirmed" });

    // Respond with the confirmed transaction signature
    response.status(200).send({ status: "ok", signature });
  } catch (error) {
    let message = "";
    if (error instanceof Error) {
      message = error.message;
    }
    response.status(400).send({ status: "error", message });
  }
}
