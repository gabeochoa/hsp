import { useContext } from 'react';
import { TrayContext } from './TrayContext.tsx';
import { TrayType } from './Types.tsx';

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

function Card({ item, tray_id }: { item: TCard; tray_id: number }) {
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
            {item.label}
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
              <dt className="text-xs font-medium text-gray-500">
                Work Needed:
              </dt>
              <dd className="mt-1 text-xs text-gray-900">
                {item.issue.ticks_needed}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500">
                Medicine Needed:
              </dt>
              <dd className="mt-1 text-xs text-gray-900">
                {item.issue.medicine_needed}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    );
  };

  return (
    <li
      className="mb-2 cursor-move border border-indigo-300 bg-white p-4"
      draggable={true}
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
    </li>
  );
}

function TrayExtra({ tray }: { tray: ITray }) {
  let extra_component = null;
  switch (tray.type) {
    case TrayType.Hold:
      extra_component = <div />;
      break;
    case TrayType.Doctor:
      extra_component = <div>Energy: {tray.extra.energy}</div>;
      break;
  }
  return extra_component;
}

function TrayHeader({ tray }: { tray: ITray }) {
  return (
    <div className="mb-2 text-xl font-bold">
      {tray.label}
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
  cards: Card[];
  horizontal: boolean;
  max_cards: number;
  tray: ITray;
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
      {cards.map((item: TCard) => {
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
  cards: Card[];
  horizontal: boolean;
  max_cards: number;
  name: string;
  tray: ITray;
  type: ITray['type'];
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
