import { constants, variables } from './Constants';

export interface IAffliction {
  medicine_needed: number;
  ticks_needed: number;
}

export function cost_of_procedure(aff: IAffliction) {
  return (
    variables.doctor_hourly_wage * aff.ticks_needed +
    variables.medicine_cost_to_consumer * aff.medicine_needed
  );
}

function get_random_name() {
  return (
    constants.names[Math.floor(Math.random() * constants.names.length)] + ' '
  );
}
function get_random_affliction(): IAffliction {
  return {
    medicine_needed: Math.round(variables.max_medicine_needed * Math.random()),
    ticks_needed: Math.round(variables.max_ticks_needed * Math.random()),
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

export class HasHealth implements Component {
  name: string;
  health: number;

  constructor() {
    this.name = 'HasHealth';
    this.health = constants.max_health;
  }
}

export class HasMoney implements Component {
  name: string;
  money: number;

  constructor() {
    this.name = 'HasMoney';
    this.money = Math.floor(
      Math.random() * variables.max_money +
        Math.random() * variables.max_medicine_needed +
        Math.random() * variables.max_ticks_needed,
    );
  }
}

export class HasAffliction implements Component {
  name: string;
  affliction: IAffliction;
  doctor?: Entity | null = null;

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
    this.energy = constants.max_energy;
  }
}

export class IsDead implements Component {
  name: string;

  burial_cooldown: number;
  burial_cooldown_reset: number;

  constructor() {
    this.name = 'IsDead';
    this.burial_cooldown = variables.burial_time;
    this.burial_cooldown_reset = variables.burial_time;
  }
}

export class IsMorgue implements Component {
  name: string;

  constructor() {
    this.name = 'IsMorgue';
  }
}

export class IsNewArrivals implements Component {
  name: string;

  spawn_cooldown: number;
  spawn_cooldown_reset: number;

  constructor() {
    this.name = 'IsNewArrivals';

    this.spawn_cooldown_reset = variables.new_arrival_spawn_rate;
    // starting at zero so you start with a single card
    this.spawn_cooldown = 0;
  }
}

type OneOfComponent =
  | HasName
  | HasAffliction //
  | HasHealth
  | IsDoctor
  | IsTray
  | IsMorgue
  | IsDead
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
      // eslint-disable-next-line no-console
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
  entity.add<HasHealth>(new HasHealth());
  entity.add<HasMoney>(new HasMoney());

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

export function make_morgue() {
  const entity = new Entity(uid(), 'morgue');
  entity.add<IsTray>(new IsTray(`morgue${entity.id}`));
  entity.add<IsMorgue>(new IsMorgue());
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
