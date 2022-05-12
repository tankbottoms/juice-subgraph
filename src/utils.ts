import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";

import {
  Participant,
  ProjectEvent,
  ProtocolLog,
  ProtocolV1Log,
  ProtocolV2Log,
} from "../generated/schema";
import { ProjectEventKey } from "./types";

export const protocolId = "1";

export function updateProtocolEntity(): void {
  const protocol = ProtocolLog.load(protocolId);
  const protocolV1Log = ProtocolV1Log.load(protocolId);
  const protocolV2Log = ProtocolV2Log.load(protocolId);

  if (protocol && protocolV1Log) {
    protocol.erc20Count =
      protocolV1Log.erc20Count + (protocolV2Log ? protocolV2Log.erc20Count : 0);
    protocol.paymentsCount =
      protocolV1Log.paymentsCount +
      (protocolV2Log ? protocolV2Log.paymentsCount : 0);
    protocol.projectsCount =
      protocolV1Log.projectsCount +
      (protocolV2Log ? protocolV2Log.projectsCount : 0);
    protocol.redeemCount =
      protocolV1Log.redeemCount +
      (protocolV2Log ? protocolV2Log.redeemCount : 0);
    protocol.volumePaid = protocolV2Log
      ? protocolV1Log.volumePaid.plus(protocolV2Log.volumePaid)
      : protocolV1Log.volumePaid;
    protocol.volumeRedeemed = protocolV2Log
      ? protocolV1Log.volumeRedeemed.plus(protocolV2Log.volumePaid)
      : protocolV1Log.volumeRedeemed;
    protocol.save();
  }
}

export function idForProjectTx(
  projectId: BigInt,
  event: ethereum.Event,
  useLogIndex: boolean = false // Using log index will ensure ID is unique even if event is emitted multiple times within a single tx
): string {
  return (
    projectId.toString() +
    "-" +
    event.transaction.hash.toHexString() +
    (useLogIndex ? "-" + event.logIndex.toString() : "")
  );
}

function idForProjectEvent(
  projectId: BigInt,
  txHash: Bytes,
  logIndex: BigInt
): string {
  return `${projectId.toString()}-${txHash
    .toHexString()
    .toLowerCase()}-${logIndex.toString()}`;
}

export function idForParticipant(
  projectId: BigInt,
  walletAddress: Bytes
): string {
  return `${projectId.toString()}-${walletAddress.toHexString().toLowerCase()}`;
}

export function updateBalance(participant: Participant): void {
  participant.balance = participant.unstakedBalance.plus(
    participant.stakedBalance
  );
}

export function saveNewProjectEvent(
  event: ethereum.Event,
  projectId: BigInt,
  id: string,
  key: ProjectEventKey
): void {
  let projectEvent = new ProjectEvent(
    idForProjectEvent(
      projectId,
      event.transaction.hash,
      event.transactionLogIndex
    )
  );
  if (!projectEvent) return;
  projectEvent.projectId = projectId.toI32();
  projectEvent.timestamp = event.block.timestamp.toI32();
  projectEvent.project = projectId.toString();

  switch (key) {
    case ProjectEventKey.deployedERC20Event:
      projectEvent.deployedERC20Event = id;
      break;
    case ProjectEventKey.distributePayoutsEvent:
      projectEvent.distributePayoutsEvent = id;
      break;
    case ProjectEventKey.distributeReservedTokensEvent:
      projectEvent.distributeReservedTokensEvent = id;
      break;
    case ProjectEventKey.distributeToPayoutModEvent:
      projectEvent.distributeToPayoutModEvent = id;
      break;
    case ProjectEventKey.distributeToReservedTokenSplitEvent:
      projectEvent.distributeToReservedTokenSplitEvent = id;
      break;
    case ProjectEventKey.distributeToTicketModEvent:
      projectEvent.distributeToTicketModEvent = id;
      break;
    case ProjectEventKey.mintTokensEvent:
      projectEvent.mintTokensEvent = id;
      break;
    case ProjectEventKey.payEvent:
      projectEvent.payEvent = id;
      break;
    case ProjectEventKey.printReservesEvent:
      projectEvent.printReservesEvent = id;
      break;
    case ProjectEventKey.projectCreateEvent:
      projectEvent.projectCreateEvent = id;
      break;
    case ProjectEventKey.redeemEvent:
      projectEvent.redeemEvent = id;
      break;
    case ProjectEventKey.tapEvent:
      projectEvent.tapEvent = id;
      break;
    case ProjectEventKey.useAllowanceEvent:
      projectEvent.useAllowanceEvent = id;
      break;
  }

  projectEvent.save();
}
