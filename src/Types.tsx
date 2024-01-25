export enum TrayType {
  Hold,
  Doctor,
}

export interface ITray {
  cards: Entity[];
  extra: {
    energy?: number | null;
  };
  id: number;
  label: string;
  type: TrayType;
}

export interface IAffliction {
  medicine_needed: number;
  ticks_needed: number;
}

function get_random_name() {
  return 'John ';
}
function get_random_affliction(): IAffliction {
  return {
    medicine_needed: 0,
    ticks_needed: 100,
  };
}

interface Component {
  name: string;
}

export class HasName implements Component {
  name: string;
  patient_name: string;

  constructor() {
    this.name = 'HasName';
    this.patient_name = get_random_name();
  }
}

export class HasAffliction implements Component {
  name: string;
  affliction: IAffliction;

  constructor() {
    this.name = 'HasAffliction';
    this.affliction = get_random_affliction();
  }
}

type OneOfComponent = HasName | HasAffliction;

export class Entity {
  name: string;
  id: number;

  components: {
    [key: string]: OneOfComponent;
  };

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
    this.components = {};
  }

  add<T extends OneOfComponent>(comp: T) {
    if (comp.name in this.components) {
      console.error(
        `This entity ${this.id} ${this.name} already has component ${comp.name}`,
      );
      return;
    }
    this.components[comp.name] = comp;
  }
  get<T extends OneOfComponent>(name: string): T {
    if (this.is_missing(name)) {
      console.error(`This entity ${this.id} ${this.name} is missing ${name}`);
    }
    return this.components[name];
  }

  has(name: string): boolean {
    return name in this.components;
  }

  is_missing(name: string): boolean {
    return !this.has(name);
  }
}

const entities: Entity[] = [];

export function make_card_entity(id: number) {
  const entity = new Entity(id, 'card');

  entity.add<HasName>(new HasName());
  entity.add<HasAffliction>(new HasAffliction());

  entities.push(entity);
  return entity;
}

export class TCard {
  id: number;
  label: string;
  issue: IAffliction;

  constructor(id: number) {
    this.id = id;
    this.label = get_random_name() + id;
    this.issue = get_random_affliction();
  }
}
