import {
  IParserUnresolvedRefDefinitionError,
  ParserDefinitionErrorType
} from "../parser/parser.js"
import { forEach, values } from "../../utils/utils.js"
import { NonTerminal, Rule } from "./gast/gast_public.js"
import { GAstVisitor } from "./gast/gast_visitor_public.js"
import {
  IGrammarResolverErrorMessageProvider,
  IParserDefinitionError
} from "../../../api.js"

export function resolveGrammar(
  topLevels: Record<string, Rule>,
  errMsgProvider: IGrammarResolverErrorMessageProvider
): IParserDefinitionError[] {
  let refResolver = new GastRefResolverVisitor(topLevels, errMsgProvider)
  refResolver.resolveRefs()
  return refResolver.errors
}

export class GastRefResolverVisitor extends GAstVisitor {
  public errors: IParserUnresolvedRefDefinitionError[] = []
  private currTopLevel: Rule

  constructor(
    private nameToTopRule: Record<string, Rule>,
    private errMsgProvider: IGrammarResolverErrorMessageProvider
  ) {
    super()
  }

  public resolveRefs(): void {
    forEach(values(this.nameToTopRule), (prod) => {
      this.currTopLevel = prod
      prod.accept(this)
    })
  }

  public visitNonTerminal(node: NonTerminal): void {
    let ref = this.nameToTopRule[node.nonTerminalName]

    if (!ref) {
      let msg = this.errMsgProvider.buildRuleNotFoundError(
        this.currTopLevel,
        node
      )
      this.errors.push({
        message: msg,
        type: ParserDefinitionErrorType.UNRESOLVED_SUBRULE_REF,
        ruleName: this.currTopLevel.name,
        unresolvedRefName: node.nonTerminalName
      })
    } else {
      node.referencedRule = ref
    }
  }
}
