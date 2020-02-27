import * as Lint from 'tslint';
import { ImportDeclaration, SourceFile, SyntaxKind } from 'typescript';

import { RuleHelpers } from './ruleHelpers';

export class Rule extends Lint.Rules.AbstractRule {
  filePattern = '^.*.(effects|reducer|actions).ts$';
  apply(sourceFile: SourceFile): Lint.RuleFailure[] {
    return this.applyWithFunction(sourceFile, ctx => {
      sourceFile.statements
        .filter(stm => stm.kind === SyntaxKind.ImportDeclaration)
        .forEach(node => {
          this.visitImportDeclaration(ctx, node as ImportDeclaration);
        });
    });
  }

  private visitImportDeclaration(ctx: Lint.WalkContext<void>, importStatement: ImportDeclaration) {
    const fromStringToken = RuleHelpers.getNextChildTokenOfKind(importStatement, SyntaxKind.StringLiteral);
    const fromStringText = fromStringToken.getText().substring(1, fromStringToken.getText().length - 1);

    if (
      new RegExp(this.filePattern).test(importStatement.getSourceFile().fileName) &&
      importStatement.getChildAt(1).getChildAt(0).kind === SyntaxKind.NamespaceImport
    ) {
      ctx.addFailureAtNode(importStatement, `Star imports in ngrx store files are banned.`);
    }
  }
}
