import { createContext, useCallback, useEffect, useState } from 'react';
import { constants } from './Constants.tsx';
import {
  call_if_has_all_requires,
  Entity,
  HasAffliction,
  HasHealth,
  IsDead,
  IsDoctor,
  IsMorgue,
  IsNewArrivals,
  IsTray,
  make_card_entity,
  make_doctor,
  make_morgue,
  make_new_arrivals,
} from './Types.tsx';

interface ITrayContext {
  is_valid_move: (
    tray_one: Entity['id'],
    tray_two: Entity['id'],
    card_id: Entity['id'],
  ) => boolean;
  medicine: number;
  moveCard: (
    tray_one: Entity['id'],
    tray_two: Entity['id'],
    card_id: Entity['id'],
  ) => void;
  patients_healed: number;
  patients_lost: number;
  trays: Entity[];
}

function regen_if_doctor_and_empty(entity: Entity) {
  const istray: IsTray = entity.get<IsTray>('IsTray');
  const isdoctor: IsDoctor = entity.get<IsDoctor>('IsDoctor');
  if (istray.cards.length != 0) {
    return;
  }
  // TODO add max
  if (isdoctor.energy >= constants.max_energy) {
    return;
  }
  isdoctor.energy++;
}

function doctor_working(entity: Entity) {
  const istray: IsTray = entity.get<IsTray>('IsTray');
  const isdoctor: IsDoctor = entity.get<IsDoctor>('IsDoctor');
  if (istray.cards.length == 0) {
    return;
  }

  const firstCard = istray.cards[0];
  if (!firstCard) {
    return;
  }

  const hasAffliction: HasAffliction =
    firstCard.get<HasAffliction>('HasAffliction');

  // TODO add some icon for this
  if (hasAffliction.affliction.ticks_needed > isdoctor.energy) {
    return;
  }

  if (hasAffliction.affliction.medicine_needed > system.medicine) {
    return;
  }

  isdoctor.energy = Math.max(0, isdoctor.energy - 1);
  if (isdoctor.energy == 0) {
    return;
  }

  if (hasAffliction.locked()) {
    // someone is working on this card

    if (hasAffliction.doctor?.id == entity.id) {
      // oh its us
    } else {
      // eslint-disable-next-line no-console
      console.error(
        `Our (${entity.id} first card ${firstCard.id} is locked by ${hasAffliction.doctor?.id}`,
      );
      return;
    }
  } else {
    // if its not locked yet then lets lock it
    hasAffliction.doctor = entity;
    system.medicine -= hasAffliction.affliction.medicine_needed;
    hasAffliction.affliction.medicine_needed = 0;
  }

  const issue = hasAffliction.affliction;

  if (issue.ticks_needed > 0) {
    issue.ticks_needed -= 1;
  } else {
    istray.cards = istray.cards.filter((x) => x.id != firstCard.id);
  }
}

function spawn_new_cards(entity: Entity) {
  const istray: IsTray = entity.get<IsTray>('IsTray');
  const isnewarrival: IsNewArrivals =
    entity.get<IsNewArrivals>('IsNewArrivals');
  isnewarrival.spawn_cooldown = Math.max(0, isnewarrival.spawn_cooldown - 1);
  if (isnewarrival.spawn_cooldown > 0) {
    return;
  }
  // This check is after the cooldown check
  // so that as soon as the spot opens up you get a new card
  //
  // This might cause issues where you want to put something back
  // but someone has already taken it
  if (istray.cards.length > constants.max_cards_new_arrivals) {
    return;
  }
  isnewarrival.spawn_cooldown = isnewarrival.spawn_cooldown_reset;
  istray.cards.push(make_card_entity());
}

function take_damage_if_waiting(entity: Entity) {
  const hasHealth: HasHealth = entity.get<HasHealth>('HasHealth');
  const hasAffliction: HasAffliction =
    entity.get<HasAffliction>('HasAffliction');

  if (hasAffliction.locked()) {
    return;
  }
  // TODO figure out
  const rate = 1;
  hasHealth.health = Math.max(0, hasHealth.health - rate);
}

function heal_if_being_helped(entity: Entity) {
  const hasHealth: HasHealth = entity.get<HasHealth>('HasHealth');
  const hasAffliction: HasAffliction =
    entity.get<HasAffliction>('HasAffliction');
  if (!hasAffliction.locked()) {
    return;
  }

  // TODO figure out
  const rate = 1;
  hasHealth.health = Math.min(constants.max_health, hasHealth.health + rate);
}

function mark_dead_patients(entity: Entity) {
  const istray: IsTray = entity.get<IsTray>('IsTray');
  const dead = istray.cards.filter(
    (x: Entity) =>
      x.get<HasHealth>('HasHealth').health <= 0 && //
      // we check for is dead so we only count
      // the new ones
      x.is_missing('IsDead'),
  );
  dead.forEach((x) =>
    x.is_missing('IsDead') ? x.add<IsDead>(new IsDead()) : 1,
  );
  system.patients_lost += dead.length;
}

function move_dead_patients(entity: Entity) {
  const istray: IsTray = entity.get<IsTray>('IsTray');
  const dead = istray.cards.filter((x: Entity) => x.has('IsDead'));
  istray.cards = istray.cards.filter((x: Entity) => x.is_missing('IsDead'));
  istray.cards.push(...dead);
}

function cleanup_dead_patients(entity: Entity) {
  const istray: IsTray = entity.get<IsTray>('IsTray');

  istray.cards = istray.cards.filter(
    (x: Entity) =>
      // this is here in case move validation
      // doesnt work
      x.is_missing('IsDead') ||
      //
      x.get<IsDead>('IsDead').burial_cooldown > 0,
  );

  if (istray.cards.length == 0) {
    return;
  }

  const card = istray.cards[0];
  if (card.is_missing('IsDead')) {
    // eslint-disable-next-line no-console
    console.error('Patient in morgue is not dead?');
    return;
  }
  card.get<IsDead>('IsDead').burial_cooldown--;
}

function cleanup_healed_patients(entity: Entity) {
  // we require it to be a doctor below, because
  // we dont want to hide the people who spawn with full health
  const istray: IsTray = entity.get<IsTray>('IsTray');

  const len = istray.cards.length;
  istray.cards = istray.cards.filter(
    (x: Entity) =>
      x.get<HasHealth>('HasHealth').health < constants.max_health ||
      x.get<HasAffliction>('HasAffliction').affliction.ticks_needed != 0,
  );
  const lenAfter = istray.cards.length;
  system.patients_healed += len - lenAfter;
}

class System {
  medicine: number;
  patients_lost: number;
  patients_healed: number;

  constructor() {
    this.medicine = constants.starting_medicine;
    this.patients_lost = 0;
    this.patients_healed = 0;
  }

  update(entity: Entity) {
    call_if_has_all_requires(
      ['IsNewArrivals', 'IsTray'],
      entity,
      spawn_new_cards,
    );
    call_if_has_all_requires(
      ['IsDoctor', 'IsTray'],
      entity,
      regen_if_doctor_and_empty,
    );
    call_if_has_all_requires(['IsDoctor', 'IsTray'], entity, doctor_working);
    call_if_has_all_requires(
      ['HasHealth', 'HasAffliction'],
      entity,
      take_damage_if_waiting,
    );
    call_if_has_all_requires(
      ['HasHealth', 'HasAffliction'],
      entity,
      heal_if_being_helped,
    );
    call_if_has_all_requires(['IsTray'], entity, mark_dead_patients);
    call_if_has_all_requires(['IsTray'], entity, move_dead_patients);
    call_if_has_all_requires(
      ['IsTray', 'IsMorgue'],
      entity,
      cleanup_dead_patients,
    );
    call_if_has_all_requires(
      ['IsDoctor', 'IsTray'],
      entity,
      cleanup_healed_patients,
    );
  }
}

const system = new System();

export const TrayContext = createContext<ITrayContext>({
  is_valid_move: () => {
    return true;
  },
  medicine: constants.starting_medicine,
  moveCard: () => {},
  patients_healed: 0,
  patients_lost: 0,
  trays: [],
});

export function TrayContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [trays, setTrays] = useState<Entity[]>([
    make_new_arrivals(),
    make_morgue(),
    make_doctor(),
    make_doctor(),
  ]);

  const is_valid_move = useCallback(
    (from_tray: number, to_tray: number, card_id: number) => {
      const fromTray = trays.find((tray) => tray.id === from_tray);
      const toTray = trays.find((tray) => tray.id === to_tray);

      // valid trays
      if (!fromTray || !toTray) {
        return false;
      }

      const isTrayFrom: IsTray = fromTray.get<IsTray>('IsTray');
      const isTrayTo: IsTray = toTray.get<IsTray>('IsTray');

      const cardToMove = isTrayFrom.cards.find((card) => card.id === card_id);

      // card exists
      if (!cardToMove) {
        return false;
      }

      // do we have space ?
      if (isTrayTo.cards.length >= constants.max_cards) {
        return false;
      }

      // If its a morgue and the card isnt dead
      // not allowed
      if (toTray.get<IsMorgue>('IsMorgue')) {
        if (cardToMove.is_missing('IsDead')) {
          return false;
        }
      }

      return true;
    },
    [trays],
  );

  const moveCard = useCallback(
    (from_tray: number, to_tray: number, card_id: number) => {
      setTrays((prevTrays) => {
        // console.log(`Moving card ${card_id} From ${from_tray} to ${to_tray}`);
        const newTrays = [...prevTrays];
        const fromTray = prevTrays.find((tray) => tray.id === from_tray);
        const toTray = prevTrays.find((tray) => tray.id === to_tray);
        if (!fromTray || !toTray) {
          // eslint-disable-next-line no-console
          console.error(
            'Moving card between trays where one or both dont exist',
          );
          return prevTrays;
        }
        const isTrayFrom: IsTray = fromTray.get<IsTray>('IsTray');
        const isTrayTo: IsTray = toTray.get<IsTray>('IsTray');

        const cardToMove = isTrayFrom.cards.find((card) => card.id === card_id);
        if (cardToMove) {
          // Remove the card from the from tray
          isTrayFrom.cards = isTrayFrom.cards.filter(
            (card) => card.id !== card_id,
          );
          // Add the card to the to tray
          isTrayTo.cards.push(cardToMove);
        } else {
          // eslint-disable-next-line no-console
          console.warn('didnt find card');
        }
        return newTrays;
      });
    },
    [],
  );

  const tick = useCallback(() => {
    // console.log('tick', Date.now());
    setTrays((prevTrays) => {
      const newTrays = [...prevTrays];
      newTrays.forEach((trayEnt: Entity) => {
        system.update(trayEnt);

        trayEnt.get<IsTray>('IsTray').cards.forEach((card: Entity) => {
          system.update(card);
        });
      });
      return newTrays;
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => tick(), 1000);
    return () => clearInterval(interval);
  }, [tick]);

  return (
    <TrayContext.Provider
      value={{
        is_valid_move,
        medicine: system.medicine,
        moveCard,
        patients_healed: system.patients_healed,
        patients_lost: system.patients_lost,
        trays,
      }}
    >
      {children}
    </TrayContext.Provider>
  );
}
