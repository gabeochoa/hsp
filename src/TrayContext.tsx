import { createContext, useCallback, useEffect, useState } from 'react';
import {
  call_if_has_all_requires,
  Entity,
  HasAffliction,
  HasHealth,
  IsDoctor,
  IsNewArrivals,
  IsTray,
  make_card_entity,
  make_doctor,
  make_new_arrivals,
} from './Types.tsx';

interface ITrayContext {
  medicine: number;
  moveCard: (
    tray_one: Entity['id'],
    tray_two: Entity['id'],
    card_id: Entity['id'],
  ) => void;
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
  if (isdoctor.energy >= 100) {
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
  if (istray.cards.length > 3) {
    return;
  }
  isnewarrival.spawn_cooldown--;
  if (isnewarrival.spawn_cooldown > 0) {
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
  hasHealth.health = Math.min(100, hasHealth.health + rate);
}

function cleanup_dead_patients(entity: Entity) {
  const istray: IsTray = entity.get<IsTray>('IsTray');

  const len = istray.cards.length;
  istray.cards = istray.cards.filter(
    (x: Entity) => x.get<HasHealth>('HasHealth').health > 0,
  );
  const lenAfter = istray.cards.length;
  system.patients_lost += len - lenAfter;
}
/*

      Doctor shouldnt start unless
      - they have enough energy to finish
      - have enough supplies (etc) 

      Once they start
      - lock the card
      - take the supplies
      - start counting down 

     */

class System {
  medicine: number;
  patients_lost: number;

  constructor() {
    this.medicine = 500;
    this.patients_lost = 0;
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
    call_if_has_all_requires(['IsTray'], entity, cleanup_dead_patients);
  }
}

const system = new System();

export const TrayContext = createContext<ITrayContext>({
  medicine: 0,
  moveCard: () => {},
  patients_lost: 0,
  trays: [],
});

export function TrayContextProvider({ children }) {
  const [trays, setTrays] = useState<Entity[]>([
    make_new_arrivals(),
    make_doctor(),
    make_doctor(),
  ]);

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
        medicine: system.medicine,
        moveCard,
        patients_lost: system.patients_lost,
        trays,
      }}
    >
      {children}
    </TrayContext.Provider>
  );
}
