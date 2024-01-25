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

function system(entity: Entity) {
  call_if_has_all_requires(
    ['IsDoctor', 'IsTray'],
    entity,
    regen_if_doctor_and_empty,
  );
}

export const TrayContext = createContext<ITrayContext>({
  medicine: 0,
  moveCard: () => {},
  trays: [],
});

export function TrayContextProvider({ children }) {
  const nextID = useRef(0);

  const make_card = useCallback((): Entity => {
    nextID.current += 1;
    return make_card_entity(nextID.current);
  }, [nextID]);

  const [medicine, setMedicine] = useState<number>(5);
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

  const tick_doctor = useCallback((tray: IsTray, doctor: IsDoctor) => {
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

    if (tray.cards.length == 0) {
      return;
    }
    doctor.energy = Math.max(0, doctor.energy - 1);
    if (doctor.energy == 0) {
      return;
    }

    const firstCard = tray.cards[0];
    if (!firstCard) {
      return;
    }
    const hasAffliction: HasAffliction =
      firstCard.get<HasAffliction>('HasAffliction');
    const issue = hasAffliction.affliction;

    if (issue.ticks_needed > 0) {
      issue.ticks_needed -= 1;
    } else {
      tray.cards = tray.cards.filter((x) => x.id != firstCard.id);
    }
  }, []);

  const tick_hold = useCallback(
    (tray: IsTray) => {
      if (tray.cards.length > 3) {
        return;
      }
      tray.cards.push(make_card());
    },
    [make_card],
  );

  const tick = useCallback(() => {
    // console.log('tick', Date.now());
    setTrays((prevTrays) => {
      const newTrays = [...prevTrays];
      newTrays.forEach((trayEnt: Entity) => {
        system(trayEnt);
        if (trayEnt.has('IsDoctor')) {
          tick_doctor(
            trayEnt.get<IsTray>('IsTray'),
            trayEnt.get<IsDoctor>('IsDoctor'),
          );
        }
        if (trayEnt.has('IsNewArrivals')) {
          tick_hold(trayEnt.get<IsTray>('IsTray'));
        }
      });
      return newTrays;
    });
  }, [tick_doctor, tick_hold]);

  useEffect(() => {
    const interval = setInterval(() => tick(), 1000);
    return () => clearInterval(interval);
  }, [tick]);

  return (
    <TrayContext.Provider
      value={{
        medicine,
        moveCard,
        trays,
      }}
    >
      {children}
    </TrayContext.Provider>
  );
}
