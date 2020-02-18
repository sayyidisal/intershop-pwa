import { CaseClause, SourceFile, SyntaxKind, VariableDeclarationKind } from 'ts-morph';

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
    const switchStatements: { identifier: string; hasLogic: boolean; block: string }[] = [];
    this.reducerFile
      .getFunction(`${this.storeName}Reducer`)
      .getFirstDescendantByKind(SyntaxKind.CaseBlock)
      .getClauses()
      .filter(clause => clause.getKind() === SyntaxKind.CaseClause)
      .forEach((clause: CaseClause) => {
        // is it a static return or is the payload used?
        const hasLogic =
          clause
            .getFirstChildByKindOrThrow(SyntaxKind.Block)
            .getStatements()[0]
            .getKind() !== SyntaxKind.ReturnStatement;
        // push information about switch statement to array
        console.log(clause.getExpression().getText());
        switchStatements.push({
          identifier: clause.getExpression().getText(),
          hasLogic,
          block: clause.getFirstChildByKindOrThrow(SyntaxKind.Block).getText(),
        });
      });

    // create new reducer function
    const reducer = this.reducerFile.addVariableStatement({
      isExported: false,
      isDefaultExport: false,
      hasDeclareKeyword: false,
      docs: [],
      kind: 39,
      declarationKind: VariableDeclarationKind.Const,
      declarations: [
        {
          name: 'reducer',
          initializer: 'createReducer()',
          type: undefined,
          hasExclamationToken: false,
          kind: 38,
        },
      ],
    });
    const createReducerFunction = reducer.getFirstDescendantByKindOrThrow(SyntaxKind.CallExpression);
    // add first reducer argument
    createReducerFunction.addArgument('initialState');
    // for each switch case, add a new on()-function
    switchStatements.forEach(statement => {
      // name of the actionCreator function
      let typeString: string;
      statement.identifier.includes('.')
        ? (typeString = statement.identifier.split('.')[1])
        : (typeString = statement.identifier);
      typeString = typeString.replace(/^\w/, c => c.toLowerCase());
      const arrowFunction = statement.hasLogic
        ? `(state, action) => ${statement.block}`
        : `state => ${statement.block}`;
      createReducerFunction.addArgument(`on(${this.storeName}Actions.${typeString}, ${arrowFunction})`);
    });
  }

  private addImports() {
    this.reducerFile.addImportDeclaration({
      moduleSpecifier: '@ngrx/store',
      namedImports: ['on'],
    });
    this.reducerFile.addImportDeclaration({
      moduleSpecifier: `./${this.storeName}.actions`,
      namespaceImport: `${this.storeName}Actions`,
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
