import { CaseClause, SourceFile, SyntaxKind, VariableDeclarationKind } from 'ts-morph';

import { MorphOperators } from '../morph-operators/morph-operators';

export class ActionCreatorsReducerMorpher {
  constructor(public storeName: string, public reducerFile: SourceFile) {}

  migrateReducer() {
    this.addImports();
    this.updateReducer();
    this.updateFeatureReducer();
    this.reducerFile.fixMissingImports();
    this.reducerFile.fixUnusedIdentifiers();
  }

  private updateReducer() {
    console.log('replacing reducers...');
    // retrieve reducer logic from old reducer
    const switchStatements: {
      identifier: string;
      hasLogic: boolean;
      block: string;
      previousIdentifiers: string[];
    }[] = [];
    let previousIdentifiers: string[] = [];
    this.reducerFile
      .getFunction(`${this.storeName}Reducer`)
      .getFirstDescendantByKind(SyntaxKind.CaseBlock)
      .getClauses()
      .filter(clause => clause.getKind() === SyntaxKind.CaseClause)
      .forEach((clause: CaseClause) => {
        // check whether clause is an empty clause
        if (clause.getStatements().length === 0) {
          previousIdentifiers.push(clause.getExpression().getText());
          return;
        }
        // is it a static return or is the payload used?
        const hasLogic =
          clause
            .getFirstChildByKindOrThrow(SyntaxKind.Block)
            .getStatements()[0]
            .getKind() !== SyntaxKind.ReturnStatement;
        // push information about switch statement to array
        switchStatements.push({
          identifier: clause.getExpression().getText(),
          hasLogic,
          block: clause.getFirstChildByKindOrThrow(SyntaxKind.Block).getText(),
          previousIdentifiers: [...previousIdentifiers],
        });
        previousIdentifiers = [];
      });

    // create new reducer function
    const reducer = this.reducerFile.addVariableStatement({
      isExported: false,
      isDefaultExport: false,
      hasDeclareKeyword: false,
      declarationKind: VariableDeclarationKind.Const,
      declarations: [
        {
          name: 'reducer',
          initializer: 'createReducer()',
          type: undefined,
          hasExclamationToken: false,
        },
      ],
    });
    const createReducerFunction = reducer.getFirstDescendantByKindOrThrow(SyntaxKind.CallExpression);
    // add first reducer argument
    createReducerFunction.addArgument('initialState');
    // for each switch case, add a new on()-function
    switchStatements.forEach(clause => {
      // name of the actionCreator function
      const actionTypes = this.createActionTypes(clause.identifier, clause.previousIdentifiers);
      const arrowFunction = clause.hasLogic ? `(state, action) => ${clause.block}` : `state => ${clause.block}`;
      createReducerFunction.addArgument(`on(${actionTypes}, ${arrowFunction})`);
    });
  }

  private createActionTypes(identifier: string, previousIdentifiers: string[]): string {
    if (previousIdentifiers.length >= 9) {
      throw new Error('Error: too many empty clauses. on() takes at most 10 arguments.');
    }
    const identifier_ = `${MorphOperators.standardizeIdentifier(identifier)}`;
    const previousIdentifiers_ = previousIdentifiers.map(i => `${MorphOperators.standardizeIdentifier(i)}`).join(', ');
    return previousIdentifiers.length === 0 ? identifier_ : `${identifier_}, ${previousIdentifiers_}`;
  }

  private addImports() {
    this.reducerFile.addImportDeclaration({
      moduleSpecifier: '@ngrx/store',
      namedImports: ['on'],
    });
  }

  private updateFeatureReducer() {
    this.reducerFile
      .getFunction(`${this.storeName}Reducer`)
      .getParameter('action')
      .remove();
    this.reducerFile.getFunction(`${this.storeName}Reducer`).addParameter({ name: 'action', type: 'Action' });
    this.reducerFile
      .getFunction(`${this.storeName}Reducer`)
      .getFirstChildByKindOrThrow(SyntaxKind.Block)
      .getStatements()
      .forEach(statement => statement.remove());
    this.reducerFile.getFunction(`${this.storeName}Reducer`).setBodyText('return reducer(state,action)');
  }
}
