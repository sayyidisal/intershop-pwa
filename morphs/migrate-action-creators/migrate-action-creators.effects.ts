import { CallExpression, SourceFile, SyntaxKind } from 'ts-morph';

import { checkForNamespaceImports, isMap } from '../morph-helpers/morph-helpers';

import { ActionCreatorsMorpher } from './migrate-action-creators';

export class ActionCreatorsEffectMorpher {
  constructor(public effectsFile: SourceFile, public parent: ActionCreatorsMorpher) {}

  migrateEffects() {
    if (!this.effectsFile) {
      console.log('no effects file found');
      return;
    }
    console.log('replacing effects...');
    checkForNamespaceImports(this.effectsFile);
    this.effectsFile
      .getClasses()[0]
      .getChildrenOfKind(SyntaxKind.PropertyDeclaration)
      .forEach(effect => {
        // retrieve information from effect
        const name = effect.getFirstChildByKindOrThrow(SyntaxKind.Identifier).getText();
        const decoratorConfig = effect.getFirstChildByKindOrThrow(SyntaxKind.Decorator).getArguments();
        let logic = effect.getFirstChildByKindOrThrow(SyntaxKind.CallExpression);

        // update effect logic
        logic = this.updateOfType(logic);
        logic = this.updateMap(logic);
        logic = this.updateMapErrorToAction(logic);

        // add new updated property declaration
        this.effectsFile.getClasses()[0].addProperty({
          name,
          initializer:
            decoratorConfig.length > 0
              ? `createEffect(() => ${logic.getText()}, ${decoratorConfig[0].getText()})`
              : `createEffect(() => ${logic.getText()})`,
        });
        effect.remove();
      });
    this.effectsFile.fixMissingImports();
    this.effectsFile.fixUnusedIdentifiers();
  }

  /**
   * updates ofType calls in given pipe
   * @param pipe pipe CallExpression
   */
  private updateOfType(pipe: CallExpression): CallExpression {
    pipe
      // get piped functions
      .getChildrenOfKind(SyntaxKind.CallExpression)
      .filter(exp => exp.getFirstChildByKind(SyntaxKind.Identifier).getText() === 'ofType')
      .forEach(exp => {
        if (exp) {
          // remove Type Argument and update actionType
          if (exp.getTypeArguments().length > 0) {
            exp.removeTypeArgument(exp.getFirstChildByKind(SyntaxKind.TypeReference));
          }
          const args = exp.getArguments();
          args.forEach(argument => {
            const t = argument.getLastChildByKind(SyntaxKind.Identifier) || argument;
            exp.addArgument(`${t.getText().replace(/^\w/, c => c.toLowerCase())}`);
            exp.removeArgument(argument);
          });
        }
      });
    return pipe;
  }

  /**
   * PLACEHOLDER: updates different map calls in given pipe
   * @param pipe pipe CallExpression
   */
  private updateMap(pipe: CallExpression): CallExpression {
    const lastCall = pipe.getLastChildByKind(SyntaxKind.CallExpression);
    if (isMap(lastCall.getFirstChildByKind(SyntaxKind.Identifier).getText())) {
      return pipe;
    }
    return pipe;
  }

  /**
   * updated mapErrorToAction calls to use new version "mapErroToActionV8"
   * @param pipe pipe CallExpression
   */
  private updateMapErrorToAction(pipe: CallExpression): CallExpression {
    pipe.getDescendantsOfKind(SyntaxKind.CallExpression).forEach(descendant => {
      if (descendant.getExpression().getText() === 'mapErrorToAction') {
        descendant.getExpression().replaceWithText('mapErrorToActionV8');
      }
    });
    return pipe;
  }
}