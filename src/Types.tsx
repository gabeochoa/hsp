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

export class IsTray implements Component {
  name: string;
  cards: Entity[];
  label: string;

  constructor(label: string) {
    this.name = 'IsTray';
    this.cards = [];
    this.label = label;
  }
}

export class IsDoctor implements Component {
  name: string;
  energy: number;

  constructor() {
    this.name = 'IsDoctor';
    this.energy = 100;
  }
}

export class IsNewArrivals implements Component {
  name: string;
  constructor() {
    this.name = 'IsNewArrivals';
  }
}

type OneOfComponent =
  | HasName
  | HasAffliction //
  | IsDoctor
  | IsTray
  | IsNewArrivals;

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
      // eslint-disable-next-line no-console
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
function uid(): number {
  return Math.round(Date.now() + Math.random() * 100);
}

export function make_card_entity(id: number) {
  const entity = new Entity(uid(), 'card');

  entity.add<HasName>(new HasName());
  entity.add<HasAffliction>(new HasAffliction());

  entities.push(entity);
  return entity;
}

export function make_new_arrivals(id: number) {
  const entity = new Entity(uid(), 'tray');
  entity.add<IsTray>(new IsTray('new_arrivals'));
  entity.add<IsNewArrivals>(new IsNewArrivals());
  entities.push(entity);
  return entity;
}

export function make_doctor(id: number) {
  const entity = new Entity(uid(), 'doctor');
  entity.add<IsTray>(new IsTray(`doctor${id}`));
  entity.add<IsDoctor>(new IsDoctor());
  entities.push(entity);
  return entity;
}
