export const genRandomStr = (length: number) => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength);
    result += characters[randomIndex];
  }

  return result;
};

export const extractInformation = (line: string) => {
  const arrows = ['-->', '..>', '<..'];
  if (line.includes(arrows[0])) {
    // case: Actor --> (Usecase)
    const match = line.match(/^\s*(.*?)\s*-->\s*(.*?)\s*$/);
    if (match) {
      return { actor: match[1].trim(), usecase: match[2].trim() };
    }
  } else if (line.includes(arrows[1])) {
    // case: (Usecase) ..> (Usecase) : <<include>>
    const match = line.match(/^\s*(.*?)\s*..>\s*(.*?)\s*:\s*<<include>>\s*$/);
    if (match) {
      return { usecase1: match[1].trim(), usecase2: match[2].trim() };
    }
  } else if (line.includes(arrows[2])) {
    // case: (Usecase) <.. (Usecase) : <<extend>>
    const match = line.match(/^\s*(.*?)\s*<..\s*(.*?)\s*:\s*<<extend>>\s*$/);
    if (match) {
      return { usecase1: match[1].trim(), usecase2: match[2].trim() };
    }
  }
  return null;
};

export type MappingEntity = {
  [name: string]: string;
};

const trimQuotes = (str: string) => {
  if (str.startsWith('"') && str.endsWith('"')) {
    return str.slice(1, -1);
  }
  return str;
};

/* eslint-disable @typescript-eslint/no-unused-expressions */
export const extractEntity = (defArr: string[]) => {
  const actors = {} as MappingEntity,
    usecases = {} as MappingEntity;
  const definition = [];
  for (let line of defArr) {
    const originalLine = line;
    line = line.trim();
    const res = extractInformation(originalLine);
    if (res?.actor && res?.usecase) {
      const actorRaw = res.actor;
      const actorClean = trimQuotes(actorRaw);
      const usecaseRaw = res.usecase.startsWith('(') && res.usecase.endsWith(')') 
        ? res.usecase.slice(1, -1) 
        : res.usecase;
      const usecaseClean = trimQuotes(usecaseRaw);

      if (!actors[actorClean]) {
        actors[actorClean] = genRandomStr(Math.max(8, actorClean.length));
      }
      if (!usecases[usecaseClean]) {
        usecases[usecaseClean] = genRandomStr(Math.max(8, usecaseClean.length));
      }

      let newLine = originalLine.replace(actorRaw, actors[actorClean]);
      // If usecaseRaw was (Name), we need to replace Name inside ()
      if (res.usecase.startsWith('(') && res.usecase.endsWith(')')) {
        newLine = newLine.replace(res.usecase, `(${usecases[usecaseClean]})`);
      } else {
        newLine = newLine.replace(res.usecase, usecases[usecaseClean]);
      }
      definition.push(newLine);
    } else if (res?.usecase1 && res?.usecase2) {
      const u1Raw = res.usecase1.startsWith('(') && res.usecase1.endsWith(')') 
        ? res.usecase1.slice(1, -1) 
        : res.usecase1;
      const u2Raw = res.usecase2.startsWith('(') && res.usecase2.endsWith(')') 
        ? res.usecase2.slice(1, -1) 
        : res.usecase2;
      
      const u1Clean = trimQuotes(u1Raw);
      const u2Clean = trimQuotes(u2Raw);

      if (!usecases[u1Clean]) {
        usecases[u1Clean] = genRandomStr(Math.max(8, u1Clean.length));
      }
      if (!usecases[u2Clean]) {
        usecases[u2Clean] = genRandomStr(Math.max(8, u2Clean.length));
      }

      let newLine = originalLine;
      if (res.usecase1.startsWith('(') && res.usecase1.endsWith(')')) {
        newLine = newLine.replace(res.usecase1, `(${usecases[u1Clean]})`);
      } else {
        newLine = newLine.replace(res.usecase1, usecases[u1Clean]);
      }

      if (res.usecase2.startsWith('(') && res.usecase2.endsWith(')')) {
        newLine = newLine.replace(res.usecase2, `(${usecases[u2Clean]})`);
      } else {
        newLine = newLine.replace(res.usecase2, usecases[u2Clean]);
      }
      definition.push(newLine);
    } else {
      definition.push(originalLine);
    }
  }
  return { actors, usecases, newDefinition: definition.join('\n') };
};
