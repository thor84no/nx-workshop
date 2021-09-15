import { Tree, formatFiles, updateJson } from '@nrwl/devkit';

export default async function (tree: Tree) {
  await updateJson(tree, 'workspace.json', (json) => ({
    ...json,
    defaultProject: 'api',
  }));
  await formatFiles(tree);
}
