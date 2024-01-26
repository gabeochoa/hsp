import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import {
  call_if_has_all_requires,
  Entity,
  HasAffliction,
  IsDoctor,
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
  isdoctor.energy = Math.max(0, isdoctor.energy - 1);
  if (isdoctor.energy == 0) {
    return;
  }

  const firstCard = istray.cards[0];
  if (!firstCard) {
    return;
  }
  const hasAffliction: HasAffliction =
    firstCard.get<HasAffliction>('HasAffliction');
  const issue = hasAffliction.affliction;

  if (issue.ticks_needed > 0) {
    issue.ticks_needed -= 1;
  } else {
    istray.cards = istray.cards.filter((x) => x.id != firstCard.id);
  }
}

function spawn_new_cards(entity: Entity) {
  const istray: IsTray = entity.get<IsTray>('IsTray');
  if (istray.cards.length > 3) {
    return;
  }
  istray.cards.push(make_card_entity());
}

/*

      Doctor shouldnt start unless
      - they have enough energy to finish
      - have enough supplies (etc) 

      Once they start
      - lock the card
      - take the supplies
      - start counting down 

      Once they finish 
      - delete the card 

      While doctor empty 
      - regen the energy

     */

class System {
  medicine: number;

  constructor() {
    this.medicine = 5;
  }

  update(entity: Entity) {
    call_if_has_all_requires(
      ['IsDoctor', 'IsTray'],
      entity,
      regen_if_doctor_and_empty,
    );
    call_if_has_all_requires(['IsDoctor', 'IsTray'], entity, doctor_working);
    call_if_has_all_requires(
      ['IsNewArrivals', 'IsTray'],
      entity,
      spawn_new_cards,
    );
  }
}

const system = new System();

export const TrayContext = createContext<ITrayContext>({
  medicine: 0,
  moveCard: () => {},
  trays: [],
});

export function TrayContextProvider({ children }) {
  const nextID = useRef(0);

  const [trays, setTrays] = useState<Entity[]>([
    make_new_arrivals(0),
    make_doctor(0),
    make_doctor(1),
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
        trays,
      }}
    >
      {children}
    </TrayContext.Provider>
  );
}
