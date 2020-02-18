import { ClassDeclaration, NewExpression, SourceFile, SyntaxKind, VariableDeclarationKind } from 'ts-morph';

export class ActionCreatorsActionsMorpher {
  constructor(public actionsFile: SourceFile, public storeName: string) {}
  actionTypes: { [typeName: string]: string };

  private string;
  migrateActions(updateGlobalReferences: boolean = true) {
    this.readActionTypes();
    this.replaceActions(updateGlobalReferences);
    // clean up old code
    this.actionsFile.getEnums()[0].remove();
    this.actionsFile.getTypeAliases()[0].remove();
    this.actionsFile.fixMissingImports();
    this.actionsFile.fixUnusedIdentifiers();
  }
  private readActionTypes() {
    console.log('reading action types...');
    this.actionTypes = this.actionsFile
      .getEnums()[0]
      .getMembers()
      .reduce(
        (acc, current) => ({
          ...acc,
          [current.getName()]: current.getInitializer().getText(),
        }),
        {}
      );
    console.log(`    ${Object.keys(this.actionTypes).length} actions found`);
  }

  private replaceActions(updateGlobalReferences: boolean) {
    console.log('replacing action classes with creator functions...');
    this.actionsFile.getClasses().forEach(actionClass => {
      // retrieve basic action information
      const className = actionClass.getName();
      const typeString = this.actionTypes[className];
      // get constructor information
      const hasConstructor = actionClass.getConstructors().length > 0;
      const constructorContents = hasConstructor
        ? actionClass
            .getConstructors()[0]
            .getParameter('payload')
            .getText()
            .replace('public ', '')
        : '';

      // assemble structure object
      const createActionStructure = {
        isExported: true,
        isDefaultExport: false,
        hasDeclareKeyword: false,
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
          {
            name: className.replace(/^\w/, c => c.toLowerCase()),
            initializer: hasConstructor
              ? `createAction(${typeString}, props<{${constructorContents}}>())`
              : `createAction(${typeString})`,
            type: undefined,
            hasExclamationToken: false,
            kind: 38,
          },
        ],
      };
      // add variable statement to file
      this.actionsFile.addVariableStatement(createActionStructure);
      // update references in other files
      if (updateGlobalReferences) {
        this.updateGlobalReferences(actionClass);
      }
      // remove class from file
      actionClass.remove();
    });
  }

  private updateGlobalReferences(actionClass: ClassDeclaration) {
    console.log(`updating references for ${actionClass.getName()}...`);
    let i = 0;
    actionClass.findReferencesAsNodes().forEach(reference => {
      if (
        // exclude tests and the actions file itself
        !reference
          .getSourceFile()
          .getBaseName()
          .includes('spec.ts') &&
        reference.getSourceFile() !== this.actionsFile
      ) {
        // update "new"-expressions
        const newExpression = reference.getFirstAncestor(
          ancestor => ancestor.getKind() === SyntaxKind.NewExpression
        ) as NewExpression;
        if (newExpression) {
          // swap new class instantiation to actionCreator call
          const hasArgument = newExpression.getArguments().length > 0;
          const argument = hasArgument ? newExpression.getArguments()[0].getText() : '';

          // update general new statements in function calls
          if (newExpression.getParent().getKind() === SyntaxKind.CallExpression) {
            console.log(`    ${newExpression.getSourceFile().getBaseName()}`);
            // console.log(`argument: ${argument}`);
            const callExpression = newExpression.getParentIfKindOrThrow(SyntaxKind.CallExpression);
            const argumentText = this.updateNewExpressionString(newExpression, actionClass.getName(), argument);

            callExpression.addArgument(argumentText);
            callExpression.removeArgument(newExpression);
            i++;
          } else if (newExpression.getParent().getKind() === SyntaxKind.ArrowFunction) {
            const arrow = newExpression.getParentIfKindOrThrow(SyntaxKind.ArrowFunction);

            const argumentText = this.updateNewExpressionString(newExpression, actionClass.getName(), argument);
            arrow.getFirstChildByKindOrThrow(SyntaxKind.NewExpression).replaceWithText(argumentText);

            // ToDo: Multiple Parameters?
            arrow
              .getParentIfKind(SyntaxKind.CallExpression)
              .addArgument(`${arrow.getParameters()[0].getText()} => ${argumentText}`);
            arrow.getParentIfKind(SyntaxKind.CallExpression).removeArgument(arrow);
            i++;
          }
        }
        // ToDo: maybe update other expressions
      }
    });

    i > 0 ? console.log(`    updated ${i} reference${i > 1 ? 's' : ''}.`) : console.log('    no references found.');
  }
  updateNewExpressionString(newExpression: NewExpression, actionClassString: string, argumentString: string = '') {
    if (newExpression.getExpression().getKind() === SyntaxKind.Identifier || SyntaxKind.PropertyAccessExpression) {
      let argumentText;
      if (newExpression.getExpression().getKind() === SyntaxKind.Identifier) {
        argumentText = `${actionClassString.replace(/^\w/, c => c.toLowerCase())}(${argumentString})`;
      } else {
        argumentText = `${this.storeName}Actions.${actionClassString.replace(/^\w/, c =>
          c.toLowerCase()
        )}(${argumentString})`;
      }
      return argumentText;
    } else {
      throw new Error('newExpression has neither Identifier nor PropertyAccessExpression');
    }
  }
}
