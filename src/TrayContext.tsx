import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import {
  Entity,
  HasAffliction,
  ITray,
  make_card_entity,
  TCard,
  TrayType,
} from './Types.tsx';

interface ITrayContext {
  moveCard: (
    tray_one: ITray['id'],
    tray_two: ITray['id'],
    card_id: TCard['id'],
  ) => void;
  trays: ITray[];
}

export const TrayContext = createContext<ITrayContext>({
  medicine: 0,
  moveCard: () => {},
  trays: [],
});

export function TrayContextProvider({ children }) {
  const nextID = useRef(0);
  const [medicine, setMedicine] = useState<number>(5);
  const [trays, setTrays] = useState<ITray[]>([
    {
      id: 0,
      label: 'new arrivals',
      // eslint-disable-next-line sort-keys-fix/sort-keys-fix
      cards: [],
      extra: {},
      type: TrayType.Hold,
    },
    {
      id: 1,
      label: 'doctor1',
      // eslint-disable-next-line sort-keys-fix/sort-keys-fix
      cards: [],
      extra: {
        energy: 100,
      },
      type: TrayType.Doctor,
    },
    {
      id: 2,
      label: 'doctor2',
      // eslint-disable-next-line sort-keys-fix/sort-keys-fix
      cards: [],
      extra: {
        energy: 100,
      },
      type: TrayType.Doctor,
    },
  ]);

  const moveCard = useCallback(
    (from_tray: number, to_tray: number, card_id: number) => {
      setTrays((prevTrays) => {
        const newTrays = [...prevTrays];
        const fromTray = prevTrays.find((tray) => tray.id === from_tray);
        const toTray = prevTrays.find((tray) => tray.id === to_tray);
        if (fromTray && toTray) {
          const cardToMove = fromTray.cards.find((card) => card.id === card_id);
          if (cardToMove) {
            // Remove the card from the from tray
            fromTray.cards = fromTray.cards.filter(
              (card) => card.id !== card_id,
            );
            // Add the card to the to tray
            toTray.cards.push(cardToMove);
          } else {
            console.log('didnt find card');
          }
        }
        return newTrays;
      });
    },
    [],
  );

  const make_card = useCallback((): Entity => {
    nextID.current += 1;
    return make_card_entity(nextID.current);
  }, [nextID]);

  const tick_doctor = useCallback((tray: ITray) => {
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

    const extra = tray.extra;
    if (extra.energy == null || extra.energy == undefined) {
      return;
    }
    if (tray.cards.length == 0) {
      extra.energy = Math.min(100, extra.energy + 1);
      return;
    }
    extra.energy = Math.max(0, extra.energy - 1);
    if (extra.energy == 0) {
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
    (tray: ITray) => {
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
      newTrays.forEach((tray) => {
        switch (tray.type) {
          case TrayType.Doctor:
            tick_doctor(tray);
            break;
          case TrayType.Hold:
            tick_hold(tray);
            return;
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
