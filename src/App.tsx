import { createContext, useCallback, useContext, useState } from 'react';

const Link = (props: JSX.IntrinsicElements['a']) => (
  <a
    className="text-pink-500 underline hover:no-underline dark:text-pink-400"
    {...props}
  />
);

interface ITray {
  cards: ICard[];
  id: number;
  label: string;
}

interface ICard {
  id: number;
  label: string;
}

interface ITrayContext {
  moveCard: (
    tray_one: ITray['id'],
    tray_two: ITray['id'],
    card_id: ICard['id'],
  ) => void;
  setTrays: (trays: ITray[]) => void;
  trays: ITray[];
}

const TrayContext = createContext<ITrayContext>({
  moveCard: () => {},
  setTrays: () => {},
  trays: [],
});

function TrayContextProvider({ children }) {
  const [trays, setTrays] = useState<ITray[]>([
    {
      id: 0,
      label: 'new arrivals',
      // eslint-disable-next-line sort-keys-fix/sort-keys-fix
      cards: [
        { id: 0, label: 'item 1' },
        { id: 1, label: 'item 2' },
      ],
    },
    {
      id: 1,
      label: 'doctor1',
      // eslint-disable-next-line sort-keys-fix/sort-keys-fix
      cards: [{ id: 2, label: 'item 3' }],
    },
    {
      id: 2,
      label: 'doctor2',
      // eslint-disable-next-line sort-keys-fix/sort-keys-fix
      cards: [{ id: 3, label: 'item 4' }],
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

  return (
    <TrayContext.Provider
      value={{
        moveCard,
        setTrays,
        trays,
      }}
    >
      {children}
    </TrayContext.Provider>
  );
}

function Tray({
  cards,
  horizontal,
  id,
  name,
}: {
  cards: ICard[];
  horizontal: boolean;
  id: string;
  name: string;
}) {
  const { moveCard } = useContext(TrayContext);
  const size = 100;
  const MAX_CARDS = 3;

  return (
    <div
      className="mt-5 rounded-lg p-4 shadow-lg"
      onDragOver={(event) => {
        event.preventDefault();
      }}
      onDrop={(event) => {
        event.preventDefault();
        if (cards.length == MAX_CARDS) {
          return;
        }

        const data = JSON.parse(event.dataTransfer.getData('data'));
        const { card_id, tray_id } = data;
        moveCard(Number(tray_id), Number(id), Number(card_id));
      }}
    >
      <div className="mb-2 text-xl font-bold">{name}</div>
      <ul
        className={`m-0 list-none border border-indigo-600 bg-indigo-100 p-0 px-1 ${horizontal ? 'flex flex-wrap' : ''}`}
        style={{
          height: !horizontal ? size * 1.1 * MAX_CARDS : 110,
          width: horizontal ? size * 1.1 * MAX_CARDS : 110,
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
              {item.label}
            </li>
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
                horizontal={false}
                id={String(tray.id)}
                key={tray.id}
                name={tray.label}
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
                horizontal={true}
                id={String(tray.id)}
                key={tray.id}
                name={tray.label}
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
