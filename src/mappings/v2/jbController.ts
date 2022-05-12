import {
  DistributeReservedTokens,
  DistributeToReservedTokenSplit,
  MintTokens,
} from "../../../generated/JBController/JBController";
import {
  DistributeReservedTokensEvent,
  DistributeToReservedTokenSplitEvent,
  MintTokensEvent,
} from "../../../generated/schema";
import { ProjectEventKey } from "../../types";
import { idForProjectTx, saveNewProjectEvent } from "../../utils";

export function handleMintTokens(event: MintTokens): void {
  // Note: Receiver balance is updated in the jbTokenStore event handler

  let mintTokensEvent = new MintTokensEvent(
    idForProjectTx(event.params.projectId, event, true)
  );
  let projectId = event.params.projectId.toString();
  if (!mintTokensEvent) return;
  mintTokensEvent.projectId = event.params.projectId.toI32();
  mintTokensEvent.amount = event.params.tokenCount;
  mintTokensEvent.beneficiary = event.params.beneficiary;
  mintTokensEvent.caller = event.transaction.from;
  mintTokensEvent.memo = event.params.memo;
  mintTokensEvent.project = projectId;
  mintTokensEvent.timestamp = event.block.timestamp.toI32();
  mintTokensEvent.txHash = event.transaction.hash;
  mintTokensEvent.save();

  saveNewProjectEvent(
    event,
    event.params.projectId,
    mintTokensEvent.id,

    ProjectEventKey.mintTokensEvent
  );
}

export function handleDistributeReservedTokens(
  event: DistributeReservedTokens
): void {
  let projectId = event.params.projectId.toString();
  let distributeReservedTokensEvent = new DistributeReservedTokensEvent(
    idForProjectTx(event.params.projectId, event)
  );

  if (!distributeReservedTokensEvent) return;
  distributeReservedTokensEvent.project = projectId;
  distributeReservedTokensEvent.projectId = event.params.projectId.toI32();
  distributeReservedTokensEvent.txHash = event.transaction.hash;
  distributeReservedTokensEvent.timestamp = event.block.timestamp.toI32();
  distributeReservedTokensEvent.fundingCycleNumber = event.params.fundingCycleNumber.toI32();
  distributeReservedTokensEvent.caller = event.transaction.from;
  distributeReservedTokensEvent.beneficiary = event.params.beneficiary;
  distributeReservedTokensEvent.tokenCount = event.params.tokenCount;
  distributeReservedTokensEvent.beneficiaryTokenCount =
    event.params.beneficiaryTokenCount;
  distributeReservedTokensEvent.memo = event.params.memo;
  distributeReservedTokensEvent.save();

  saveNewProjectEvent(
    event,
    event.params.projectId,
    distributeReservedTokensEvent.id,

    ProjectEventKey.distributeReservedTokensEvent
  );
}

export function handleDistributeToReservedTokenSplit(
  event: DistributeToReservedTokenSplit
): void {
  let projectId = event.params.projectId.toString();
  let distributeReservedTokenSplitEvent = new DistributeToReservedTokenSplitEvent(
    idForProjectTx(event.params.projectId, event, true)
  );

  if (!distributeReservedTokenSplitEvent) return;
  distributeReservedTokenSplitEvent.distributeReservedTokensEvent = idForProjectTx(
    event.params.projectId,

    event
  );
  distributeReservedTokenSplitEvent.project = projectId;
  distributeReservedTokenSplitEvent.projectId = event.params.projectId.toI32();
  distributeReservedTokenSplitEvent.txHash = event.transaction.hash;
  distributeReservedTokenSplitEvent.timestamp = event.block.timestamp.toI32();
  distributeReservedTokenSplitEvent.caller = event.transaction.from;
  distributeReservedTokenSplitEvent.tokenCount = event.params.tokenCount;
  distributeReservedTokenSplitEvent.allocator = event.params.split.allocator;
  distributeReservedTokenSplitEvent.beneficiary =
    event.params.split.beneficiary;
  distributeReservedTokenSplitEvent.lockedUntil = event.params.split.lockedUntil.toI32();
  distributeReservedTokenSplitEvent.percent = event.params.split.percent.toI32();
  distributeReservedTokenSplitEvent.preferClaimed =
    event.params.split.preferClaimed;
  distributeReservedTokenSplitEvent.splitProjectId = event.params.split.projectId.toI32();
  distributeReservedTokenSplitEvent.save();

  saveNewProjectEvent(
    event,
    event.params.projectId,
    distributeReservedTokenSplitEvent.id,

    ProjectEventKey.distributeToReservedTokenSplitEvent
  );
}
