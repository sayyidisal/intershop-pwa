import * as Lint from 'tslint';
import * as ts from 'typescript';

export class Rule extends Lint.Rules.AbstractRule {
  static FAILURE_STRING = 'star import in ngrx store files is forbidden';

  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    if (sourceFile.fileName.includes('.effects.ts' || '.actions.ts' || '.reducer.ts' || '.selectors.ts')) {
      return this.applyWithWalker(new NoStarImportsInStoreRule(sourceFile, this.getOptions()));
    } else {
      return [];
    }
  }
}

// The walker takes care of all the work.
class NoStarImportsInStoreRule extends Lint.RuleWalker {
  visitNamespaceImport(node: ts.NamespaceImport) {
    // create a failure at the current position
    this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));

    // call the base version of this visitor to actually parse this node
    super.visitNamespaceImport(node);
  }
}
