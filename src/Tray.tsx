import { useContext } from 'react';
import { BasicText } from './Components.tsx';
import { TrayContext } from './TrayContext.tsx';
import {
  cost_of_procedure,
  Entity,
  HasAffliction,
  HasHealth,
  HasMoney,
  HasName,
  IsDead,
  IsDoctor,
  IsNewArrivals,
  IsTray,
} from './Types.tsx';

const CARD_SIZE = 150;

function DeadIcon() {
  return (
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
        strokeWidth="1.5"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function LockIcon() {
  return (
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
  );
}

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
  const locked = item.get<HasAffliction>('HasAffliction').locked();
  const dead = item.has('IsDead');
  const draggable = !locked;

  const AfflictionInfo = () => {
    return (
      <div className="w-full">
        <dl className="grid grid-cols-1 gap-y-1">
          <div>
            <p className="text-xs font-medium text-gray-500">
              Wallet{' '}
              <span className="text-gray-950">
                ${item.get<HasMoney>('HasMoney').money}
              </span>
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Procedure Cost{' '}
              <span className="text-gray-950">
                $
                {cost_of_procedure(
                  item.get<HasAffliction>('HasAffliction').affliction,
                )}
              </span>
            </p>
          </div>
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
    );
  };

  const BurialInfo = () => {
    return (
      <div className="mt-2 w-full">
        <dl className="grid grid-cols-1 gap-y-4">
          <div>
            <br />
            <br />
            <p className="text-xs font-medium text-gray-500">
              Time Remaining:{' '}
              <span className="text-gray-950">
                {item.get<IsDead>('IsDead').burial_cooldown}
              </span>
            </p>
          </div>
        </dl>
      </div>
    );
  };

  const CardInner = () => {
    return (
      <div
        className=""
        style={{
          height: CARD_SIZE,
          width: CARD_SIZE,
        }}
      >
        <div className="flex items-center">
          <img
            alt="photo of patient"
            className="h-8 w-8 rounded-full p-1"
            src="https://fakeimg.pl/100x100"
          />
          <h2 className="text-lg font-medium leading-6 text-gray-900">
            {item.get<HasName>('HasName').patient_name}
          </h2>
        </div>
        {!dead && <AfflictionInfo />}
        {dead && <BurialInfo />}
      </div>
    );
  };

  const background_color = () => {
    const health = item.get<HasHealth>('HasHealth').health;
    if (health < 20) {
      return 'bg-rose-500';
    }
    if (health < 30) {
      return 'bg-amber-500';
    }
    if (health < 40) {
      return 'bg-amber-200';
    }
    if (health < 50) {
      return 'bg-amber-100';
    }
    return 'bg-white';
  };

  return (
    <li
      className={`mb-2 cursor-move border border-indigo-300 ${background_color()} rounded-lg p-4 shadow-lg`}
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
      {locked && <LockIcon />}
      {dead && <DeadIcon />}
    </li>
  );
}

function TrayExtra({ tray }: { tray: Entity }) {
  const istray: IsTray = tray.get<IsTray>('IsTray');

  if (tray.has('IsDoctor')) {
    const isdoc: IsDoctor = tray.get<IsDoctor>('IsDoctor');

    const planned_energy = istray.cards.reduce((prev: number, card: Entity) => {
      return (
        prev + card.get<HasAffliction>('HasAffliction').affliction.ticks_needed
      );
    }, 0);

    return (
      <div>
        <BasicText>Energy: {isdoc.energy}</BasicText>
        <BasicText>Planned: {planned_energy}</BasicText>
        {planned_energy - isdoc.energy > 0 && (
          <BasicText>
            Deficit: Deficit: {isdoc.energy - planned_energy}
          </BasicText>
        )}
      </div>
    );
  }
  if (tray.has('IsNewArrivals')) {
    const isnewarr: IsNewArrivals = tray.get<IsNewArrivals>('IsNewArrivals');
    return <div>Next Spawn: {isnewarr.spawn_cooldown}</div>;
  }
  return <div />;
}

function TrayHeader({ tray }: { tray: Entity }) {
  return (
    <div className="mb-2 text-xl font-bold dark:text-white">
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
  const { is_valid_move, moveCard } = useContext(TrayContext);

  return (
    <div
      className="mt-5 rounded-lg p-4 shadow-lg"
      onDragOver={(event) => {
        event.preventDefault();
        // TODO show why its not valid
      }}
      onDrop={(event) => {
        event.preventDefault();

        const data = JSON.parse(event.dataTransfer.getData('data'));
        const { card_id, tray_id } = data;
        const is_valid = is_valid_move(
          Number(tray_id),
          Number(tray.id),
          Number(card_id),
        );
        if (!is_valid) {
          return;
        }
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
