import { BigInt, dataSource, log } from "@graphprotocol/graph-ts";

import { Participant } from "../../generated/schema";
import { Transfer } from "../../generated/templates/ERC20/ERC20";
import { idForParticipant, updateBalance } from "../utils";

export function handleERC20Transfer(event: Transfer): void {
  let context = dataSource.context();
  let projectId = BigInt.fromI32(context.getI32("projectId"));
  let cv = context.getString("cv");

  log.debug("handling ERC20 transfer. projectId: {}", [projectId.toString()]);

  let sender = Participant.load(idForParticipant(projectId, event.params.from));

  if (sender) {
    sender.unstakedBalance = sender.unstakedBalance.minus(event.params.value);

    updateBalance(sender);

    sender.save();
  }

  let receiverId = idForParticipant(projectId, event.params.to);
  let receiver = Participant.load(receiverId);

  if (!receiver) {
    receiver = new Participant(receiverId);
    receiver.projectId = projectId.toI32();
    receiver.project = projectId.toString();
    receiver.wallet = event.params.to;
    receiver.stakedBalance = BigInt.fromString("0");
    receiver.unstakedBalance = BigInt.fromString("0");
    receiver.totalPaid = BigInt.fromString("0");
    receiver.lastPaidTimestamp = 0;
  }

  if (!receiver) return;

  receiver.unstakedBalance = receiver.unstakedBalance.plus(event.params.value);

  updateBalance(receiver);

  receiver.save();
}
