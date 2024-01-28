import { createContext, useCallback, useEffect, useState } from 'react';
import { constants } from './Constants.tsx';
import { system } from './System.tsx';
import {
  Entity,
  IsTray,
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
  money: number;
  moveCard: (
    tray_one: Entity['id'],
    tray_two: Entity['id'],
    card_id: Entity['id'],
  ) => void;
  patients_healed: number;
  patients_lost: number;
  trays: Entity[];
}

export const TrayContext = createContext<ITrayContext>({
  is_valid_move: () => {
    return true;
  },
  medicine: constants.starting_medicine,
  money: 0,
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
      if (toTray.has('IsMorgue')) {
        if (cardToMove.is_missing('IsDead')) {
          return false;
        }
      } else {
        // if its not the mogue
        // no dead cards
        if (cardToMove.has('IsDead')) {
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
        money: system.money,
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
