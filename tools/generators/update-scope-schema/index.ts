import { formatFiles, readJson, Tree, writeJson } from '@nrwl/devkit';

function objectFromEntries(array: unknown[]) {
  return array.reduce((accumulator, [key, value]) => {
    accumulator[key] = value;
    return accumulator;
  }, {});
}

async function getNxJsonTags(tree: Tree, project: string) {
  const nxJson = await readJson(tree, 'nx.json');
  return nxJson.projects[project]?.tags ?? [];
}

async function getProjectDefinitions(workspace: any, tree: Tree) {
  const jsonPromises = Object.entries(workspace.projects).map(
    async ([project, json]: [project: any, json: string | object]) => {
      if (typeof json === 'string') {
        const jsonPath = `${json}/project.json`;
        return [
          project,
          {
            ...(await readJson(tree, jsonPath)),
            origin: jsonPath,
            name: project,
          },
        ];
      }
      return [
        project,
        { ...json, tags: await getNxJsonTags(tree, project), name: project },
      ];
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
        ?.filter((tag) => tag.startsWith('scope:'))
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

async function setMissingScopeTags(tree: Tree, projects: any) {
  const projectsMissingScope = Object.values(projects).filter(
    (project: any) => !project.tags?.find((tag) => tag.startsWith('scope:'))
  );
  const scopes = projectsMissingScope.map((project: any) => {
    const match = project.root.match(/libs\/([^\/]+)\/?([^\/]+)?/);
    if (match?.[2]) {
      return { project, scope: match[1] };
    }
    return { project, scope: match[1].replace(/-.*/, '') };
  });
  await Promise.all(
    scopes.map(async (scopeMetadata) => {
      const { origin, name, ...project } = scopeMetadata.project;
      const scope = scopeMetadata.scope;
      if (origin) {
        await writeJson(tree, origin, {
          ...project,
          tags: [...project.tags, `scope:${scope}`],
        });
      } else {
        const nxJson = await readJson(tree, 'nx.json');
        nxJson.projects[name].tags.push(`scope:${scope}`);
        await writeJson(tree, 'nx.json', nxJson);
      }
    })
  );
}

export default async function (tree: Tree) {
  const workspace = await readJson(tree, 'workspace.json');
  const projects = await getProjectDefinitions(workspace, tree);
  await setMissingScopeTags(tree, projects);
  const scopes = getScopes(projects);
  await updateGeneratorScopes(tree, 'feature-lib', scopes);
  await updateGeneratorScopes(tree, 'util-lib', scopes);
  await formatFiles(tree);
}
