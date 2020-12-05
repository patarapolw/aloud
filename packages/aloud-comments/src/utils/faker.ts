import faker from 'faker';

export interface IAuthor {
  id: string | number;
  name: string;
  image: string;
}

export interface IPost {
  id: string | number;
  author: IAuthor;
  markdown: string;
  createdAt: number;
}

export function randomAuthor(): IAuthor {
  return {
    id: Math.random(),
    name: faker.name.findName(),
    image: `https://joeschmoe.io/api/v1/${Math.random().toString(36).substr(2)}`,
  };
}

export function randomPost(within?: Date): Omit<IPost, 'author'> {
  return {
    id: Math.random(),
    markdown: faker.lorem.paragraphs(Math.random() * 2, '\n\n'),
    createdAt: within ? +faker.date.between(within, new Date()) : +randomDate(),
  };
}

function randomDate(seed = Math.random()): Date {
  const now = new Date();

  // if (seed < 0.1) {
  //   return faker.date.between(new Date(+now - 1000 * 60), now); // within secs
  // }
  // if (seed < 0.3) {
  //   return faker.date.between(new Date(+now - 1000 * 60 * 60), now); // within mins
  // }
  if (seed < 0.5) {
    return faker.date.between(new Date(+now - 1000 * 60 * 60 * 24), now); // within hours
  }
  if (seed < 0.8) {
    return faker.date.between(new Date(+now - 1000 * 60 * 60 * 24 * 30), now); // within days
  }

  return faker.date.between(new Date(+now - 1000 * 60 * 60 * 24 * 365), now); // within a years
}
