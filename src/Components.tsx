export function Header({ children }) {
  return (
    <h1 className="mb-4 text-4xl text-black dark:text-white">{children}</h1>
  );
}

export function TextXL({ children }) {
  return (
    <div className="mb-2 text-xl font-bold dark:text-white">{children}</div>
  );
}

export function BasicText({ children }) {
  return <p className={'dark:text-white'}>{children}</p>;
}

export function Button({ className, onClick, children }) {
  const light_class = `${className} text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700`;

  return (
    <button className={light_class} onClick={onClick}>
      {children}
    </button>
  );
}
