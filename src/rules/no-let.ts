import { TSESTree } from "@typescript-eslint/typescript-estree";
import { all as deepMerge } from "deepmerge";
import { JSONSchema4 } from "json-schema";

import * as ignore from "../common/ignore-options";
import {
  checkNode,
  createRule,
  RuleContext,
  RuleMetaData,
  RuleResult
} from "../util/rule";
import { isForXInitialiser } from "../util/typeguard";

// The name of this rule.
export const name = "no-let" as const;

// The options this rule can take.
type Options = readonly [ignore.IgnoreLocalOption & ignore.IgnorePatternOption];

// The schema for the rule options.
const schema: JSONSchema4 = [
  deepMerge([ignore.ignoreLocalOptionSchema, ignore.ignorePatternOptionSchema])
];

// The default options for the rule.
const defaultOptions: Options = [
  {
    ignoreLocal: false
  }
];

// The possible error messages.
const errorMessages = {
  generic: "Unexpected let, use const instead."
} as const;

// The meta data for this rule.
const meta: RuleMetaData<keyof typeof errorMessages> = {
  type: "suggestion",
  docs: {
    description: "Disallow mutable variables.",
    category: "Best Practices",
    recommended: "error"
  },
  messages: errorMessages,
  fixable: "code",
  schema
};

/**
 * Check if the given VariableDeclaration violates this rule.
 */
function checkVariableDeclaration(
  node: TSESTree.VariableDeclaration,
  context: RuleContext<keyof typeof errorMessages, Options>
): RuleResult<keyof typeof errorMessages, Options> {
  return {
    context,
    descriptors:
      node.kind === "let"
        ? [
            {
              node,
              messageId: "generic",
              fix:
                /*
                 * TODO: Remove this fix?
                 * This fix doesn't actually fix the problem; it just turns the
                 * let into a const and makes "cannot reassign to const" issues.
                 *
                 * Note: The rule "prefer-const"'s fix will fix lets only when
                 * they aren't reassigned to.
                 */

                // Can only fix if all declarations have an initial value (with the
                // exception of ForOf and ForIn Statement initialisers).
                node.declarations.every(
                  declaration => declaration.init !== null
                ) || isForXInitialiser(node)
                  ? fixer =>
                      fixer.replaceTextRange(
                        [node.range[0], node.range[0] + node.kind.length],
                        "const"
                      )
                  : undefined
            }
          ]
        : []
  };
}

// Create the rule.
export const rule = createRule<keyof typeof errorMessages, Options>({
  name,
  meta,
  defaultOptions,
  create(context, [ignoreOptions, ...otherOptions]) {
    const _checkVariableDeclaration = checkNode(
      checkVariableDeclaration,
      context,
      ignoreOptions,
      otherOptions
    );

    return {
      VariableDeclaration: _checkVariableDeclaration
    };
  }
});