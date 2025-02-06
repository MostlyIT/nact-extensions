import { describe, expectTypeOf, it } from "vitest";
import { spawnOpenAuthority } from "../../actors/state/open-authority/spawnOpenAuthority";
import { ReplaceContentMessage } from "../../data-types/messages/ReplaceContentMessage";
import {
  dispatch,
  LocalActorRef,
  spawn,
  start,
} from "../../vendored/@nact/core";
import { omitMessageType } from "./omitMessageType";

describe("omitMessageType", () => {
  describe("type inference", () => {
    it("should handle cases with multiple message types", () => {
      type Message1 = { type: "msg1"; data: string };
      type Message2 = { type: "msg2"; data: number };
      type Message3 = { type: "msg3"; data: boolean };

      const mockActor = {} as LocalActorRef<Message1 | Message2 | Message3>;

      // Omit one message type
      const omitted1 = omitMessageType<Message1>().fromActor(mockActor);
      expectTypeOf(omitted1).toMatchTypeOf<
        LocalActorRef<Message2 | Message3>
      >();
      expectTypeOf(omitted1).not.toMatchTypeOf<
        LocalActorRef<Message1 | Message2 | Message3>
      >();
      expectTypeOf(omitted1).not.toMatchTypeOf<LocalActorRef<Message1>>();

      // Omit union of message types
      const omitted2 = omitMessageType<Message1 | Message2>().fromActor(
        mockActor
      );
      expectTypeOf(omitted2).toMatchTypeOf<LocalActorRef<Message3>>();
      expectTypeOf(omitted2).not.toMatchTypeOf<
        LocalActorRef<Message1 | Message2 | Message3>
      >();
      expectTypeOf(omitted2).not.toMatchTypeOf<
        LocalActorRef<Message1 | Message2>
      >();
    });
  });

  describe("type safety", () => {
    it("should maintain type safety for remaining message types", () => {
      const system = start();
      const actor = spawnOpenAuthority(system, Symbol(), null as string | null);
      const sink = spawn(system, (state: undefined, _message: any) => state);

      const omittedReplace =
        omitMessageType<ReplaceContentMessage<string | null>>().fromActor(
          actor
        );

      dispatch(omittedReplace, {
        // @ts-expect-error - Should not allow ReplaceContentMessage
        type: "replace content",
        value: "test",
      });

      // Should allow other message types.
      dispatch(omittedReplace, {
        type: "transform content",
        transformer: (value) => value,
      });
      dispatch(omittedReplace, {
        type: "subscribe",
        subscriber: sink,
      });
      dispatch(omittedReplace, {
        type: "unsubscribe",
        subscriber: sink,
      });
    });

    it("should handle never type correctly", () => {
      type OnlyMessage = { type: "only"; data: string };
      const mockActor = {} as LocalActorRef<OnlyMessage>;

      // Omitting the only message type should result in never
      const omitted = omitMessageType<OnlyMessage>().fromActor(mockActor);
      expectTypeOf(omitted).toMatchTypeOf<LocalActorRef<never>>();
    });
  });
});
