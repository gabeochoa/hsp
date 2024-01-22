import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

enum TrayType {
  Hold,
  Doctor,
}

interface ITray {
  cards: ICard[];
  extra: {
    energy?: number | null;
  };
  id: number;
  label: string;
  type: TrayType;
}

interface ICard {
  id: number;
  label: string;
  ticks_remaining: number;
}

interface ITrayContext {
  moveCard: (
    tray_one: ITray['id'],
    tray_two: ITray['id'],
    card_id: ICard['id'],
  ) => void;
  trays: ITray[];
}

const TrayContext = createContext<ITrayContext>({
  moveCard: () => {},
  trays: [],
});

function TrayContextProvider({ children }) {
  const nextID = useRef(0);
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

  const make_card = useCallback(() => {
    nextID.current += 1;
    return {
      id: nextID.current,
      label: `item ${nextID.current}`,
      ticks_remaining: 100,
    };
  }, [nextID]);

  const tick_doctor = useCallback((tray: ITray) => {
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
    if (firstCard.ticks_remaining > 0) {
      firstCard.ticks_remaining -= 1;
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
    console.log('tick', Date.now());
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
        moveCard,
        trays,
      }}
    >
      {children}
    </TrayContext.Provider>
  );
}

function Tray({
  cards,
  extra,
  horizontal,
  id,
  max_cards,
  name,
  type,
}: {
  cards: ICard[];
  extra: ITray['extra'];
  horizontal: boolean;
  id: string;
  max_cards: number;
  name: string;
  type: ITray['type'];
}) {
  const { moveCard } = useContext(TrayContext);
  const size = 100;
  const tray_height = !horizontal ? size * 1.1 * max_cards : 110;
  const tray_width = horizontal ? size * 1.1 * max_cards : 110;
  const num_placeholders = max_cards - cards.length;

  let extra_component = null;
  switch (type) {
    case TrayType.Hold:
      extra_component = null;
      break;
    case TrayType.Doctor:
      extra_component = <div>{extra.energy}</div>;
      break;
  }

  return (
    <div
      className="mt-5 rounded-lg p-4 shadow-lg"
      onDragOver={(event) => {
        event.preventDefault();
      }}
      onDrop={(event) => {
        event.preventDefault();
        if (cards.length == max_cards) {
          return;
        }

        const data = JSON.parse(event.dataTransfer.getData('data'));
        const { card_id, tray_id } = data;
        moveCard(Number(tray_id), Number(id), Number(card_id));
      }}
    >
      <div className="mb-2 text-xl font-bold">
        {name}
        {extra_component}
      </div>
      <ul
        className={`m-0 list-none border border-indigo-600 bg-indigo-100 p-0 px-1 ${horizontal ? 'flex flex-wrap' : ''}`}
        style={{
          height: tray_height,
          width: tray_width,
        }}
      >
        {cards.map((item: ICard) => {
          return (
            <li
              className="mb-2 cursor-move border border-indigo-300 bg-white p-4"
              draggable={true}
              id={`${item.id}`}
              key={item.id}
              onDragStart={(event) => {
                const data = {
                  card_id: event.currentTarget.id,
                  tray_id: id,
                };
                event.dataTransfer.setData('data', JSON.stringify(data));
              }}
              style={{
                height: size,
                width: size,
              }}
            >
              {item.label}({item.ticks_remaining})
            </li>
          );
        })}
        {num_placeholders > 0 &&
          new Array(num_placeholders).map((x, index) => {
            return (
              <li
                className="mb-2 cursor-move border border-indigo-300 bg-white p-4"
                key={index}
                style={{
                  height: size,
                  width: size,
                }}
              ></li>
            );
          })}
      </ul>
    </div>
  );
}

function Main() {
  const { trays } = useContext(TrayContext);

  return (
    <div className="mx-auto my-8 mt-10 w-8/12 rounded border border-gray-200 p-4 shadow-md dark:border-neutral-600 dark:bg-neutral-800 dark:shadow-none">
      <h1 className="mb-4 text-4xl">Welcome</h1>
      <div className="columns-2 gap-8">
        <div className="break-after-column">
          {trays.map((tray: ITray, index: number) => {
            if (index != 0) {
              return null;
            }
            return (
              <Tray
                cards={tray.cards}
                extra={tray.extra}
                horizontal={false}
                id={String(tray.id)}
                key={tray.id}
                max_cards={5}
                name={tray.label}
                type={tray.type}
              />
            );
          })}
        </div>
        <div className="">
          {trays.map((tray: ITray, index: number) => {
            if (index == 0) {
              return null;
            }
            return (
              <Tray
                cards={tray.cards}
                extra={tray.extra}
                horizontal={true}
                id={String(tray.id)}
                key={tray.id}
                max_cards={3}
                name={tray.label}
                type={tray.type}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
export default function App() {
  return (
    <TrayContextProvider>
      <Main />
    </TrayContextProvider>
  );
}
