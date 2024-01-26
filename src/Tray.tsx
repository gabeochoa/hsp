import { useContext } from 'react';
import { TrayContext } from './TrayContext.tsx';
import { Entity, HasAffliction, HasName, IsDoctor, IsTray } from './Types.tsx';

const CARD_SIZE = 150;

function CardPlaceholder() {
  return (
    <li
      className="mb-2 cursor-move border border-indigo-300 bg-white p-4"
      style={{
        height: CARD_SIZE,
        width: CARD_SIZE,
      }}
    ></li>
  );
}

function Card({ item, tray_id }: { item: Entity; tray_id: number }) {
  const CardInner = () => {
    return (
      <div
        className="flex flex-col"
        style={{
          height: CARD_SIZE,
          width: CARD_SIZE,
        }}
      >
        <div className="flex">
          <h2 className="py-1 text-lg font-medium leading-6 text-gray-900">
            {item.get<HasName>('HasName').patient_name}
          </h2>
          <img
            alt="photo of patient"
            className="h-8 w-8 rounded-full p-1"
            src="https://fakeimg.pl/100x100"
          />
        </div>
        <div className="mt-2 w-full">
          <dl className="grid grid-cols-1 gap-y-4">
            <div>
              <p className="text-xs font-medium text-gray-500">
                Work Needed:{' '}
                <span className="text-gray-950">
                  {
                    item.get<HasAffliction>('HasAffliction').affliction
                      .ticks_needed
                  }
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">
                Medicine Required:{' '}
                <span className="text-gray-950">
                  {
                    item.get<HasAffliction>('HasAffliction').affliction
                      .medicine_needed
                  }
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">
                Health Remaining:{' '}
                <span className="text-gray-950">
                  {item.get<HasHealth>('HasHealth').health}
                </span>
              </p>
            </div>
          </dl>
        </div>
      </div>
    );
  };
  const draggable = !item.get<HasAffliction>('HasAffliction').locked();

  return (
    <li
      className="mb-2 cursor-move border border-indigo-300 bg-white p-4"
      draggable={draggable}
      id={`${item.id}`}
      onDragStart={(event) => {
        const data = {
          card_id: event.currentTarget.id,
          tray_id,
        };
        event.dataTransfer.setData('data', JSON.stringify(data));
      }}
      style={{
        height: CARD_SIZE,
        width: CARD_SIZE,
      }}
    >
      <CardInner />
      {!draggable && (
        <div
          style={{
            marginTop: -CARD_SIZE,
            paddingRight: 75,
          }}
        >
          <svg
            className="h-24 w-24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </li>
  );
}

function TrayExtra({ tray }: { tray: Entity }) {
  if (tray.has('IsDoctor')) {
    const isdoc: IsDoctor = tray.get<IsDoctor>('IsDoctor');
    return <div>Energy: {isdoc.energy}</div>;
  }
  return <div />;
}

function TrayHeader({ tray }: { tray: Entity }) {
  return (
    <div className="mb-2 text-xl font-bold">
      {tray.get<IsTray>('IsTray').label}
      <TrayExtra tray={tray} />
    </div>
  );
}

function TrayList({
  cards,
  horizontal,
  max_cards,
  tray,
}: {
  cards: Entity[];
  horizontal: boolean;
  max_cards: number;
  tray: Entity;
}) {
  const tray_height = CARD_SIZE * 1.1 * (!horizontal ? max_cards : 1);
  const tray_width = CARD_SIZE * 1.1 * (horizontal ? max_cards : 1);
  const num_placeholders = max_cards - cards.length;

  return (
    <ul
      className={`m-0 list-none border border-indigo-600 bg-indigo-100 p-0 px-1 ${horizontal ? 'flex flex-wrap' : ''}`}
      style={{
        height: tray_height,
        width: tray_width,
      }}
    >
      {cards.map((item: Entity) => {
        return <Card item={item} key={item.id} tray_id={tray.id} />;
      })}
      {num_placeholders > 0 &&
        new Array(num_placeholders).map((x, index) => {
          return <CardPlaceholder key={index} />;
        })}
    </ul>
  );
}

export function Tray({
  cards,
  horizontal,
  max_cards,
  tray,
}: {
  cards: Entity[];
  horizontal: boolean;
  max_cards: number;
  tray: Entity;
}) {
  const { moveCard } = useContext(TrayContext);

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
        moveCard(Number(tray_id), Number(tray.id), Number(card_id));
      }}
    >
      <TrayHeader tray={tray} />
      <TrayList
        cards={cards}
        horizontal={horizontal}
        max_cards={max_cards}
        tray={tray}
      />
    </div>
  );
}
