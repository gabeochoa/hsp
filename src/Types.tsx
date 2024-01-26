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
    ticks_needed: Math.round(100 * Math.random()),
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
  doctor?: Entity = null;

  constructor() {
    this.name = 'HasAffliction';
    this.affliction = get_random_affliction();
  }

  locked(): boolean {
    return this.doctor != null;
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

export function make_card_entity() {
  const entity = new Entity(uid(), 'card');

  entity.add<HasName>(new HasName());
  entity.add<HasAffliction>(new HasAffliction());

  entities.push(entity);
  return entity;
}

export function make_new_arrivals() {
  const entity = new Entity(uid(), 'tray');
  entity.add<IsTray>(new IsTray('new_arrivals'));
  entity.add<IsNewArrivals>(new IsNewArrivals());
  entities.push(entity);
  return entity;
}

export function make_doctor() {
  const entity = new Entity(uid(), 'doctor');
  entity.add<IsTray>(new IsTray(`doctor${entity.id}`));
  entity.add<IsDoctor>(new IsDoctor());
  entities.push(entity);
  return entity;
}

export function call_if_has_all_requires(
  value: string[],
  entity: Entity,
  cb: (arg0: Entity) => void,
) {
  if (value.length == 0) {
    return;
  }
  const missing_first = entity.is_missing(value[0]);
  if (missing_first) {
    // doesnt have req
    // dont call the function
    return;
  }

  // if this was the only req, we are good
  if (value.length == 1) {
    cb(entity);
    return;
  }
  // otherwise check the rest
  return call_if_has_all_requires(value.splice(1), entity, cb);
}
