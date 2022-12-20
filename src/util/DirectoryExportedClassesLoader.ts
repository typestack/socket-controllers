import * as path from 'path';
import * as glob from 'glob';

/**
 * Loads all exported classes from the given directory.
 */
export function importClassesFromDirectories(directories: string[], formats = ['.js', '.ts']): Function[] {
  const loadFileClasses = function (exported: Function | Record<string, Function> | Function[], allLoaded: Function[]) {
    if (exported instanceof Function) {
      allLoaded.push(exported);
    } else if (typeof exported === 'object' && !Array.isArray(exported)) {
      Object.keys(exported).forEach(key => loadFileClasses(exported[key], allLoaded));
    } else if (Array.isArray(exported)) {
      exported.forEach((i: Function | Record<string, Function> | Function[]) => loadFileClasses(i, allLoaded));
    }

    return allLoaded;
  };

  const allFiles = directories.reduce((allDirs, dir) => {
    return allDirs.concat(glob.sync(path.normalize(dir)));
  }, [] as string[]);

  const dirs = allFiles
    .filter(file => {
      const dtsExtension = file.substring(file.length - 5, file.length);
      return formats.indexOf(path.extname(file)) !== -1 && dtsExtension !== '.d.ts';
    })
    .map(file => {
      return require(file);
    });

  return loadFileClasses(dirs, []);
}
