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
    const match = line.match(/^(.*?)\s-->\s(.*?)$/);
    if (match) {
      return { actor: match[1], usecase: match[2] };
    }
  } else if (line.includes(arrows[1])) {
    // case: (Usecase) ..> (Usecase) : <<include>>
    const match = line.match(/^(.*?)\s..>\s(.*?)\s:\s<<include>>$/);
    if (match) {
      return { usecase1: match[1], usecase2: match[2] };
    }
  } else if (line.includes(arrows[2])) {
    // case: (Usecase) <.. (Usecase) : <<extend>>
    const match = line.match(/^(.*?)\s<..\s(.*?)\s:\s<<extend>>$/);
    if (match) {
      return { usecase1: match[1], usecase2: match[2] };
    }
  }
  return null;
};

export type MappingEntity = {
  [name: string]: string;
};

/* eslint-disable @typescript-eslint/no-unused-expressions */
export const extractEntity = (defArr: string[]) => {
  const actors = {} as MappingEntity,
    usecases = {} as MappingEntity;
  const definition = [];
  for (let line of defArr) {
    line = line.trim();
    const res = extractInformation(line);
    if (res?.actor && res?.usecase) {
      !actors[res.actor] &&
        (actors[res.actor] = genRandomStr(res.actor.length));
      res.usecase = res.usecase.slice(1, -1);
      !usecases[res.usecase] &&
        (usecases[res.usecase] = genRandomStr(res.usecase.length));
      definition.push(
        line
          .replace(res.actor, actors[res.actor])
          .replace(res.usecase, usecases[res.usecase])
      );
    } else if (res?.usecase1 && res?.usecase2) {
      res.usecase1 = res.usecase1.slice(1, -1);
      res.usecase2 = res.usecase2.slice(1, -1);
      !usecases[res.usecase1] &&
        (usecases[res.usecase1] = genRandomStr(res.usecase1.length));
      !usecases[res.usecase2] &&
        (usecases[res.usecase2] = genRandomStr(res.usecase2.length));
      definition.push(
        line
          .replace(res.usecase1, usecases[res.usecase1])
          .replace(res.usecase2, usecases[res.usecase2])
      );
    } else {
      definition.push(line);
    }
  }
  return { actors, usecases, newDefinition: definition.join('\n') };
};
