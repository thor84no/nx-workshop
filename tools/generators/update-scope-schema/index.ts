import { formatFiles, readJson, Tree, writeJson } from '@nrwl/devkit';

function objectFromEntries(array: unknown[]) {
  return array.reduce((accumulator, [key, value]) => {
    accumulator[key] = value;
    return accumulator;
  }, {});
}

async function getProjectDefinitions(workspace: any, tree: Tree) {
  const jsonPromises = Object.entries(workspace.projects).map(
    async ([project, json]) => {
      if (typeof json === 'string') {
        return [project, await readJson(tree, `${json}/project.json`)];
      }
      return [project, json];
    }
  );
  return objectFromEntries(await Promise.all(jsonPromises));
}

function flat(arrays) {
  return arrays.reduce(
    (accumulator, arrays) => [...accumulator, ...arrays],
    []
  );
}

function unique(value, index, self) {
  return self.indexOf(value) === index;
}

function getScopes(projects: any): string[] {
  return flat(
    Object.values(projects).map((project: any) =>
      project.tags
        .filter((tag) => tag.startsWith('scope:'))
        .map((tag) => tag.substring('scope:'.length))
    )
  ).filter(unique);
}

async function updateGeneratorScopes(
  tree: Tree,
  name: string,
  scopes: string[]
) {
  const jsonPath = `tools/generators/${name}/schema.json`;
  const schema = await readJson(tree, jsonPath);
  schema.properties.directory.enum = scopes;
  const prompt = schema.properties.directory['x-prompt'];
  prompt.items = prompt.items.filter((item) => scopes.includes(item.value));
  const items = prompt.items;
  scopes
    .filter((scope) => !items.find((item) => item.value === scope))
    .forEach((scope) => {
      items.push({
        value: scope,
        label: scope.charAt(0).toUpperCase() + scope.substring(1),
      });
    });
  await writeJson(tree, jsonPath, schema);
}

export default async function (tree: Tree) {
  const workspace = await readJson(tree, 'workspace.json');
  const projects = await getProjectDefinitions(workspace, tree);
  const scopes = getScopes(projects);
  await updateGeneratorScopes(tree, 'feature-lib', scopes);
  await updateGeneratorScopes(tree, 'util-lib', scopes);
  await formatFiles(tree);
}
