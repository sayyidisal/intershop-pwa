import { Project } from 'ts-morph';

import { ActionCreatorsActionsMorpher } from './migrate-action-creators.actions';
import { ActionCreatorsEffectMorpher } from './migrate-action-creators.effects';
import { ActionCreatorsReducerMorpher } from './migrate-action-creators.reducers';

const control = {
  actions: true,
  reducer: true,
  effects: true,
};
const save = false;

const storeName = 'contact';
const project = new Project({
  tsConfigFilePath: 'E:/Projects/pwa-github/tsconfig.json',
});
/*
Please make sure there are no star imports used in your store!
*/

console.log(`migrating '${storeName}' store`);
// instantiate morphers
const actionMorph = new ActionCreatorsActionsMorpher(project.getSourceFile(`${storeName}.actions.ts`), storeName);
const reducerMorph = new ActionCreatorsReducerMorpher(storeName, project.getSourceFile(`${storeName}.reducer.ts`));
const effectsMorph = new ActionCreatorsEffectMorpher(storeName, project.getSourceFile(`${storeName}.effects.ts`));

// migrate actions
control.actions ? actionMorph.migrateActions() : null;

// migrate reducer
control.reducer ? reducerMorph.migrateReducer() : null;

// migrate effects
control.effects ? effectsMorph.migrateEffects() : null;

save ? project.save() : null;
