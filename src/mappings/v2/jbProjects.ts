import { BigInt } from "@graphprotocol/graph-ts";

import {
  Create,
  SetMetadata,
  Transfer,
} from "../../../generated/JBProjects/JBProjects";
import {
  Project,
  ProjectCreateEvent,
  ProtocolV2Log,
} from "../../../generated/schema";
import { ProjectEventKey } from "../../types";
import {
  idForProjectTx,
  protocolId,
  saveNewProjectEvent,
  updateProtocolEntity,
} from "../../utils";

export function handleCreate(event: Create): void {
  let projectId = event.params.projectId.toString();

  let project = new Project(projectId);
  if (!project) return;
  project.projectId = event.params.projectId.toI32();
  project.owner = event.params.owner;
  project.createdAt = event.block.timestamp;
  project.metadataUri = event.params.metadata.content;
  project.metadataDomain = event.params.metadata.domain;
  project.totalPaid = BigInt.fromString("0");
  project.totalRedeemed = BigInt.fromString("0");
  project.currentBalance = BigInt.fromString("0");
  project.save();

  let projectCreateEvent = new ProjectCreateEvent(
    idForProjectTx(event.params.projectId, event)
  );
  if (projectCreateEvent) {
    projectCreateEvent.project = project.id;
    projectCreateEvent.projectId = event.params.projectId.toI32();
    projectCreateEvent.timestamp = event.block.timestamp.toI32();
    projectCreateEvent.txHash = event.transaction.hash;
    projectCreateEvent.caller = event.transaction.from;
    projectCreateEvent.save();

    saveNewProjectEvent(
      event,
      event.params.projectId,
      projectCreateEvent.id,

      ProjectEventKey.projectCreateEvent
    );
  }

  let protocolLog = ProtocolV2Log.load(protocolId);
  if (!protocolLog) protocolLog = new ProtocolV2Log(protocolId);
  // We only need to create log here, since there will only be one entity and it will be created when first project is created.
  protocolLog.projectsCount = protocolLog.projectsCount + 1;
  protocolLog.log = protocolId;
  protocolLog.save();
  updateProtocolEntity();
}

export function handleSetMetadata(event: SetMetadata): void {
  let project = Project.load(event.params.projectId.toString());
  if (!project) return;
  project.metadataUri = event.params.metadata.content;
  project.metadataDomain = event.params.metadata.domain;
  project.save();
}

export function handleTransferOwnership(event: Transfer): void {
  let project = Project.load(event.params.tokenId.toString());
  if (!project) return;
  project.owner = event.params.to;
  project.save();
}
