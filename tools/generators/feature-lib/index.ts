import { Tree, formatFiles, installPackagesTask } from '@nrwl/devkit';
import { libraryGenerator } from '@nrwl/react';
import { Linter } from '@nrwl/linter';

export default async function (tree: Tree, schema: any) {
  await libraryGenerator(tree, {
    linter: Linter.EsLint,
    skipFormat: false,
    skipTsConfig: false,
    style: 'scss',
    unitTestRunner: 'jest',
    name: `feature-${schema.name}`,
    directory: schema.directory,
    tags: `type:feature,scope:${schema.directory}`,
  });
  await formatFiles(tree);
  return () => {
    installPackagesTask(tree);
  };
}
