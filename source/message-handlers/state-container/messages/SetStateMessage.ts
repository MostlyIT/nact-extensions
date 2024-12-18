export type SetStateMessage<TState> = {
  readonly type: "set state";
  readonly stateCandidate: TState;
};

export const isSetStateMessage__unsafe = <TState>(
  message: any
): message is SetStateMessage<TState> => {
  if (typeof message !== "object" || message === null) {
    return false;
  }

  if (!("type" in message)) {
    return false;
  }

  if (message.type !== "set state") {
    return false;
  }

  if (!("stateCandidate" in message)) {
    return false;
  }

  return true;
};
