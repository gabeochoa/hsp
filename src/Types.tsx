export enum TrayType {
  Hold,
  Doctor,
}

export interface ITray {
  cards: Card[];
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

export class Card {
  id: number;
  label: string;
  ticks_remaining: number;
  issue: IAffliction;

  constructor(id: number) {
    this.id = id;
    this.label = get_random_name() + id;
    this.issue = get_random_affliction();
    this.ticks_remaining = this.issue.ticks_needed;
  }
}
