import { CaseClause, SourceFile, SyntaxKind, VariableDeclarationKind } from 'ts-morph';

import { checkForNamespaceImports, createActionTypes } from '../morph-helpers/morph-helpers';

export class ActionCreatorsReducerMorpher {
  constructor(public storeName: string, public reducerFile: SourceFile) {}

  migrateReducer() {
    console.log('replacing reducers...');
    checkForNamespaceImports(this.reducerFile);
    this.addImports();
    this.declareNewReducer();
    this.updateFeatureReducer();
    this.reducerFile.fixMissingImports();
    this.reducerFile.fixUnusedIdentifiers();
  }
  /**
   * add required imports to prevent problems with automatic adding
   */
  private addImports() {
    this.reducerFile.addImportDeclaration({
      moduleSpecifier: '@ngrx/store',
      namedImports: ['on'],
    });
  }

  /**
   * declare new reducer function created with new createReducer factory
   */
  private declareNewReducer() {
    // retrieve reducer logic from old reducer
    const switchStatements: {
      identifier: string;
      hasLogic: boolean;
      block: string;
      previousIdentifiers: string[];
    }[] = [];
    let previousIdentifiers: string[] = [];

    // iterate over reducer switch cases and store info
    this.reducerFile
      .getFunction(`${this.storeName}Reducer`)
      .getFirstDescendantByKind(SyntaxKind.CaseBlock)
      .getClauses()
      .filter(clause => clause.getKind() === SyntaxKind.CaseClause)
      .forEach((clause: CaseClause) => {
        // store empty clauses for later use and continue
        if (clause.getStatements().length === 0) {
          previousIdentifiers.push(clause.getExpression().getText());
          return;
        }

        // does the clause have a static return or is the payload used?
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

    // add first reducer argument
    const createReducerFunction = reducer.getFirstDescendantByKindOrThrow(SyntaxKind.CallExpression);
    createReducerFunction.addArgument('initialState');

    // for each switch case, add a new on()-function
    switchStatements.forEach(clause => {
      // name of the actionCreator function
      const actionTypes = createActionTypes(clause.identifier, clause.previousIdentifiers);
      const arrowFunction = clause.hasLogic ? `(state, action) => ${clause.block}` : `state => ${clause.block}`;
      createReducerFunction.addArgument(`on(${actionTypes}, ${arrowFunction})`);
    });
  }

  /**
   * update reducer function to use the newly constructed version using createReducer
   */
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
