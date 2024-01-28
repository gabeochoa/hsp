import { useContext } from 'react';
import { Header, TextXL } from './Components.tsx';
import { ThemeContext, ThemeContextProvider } from './ThemeContext';
import { Tray } from './Tray.tsx';
import { TrayContext, TrayContextProvider } from './TrayContext.tsx';
import { Entity, IsTray } from './Types.tsx';

function NewArrivals() {
  const { trays } = useContext(TrayContext);

  return (
    <div className="w-full">
      {trays.map((tray: Entity, index: number) => {
        if (index != 0) {
          return null;
        }
        return (
          <Tray
            cards={tray.get<IsTray>('IsTray').cards}
            horizontal={false}
            key={tray.id}
            max_cards={5}
            tray={tray}
          />
        );
      })}
    </div>
  );
}

function Doctors() {
  const { trays } = useContext(TrayContext);

  return (
    <div className="w-full">
      {trays.map((tray: Entity, index: number) => {
        if (index == 0) {
          return null;
        }
        return (
          <Tray
            cards={tray.get<IsTray>('IsTray').cards}
            horizontal={true}
            key={tray.id}
            max_cards={3}
            tray={tray}
          />
        );
      })}
    </div>
  );
}

function Supplies() {
  const { medicine, patients_healed, patients_lost } = useContext(TrayContext);

  return (
    <div>
      <TextXL>Medicine Supplies: {medicine}</TextXL>
      <TextXL>Lost Patients: {patients_lost}</TextXL>
      <TextXL>Patients Healed: {patients_healed}</TextXL>
    </div>
  );
}

function Main() {
  return (
    <div className="mx-auto h-dvh w-10/12 overflow-scroll rounded border border-gray-200 p-4 dark:border-neutral-600 dark:bg-neutral-800 dark:shadow-none">
      <DarkModeToggle />
      <Header>Welcome</Header>
      <Supplies />
      <div className="grid grid-cols-3 gap-x-4">
        <div>
          <NewArrivals />
        </div>
        <div>
          <Doctors />
        </div>
      </div>
    </div>
  );
}

const DarkModeToggle = () => {
  const { isDarkMode, setIsDarkMode } = useContext(ThemeContext);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const dark_class =
    'text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700';
  const light_class =
    'text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700';

  return (
    <button
      className={isDarkMode ? dark_class : light_class}
      onClick={toggleDarkMode}
    >
      {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    </button>
  );
};

export default function App() {
  return (
    <ThemeContextProvider>
      <TrayContextProvider>
        <Main />
      </TrayContextProvider>
    </ThemeContextProvider>
  );
}
