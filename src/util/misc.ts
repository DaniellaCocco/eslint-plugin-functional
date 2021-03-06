import {
  AST_NODE_TYPES,
  TSESTree
} from "@typescript-eslint/experimental-utils";
import { Linter } from "eslint";

/**
 * Returns a function that checks if the given value is the same as the expected
 * value.
 */
export function isExpected<T>(expected: T): (actual: T) => boolean {
  return actual => actual === expected;
}

/**
 * Does the given ExpressionStatement specify directive prologues.
 */
export function isDirectivePrologue(
  node: TSESTree.ExpressionStatement
): boolean {
  return (
    node.expression.type === AST_NODE_TYPES.Literal &&
    typeof node.expression.value === "string" &&
    node.expression.value.startsWith("use ")
  );
}

/**
 * Eslint Config.
 */
export type Config = Linter.Config & {
  readonly overrides?: ReadonlyArray<{
    readonly files: ReadonlyArray<string>;
    readonly rules: Linter.Config["rules"];
  }>;
};
